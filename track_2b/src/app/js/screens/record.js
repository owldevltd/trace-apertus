import { $ } from '../dom.js';
import { createRecorder } from '../capture/recorder.js';
import { api } from '../api.js';
import * as form from './form.js';

// Listening: the recording goes to the server in pieces as they close, and stopping starts the transcription;
// the transcript appears on the form. A mocked form of the walk-through fills with its made-up values instead.

export function leave( ctx ) {
    stop( ctx );
}

export async function start( ctx, entry ) {
    const s = ctx.screen( 'record' );
    ctx.state.current = entry;
    $( '[data-timer]', s ).textContent = '0:00';
    $( '[data-pieces]', s ).textContent = '';
    $( '[data-hint]', s ).textContent = ctx.t( 'rec.hint', { f: entry.name } );
    await ctx.router.push( 'record' );
    const started = Date.now();
    ctx.state.timer = setInterval( () => {
        const sec = Math.floor( ( Date.now() - started ) / 1000 );
        $( '[data-timer]', s ).textContent = clock( sec );
    }, 250 );
    const uploads = [];
    const recorder = createRecorder( {
        onPiece: ( piece ) => {
            if ( !entry.jobId ) {
                return;
            }
            uploads.push( api.addAudio( entry.jobId, piece ).then( () => {
                $( '[data-pieces]', s ).textContent = ctx.t( 'rec.pieces', { n: uploads.length, d: clock( Math.round( piece.start + piece.duration ) ) } );
            } ).catch( ( error ) => ctx.toast( ctx.t( 'job.failed', { e: error.message } ) ) ) );
        },
    } );
    ctx.state.recorder = recorder;
    ctx.state.uploads = uploads;
    let analyser = null;
    try {
        analyser = await recorder.start();
    } catch {
        ctx.state.recorder = null;
        $( '[data-hint]', s ).textContent = ctx.t( 'rec.fail' );
    }
    wave( ctx, analyser );
}

function clock( sec ) {
    return Math.floor( sec / 60 ) + ':' + String( sec % 60 ).padStart( 2, '0' );
}

function wave( ctx, analyser ) {
    const c = $( '[data-wave]', ctx.screen( 'record' ) );
    const g = c.getContext( '2d' );
    const data = analyser ? new Uint8Array( analyser.frequencyBinCount ) : null;
    const bars = 40;
    const css = getComputedStyle( document.documentElement );
    const ink = css.getPropertyValue( '--ink' ).trim() || '#141411';
    const base = css.getPropertyValue( '--line' ).trim() || '#ddd';
    const draw = () => {
        g.clearRect( 0, 0, c.width, c.height );
        if ( data ) {
            analyser.getByteFrequencyData( data );
        }
        const w = c.width / bars;
        for ( let i = 0; i < bars; i++ ) {
            const v = data ? data[ Math.floor( i * data.length / bars / 2 ) ] / 255 : 0.2 + 0.6 * Math.abs( Math.sin( Date.now() / 300 + i * 0.6 ) ) * Math.random();
            const h = Math.max( 6, v * c.height * 0.9 );
            g.fillStyle = v > 0.08 ? ink : base;
            g.beginPath();
            g.roundRect( i * w + w * 0.3, ( c.height - h ) / 2, w * 0.4, h, 6 );
            g.fill();
        }
        ctx.state.raf = requestAnimationFrame( draw );
    };
    draw();
}

// ends the recording; the last piece closes and uploads; resolves when every piece is on the server
async function stop( ctx ) {
    cancelAnimationFrame( ctx.state.raf );
    clearInterval( ctx.state.timer );
    const recorder = ctx.state.recorder;
    ctx.state.recorder = null;
    if ( recorder ) {
        await recorder.stop();
    }
    await Promise.all( ctx.state.uploads || [] );
    ctx.state.uploads = [];
}

export function wire( ctx ) {
    const s = ctx.screen( 'record' );
    $( '[data-stop]', s ).addEventListener( 'click', async () => {
        const entry = ctx.state.current;
        const f = ctx.model.formOf( entry );
        entry.duration = $( '[data-timer]', s ).textContent;
        $( '[data-hint]', s ).textContent = ctx.t( 'rec.closing' );
        await stop( ctx );
        if ( f.values ) {
            // the walk-through: made-up values
            entry.values = JSON.parse( JSON.stringify( f.values ) );
            entry.status = 'filled';
            ctx.event( ctx.t( 'ev.dictated', { f: f.name, d: entry.duration } ), f.id, entry.photo );
            ctx.store.touch();
            ctx.state.tab = 'fields';
            form.render( ctx, entry );
            ctx.router.pop();
            return;
        }
        ctx.store.touch();
        ctx.state.tab = 'transcript';
        ctx.state.transcribing = entry.jobId;
        form.render( ctx, entry );
        ctx.router.pop();
        try {
            await api.transcribe( entry.jobId );
            const { run } = await api.wait( entry.jobId, null, 1000 );
            if ( run.step === 'error' ) {
                throw new Error( run.error || 'transcription' );
            }
            ctx.model.forget( entry.jobId );
            await ctx.model.loadForm( entry );
            ctx.event( ctx.t( 'ev.dictated', { f: entry.name, d: entry.duration } ), entry.jobId, entry.photo );
        } catch ( error ) {
            ctx.toast( ctx.t( 'job.failed', { e: error.message } ) );
        }
        ctx.state.transcribing = null;
        if ( ctx.state.current === entry && ctx.router.top().id === 'form' ) {
            form.render( ctx, entry );
        }
    } );
    $( '[data-cancel]', s ).addEventListener( 'click', () => ctx.router.pop() );
}
