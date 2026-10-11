import fs from 'node:fs/promises';
import path from 'node:path';

// The one door to the model. Every call goes through a single queue, one after the other. The queue takes a
// breath of half a second after every BLOCK calls. When the service turns a call down with a 4xx, the queue waits
// half a second and sends the same call once more; if that one comes back with a 403 or 429 as well, nothing more
// is sent. The raw exchange is written per call, with prompt, model, temperature, duration and finish reason, so
// a run can be read back without the model.
//
// Until 11 October 2026 the queue paused two seconds before every call and twenty seconds before every fiftieth,
// and halted at the first 403 or 429. Measured that day on a photographed page captured through the app, 94
// calls, 4 min 33 s from the page image to the finished dialogue: 64 s were the model's and 204 s the queue's
// own pauses; a reading call was answered in 0.33 s on average. The pace below was set by hand the same day. The
// service names no limit in the headers of its answers.

const BLOCK = 10;
const PAUSE = 500;
const REFUSED = 500;
const TIMEOUT = 180000;

// How long the queue waits before its next call, after this many calls.
export function rest( calls ) {
    return calls > 0 && calls % BLOCK === 0 ? PAUSE : 0;
}

// One client per process: the queue is what keeps the calls sequential across jobs.
export function createClient( config ) {
    // the raw exchange is numbered per process; the stamp keeps runs of several processes apart
    const state = { calls: 0, halted: 0, queue: Promise.resolve(), stamp: Date.now().toString( 36 ) };

    // Asks the model and resolves with { text, http, usage, finish }, or null after a halt or an error.
    // options: image (PNG bytes), audio ({ bytes, format }), room (max tokens), log (dir for the raw exchange), tag.
    function ask( prompt, options = {} ) {
        const job = state.queue.then( () => send( prompt, options ) );
        state.queue = job.catch( () => {} );
        return job;
    }

    async function send( prompt, options ) {
        if ( state.halted || !config.apiKey ) {
            return null;
        }
        let sent = await once( prompt, options );
        if ( sent.http >= 400 && sent.http < 500 ) {
            await sleep( REFUSED );
            sent = await once( prompt, options );
            if ( sent.http === 403 || sent.http === 429 ) {
                state.halted = sent.http;
            }
        }
        return sent.result;
    }

    // one call as it goes out: { http, result }
    async function once( prompt, options ) {
        const wait = rest( state.calls );
        if ( wait ) {
            await sleep( wait );
        }
        state.calls++;
        const content = [ { type: 'text', text: prompt } ];
        if ( options.image ) {
            content.push( { type: 'image_url', image_url: { url: 'data:image/png;base64,' + base64( options.image ) } } );
        }
        if ( options.audio ) {
            content.push( { type: 'input_audio', input_audio: { data: base64( options.audio.bytes ), format: options.audio.format } } );
        }
        const body = {
            // the large model only where a step says so (the catalogue); everything else runs on the small one
            model: options.model || config.model,
            temperature: 0,
            max_tokens: options.room || 400,
            messages: [ { role: 'user', content } ],
        };
        const started = Date.now();
        const abort = new AbortController();
        const timer = setTimeout( () => abort.abort(), TIMEOUT );
        let http = 0;
        let answer = null;
        let error = null;
        try {
            const response = await fetch( config.baseUrl.replace( /\/$/, '' ) + '/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + config.apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify( body ),
                signal: abort.signal,
            } );
            http = response.status;
            answer = http === 200 ? await response.json() : { body: await response.text() };
        } catch ( e ) {
            error = e.name === 'AbortError' ? 'timeout' : e.message;
        } finally {
            clearTimeout( timer );
        }
        const text = answer?.choices?.[ 0 ]?.message?.content;
        const result = typeof text === 'string'
            ? { text: text.trim(), http, usage: answer.usage || null, finish: answer.choices[ 0 ].finish_reason || null }
            : null;
        if ( options.log ) {
            await fs.mkdir( options.log, { recursive: true } );
            await fs.writeFile( path.join( options.log, state.stamp + '-' + String( state.calls ).padStart( 4, '0' ) + '.json' ), JSON.stringify( {
                at: new Date( started ).toISOString(),
                tag: options.tag || null,
                model: body.model,
                temperature: 0,
                room: body.max_tokens,
                prompt,
                image: options.image ? options.image.length : 0,
                audio: options.audio ? options.audio.bytes.length : 0,
                ms: Date.now() - started,
                http,
                error,
                answer,
            }, null, 2 ) );
        }
        return { http, result };
    }

    return { ask, state };
}

function base64( bytes ) {
    return Buffer.from( bytes.buffer, bytes.byteOffset, bytes.byteLength ).toString( 'base64' );
}

function sleep( ms ) {
    return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
}
