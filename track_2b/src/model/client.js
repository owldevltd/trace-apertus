import fs from 'node:fs/promises';
import path from 'node:path';

// The one door to the model. Every call goes through a single queue, one after the other, with a pause between
// calls and a longer rest every STAGE calls; after a 403 or 429 nothing more is sent. The raw exchange is written
// per call, with prompt, model, temperature, duration and finish reason, so a run can be read back without the model.

const PAUSE = 2000;
const STAGE = 50;
const STAGE_REST = 20000;
const TIMEOUT = 180000;

// One client per process: the queue is what keeps the calls sequential across jobs.
export function createClient( config ) {
    const state = { calls: 0, halted: 0, queue: Promise.resolve() };

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
        if ( state.calls > 0 ) {
            await sleep( state.calls % STAGE === 0 ? STAGE_REST : PAUSE );
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
            model: config.model,
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
        if ( http === 403 || http === 429 ) {
            state.halted = http;
        }
        const text = answer?.choices?.[ 0 ]?.message?.content;
        const result = typeof text === 'string'
            ? { text: text.trim(), http, usage: answer.usage || null, finish: answer.choices[ 0 ].finish_reason || null }
            : null;
        if ( options.log ) {
            await fs.mkdir( options.log, { recursive: true } );
            await fs.writeFile( path.join( options.log, String( state.calls ).padStart( 4, '0' ) + '.json' ), JSON.stringify( {
                at: new Date( started ).toISOString(),
                tag: options.tag || null,
                model: config.model,
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
        return result;
    }

    return { ask, state };
}

function base64( bytes ) {
    return Buffer.from( bytes.buffer, bytes.byteOffset, bytes.byteLength ).toString( 'base64' );
}

function sleep( ms ) {
    return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
}
