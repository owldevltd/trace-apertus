import { $ } from '../dom.js';
import * as verify from './verify.js';

// The camera: the device camera when the browser gives it, else the file picker; the photo is shrunk on the
// device and stays there. Recognition after the shot is mocked (verify.recognize).

const MAX = 1000;

export function enter( ctx ) {
    start( ctx );
}

export function leave( ctx ) {
    stop( ctx );
}

async function start( ctx ) {
    const s = ctx.screen( 'camera' );
    const video = $( '[data-video]', s );
    $( '[data-shot]', s ).hidden = true;
    video.hidden = true;
    $( '[data-retake]', s ).hidden = true;
    $( '[data-shutter]', s ).hidden = false;
    $( '[data-hint]', s ).textContent = ctx.t( 'cam.hint' );
    ctx.state.photo = null;
    if ( !navigator.mediaDevices?.getUserMedia ) {
        fileMode( ctx );
        return;
    }
    try {
        ctx.state.stream = await navigator.mediaDevices.getUserMedia( { video: { facingMode: { ideal: 'environment' } }, audio: false } );
        video.srcObject = ctx.state.stream;
        video.hidden = false;
        $( '[data-file]', s ).disabled = true;
    } catch {
        fileMode( ctx );
    }
}

function fileMode( ctx ) {
    const s = ctx.screen( 'camera' );
    $( '[data-file]', s ).disabled = false;
    $( '[data-hint]', s ).textContent = ctx.t( 'cam.file' );
}

function stop( ctx ) {
    if ( ctx.state.stream ) {
        ctx.state.stream.getTracks().forEach( ( track ) => track.stop() );
        ctx.state.stream = null;
    }
    $( '[data-video]', ctx.screen( 'camera' ) ).srcObject = null;
}

// the picture small enough for the walk-through, as a data URL
export function shrink( src, done ) {
    const im = new Image();
    im.onload = () => {
        const c = document.createElement( 'canvas' );
        const k = Math.min( 1, MAX / Math.max( im.width, im.height ) );
        c.width = im.width * k;
        c.height = im.height * k;
        c.getContext( '2d' ).drawImage( im, 0, 0, c.width, c.height );
        done( c.toDataURL( 'image/jpeg', 0.8 ) );
    };
    im.src = src;
}

function show( ctx, data ) {
    const s = ctx.screen( 'camera' );
    ctx.state.photo = data;
    const img = $( '[data-shot]', s );
    img.src = data;
    img.hidden = false;
    $( '[data-video]', s ).hidden = true;
    stop( ctx );
    $( '[data-shutter]', s ).hidden = true;
    $( '[data-retake]', s ).hidden = false;
    $( '[data-hint]', s ).textContent = ctx.t( 'cam.taken' );
    setTimeout( () => verify.recognize( ctx ), 450 );
}

export function wire( ctx ) {
    const s = ctx.screen( 'camera' );
    $( '[data-shutter]', s ).addEventListener( 'click', ( e ) => {
        if ( !ctx.state.stream ) {
            return;
        }
        e.preventDefault();
        const video = $( '[data-video]', s );
        const c = document.createElement( 'canvas' );
        c.width = video.videoWidth || 720;
        c.height = video.videoHeight || 960;
        c.getContext( '2d' ).drawImage( video, 0, 0 );
        shrink( c.toDataURL( 'image/jpeg', 0.9 ), ( data ) => show( ctx, data ) );
    } );
    $( '[data-file]', s ).addEventListener( 'change', ( e ) => {
        const file = e.target.files[ 0 ];
        if ( !file ) {
            return;
        }
        const reader = new FileReader();
        reader.onload = () => shrink( reader.result, ( data ) => show( ctx, data ) );
        reader.readAsDataURL( file );
        e.target.value = '';
    } );
    $( '[data-retake]', s ).addEventListener( 'click', () => start( ctx ) );
    $( '[data-nophoto]', s ).addEventListener( 'click', () => {
        ctx.state.photo = null;
        stop( ctx );
        verify.recognize( ctx );
    } );
}
