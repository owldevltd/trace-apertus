import { digits, numberWord } from '../src/speech/numbers.js';

// Number words → digits: German, the cases the speech evaluation relied on; English, French and Italian, each in its
// own words. No model.
//
//   node tests/numbers.js

const words = [
    [ 'vierzehnten', 14, true ], [ 'eintausendneunhundertachtunddreissig', 1938, false ], [ 'zweitausendsechsundzwanzig', 2026, false ],
    [ 'einhundertfünfundvierzig', 145, false ], [ 'achtundachtzig', 88, false ], [ 'dritten', 3, true ], [ 'drei', 3, false ],
    [ 'zwanzig', 20, false ], [ 'neunzig', 90, false ], [ 'dreissig', 30, false ], [ 'dreißig', 30, false ], [ 'siebter', 7, true ],
    [ 'ein', null ], [ 'eine', null ], [ 'Rollator', null ], [ 'und', null ], [ 'eins', 1, false ], [ 'Eins', 1, false ],
];
const texts = [
    [ 'geboren am vierzehnten März achtundachtzig, Werkstrasse zwölf in Zug', 'geboren am 14. März 88, Werkstrasse 12 in Zug' ],
    [ 'fünf Prozent Zins ab dreizehntem Juli', '5 Prozent Zins ab 13. Juli' ],
    [ 'zweitausenddreihundertvierzig Franken fünfzig', '2340 Franken 50' ],
    [ 'ein Rollator und eine Hüfte', 'ein Rollator und eine Hüfte' ],
    [ 'Rechnung Nummer zwanzig sechsundzwanzig strich einhundertachtzehn', 'Rechnung Nummer 20 26 strich 118' ],
    [ 'geboren am vierzehn Mai neunzehnhundert achtunddreißig, am dritten Oktober zweitausend sechsundzwanzig um vierzehn Uhr dreißig', 'geboren am 14 Mai 1938, am 3. Oktober 2026 um 14 Uhr 30' ],
    [ 'Zins ab dreizehntem Juli', 'Zins ab 13. Juli' ],
    [ 'Hansi Strasse Eins, drei, zwei, null, null, Tun', 'Hansi Strasse 1, 3, 2, 0, 0, Tun' ],
    [ 'neun, drei, acht, fünf, vier, zwei, fünf, eins, zwei', '9, 3, 8, 5, 4, 2, 5, 1, 2' ],
    [ 'vor ein, zwei Wochen, halb eins', 'vor ein, 2 Wochen, halb 1' ],
];
// the other languages: digits said one after the other stay apart, a number said in parts is joined, articles and
// a lone pronoun stay words, and a word of another language is no number ("elf" in English)
const others = [
    [ 'en', 'Five six nine eight', '5 6 9 8' ],
    [ 'en', 'twenty one, two hundred and five, one thousand nine hundred eighty four', '21, 205, 1984' ],
    [ 'en', 'my number is zero seven nine, four one two', 'my number is 0 7 9, 4 1 2' ],
    [ 'en', 'one of them, two hundred and Peter, elf', 'one of them, 200 and Peter, elf' ],
    [ 'fr', 'quatre-vingt-dix-sept, soixante-dix, vingt-et-un, deux cents trois, deux mille vingt-six', '97, 70, 21, 203, 2026' ],
    [ 'fr', 'un livre et cinq six neuf huit', 'un livre et 5 6 9 8' ],
    [ 'it', 'ventotto, duecentoquaranta, duemilasei, ventitré, mille novecento', '28, 240, 2006, 23, 1900' ],
    [ 'it', 'uno studio, cinque sei nove otto', 'uno studio, 5 6 9 8' ],
    [ 'el', 'πέντε έξι', 'πέντε έξι' ],
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
for ( const [ lang, text, want ] of others ) {
    const got = digits( text, lang );
    const ok = got === want;
    console.log( ( ok ? 'ok   ' : 'FAIL ' ) + lang + ' ' + got );
    failed += ok ? 0 : 1;
}
process.exit( failed ? 1 : 0 );
