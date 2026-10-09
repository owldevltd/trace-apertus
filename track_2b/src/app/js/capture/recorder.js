// The recording: the microphone through Web Audio, gathered as 16 kHz mono, cut into pieces only where the
// size demands it and then at a pause, each piece encoded as MP3 (lamejs, 64 kbit/s) or, without the encoder,
// as WAV, and handed out as soon as it is closed. Cutting into sentences gained nothing when measured, so a
// dictation goes whole unless it grows past the service's limit. A conversation is recorded the other way:
// with `pause` set, a piece closes at the first pause of that length after the person has spoken, one answer
// per piece, and what was only silence is no piece.

const RATE = 16000;
const KBPS = 64;

// a pause: the level under the noise floor for this long; the floor is read from the first half second
const PAUSE_MS = 700;
const FLOOR_MS = 500;
const FLOOR_GAIN = 2.5;
const FLOOR_MIN = 0.004;

// a piece is closed at the next pause from here on (3.4 MB at 64 kbit/s), and at the latest here
const CUT_SECONDS = 420;
const HARD_SECONDS = 480;

const BLOCK = 4096;

// in a conversation: the level stands above the floor for this long before it counts as speech, and this much
// sound before the speech is kept with the piece
const VOICED_MS = 300;
const LEAD_MS = 500;

// Speech, then a pause: the gate hears the level block by block and says when an answer has ended.
export function createGate( pause, voiced = VOICED_MS ) {
    const state = { voiced: 0, quiet: 0 };
    return {
        // ms of sound, above the floor or not; true when an answer has just ended
        hear( loud, ms ) {
            if ( loud ) {
                state.voiced += ms;
                state.quiet = 0;
                return false;
            }
            state.quiet += ms;
            if ( state.quiet < pause ) {
                return false;
            }
            // a pause: after speech the answer has ended, after a crackle it is forgotten
            const ended = state.voiced >= voiced;
            state.voiced = 0;
            return ended;
        },
        spoken: () => state.voiced >= voiced,
    };
}

// pause: in a conversation, the length of the pause in ms that ends an answer; without it the recording is a dictation
export function createRecorder( { onLevel, onPiece, pause = 0 } = {} ) {
    const gate = pause ? createGate( pause ) : null;
    const state = { audio: null, stream: null, source: null, processor: null, analyser: null, chunks: [], rate: 48000, seconds: 0, pieceStart: 0, n: 0, floor: null, floorSamples: [], quietMs: 0, heard: false, closing: Promise.resolve() };

    async function start() {
        state.stream = await navigator.mediaDevices.getUserMedia( { audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false } );
        state.audio = new ( window.AudioContext || window.webkitAudioContext )();
        state.rate = state.audio.sampleRate;
        state.source = state.audio.createMediaStreamSource( state.stream );
        state.analyser = state.audio.createAnalyser();
        state.analyser.fftSize = 512;
        state.source.connect( state.analyser );
        state.processor = state.audio.createScriptProcessor( BLOCK, 1, 1 );
        state.processor.onaudioprocess = ( e ) => take( e.inputBuffer.getChannelData( 0 ) );
        state.source.connect( state.processor );
        // a processor only runs when it leads somewhere; a silent gain keeps the speakers quiet
        const mute = state.audio.createGain();
        mute.gain.value = 0;
        state.processor.connect( mute );
        mute.connect( state.audio.destination );
        state.seconds = 0;
        state.pieceStart = 0;
        state.n = 0;
        state.chunks = [];
        return state.analyser;
    }

    function take( data ) {
        state.chunks.push( new Float32Array( data ) );
        const ms = data.length / state.rate * 1000;
        state.seconds += ms / 1000;
        let sum = 0;
        for ( let i = 0; i < data.length; i++ ) {
            sum += data[ i ] * data[ i ];
        }
        const rms = Math.sqrt( sum / data.length );
        onLevel?.( rms );
        if ( state.floor === null ) {
            state.floorSamples.push( rms );
            if ( state.floorSamples.length * ms >= FLOOR_MS ) {
                const sorted = [ ...state.floorSamples ].sort( ( a, b ) => a - b );
                state.floor = Math.max( FLOOR_MIN, sorted[ Math.floor( sorted.length / 2 ) ] * FLOOR_GAIN );
            }
            return;
        }
        state.quietMs = rms < state.floor ? state.quietMs + ms : 0;
        if ( gate ) {
            const ended = gate.hear( rms >= state.floor, ms );
            state.heard = state.heard || gate.spoken();
            if ( ended ) {
                close();
            } else if ( !state.heard ) {
                // nothing said yet: only the last moment is kept, so the piece begins just before the speech
                let kept = 0;
                let from = state.chunks.length;
                while ( from > 0 && kept < LEAD_MS ) {
                    kept += state.chunks[ --from ].length / state.rate * 1000;
                }
                state.chunks = state.chunks.slice( from );
                state.pieceStart = state.seconds - kept / 1000;
            }
            return;
        }
        const length = state.seconds - state.pieceStart;
        if ( ( length >= CUT_SECONDS && state.quietMs >= PAUSE_MS ) || length >= HARD_SECONDS ) {
            close();
        }
    }

    // the gathered sound becomes a piece; encoding runs after the current block, one piece after the other
    function close() {
        const chunks = state.chunks;
        const start = state.pieceStart;
        const duration = state.seconds - start;
        const heard = state.heard;
        state.chunks = [];
        state.pieceStart = state.seconds;
        state.heard = false;
        // in a conversation the pause that ended the answer runs on: it is what tells that nobody speaks any more
        state.quietMs = gate ? state.quietMs : 0;
        if ( !chunks.length || duration < 0.3 || ( gate && !heard ) ) {
            return state.closing;
        }
        const n = ++state.n;
        state.closing = state.closing.then( () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) ) ).then( () => {
            const pcm = toPcm16( resample( concat( chunks ), state.rate, RATE ) );
            const piece = encode( pcm );
            onPiece?.( { n, start: Math.round( start * 10 ) / 10, duration: Math.round( duration * 10 ) / 10, ...piece } );
        } );
        return state.closing;
    }

    async function stop() {
        if ( state.processor ) {
            state.processor.onaudioprocess = null;
        }
        const last = close();
        state.stream?.getTracks().forEach( ( track ) => track.stop() );
        await state.audio?.close().catch( () => {} );
        state.stream = null;
        state.audio = null;
        await last;
    }

    return { start, stop, seconds: () => state.seconds, pieces: () => state.n, analyser: () => state.analyser, quiet: () => state.quietMs };
}

function concat( chunks ) {
    const out = new Float32Array( chunks.reduce( ( a, c ) => a + c.length, 0 ) );
    let o = 0;
    for ( const c of chunks ) {
        out.set( c, o );
        o += c.length;
    }
    return out;
}

// linear resampling; the browser's rate is usually 44.1 or 48 kHz
function resample( data, from, to ) {
    if ( from === to ) {
        return data;
    }
    const n = Math.round( data.length * to / from );
    const out = new Float32Array( n );
    const k = from / to;
    for ( let i = 0; i < n; i++ ) {
        const p = i * k;
        const j = Math.floor( p );
        const f = p - j;
        out[ i ] = data[ j ] * ( 1 - f ) + ( data[ Math.min( data.length - 1, j + 1 ) ] || 0 ) * f;
    }
    return out;
}

function toPcm16( data ) {
    const out = new Int16Array( data.length );
    for ( let i = 0; i < data.length; i++ ) {
        const v = Math.max( -1, Math.min( 1, data[ i ] ) );
        out[ i ] = v < 0 ? v * 32768 : v * 32767;
    }
    return out;
}

// MP3 through lamejs when the page loaded it, else WAV
function encode( pcm ) {
    const lame = window.lamejs;
    if ( lame && lame.Mp3Encoder ) {
        const encoder = new lame.Mp3Encoder( 1, RATE, KBPS );
        const parts = [];
        for ( let i = 0; i < pcm.length; i += 1152 ) {
            const d = encoder.encodeBuffer( pcm.subarray( i, i + 1152 ) );
            if ( d.length ) {
                parts.push( new Uint8Array( d.buffer, d.byteOffset, d.length ) );
            }
        }
        const end = encoder.flush();
        if ( end.length ) {
            parts.push( new Uint8Array( end.buffer, end.byteOffset, end.length ) );
        }
        return { blob: new Blob( parts, { type: 'audio/mpeg' } ), format: 'mp3' };
    }
    return { blob: wav( pcm ), format: 'wav' };
}

function wav( pcm ) {
    const buffer = new ArrayBuffer( 44 + pcm.length * 2 );
    const v = new DataView( buffer );
    const text = ( o, s ) => [ ...s ].forEach( ( c, i ) => v.setUint8( o + i, c.charCodeAt( 0 ) ) );
    text( 0, 'RIFF' );
    v.setUint32( 4, 36 + pcm.length * 2, true );
    text( 8, 'WAVE' );
    text( 12, 'fmt ' );
    v.setUint32( 16, 16, true );
    v.setUint16( 20, 1, true );
    v.setUint16( 22, 1, true );
    v.setUint32( 24, RATE, true );
    v.setUint32( 28, RATE * 2, true );
    v.setUint16( 32, 2, true );
    v.setUint16( 34, 16, true );
    text( 36, 'data' );
    v.setUint32( 40, pcm.length * 2, true );
    new Int16Array( buffer, 44 ).set( pcm );
    return new Blob( [ buffer ], { type: 'audio/wav' } );
}
