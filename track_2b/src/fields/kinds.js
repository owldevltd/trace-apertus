import { day, swiss } from './dates.js';

// What a field a person writes into takes, beyond text: a number, a date, a time of day, a telephone number,
// an e-mail address, a postcode, an IBAN, an identifier (a policy, customer or insurance number). The geometry
// knows a date and a signature by the words of the label and nothing else; the other kinds are proposed by the
// model when a form is captured or corrected (src/fields/predictor.js), and a person sets them in the mask in
// which a form is corrected. What a kind does is code and is the same for every form: write() puts a value the
// way a form takes it, fits() says whether a value is one of its kind. Neither changes what does not fit: such
// a value stays as it was said, and the person is asked to look.
//
// Why by kind and not over the whole text: counted 11 October 2026 without the model, in the 281 German
// transcripts of the speech measurements single digits said in a row occur three times, each two words long
// and each an estimate ("vor ein, zwei Wochen"); in a tester's dictation the house number and the postcode
// stand in one row of five ("Strasse eins, drei, zwei, null, null"). A row of digits is one number only where
// the field says so.

// One row of digits is read in text all the same: four single digits in front of a word are a postcode said
// digit by digit, and five are a house number and a postcode ("Strasse 1, 3, 2, 0, 0, Thun" is "Strasse 1,
// 3200 Thun"). Rows of two, as estimates are said, and longer rows stay. In the measured transcripts no row of
// three or more occurs at all. Set by the assistant, open: the four digits of a Swiss postcode.

// the kinds a person writes into; a tick mark and a signature are none
export const WRITTEN = [ 'text', 'multiline', 'number', 'date', 'time', 'phone', 'email', 'postcode', 'iban', 'identifier' ];

// the kinds a row of single digits is one number in
const JOINED = [ 'phone', 'postcode', 'identifier' ];

// single digits said one after the other, with spaces or commas between them; only looked for in a kind that
// takes one number and no decimal ("3,5" hours is a number, "3,5" in a telephone number is two digits)
const ROW = /(?<!\d)\d(?!\d)(?:\s*[\s,]\s*\d(?!\d))+/g;

// a number by itself: its digits, in threes with an apostrophe or a space where a person groups them, and a
// decimal part; "2, 3" is two numbers
const DIGITS = "[+-]?(?:\\d{1,3}(?:['’ ]\\d{3})+|\\d+)(?:[.,]\\d+)?";
const NUMBER = new RegExp( '^' + DIGITS + '$' );

// a number and the words behind it: the unit, which the label of the field names already
const WITH_UNIT = new RegExp( '^(' + DIGITS + ')\\s*(?:%|[\\p{L}.\\/]+(?:\\s+[\\p{L}.\\/]+)*)\\.?$', 'u' );

// hour and minute as they are said and written: "13 Uhr 5", "13.05 Uhr", "13h05", "13:05"
const CLOCK = /^(?:um\s+)?(\d{1,2})\s*(?:uhr|h|:|\.)\s*(\d{1,2})?\s*(?:uhr)?\.?$/i;

// Swiss postcodes have four digits. Set by the assistant, open: a form filled in for an address abroad.
const POSTCODE = /^\d{4}$/;

// A Swiss telephone number: ten digits from a zero on, or nine behind +41 or 0041. It is written in its usual
// groups whatever groups it came in; any other number stays as it is. Tried 11 October 2026: of six runs of one
// dictation, the number said digit by digit came out of the model as "0 79 41 23 68 5" five times and as
// "0794123685" once. Set by the assistant, open.
const SWISS_PHONE = /^(?:(0)|(?:\+|00)41)(\d{2})(\d{3})(\d{2})(\d{2})$/;

// The value written the way a form takes it; a value that is none of its kind comes back as it is.
export function write( kind, value ) {
    const v = String( value ?? '' ).trim();
    if ( kind === 'date' ) {
        return swiss( v );
    }
    if ( kind === 'time' ) {
        return clock( v ) || v;
    }
    if ( kind === 'phone' ) {
        return phone( v );
    }
    if ( JOINED.includes( kind ) ) {
        return v.replace( ROW, ( row ) => row.replace( /\D/g, '' ) );
    }
    if ( kind === 'iban' ) {
        const compact = v.replace( /[\s,]+/g, '' ).replace( /\.$/, '' ).toUpperCase();
        return checked( compact ) ? compact.replace( /(.{4})(?=.)/g, '$1 ' ) : v;
    }
    if ( kind === 'number' ) {
        const m = v.match( WITH_UNIT );
        return m ? m[ 1 ] : v;
    }
    if ( kind === 'text' || kind === 'multiline' ) {
        return postcodes( v );
    }
    return v;
}

// a telephone number: Swiss in its groups, else with the digits said one by one joined
function phone( v ) {
    const m = /^[+\d\s().\/,-]+$/.test( v ) ? v.replace( /[^+\d]/g, '' ).match( SWISS_PHONE ) : null;
    if ( m ) {
        return ( m[ 1 ] ? '0' : '+41 ' ) + m[ 2 ] + ' ' + m[ 3 ] + ' ' + m[ 4 ] + ' ' + m[ 5 ];
    }
    return v.replace( ROW, ( row ) => row.replace( /\D/g, '' ) );
}

// a postcode said digit by digit in front of the name of a place, written as one number
function postcodes( v ) {
    return v.replace( new RegExp( ROW.source + '(?=\\s*,?\\s+\\p{L})(\\s*,)?', 'gu' ), ( row ) => {
        const d = row.replace( /\D/g, '' );
        return d.length === 4 ? d : d.length === 5 ? d[ 0 ] + ', ' + d.slice( 1 ) : row;
    } );
}

// Is the value one of its kind? Text takes anything, and so does an identifier: nobody knows its form.
export function fits( kind, value ) {
    const v = String( value ?? '' ).trim();
    if ( kind === 'date' ) {
        return !!day( v );
    }
    if ( kind === 'time' ) {
        return clock( v ) === v;
    }
    if ( kind === 'number' ) {
        return NUMBER.test( v );
    }
    if ( kind === 'phone' ) {
        return /^\+?[\d\s()\/.-]*\d[\d\s()\/.-]*$/.test( v );
    }
    if ( kind === 'email' ) {
        return /^[^\s@]+@[^\s@]+\.[^\s@.]+$/.test( v );
    }
    if ( kind === 'postcode' ) {
        return POSTCODE.test( v );
    }
    if ( kind === 'iban' ) {
        return checked( v.replace( /\s+/g, '' ).toUpperCase() );
    }
    return true;
}

// "13:05" from a time of day as it was said, or null
function clock( v ) {
    const m = v.match( CLOCK );
    if ( !m || Number( m[ 1 ] ) > 23 || Number( m[ 2 ] || 0 ) > 59 ) {
        return null;
    }
    return m[ 1 ].padStart( 2, '0' ) + ':' + ( m[ 2 ] || '0' ).padStart( 2, '0' );
}

// the check digits of an IBAN (ISO 13616): the first four characters behind the rest, letters as numbers from
// 10 on, and the whole leaves 1 when divided by 97
function checked( iban ) {
    if ( !/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test( iban ) ) {
        return false;
    }
    let rest = 0;
    for ( const c of iban.slice( 4 ) + iban.slice( 0, 4 ) ) {
        for ( const d of String( parseInt( c, 36 ) ) ) {
            rest = ( rest * 10 + Number( d ) ) % 97;
        }
    }
    return rest === 1;
}
