// The server's API, as the app uses it. Same origin, plain fetch.

async function json( response ) {
    const data = await response.json().catch( () => ( {} ) );
    if ( !response.ok ) {
        throw new Error( data.error || ( 'HTTP ' + response.status ) );
    }
    return data;
}

export const api = {
    forms: () => fetch( '/api/forms' ).then( json ),
    jobs: () => fetch( '/api/jobs' ).then( json ),
    job: ( id ) => fetch( '/api/jobs/' + id ).then( json ),
    // png: a Blob or ArrayBuffer of the page
    createJob: ( png ) => fetch( '/api/jobs', { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: png } ).then( json ),
    addPage: ( id, png ) => fetch( '/api/jobs/' + id + '/pages', { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: png } ).then( json ),
    fromForm: ( form ) => fetch( '/api/jobs/from/' + form, { method: 'POST' } ).then( json ),
    run: ( id ) => fetch( '/api/jobs/' + id + '/run', { method: 'POST' } ).then( json ),
    // piece: { n, start, duration, blob, format }
    addAudio: ( id, piece ) => fetch( '/api/jobs/' + id + '/audio', {
        method: 'POST',
        headers: { 'Content-Type': piece.format === 'mp3' ? 'audio/mpeg' : 'audio/wav', 'X-Piece': String( piece.n ), 'X-Start': String( piece.start ), 'X-Duration': String( piece.duration ) },
        body: piece.blob,
    } ).then( json ),
    transcribe: ( id ) => fetch( '/api/jobs/' + id + '/transcribe', { method: 'POST' } ).then( json ),
    pageUrl: ( id, n ) => '/api/jobs/' + id + '/pages/' + n,
    // asks for the job until the pipeline is done or failed; onStep( run ) on every answer
    async wait( id, onStep, every = 800 ) {
        for ( ;; ) {
            const { job, run } = await api.job( id );
            onStep?.( run, job );
            if ( run.step === 'done' || run.step === 'error' ) {
                return { job, run };
            }
            await new Promise( ( r ) => setTimeout( r, every ) );
        }
    },
};
