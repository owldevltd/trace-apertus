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
    // piece: { n, start, duration, blob, format }; without n the server gives the next free number
    addAudio: ( id, piece ) => fetch( '/api/jobs/' + id + '/audio', {
        method: 'POST',
        headers: { 'Content-Type': piece.format === 'mp3' ? 'audio/mpeg' : 'audio/wav', ...( piece.n ? { 'X-Piece': String( piece.n ) } : {} ), 'X-Start': String( piece.start ), 'X-Duration': String( piece.duration ) },
        body: piece.blob,
    } ).then( json ),
    // answer: { text } as typed, { pieces: [ n, … ] } as said, or { skip: true }
    answer: ( id, unit, answer ) => fetch( '/api/jobs/' + id + '/answers/' + unit, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( answer ) } ).then( json ),
    // the form corrected by hand: { name, fields }; ready: true when there is nothing to wait for
    saveForm: ( id, edit ) => fetch( '/api/jobs/' + id + '/form', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( edit ) } ).then( json ),
    // the person goes on with questions open: what is not answered stays empty
    goOn: ( id ) => fetch( '/api/jobs/' + id + '/review', { method: 'POST' } ).then( json ),
    // the dialogue in the language of the person; ready: true when there is nothing to wait for
    translate: ( id, language ) => fetch( '/api/jobs/' + id + '/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( { language } ) } ).then( json ),
    // the values into the language of the form
    translateValues: ( id ) => fetch( '/api/jobs/' + id + '/translate/values', { method: 'POST' } ).then( json ),
    transcribe: ( id ) => fetch( '/api/jobs/' + id + '/transcribe', { method: 'POST' } ).then( json ),
    fill: ( id ) => fetch( '/api/jobs/' + id + '/fill', { method: 'POST' } ).then( json ),
    draft: ( id ) => fetch( '/api/jobs/' + id + '/draft' ).then( json ),
    send: ( id ) => fetch( '/api/jobs/' + id + '/send', { method: 'POST' } ).then( json ),
    pdfUrl: ( id ) => '/api/jobs/' + id + '/output.pdf',
    // decision: { decision: 'confirmed' | 'changed' | 'rejected', value? }
    review: ( id, fid, decision ) => fetch( '/api/jobs/' + id + '/fields/' + fid, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( decision ) } ).then( json ),
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
