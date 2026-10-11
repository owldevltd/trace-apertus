import { $ } from './dom.js';
import { createRecorder } from './capture/recorder.js';
import { api } from './api.js';
import * as form from './screens/form.js';

// Listening on the form, where the person looks: the microphone opens at a question or for the whole form, and
// the level is drawn right there; there is no screen of its own for it. At a question the recording is a
// conversation: an answer ends at the first pause after speech and goes to that question, the next open
// question is asked, and the microphone stays open until someone stops it or nobody speaks any more. For the
// whole form the recording runs until it is stopped; then it is transcribed and fills what is still open.
// A form of the walk-through takes its made-up values instead of what was said.

// An answer ends after a pause of this length. A start value, agreed 9 October 2026, to be tuned on real voices.
const PAUSE = 1500;

// Nobody speaks for this long in a conversation: the microphone closes.
const IDLE = 20000;

const BARS = 24;

export const active = ( ctx ) => ctx.state.listen || null;

const clock = ( sec ) => Math.floor( sec / 60 ) + ':' + String( Math.floor( sec % 60 ) ).padStart( 2, '0' );

// unit: the question of the dialogue the conversation starts at; without one the whole form is dictated
export async function start( ctx, entry, unit = null ) {
    if ( active( ctx ) ) {
        await stop( ctx );
    }
    const listen = { entry, unit: unit ? unit.id : null, talk: !!unit, recorder: null, analyser: null, started: Date.now(), raf: 0, sent: [], dropped: false };
    listen.recorder = createRecorder( {
        pause: unit ? PAUSE : 0,
        onPiece: ( piece ) => {
            if ( !listen.dropped ) {
                ( listen.talk ? answered : dictated )( ctx, listen, piece );
            }
        },
    } );
    try {
        listen.analyser = await listen.recorder.start();
    } catch {
        ctx.toast( ctx.t( 'rec.fail' ) );
        return;
    }
    ctx.state.listen = listen;
    ctx.state.asking = null;
    form.render( ctx, entry );
    draw( ctx, listen );
}

// An answer has ended: it belongs to the question that was being asked; the next one is asked at once, while
// the server reads the answer.
function answered( ctx, listen, piece ) {
    const id = listen.unit;
    if ( !id ) {
        return;
    }
    ctx.state.pending.add( id );
    listen.unit = null;
    listen.unit = form.asking( ctx, listen.entry );
    form.answer( ctx, listen.entry, id, listen.entry.jobId ? { sound: piece } : { said: true } );
    if ( !listen.unit && active( ctx ) === listen ) {
        stop( ctx );
    }
}

// A piece of the dictation goes to the server as it closes, one after the other.
function dictated( ctx, listen, piece ) {
    if ( listen.entry.jobId ) {
        listen.sent.push( form.queued( ctx, () => api.addAudio( listen.entry.jobId, piece ) ).catch( ( error ) => ctx.toast( ctx.t( 'job.failed', { e: error.message } ) ) ) );
    }
}

// The level as bars and the time, wherever the form shows them at the moment; the form is drawn anew while
// the recording runs, so the canvas is looked up every time.
function draw( ctx, listen ) {
    const css = getComputedStyle( document.documentElement );
    const ink = css.getPropertyValue( '--ink' ).trim() || '#141411';
    const base = css.getPropertyValue( '--line' ).trim() || '#ddd';
    const data = new Uint8Array( listen.analyser.frequencyBinCount );
    const frame = () => {
        if ( active( ctx ) !== listen ) {
            return;
        }
        const screen = ctx.screen( 'form' );
        const canvas = $( '[data-eq]', screen );
        if ( canvas ) {
            const g = canvas.getContext( '2d' );
            listen.analyser.getByteFrequencyData( data );
            g.clearRect( 0, 0, canvas.width, canvas.height );
            const w = canvas.width / BARS;
            for ( let i = 0; i < BARS; i++ ) {
                const v = data[ Math.floor( i * data.length / BARS / 2 ) ] / 255;
                const h = Math.max( 4, v * canvas.height * 0.9 );
                g.fillStyle = v > 0.08 ? ink : base;
                g.beginPath();
                g.roundRect( i * w + w * 0.3, ( canvas.height - h ) / 2, w * 0.4, h, 4 );
                g.fill();
            }
        }
        const timer = $( '[data-timer]', screen );
        if ( timer ) {
            timer.textContent = clock( ( Date.now() - listen.started ) / 1000 );
        }
        if ( listen.talk && listen.recorder.quiet() >= IDLE ) {
            stop( ctx );
            return;
        }
        listen.raf = requestAnimationFrame( frame );
    };
    frame();
}

// Ends the recording. In a conversation what was said last still goes to its question; a dictation is
// transcribed and fills the fields that are open.
export async function stop( ctx ) {
    const listen = active( ctx );
    if ( !listen ) {
        return;
    }
    const entry = listen.entry;
    ctx.state.listen = null;
    cancelAnimationFrame( listen.raf );
    entry.duration = clock( ( Date.now() - listen.started ) / 1000 );
    const shown = () => ctx.state.current === entry && ctx.router.top().id === 'form';
    if ( shown() ) {
        form.render( ctx, entry );
    }
    await listen.recorder.stop();
    if ( listen.talk ) {
        return;
    }
    const f = ctx.model.formOf( entry );
    if ( !entry.jobId ) {
        // the walk-through: made-up values; what was answered question by question before stays
        entry.values = { ...JSON.parse( JSON.stringify( f.values ) ), ...( entry.values || {} ) };
        entry.status = 'filled';
        ctx.event( ctx.t( 'ev.dictated', { f: f.name, d: entry.duration } ), f.id, entry.photo );
        ctx.store.touch();
        if ( shown() ) {
            form.render( ctx, entry );
        }
        return;
    }
    await Promise.all( listen.sent );
    ctx.store.touch();
    await read( ctx, entry );
}

// What was dictated is transcribed and fills the fields that are open. Where the model gave no answer for the
// recording, the person is told so; the recording is kept on the server, and this is asked for again from the
// transcript.
export async function read( ctx, entry ) {
    const shown = () => ctx.state.current === entry && ctx.router.top().id === 'form';
    ctx.state.tab = 'transcript';
    ctx.state.transcribing = entry.jobId;
    entry.unheard = false;
    if ( shown() ) {
        form.render( ctx, entry );
    }
    try {
        await form.queued( ctx, async () => {
            await api.transcribe( entry.jobId );
            let { run } = await api.wait( entry.jobId, null, 1000 );
            if ( run.step === 'error' ) {
                throw new Error( run.error || 'transcription' );
            }
            ctx.model.forget( entry.jobId );
            await ctx.model.loadForm( entry );
            ctx.event( ctx.t( 'ev.dictated', { f: entry.name, d: entry.duration } ), entry.jobId, entry.photo );
            // then the values into the fields
            if ( shown() ) {
                ctx.state.tab = 'fields';
                form.render( ctx, entry );
            }
            await api.fill( entry.jobId );
            ( { run } = await api.wait( entry.jobId, null, 1000 ) );
            if ( run.step === 'error' ) {
                throw new Error( run.error || 'filling' );
            }
            ctx.model.forget( entry.jobId );
            await ctx.model.loadForm( entry );
        } );
    } catch ( error ) {
        entry.unheard = error.message === 'unanswered';
        ctx.toast( entry.unheard ? ctx.t( 'job.unanswered' ) : ctx.t( 'job.failed', { e: error.message } ) );
    }
    ctx.store.touch();
    ctx.state.transcribing = null;
    if ( shown() ) {
        form.render( ctx, entry );
    }
}

// Leaving the form: the microphone closes and what was not sent yet is dropped.
export async function cancel( ctx ) {
    const listen = active( ctx );
    if ( !listen ) {
        return;
    }
    ctx.state.listen = null;
    cancelAnimationFrame( listen.raf );
    listen.dropped = true;
    await listen.recorder.stop();
}
