import { FORMS } from './mock/forms.js';
import { BLOCKS } from './mock/blocks.js';
import { api } from './api.js';

// What the screens draw: a form view with name, pages, sections of fields, blocks, and what was dictated. It
// comes from a mocked form of the walk-through or from a job of the server; the screens do not care which.
// A saved entry names one of the two: formId for a mock, jobId for a job.

// a mocked form as a view
function fromMock( f ) {
    return { ...f, sizes: [ f.page ], blocks: BLOCKS[ f.id ] || [] };
}

// a job of the server as a view: one section per page, the fields and blocks as the pipeline found them
export function fromJob( job, t ) {
    const sections = job.pages.map( ( p ) => ( {
        title: t( 'page', { n: p.n } ),
        fields: job.fields.filter( ( f ) => f.page === p.n ).map( ( f ) => ( {
            id: f.id,
            label: f.label || t( 'field.unlabelled', { n: f.id.replace( /\D/g, '' ) } ),
            kind: f.kind,
            page: f.page,
            x: f.x,
            y: f.y,
            w: f.width,
            h: f.height,
            ...( f.group ? { group: f.group, option: f.option } : {} ),
        } ) ),
    } ) ).filter( ( s ) => s.fields.length );
    return {
        id: 'job:' + job.id,
        jobId: job.id,
        name: job.form.name,
        issuer: job.form.issuer || '',
        pages: job.pages.length,
        sizes: job.pages.map( ( p ) => ( { w: p.width, h: p.height } ) ),
        kind: 'captured',
        recipient: '',
        subject: job.form.name,
        sections,
        blocks: job.blocks.map( ( b ) => ( { type: b.type, page: b.page, x: b.x, y: b.y, w: b.width, h: b.height, content: b.content, fontSize: b.fontSize, color: b.color, background: b.background } ) ),
        transcript: ( job.transcript || [] ).map( ( p ) => ( { t: clock( p.start ), section: p.approve ? t( 'tr.listen' ) : '', summary: p.text, raw: p.raw } ) ),
        values: null,
        laws: [],
    };
}

function clock( sec ) {
    const s = Math.round( sec || 0 );
    return Math.floor( s / 60 ) + ':' + String( s % 60 ).padStart( 2, '0' );
}

export function createModel( t ) {
    const jobs = new Map();
    return {
        mocks: FORMS,
        // the view for an entry, when it is at hand
        formOf( entry ) {
            if ( entry.jobId ) {
                return jobs.get( entry.jobId ) || null;
            }
            const f = FORMS.find( ( x ) => x.id === entry.formId );
            return f ? fromMock( f ) : null;
        },
        // the view for an entry, fetched from the server when it is a job not seen yet
        async loadForm( entry ) {
            if ( entry.jobId && !jobs.has( entry.jobId ) ) {
                const { job } = await api.job( entry.jobId );
                jobs.set( job.id, fromJob( job, t ) );
            }
            return this.formOf( entry );
        },
        // a view fresh from a job the app just ran
        keep( job ) {
            const view = fromJob( job, t );
            jobs.set( job.id, view );
            return view;
        },
        // drop a cached job so the next load fetches it anew
        forget( id ) {
            jobs.delete( id );
        },
    };
}

// the fields of a view in one list, without the ones a person unticked
export const fieldsOf = ( form, off = [] ) => form.sections.flatMap( ( s ) => s.fields.filter( ( f ) => !off.includes( f.id ) ) );
