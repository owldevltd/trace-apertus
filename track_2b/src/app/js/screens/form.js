import { $, on } from '../dom.js';
import { escape } from '../template.js';
import { fieldsOf } from '../model.js';
import { api } from '../api.js';
import { drawPreview, wirePreview } from '../preview.js';
import { switchPane } from '../router.js';
import * as listen from '../listen.js';
import * as sign from './sign.js';

// One form: its fields with state and value, the page preview, the transcript, the legal texts. Before
// dictation the fields are empty and the button says "Start listening"; after it, every entry carries ok,
// unclear or missing, and unclear or missing ones ask for a decision. A form with a dialogue shows its fields
// as a conversation: the question of each unit on the left, in plain words where one holds and with the printed
// label beside it, and what was said on the right. A bare label had lost its context in the list of fields.
// The questions can be answered one by one, typed or spoken, and each answer stays with its question; a question
// with nothing to enter is ticked off. Spoken, the answers follow each other as in a conversation: the microphone
// stays open, the level is drawn at the question, and an answer ends at a pause. Saying everything at once still
// works and fills what is open.
//
// Where the language of the app is not the language of the form, the dialogue is translated once when the form is
// first opened, and the person answers in their own language. When every question is answered they go on: the
// answers are translated into the language of the form and shown with what was said beside them, to be checked
// once more before sending.

const PILLS = [ 'fields', 'preview', 'transcript', 'legal' ];
const CHIP = { ok: [ 'ok', 'ok' ], unclear: [ 'warn', 'unclear' ], missing: [ 'bad', 'missing' ], empty: [ '', 'empty' ], sign: [ '', 'type.sign' ] };

// a job's form is fetched from the server the first time it is opened
export async function show( ctx, entry ) {
    if ( !ctx.model.formOf( entry ) ) {
        ctx.body( 'form' ).innerHTML = '<div class="grey row"><div class="spinner"></div></div>';
        ctx.bottom( 'form' ).innerHTML = '';
        if ( ctx.router.top().id !== 'form' ) {
            ctx.router.push( 'form' );
        }
        try {
            await ctx.model.loadForm( entry );
        } catch ( error ) {
            ctx.body( 'form' ).innerHTML = '<div class="hero">' + escape( ctx.t( 'job.failed', { e: error.message } ) ) + '</div>';
            return;
        }
    }
    if ( entry.jobId && ctx.model.formOf( entry ).untranslated ) {
        await translate( ctx, entry );
    }
    render( ctx, entry );
    if ( ctx.router.top().id !== 'form' ) {
        ctx.router.push( 'form' );
    }
}

// The page that says the app is at work on the form, in the place of the form itself, with a bar for how far
// the work is.
function working( ctx, title, steps, progress ) {
    ctx.body( 'form' ).innerHTML = ctx.tpl.render( 'recognizing', { title, steps, progress, bar: { pct: 0 } } );
    ctx.bottom( 'form' ).innerHTML = '';
}

// Moves the bar of that page, and its line of text, without drawing the page anew. share: 0 to 1.
function advance( ctx, share, text ) {
    const body = ctx.body( 'form' );
    const bar = $( '[data-bar]', body );
    if ( bar ) {
        bar.style.width = Math.round( 100 * Math.min( 1, share ) ) + '%';
    }
    if ( text && $( '[data-progress]', body ) ) {
        $( '[data-progress]', body ).textContent = text;
    }
}

// The dialogue into the language of the app, once per form and language. Without a model, or when it fails, the
// form stays in its own language.
async function translate( ctx, entry ) {
    const { t } = ctx;
    ctx.state.current = entry;
    working( ctx, t( 'tr.title' ), [ t( 'tr.m1' ), t( 'tr.m2' ) ], t( 'tr.wait' ) );
    if ( ctx.router.top().id !== 'form' ) {
        ctx.router.push( 'form' );
    }
    try {
        const started = await queued( ctx, () => api.translate( entry.jobId, ctx.i18n.lang ) );
        if ( !started.ready ) {
            // the run counts its calls to the model: done of planned
            const { run } = await api.wait( entry.jobId, ( r ) => {
                if ( r.step === 'translate' && r.of && ctx.state.current === entry && ctx.router.top().id === 'form' ) {
                    advance( ctx, r.page / r.of );
                }
            }, 700 );
            if ( run.step === 'error' ) {
                throw new Error( run.error || 'translation' );
            }
        }
    } catch ( error ) {
        ctx.toast( t( 'job.failed', { e: error.message } ) );
    }
    ctx.model.forget( entry.jobId );
    await ctx.model.loadForm( entry );
}

// The answers into the language of the form, when the person goes on; then the form shows each value with what
// was said beside it.
async function translateValues( ctx, entry ) {
    const { t } = ctx;
    const steps = [ t( 'trv.m1' ), t( 'trv.m2' ) ];
    const all = ctx.model.formOf( entry ).toTranslate;
    working( ctx, t( 'trv.title' ), steps, t( 'trv.progress', { a: 0, b: all } ) );
    try {
        const started = await queued( ctx, () => api.translateValues( entry.jobId ) );
        if ( !started.ready ) {
            const { run } = await api.wait( entry.jobId, ( r ) => {
                if ( r.step === 'translate' && all && ctx.state.current === entry && ctx.router.top().id === 'form' ) {
                    advance( ctx, r.page / all, t( 'trv.progress', { a: r.page, b: all } ) );
                }
            }, 700 );
            if ( run.step === 'error' ) {
                throw new Error( run.error || 'translation' );
            }
        }
    } catch ( error ) {
        ctx.toast( t( 'job.failed', { e: error.message } ) );
    }
    ctx.model.forget( entry.jobId );
    await ctx.model.loadForm( entry );
    if ( ctx.state.current === entry && ctx.router.top().id === 'form' ) {
        render( ctx, entry );
    }
}

// The person goes on: what is still open stays empty, and the form shows as filled. A job is told so on the
// server; the walk-through leaves the fields of its open questions empty. Answers given in another language than
// the form's are translated next.
async function goOn( ctx, entry ) {
    const f = ctx.model.formOf( entry );
    ctx.state.asking = null;
    if ( !entry.jobId ) {
        entry.values = entry.values || {};
        for ( const id of ( f.dialogue || [] ).flatMap( ( u ) => u.fields ) ) {
            // what the walk-through's made-up values call missing is missing when it was not answered, too
            entry.values[ id ] = entry.values[ id ] || ( f.values[ id ]?.[ 1 ] === 'missing' ? [ ...f.values[ id ] ] : [ '', 'empty', '' ] );
        }
        ctx.store.touch();
        render( ctx, entry );
        return;
    }
    if ( f.status !== 'filled' && f.status !== 'reviewed' ) {
        try {
            const { job } = await queued( ctx, () => api.goOn( entry.jobId ) );
            ctx.model.keep( job );
        } catch ( error ) {
            ctx.toast( ctx.t( 'job.failed', { e: error.message } ) );
            return;
        }
    }
    if ( ctx.model.formOf( entry ).toTranslate ) {
        await translateValues( ctx, entry );
        return;
    }
    if ( ctx.state.current === entry && ctx.router.top().id === 'form' ) {
        render( ctx, entry );
    }
}

export function render( ctx, entry ) {
    const { t, tpl, state } = ctx;
    state.current = entry;
    const f = ctx.model.formOf( entry );
    const all = fieldsOf( f, entry.off );
    // a job's values live on the server; a mocked form's in the entry
    if ( entry.jobId ) {
        entry.values = f.values;
        if ( f.status === 'filled' || f.status === 'reviewed' ) {
            entry.status = entry.status === 'sent' ? 'sent' : 'filled';
        }
    }
    const asked = f.dialogue ? conversation( ctx, f, entry ) : null;
    // filled: after the dictation, or with the last question answered
    const filled = !!entry.values && !( asked && asked.open );
    if ( !entry.jobId && filled && entry.status === 'verified' ) {
        entry.status = 'filled';
        ctx.store.touch();
    }
    const count = ( k ) => all.filter( ( fl ) => entry.values?.[ fl.id ]?.[ 1 ] === k ).length;
    const unclear = count( 'unclear' );
    const missing = count( 'missing' );
    const meta = filled
        ? [ t( 'meta.spoken', { d: entry.duration || '0:00' } ), t( 'meta.ok', { n: count( 'ok' ) } ), unclear ? t( 'meta.unclear', { n: unclear } ) : '', missing ? t( 'meta.missing', { n: missing } ) : '' ].filter( Boolean )
        : [ f.issuer, t( 'nfields', { n: all.length } ), t( 'meta.captured', { t: entry.created } ) ];
    // while the questions are being answered: how many have an answer, how many of the required ones, and that
    // the person can go on whenever it is enough for them
    const going = asked && [ t( 'form.progress', { a: asked.total - asked.open, b: asked.total } ), asked.required ? t( 'form.required', { a: asked.given, b: asked.required } ) : '', t( 'form.goon' ) ].filter( Boolean ).join( ' ' );
    const card = !filled ? ( !asked ? t( 'form.empty', { f: f.name } ) : entry.values ? going : t( 'form.ask', { f: f.name } ) )
        : f.toTranslate ? t( 'form.translate' )
        : unclear + missing ? [ unclear ? t( 'form.unclear', { n: unclear } ) : '', missing ? t( 'form.missing', { n: missing } ) : '', t( 'form.then' ) ].filter( Boolean ).join( ' ' )
        : t( 'form.done' );
    const sections = f.sections.map( ( s ) => {
        // in a conversation only what no unit asks for stays in the list: the signature
        const fields = s.fields.filter( ( fl ) => !entry.off.includes( fl.id ) && !( asked && asked.used.has( fl.id ) ) );
        return {
            // the conversation has named the section already where its last turn belongs to it
            title: asked && asked.last === s.title ? '' : s.title,
            ok: filled && !asked ? t( 'sec.ok', { a: fields.filter( ( fl ) => entry.values[ fl.id ]?.[ 1 ] === 'ok' ).length, b: fields.length } ) : '',
            fields: fields.map( ( fl ) => fieldView( ctx, fl, entry.values?.[ fl.id ], f, filled ) ),
        };
    } ).filter( ( s ) => s.fields.length );
    // a job names the catalogue its legal text comes from; the walk-through's is made up and says so
    const laws = f.laws.map( ( l ) => ( { ...l, fields: l.fields.map( ( id ) => all.find( ( x ) => x.id === id )?.label || id ).join( ', ' ), src: l.source || t( 'law.src' ) } ) );
    const body = ctx.body( 'form' );
    body.innerHTML = tpl.render( 'form', {
        name: f.name,
        meta,
        pills: PILLS.map( ( key ) => ( { key, label: t( key === 'fields' && asked ? 'questions' : key ), on: state.tab === key } ) ),
        paneTitle: t( asked ? 'questions' : 'fields' ),
        turns: asked ? asked.turns : [],
        isFields: state.tab === 'fields',
        isPreview: state.tab === 'preview',
        isTranscript: state.tab === 'transcript',
        isLegal: state.tab === 'legal',
        card,
        sections,
        // the walk-through's made-up transcript shows once something was dictated, not on a fresh form
        transcript: f.transcript && f.transcript.length && ( entry.jobId || entry.duration ) ? f.transcript : [],
        trHint: t( entry.jobId ? 'tr.hint' : 'tr.hint.demo' ),
        transcribing: state.transcribing && state.transcribing === entry.jobId,
        filling: state.transcribing && state.transcribing === entry.jobId && f.transcript && f.transcript.length > 0,
        laws,
        pvHint: filled ? t( 'form.pv.filled' ) : t( 'form.pv.empty' ),
        pvMeta: t( 'pv.meta', { n: f.pages } ),
        preview: drawPreview( f.sizes, f.blocks, all, entry.values, entry.off ),
    } );
    const hearing = listen.active( ctx );
    ctx.bottom( 'form' ).innerHTML = hearing && hearing.entry === entry
        // the microphone is open: a conversation shows its level at the question, a dictation here
        ? ( hearing.talk
            ? '<button class="btn block press" data-stop><span class="dot pulse"></span>&nbsp;' + escape( t( 'rec.stop' ) ) + '</button>'
            : '<div class="row"><canvas class="eq grow" data-eq width="480" height="72"></canvas><span class="num" data-timer>0:00</span><button class="btn press" data-stop>' + escape( t( 'rec.stop' ) ) + '</button></div>' )
        : entry.status === 'sent'
        ? '<button class="btn outline block" disabled>' + escape( t( 'btn.sentdone' ) ) + '</button>'
        : filled && f.toTranslate
            // answered in another language than the form's: the answers are translated before they can be sent
            ? '<button class="btn block press" data-next>' + escape( t( 'btn.next' ) ) + '</button>'
        : filled
            // what is required and missing is said on the card and before sending; it does not lock the button
            ? '<div class="row"><button class="btn outline press" data-record aria-label="' + escape( t( 'btn.again' ) ) + '"><span class="dot"></span></button><button class="btn grow press" data-sign>' + escape( t( 'btn.sign' ) ) + '</button></div>'
        : asked && entry.values
            // with the first answer the person can go on at any time: what is open stays empty
            ? '<div class="row"><button class="btn outline grow press" data-record><span class="dot"></span>&nbsp;' + escape( t( 'btn.listen' ) ) + '</button><button class="btn press" data-next>' + escape( t( 'btn.next' ) ) + '</button></div>'
            : '<button class="btn block press" data-record><span class="dot"></span>&nbsp;' + escape( t( 'btn.listen' ) ) + '</button>';
    for ( const pv of body.querySelectorAll( '.pv' ) ) {
        wirePreview( pv, ( id ) => {
            const fl = all.find( ( x ) => x.id === id );
            const v = entry.values?.[ id ]?.[ 0 ];
            ctx.toast( fl.label + ( v ? ': ' + v : '' ) );
        } );
    }
}

// The fields of a form as a conversation, unit by unit in the order of the dialogue. Returns the turns, the ids
// of the fields they cover and how many questions are still open. An open question shows alone, the one that is
// being asked with a place to answer; an answered one has what was said under it, with the same decisions as in
// the list. A unit that is not asked shows only when it carries a value, so nothing that was filled in is hidden.
function conversation( ctx, f, entry ) {
    const { t, state } = ctx;
    const shown = new Map( fieldsOf( f, entry.off ).map( ( fl ) => [ fl.id, fl ] ) );
    const section = new Map( f.sections.flatMap( ( s ) => s.fields.map( ( fl ) => [ fl.id, s.title ] ) ) );
    const valueOf = ( fl ) => entry.values?.[ fl.id ];
    const needs = ( fl ) => [ 'unclear', 'missing' ].includes( valueOf( fl )?.[ 1 ] );
    const used = new Set();
    const units = [];
    for ( const u of f.dialogue ) {
        u.fields.forEach( ( id ) => used.add( id ) );
        const fields = u.fields.map( ( id ) => shown.get( id ) ).filter( Boolean );
        if ( fields.length && !( u.skip && !fields.some( ( fl ) => valueOf( fl )?.[ 0 ] ) ) ) {
            units.push( { u, fields, answered: fields.some( ( fl ) => valueOf( fl ) !== undefined ) } );
        }
    }
    // open: not answered, and no answer on its way to the server
    const open = entry.status === 'sent' ? [] : units.filter( ( x ) => !x.answered && !state.pending.has( x.u.id ) );
    // the question that is being asked: where the conversation stands, else the one the person chose (also an
    // answered one, to add to it), else the first that is open
    const hearing = listen.active( ctx );
    const talking = hearing && hearing.entry === entry && hearing.talk;
    const chosen = talking ? hearing.unit : state.asking;
    const current = entry.status === 'sent' ? null : units.find( ( x ) => x.u.id === chosen ) || open[ 0 ] || null;
    const turns = [];
    let title = null;
    for ( const x of units ) {
        const { u, fields, answered } = x;
        const choice = u.kind === 'choice';
        const writing = fields.length === 1 && fields[ 0 ].kind !== 'checkbox' && fields[ 0 ].kind !== 'radio';
        // what stands on the right: a single field always; of a choice the ticks and what needs a decision; of a
        // table the cells with a value and the next empty row, to go on writing
        let said = [];
        // a required choice with no tick: said once for the question, not as a box that is missing
        const lacking = choice && fields.some( ( fl ) => valueOf( fl )?.[ 1 ] === 'missing' );
        if ( answered && !choice && u.kind !== 'table' ) {
            said = fields;
        } else if ( answered && choice ) {
            said = fields.filter( ( fl ) => valueOf( fl )?.[ 0 ] || valueOf( fl )?.[ 1 ] === 'unclear' );
        } else if ( answered ) {
            const empty = ( fl ) => !valueOf( fl )?.[ 0 ] && !needs( fl );
            const next = Math.floor( fields.findIndex( empty ) / u.columns );
            said = fields.filter( ( fl, i ) => !empty( fl ) || Math.floor( i / u.columns ) === next );
        }
        const answers = said.map( ( fl ) => {
            const view = fieldView( ctx, fl, valueOf( fl ), f, true );
            const i = fields.indexOf( fl );
            const cell = u.kind === 'table' ? t( 'chat.cell', { r: Math.floor( i / u.columns ) + 1, c: i % u.columns + 1 } ) : '';
            // under its question a single answer needs no label; a cell says which one it is
            return { ...view, label: [ u.kind === 'table' && !fl.bare ? fl.label : '', cell ].filter( Boolean ).join( ' · ' ), law: false };
        } );
        const head = section.get( fields[ 0 ].id );
        const pending = state.pending.has( u.id );
        const tick = !answered ? 'open' : fields.some( needs ) ? 'look' : 'done';
        turns.push( {
            id: u.id,
            head: head !== title ? head : '',
            // a translated dialogue asks with its translated label where no question holds; what is printed
            // on the form stays as it is printed
            question: u.question || ( choice ? u.ask || t( 'type.choice' ) : u.ask || u.label || fields[ 0 ].label ),
            printed: ( u.question || u.ask ) && u.label && !choice ? t( 'chat.printed', { printed: u.label } ) : '',
            asPrinted: !u.question && !u.ask && !!u.label && !choice,
            law: fields.some( ( fl ) => f.laws.some( ( l ) => l.fields.includes( fl.id ) ) ),
            // what the form requires says so at the question, in red as long as nothing stands there
            required: u.required ? ( fields.some( ( fl ) => valueOf( fl )?.[ 0 ] ) ? 'plain' : 'bad' ) : '',
            lacking: lacking ? t( 'hint.missing' ) : '',
            options: choice ? fields.map( ( fl ) => ( { id: fl.id, label: ( u.options && u.options[ fl.id ] ) || fl.option || fl.label, on: !!valueOf( fl )?.[ 0 ], can: ( answered || x === current ) && entry.status !== 'sent' } ) ) : [],
            answers,
            none: answered && !answers.length && !lacking,
            // ticked off: answered and nothing left to decide; an open question is ticked off by hand
            tick,
            mark: { open: '', look: '!', done: '✓' }[ tick ],
            canTick: !answered && !pending && entry.status !== 'sent',
            current: x === current,
            canAsk: x !== current && !talking && entry.status !== 'sent',
            pending,
            // where the conversation stands the level is drawn; else a place to type, or to start speaking
            live: x === current && talking,
            compose: x === current && !talking && !pending ? { id: u.id, text: writing, hint: writing ? '' : t( choice ? 'chat.choose' : 'chat.table' ) } : null,
        } );
        title = head;
    }
    const must = units.filter( ( x ) => x.u.required );
    return { turns, used, last: title, open: open.length, total: units.length, current: current ? current.u.id : null,
        required: must.length, given: must.filter( ( x ) => x.fields.some( ( fl ) => valueOf( fl )?.[ 0 ] ) ).length };
}

// The question that is asked next, as the conversation would show it.
export function asking( ctx, entry ) {
    return conversation( ctx, ctx.model.formOf( entry ), entry ).current;
}

// What changes a job on the server goes one after the other: every request rewrites the job, and the answers of
// a conversation are still on their way while the next one is spoken.
export function queued( ctx, request ) {
    const result = ( ctx.state.queue || Promise.resolve() ).then( request );
    ctx.state.queue = result.catch( () => {} );
    return result;
}

export function leave( ctx ) {
    listen.cancel( ctx );
}

function fieldView( ctx, fl, v, f, filled ) {
    const { t } = ctx;
    const [ val, st, note, said ] = v || [ '', filled ? 'empty' : 'open' ];
    const chip = CHIP[ st ];
    const mark = fl.kind === 'checkbox' || fl.kind === 'radio';
    const shown = val ? ( mark ? '✓ ' + ( fl.option || fl.label ) : val ) : st === 'sign' ? t( 'v.sign' ) : st === 'missing' ? t( 'v.missing' ) : st === 'open' ? t( 'v.open' ) : t( 'v.left' );
    return {
        id: fl.id,
        label: fl.label,
        law: f.laws.some( ( l ) => l.fields.includes( fl.id ) ),
        state: st,
        chip: chip ? chip[ 0 ] || 'plain' : '',
        chipLabel: chip ? t( chip[ 1 ] ) : '',
        shown,
        isEmpty: !val,
        note: note || '',
        // what the person gave in their own language, where the value was translated; a value that asks for a
        // decision says it in its note already
        said: said && st !== 'unclear' ? t( 'v.translated', { q: said } ) : '',
        unclear: st === 'unclear',
        missing: st === 'missing',
        editable: filled && st !== 'unclear' && st !== 'missing' && st !== 'sign',
    };
}

export function wire( ctx ) {
    const body = ctx.body( 'form' );
    on( body, 'click', '[data-pill]', ( b ) => {
        const key = b.dataset.pill;
        if ( key === ctx.state.tab ) {
            return;
        }
        const dir = PILLS.indexOf( key ) >= PILLS.indexOf( ctx.state.tab ) ? 1 : -1;
        switchPane( body, dir, () => {
            ctx.state.tab = key;
            render( ctx, ctx.state.current );
        } );
    } );
    on( body, 'click', '.seg', ( el ) => el.classList.toggle( 'open' ) );
    on( body, 'click', '[data-confirm]', ( b ) => {
        const entry = ctx.state.current;
        if ( entry.jobId ) {
            decide( ctx, entry, b.dataset.confirm, { decision: 'confirmed' } );
            return;
        }
        entry.values[ b.dataset.confirm ][ 1 ] = 'ok';
        entry.values[ b.dataset.confirm ][ 2 ] = '';
        ctx.store.touch();
        render( ctx, entry );
    } );
    on( body, 'click', '[data-edit]', ( b ) => edit( ctx, b.dataset.edit, b.closest( '.field' ) ) );
    on( body, 'click', '[data-save]', ( b ) => {
        const entry = ctx.state.current;
        const v = $( '[data-input]', body ).value.trim();
        if ( entry.jobId ) {
            decide( ctx, entry, b.dataset.save, v ? { decision: 'changed', value: v } : { decision: 'rejected' } );
            return;
        }
        entry.values[ b.dataset.save ] = [ v, v ? 'ok' : 'missing', v ? '' : ctx.t( 'v.notsaid' ) ];
        ctx.store.touch();
        render( ctx, entry );
    } );
    on( body, 'click', '[data-cancel]', () => render( ctx, ctx.state.current ) );
    // the conversation: choose a question, answer it typed or spoken, tick it off
    on( body, 'click', '[data-ask]', ( el, event ) => {
        if ( event.target.closest( '.opt' ) ) {
            return;
        }
        ctx.state.asking = el.dataset.ask;
        render( ctx, ctx.state.current );
        $( '[data-answer]', body )?.focus();
    } );
    on( body, 'click', '[data-send]', ( b ) => {
        const text = $( '[data-answer]', body ).value.trim();
        if ( text ) {
            answer( ctx, ctx.state.current, b.dataset.send, { text } ).then( () => $( '[data-answer]', body )?.focus() );
        }
    } );
    on( body, 'keydown', '[data-answer]', ( el, event ) => {
        if ( event.key === 'Enter' && el.value.trim() ) {
            answer( ctx, ctx.state.current, el.dataset.answer, { text: el.value.trim() } ).then( () => $( '[data-answer]', body )?.focus() );
        }
    } );
    on( body, 'click', '[data-speak]', ( b ) => {
        const f = ctx.model.formOf( ctx.state.current );
        listen.start( ctx, ctx.state.current, f.dialogue.find( ( u ) => u.id === b.dataset.speak ) );
    } );
    on( body, 'click', '[data-stop]', () => listen.stop( ctx ) );
    on( body, 'click', '[data-tick]', ( b ) => answer( ctx, ctx.state.current, b.dataset.tick, { skip: true } ) );
    const bottom = ctx.bottom( 'form' );
    on( bottom, 'click', '[data-record]', () => listen.start( ctx, ctx.state.current ) );
    on( bottom, 'click', '[data-stop]', () => listen.stop( ctx ) );
    on( bottom, 'click', '[data-next]', () => goOn( ctx, ctx.state.current ) );
    on( bottom, 'click', '[data-sign]', () => sign.open( ctx, ctx.state.current ) );
}

// An answer to one question: { text } as typed, { sound: piece } as said, { said: true } as said in the
// walk-through, { skip: true } for nothing to enter. For a job the server puts the values into the fields of the
// unit and says whether the answer is enough; the walk-through takes a typed answer as it stands and its made-up
// values for a spoken one. The question shows as on its way until the server has answered.
export async function answer( ctx, entry, id, what ) {
    const f = ctx.model.formOf( entry );
    const unit = f.dialogue.find( ( u ) => u.id === id );
    const shown = () => ctx.state.current === entry && ctx.router.top().id === 'form';
    ctx.state.asking = null;
    if ( entry.jobId ) {
        ctx.state.pending.add( id );
        render( ctx, entry );
        try {
            const { job, heard } = await queued( ctx, async () => {
                if ( !what.sound ) {
                    return api.answer( entry.jobId, id, what );
                }
                // the piece first, numbered by the server, then the answer made of it
                const { piece } = await api.addAudio( entry.jobId, { ...what.sound, n: 0 } );
                return api.answer( entry.jobId, id, { pieces: [ piece ] } );
            } );
            ctx.model.keep( job );
            if ( heard === false ) {
                ctx.toast( ctx.t( 'chat.unheard' ) );
            }
        } catch ( error ) {
            ctx.toast( ctx.t( 'job.failed', { e: error.message } ) );
        }
        ctx.state.pending.delete( id );
    } else {
        entry.values = entry.values || {};
        for ( const fl of fieldsOf( f ).filter( ( x ) => unit.fields.includes( x.id ) ) ) {
            entry.values[ fl.id ] = what.text ? [ what.text, 'ok', '' ] : what.said && f.values[ fl.id ] ? [ ...f.values[ fl.id ] ] : [ '', 'empty', '' ];
        }
        ctx.state.pending.delete( id );
        ctx.store.touch();
    }
    if ( shown() ) {
        render( ctx, entry );
        $( '.turn.current', ctx.body( 'form' ) )?.scrollIntoView( { block: 'center', behavior: 'smooth' } );
    }
}

// a person's decision on a job's field goes to the server; the form comes back with it
async function decide( ctx, entry, id, decision ) {
    try {
        const { job } = await queued( ctx, () => api.review( entry.jobId, id, decision ) );
        ctx.model.keep( job );
    } catch ( error ) {
        ctx.toast( ctx.t( 'job.failed', { e: error.message } ) );
    }
    render( ctx, entry );
}

// change a value in place: a text box, a text area, or a tick for a mark
function edit( ctx, id, wrap ) {
    const { t, state } = ctx;
    const entry = state.current;
    const f = ctx.model.formOf( entry );
    const fl = fieldsOf( f ).find( ( x ) => x.id === id );
    // a tick can be the first thing entered
    entry.values = entry.values || {};
    const cur = entry.values[ id ]?.[ 0 ] || '';
    if ( fl.kind === 'checkbox' || fl.kind === 'radio' ) {
        // radios of one group exclude each other: ticking one takes the tick from the others
        const others = cur || fl.kind !== 'radio' || !fl.group ? [] : fieldsOf( f ).filter( ( x ) => x.group === fl.group && x.id !== id && entry.values[ x.id ]?.[ 0 ] );
        if ( entry.jobId ) {
            // one after the other: every decision rewrites the job on the server
            others.reduce( ( done, x ) => done.then( () => queued( ctx, () => api.review( entry.jobId, x.id, { decision: 'rejected' } ) ) ), Promise.resolve() )
                .catch( () => {} )
                .then( () => decide( ctx, entry, id, cur ? { decision: 'rejected' } : { decision: 'changed', value: 'x' } ) );
            return;
        }
        for ( const x of others ) {
            entry.values[ x.id ] = [ '', 'empty', '' ];
        }
        entry.values[ id ] = [ cur ? '' : 'x', cur ? 'empty' : 'ok', '' ];
        ctx.store.touch();
        render( ctx, entry );
        return;
    }
    const value = $( '.value', wrap );
    value.classList.remove( 'empty' );
    value.innerHTML = fl.kind === 'multiline'
        ? '<textarea data-input>' + escape( cur ) + '</textarea>'
        : '<input data-input value="' + escape( cur ) + '">';
    const wide = $( '.wide', wrap ) || value.insertAdjacentElement( 'afterend', document.createElement( 'div' ) );
    wide.className = 'wide';
    wide.hidden = false;
    wide.innerHTML = '<div class="row gap"><button class="btn sm press" data-save="' + escape( id ) + '">' + escape( t( 'apply' ) ) + '</button><button class="btn outline sm press" data-cancel>' + escape( t( 'cancel' ) ) + '</button></div>';
    $( '[data-input]', wrap ).focus();
}
