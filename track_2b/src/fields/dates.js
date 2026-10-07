// Dates as people say and write them in Switzerland.

export const MONTHS = [ 'januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember' ];

// Day as YYYY-MM-DD from "22.11.2018", "22. November 2018" or "2018-11-22"; empty when none.
export function day( t ) {
    const s = String( t || '' ).toLowerCase();
    let m = s.match( /(\d{4})-(\d{2})-(\d{2})/ );
    if ( m ) {
        return m[ 1 ] + '-' + m[ 2 ] + '-' + m[ 3 ];
    }
    m = s.match( /(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/ );
    if ( m ) {
        return m[ 3 ] + '-' + m[ 2 ].padStart( 2, '0' ) + '-' + m[ 1 ].padStart( 2, '0' );
    }
    m = s.match( new RegExp( '(\\d{1,2})\\.?\\s*(' + MONTHS.join( '|' ) + ')\\s*(\\d{4})' ) );
    if ( m ) {
        return m[ 3 ] + '-' + String( MONTHS.indexOf( m[ 2 ] ) + 1 ).padStart( 2, '0' ) + '-' + m[ 1 ].padStart( 2, '0' );
    }
    return '';
}

// The day written the Swiss way, DD.MM.YYYY; the text itself when it holds no day.
export function swiss( t ) {
    const d = day( t );
    if ( !d ) {
        return t;
    }
    const [ y, m, dd ] = d.split( '-' );
    return dd + '.' + m + '.' + y;
}
