// Templates, mustache-like. A template is a string; render( name, data ) fills it:
//   {{a.b}}            value at a dotted path, HTML-escaped
//   {{{a.b}}}          the same, raw
//   {{#list}}…{{/list}} once per item of an array (the item is the context, {{.}} is the item itself),
//                       or once when the value is truthy (the value is the context)
//   {{^list}}…{{/list}} when the value is empty, false or missing
//   {{> name}}         another template, with the same context
//   {{t:key}}          a translation, with the context as parameters
// A path is looked up in the current context first, then in the ones around it. Pure functions; the templates
// are loaded once by main.js and handed in.

export function createTemplates( sources, t ) {
    const compiled = new Map();
    for ( const [ name, source ] of Object.entries( sources ) ) {
        compiled.set( name, compile( source ) );
    }

    function render( name, data = {} ) {
        const tree = compiled.get( name );
        if ( !tree ) {
            throw new Error( 'no template ' + name );
        }
        return paint( tree, [ data ] );
    }

    function paint( nodes, stack ) {
        let out = '';
        for ( const node of nodes ) {
            if ( typeof node === 'string' ) {
                out += node;
            } else if ( node.kind === 'value' ) {
                const v = lookup( stack, node.path );
                out += node.raw ? str( v ) : escape( str( v ) );
            } else if ( node.kind === 'translate' ) {
                out += escape( t( node.key, stack[ stack.length - 1 ] ) );
            } else if ( node.kind === 'partial' ) {
                out += paint( compiled.get( node.name ) || [], stack );
            } else if ( node.kind === 'section' ) {
                const v = lookup( stack, node.path );
                if ( node.inverted ) {
                    if ( !v || ( Array.isArray( v ) && !v.length ) ) {
                        out += paint( node.body, stack );
                    }
                } else if ( Array.isArray( v ) ) {
                    for ( const item of v ) {
                        out += paint( node.body, [ ...stack, item ] );
                    }
                } else if ( v ) {
                    out += paint( node.body, [ ...stack, v ] );
                }
            }
        }
        return out;
    }

    return { render, has: ( name ) => compiled.has( name ) };
}

// The template as a tree of strings and tags; sections nest.
function compile( source ) {
    const root = [];
    const open = [];
    let current = root;
    const re = /\{\{\{\s*([^}]+?)\s*\}\}\}|\{\{\s*([#^/>]?)\s*([^}]+?)\s*\}\}/g;
    let last = 0;
    let m;
    while ( ( m = re.exec( source ) ) ) {
        if ( m.index > last ) {
            current.push( source.slice( last, m.index ) );
        }
        last = re.lastIndex;
        if ( m[ 1 ] !== undefined ) {
            current.push( { kind: 'value', path: m[ 1 ], raw: true } );
            continue;
        }
        const sigil = m[ 2 ];
        const name = m[ 3 ];
        if ( sigil === '#' || sigil === '^' ) {
            const node = { kind: 'section', path: name, inverted: sigil === '^', body: [] };
            current.push( node );
            open.push( current );
            current = node.body;
        } else if ( sigil === '/' ) {
            current = open.pop() || root;
        } else if ( sigil === '>' ) {
            current.push( { kind: 'partial', name } );
        } else if ( name.startsWith( 't:' ) ) {
            current.push( { kind: 'translate', key: name.slice( 2 ) } );
        } else {
            current.push( { kind: 'value', path: name, raw: false } );
        }
    }
    if ( last < source.length ) {
        current.push( source.slice( last ) );
    }
    return root;
}

function lookup( stack, path ) {
    if ( path === '.' ) {
        return stack[ stack.length - 1 ];
    }
    const parts = path.split( '.' );
    for ( let i = stack.length - 1; i >= 0; i-- ) {
        let v = stack[ i ];
        if ( v === null || typeof v !== 'object' || !( parts[ 0 ] in v ) ) {
            continue;
        }
        for ( const p of parts ) {
            v = v === null || v === undefined ? undefined : v[ p ];
        }
        return v;
    }
    return undefined;
}

function str( v ) {
    return v === undefined || v === null ? '' : String( v );
}

export function escape( s ) {
    return s.replace( /[&<>"']/g, ( c ) => ( { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } )[ c ] );
}
