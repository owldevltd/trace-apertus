import { $ } from '../dom.js';
import * as form from './form.js';

// Listening: the microphone level is real when the browser gives the microphone, nothing is kept or sent.
// Stopping fills the form with the mocked values of the walk-through.

export function leave( ctx ) {
    stop( ctx );
}

export async function start( ctx, entry ) {
    const s = ctx.screen( 'record' );
    ctx.state.current = entry;
    $( '[data-timer]', s ).textContent = '0:00';
    $( '[data-hint]', s ).textContent = ctx.t( 'rec.hint', { f: entry.name } );
    await ctx.router.push( 'record' );
    const started = Date.now();
    ctx.state.timer = setInterval( () => {
        const sec = Math.floor( ( Date.now() - started ) / 1000 );
        $( '[data-timer]', s ).textContent = Math.floor( sec / 60 ) + ':' + String( sec % 60 ).padStart( 2, '0' );
    }, 250 );
    let analyser = null;
    try {
        const stream = await navigator.mediaDevices.getUserMedia( { audio: true, video: false } );
        const audio = new ( window.AudioContext || window.webkitAudioContext )();
        analyser = audio.createAnalyser();
        analyser.fftSize = 512;
        audio.createMediaStreamSource( stream ).connect( analyser );
        ctx.state.audio = { stream, audio };
    } catch {
        ctx.state.audio = null;
        $( '[data-hint]', s ).textContent = ctx.t( 'rec.fail' );
    }
    wave( ctx, analyser );
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

function stop( ctx ) {
    cancelAnimationFrame( ctx.state.raf );
    clearInterval( ctx.state.timer );
    if ( ctx.state.audio ) {
        ctx.state.audio.stream.getTracks().forEach( ( track ) => track.stop() );
        ctx.state.audio.audio.close().catch( () => {} );
        ctx.state.audio = null;
    }
}

export function wire( ctx ) {
    const s = ctx.screen( 'record' );
    $( '[data-stop]', s ).addEventListener( 'click', () => {
        const entry = ctx.state.current;
        const f = ctx.model.formOf( entry );
        stop( ctx );
        entry.duration = $( '[data-timer]', s ).textContent;
        // a mocked form fills with its made-up values; a real job waits for the transcription step
        if ( f.values ) {
            entry.values = JSON.parse( JSON.stringify( f.values ) );
            entry.status = 'filled';
            ctx.event( ctx.t( 'ev.dictated', { f: f.name, d: entry.duration } ), f.id, entry.photo );
        } else {
            ctx.toast( ctx.t( 'rec.later' ) );
        }
        ctx.store.touch();
        ctx.state.tab = 'fields';
        form.render( ctx, entry );
        ctx.router.pop();
    } );
    $( '[data-cancel]', s ).addEventListener( 'click', () => ctx.router.pop() );
}
