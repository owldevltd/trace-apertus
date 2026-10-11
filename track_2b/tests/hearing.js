import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The recognition when the model gives no answer, without a model: a call that brings nothing back is made once
// more; where the second brings nothing either, the piece is not taken for silence, the run says so, and the
// recording can be asked for again. A stand-in answers, or does not, in the place of the model.
//
//   node tests/hearing.js

const root = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
process.env.STORAGE_DIR = path.join( root, 'storage', 'tests', 'hearing' );
const { createJob, saveJob, jobDir, loadRun } = await import( '../src/job.js' );
const { transcribeJob, transcribeAnswer, UNANSWERED } = await import( '../src/speech/transcriber.js' );

let failed = false;
const check = ( ok, what ) => {
    console.log( ( ok ? 'ok   ' : 'FAIL ' ) + what );
    failed = failed || !ok;
};
// a job with one piece of a recording; replies: what the stand-in gives back call by call (null: no answer)
async function recorded( replies, halted = 0 ) {
    const job = createJob( { name: 'Probe', language: 'de', pages: 1 } );
    await saveJob( job );
    const dir = path.join( jobDir( job.id ), 'audio' );
    await fs.mkdir( dir, { recursive: true } );
    await fs.writeFile( path.join( dir, '1.mp3' ), Buffer.from( 'sound' ) );
    await fs.writeFile( path.join( dir, 'pieces.json' ), JSON.stringify( [ { n: 1, file: '1.mp3', format: 'mp3', start: 0, duration: 3 } ] ) );
    const tags = [];
    const client = { state: { halted }, ask: async ( prompt, options ) => {
        tags.push( options.tag );
        const reply = replies.shift();
        return reply === undefined || reply === null ? null : { text: reply, finish: 'stop' };
    } };
    return { job, client, tags };
}

const once = await recorded( [ null, 'Ich heisse Hans Rietli.' ] );
await transcribeJob( once.job, once.client );
check( once.tags.join() === 'audio #1,audio #1 again' && once.job.transcript.length === 1 && once.job.transcript[ 0 ].text === 'Ich heisse Hans Rietli.' && ( await loadRun( once.job.id ) ).step === 'done',
    'a call that brings no answer is made once more; the second answer is the transcript' );

const never = await recorded( [ null, null ] );
await transcribeJob( never.job, never.client );
const run = await loadRun( never.job.id );
check( never.tags.length === 2 && never.job.transcript.length === 0 && run.step === 'error' && run.error === UNANSWERED,
    'two calls without an answer: the piece is not kept as heard and empty, and the run says the model did not answer' );
never.client.ask = async () => ( { text: 'Jetzt ist es da.', finish: 'stop' } );
await transcribeJob( never.job, never.client );
check( never.job.transcript.length === 1 && never.job.transcript[ 0 ].text === 'Jetzt ist es da.' && ( await loadRun( never.job.id ) ).step === 'done',
    'asked again, the same recording is transcribed: nothing has to be said twice' );

const halted = await recorded( [ null, 'zu spät' ], 429 );
await transcribeJob( halted.job, halted.client );
check( halted.tags.length === 1 && halted.job.transcript.length === 0 && ( await loadRun( halted.job.id ) ).error === UNANSWERED,
    'where access to the model is halted no second call is made' );

const silent = await recorded( [ '' ] );
await transcribeJob( silent.job, silent.client );
check( silent.tags.length === 1 && silent.job.transcript.length === 1 && silent.job.transcript[ 0 ].text === '' && silent.job.transcript[ 0 ].approve === true,
    'an answer that is empty is what was heard: the piece is kept, for a person to listen' );

const reply = await recorded( [ null, null ] );
const said = await transcribeAnswer( reply.job, [ 1 ], 'q1', reply.client );
check( said.length === 0 && ( reply.job.transcript || [] ).length === 0, 'an answer to a question the model did not transcribe is no piece of the transcript' );

process.exit( failed ? 1 : 0 );
