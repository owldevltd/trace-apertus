import { digits, numberWord } from '../src/speech/numbers.js';

// German number words → digits, the cases the speech evaluation relied on. No model.
//
//   node tests/numbers.js

const words = [
    [ 'vierzehnten', 14, true ], [ 'eintausendneunhundertachtunddreissig', 1938, false ], [ 'zweitausendsechsundzwanzig', 2026, false ],
    [ 'einhundertfünfundvierzig', 145, false ], [ 'achtundachtzig', 88, false ], [ 'dritten', 3, true ], [ 'drei', 3, false ],
    [ 'zwanzig', 20, false ], [ 'neunzig', 90, false ], [ 'dreissig', 30, false ], [ 'dreißig', 30, false ], [ 'siebter', 7, true ],
    [ 'ein', null ], [ 'eine', null ], [ 'Rollator', null ], [ 'und', null ],
];
const texts = [
    [ 'geboren am vierzehnten März achtundachtzig, Werkstrasse zwölf in Zug', 'geboren am 14. März 88, Werkstrasse 12 in Zug' ],
    [ 'fünf Prozent Zins ab dreizehntem Juli', '5 Prozent Zins ab 13. Juli' ],
    [ 'zweitausenddreihundertvierzig Franken fünfzig', '2340 Franken 50' ],
    [ 'ein Rollator und eine Hüfte', 'ein Rollator und eine Hüfte' ],
    [ 'Rechnung Nummer zwanzig sechsundzwanzig strich einhundertachtzehn', 'Rechnung Nummer 20 26 strich 118' ],
    [ 'geboren am vierzehn Mai neunzehnhundert achtunddreißig, am dritten Oktober zweitausend sechsundzwanzig um vierzehn Uhr dreißig', 'geboren am 14 Mai 1938, am 3. Oktober 2026 um 14 Uhr 30' ],
    [ 'Zins ab dreizehntem Juli', 'Zins ab 13. Juli' ],
];

let failed = 0;
for ( const [ w, v, ordinal ] of words ) {
    const n = numberWord( w );
    const ok = v === null ? n === null : n && n.value === v && n.ordinal === ordinal;
    console.log( ( ok ? 'ok   ' : 'FAIL ' ) + w.padEnd( 40 ) + ' → ' + JSON.stringify( n ) );
    failed += ok ? 0 : 1;
}
for ( const [ text, want ] of texts ) {
    const got = digits( text );
    const ok = got === want;
    console.log( ( ok ? 'ok   ' : 'FAIL ' ) + got );
    failed += ok ? 0 : 1;
}
process.exit( failed ? 1 : 0 );
