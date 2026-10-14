import { $, $$ } from '../dom.js';
import { SMALL, findDocument, inFrame, sameQuad } from '../capture/detect.js';
import { isRectangular, rectify, enhance, fit } from '../capture/warp.js';
import * as verify from './verify.js';

// The camera: the device camera when the browser gives it, else the file picker. Every frame is searched for
// the sheet; when it sits in the guide frame and holds still, the frame turns green and the picture is taken.
// The picture is straightened from its corners and its light evened out, visibly, then it joins the pages of
// this form. Files from the desk take the same path. Done sends the pages to the pipeline.

// the guide frame inside the picture, as shares of its width and height
const GUIDE = { x: 0.08, y: 0.10, w: 0.84, h: 0.80 };

// frames the sheet has to hold still before the picture is taken
const STILL = 8;

// width of a page thumbnail
const THUMB = 160;

const ANIMATION = 600;

export function enter( ctx ) {
    ctx.state.pages = ctx.state.pages || [];
    strip( ctx );
    if ( !ctx.state.reviewing ) {
        live( ctx );
    }
}

export function leave( ctx ) {
    stop( ctx );
}

// the live view: camera on, search on every frame
async function live( ctx ) {
    const s = ctx.screen( 'camera' );
    const video = $( '[data-video]', s );
    $( '[data-shot]', s ).hidden = true;
    $( '[data-overlay]', s ).hidden = true;
    $( '[data-retake]', s ).hidden = true;
    $( '[data-shutter]', s ).hidden = false;
    $( '.frame', s ).classList.remove( 'found' );
    $( '[data-hint]', s ).textContent = ctx.t( 'cam.hint' );
    if ( !navigator.mediaDevices?.getUserMedia ) {
        fileMode( ctx );
        return;
    }
    try {
        ctx.state.stream = await navigator.mediaDevices.getUserMedia( { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } }, audio: false } );
        video.srcObject = ctx.state.stream;
        video.hidden = false;
        $( '[data-file]', s ).disabled = true;
        watch( ctx );
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
    cancelAnimationFrame( ctx.state.watch );
    if ( ctx.state.stream ) {
        ctx.state.stream.getTracks().forEach( ( track ) => track.stop() );
        ctx.state.stream = null;
    }
    $( '[data-video]', ctx.screen( 'camera' ) ).srcObject = null;
}

// looks for the sheet in a small copy of every frame; still for STILL frames inside the guide → picture
function watch( ctx ) {
    const s = ctx.screen( 'camera' );
    const video = $( '[data-video]', s );
    const small = document.createElement( 'canvas' );
    let last = null;
    let still = 0;
    const tick = () => {
        ctx.state.watch = requestAnimationFrame( tick );
        if ( !ctx.state.stream || !video.videoWidth ) {
            return;
        }
        const h = Math.round( SMALL * video.videoHeight / video.videoWidth );
        small.width = SMALL;
        small.height = h;
        const g = small.getContext( '2d', { willReadFrequently: true } );
        g.drawImage( video, 0, 0, SMALL, h );
        const found = findDocument( g.getImageData( 0, 0, SMALL, h ) );
        const guide = { x: GUIDE.x * SMALL, y: GUIDE.y * h, w: GUIDE.w * SMALL, h: GUIDE.h * h };
        const ok = found && inFrame( found.quad, guide ) && isRectangular( found.quad );
        still = ok && sameQuad( found.quad, last, SMALL ) ? still + 1 : 0;
        last = found ? found.quad : null;
        $( '.frame', s ).classList.toggle( 'found', !!ok );
        $( '[data-hint]', s ).textContent = ctx.t( ok ? 'cam.hold' : 'cam.hint' );
        if ( still >= STILL ) {
            cancelAnimationFrame( ctx.state.watch );
            shoot( ctx, video );
        }
    };
    tick();
}

// the full frame as a canvas, then the common path; the corners are found again on the full frame, finer
function shoot( ctx, video ) {
    const c = document.createElement( 'canvas' );
    c.width = video.videoWidth || 1280;
    c.height = video.videoHeight || 960;
    c.getContext( '2d' ).drawImage( video, 0, 0 );
    stop( ctx );
    ingest( ctx, c, null );
}

// the sheet's corners in a picture, searched on a copy FINE pixels wide (three times the live search)
const FINE = 480;

function locate( source ) {
    const small = document.createElement( 'canvas' );
    const h = Math.round( FINE * source.height / source.width );
    small.width = FINE;
    small.height = h;
    const g = small.getContext( '2d', { willReadFrequently: true } );
    g.drawImage( source, 0, 0, FINE, h );
    const found = findDocument( g.getImageData( 0, 0, FINE, h ) );
    if ( !found || !isRectangular( found.quad ) ) {
        return null;
    }
    const k = source.width / FINE;
    return found.quad.map( ( p ) => ( { x: p.x * k, y: p.y * k } ) );
}

// A picture from the camera or from a file: find the sheet if not yet known, straighten, even out, show it
// happening, and keep the page.
export async function ingest( ctx, source, quad = null ) {
    const s = ctx.screen( 'camera' );
    const video = $( '[data-video]', s );
    const shot = $( '[data-shot]', s );
    video.hidden = true;
    $( '[data-shutter]', s ).hidden = true;
    shot.src = source.toDataURL( 'image/jpeg', 0.85 );
    shot.hidden = false;
    if ( !quad ) {
        quad = locate( source );
    }
    $( '[data-hint]', s ).textContent = ctx.t( quad ? 'cam.straighten' : 'cam.flat' );
    await new Promise( ( r ) => requestAnimationFrame( r ) );
    const page = quad ? rectify( source, quad ) : fit( source );
    if ( quad ) {
        await animate( ctx, shot, source, quad );
    }
    enhance( page );
    shot.src = page.toDataURL( 'image/jpeg', 0.85 );
    $( '[data-overlay]', s ).hidden = true;
    const blob = await new Promise( ( r ) => page.toBlob( r, 'image/png' ) );
    const thumb = thumbnail( page );
    ctx.state.pages.push( { blob, thumb, width: page.width, height: page.height } );
    await fly( shot );
    shot.hidden = true;
    strip( ctx );
    $( '[data-hint]', s ).textContent = ctx.t( 'cam.taken' );
    $( '[data-retake]', s ).hidden = false;
}

// the corner quad on the picture pulls itself into the rectangle
function animate( ctx, shot, source, quad ) {
    const s = ctx.screen( 'camera' );
    const overlay = $( '[data-overlay]', s );
    const box = shot.getBoundingClientRect();
    const host = $( '.viewfinder', s ).getBoundingClientRect();
    overlay.width = Math.round( box.width );
    overlay.height = Math.round( box.height );
    overlay.style.left = ( box.left - host.left ) + 'px';
    overlay.style.top = ( box.top - host.top ) + 'px';
    overlay.hidden = false;
    // the shot is object-fit: cover; map picture pixels to the shown box
    const k = Math.max( box.width / source.width, box.height / source.height );
    const ox = ( box.width - source.width * k ) / 2;
    const oy = ( box.height - source.height * k ) / 2;
    const from = quad.map( ( p ) => ( { x: ox + p.x * k, y: oy + p.y * k } ) );
    const to = [ { x: 0, y: 0 }, { x: box.width, y: 0 }, { x: box.width, y: box.height }, { x: 0, y: box.height } ];
    const g = overlay.getContext( '2d' );
    const accent = getComputedStyle( document.documentElement ).getPropertyValue( '--accent' ).trim() || '#8B6CFF';
    const started = performance.now();
    return new Promise( ( resolve ) => {
        const draw = () => {
            const t = Math.min( 1, ( performance.now() - started ) / ANIMATION );
            const e = 1 - Math.pow( 1 - t, 3 );
            g.clearRect( 0, 0, overlay.width, overlay.height );
            g.fillStyle = 'rgba(0,0,0,0.45)';
            g.fillRect( 0, 0, overlay.width, overlay.height );
            g.globalCompositeOperation = 'destination-out';
            g.beginPath();
            from.forEach( ( p, i ) => {
                const q = to[ i ];
                g[ i ? 'lineTo' : 'moveTo' ]( p.x + ( q.x - p.x ) * e, p.y + ( q.y - p.y ) * e );
            } );
            g.closePath();
            g.fill();
            g.globalCompositeOperation = 'source-over';
            g.strokeStyle = accent;
            g.lineWidth = 4;
            g.stroke();
            if ( t < 1 ) {
                requestAnimationFrame( draw );
            } else {
                resolve();
            }
        };
        draw();
    } );
}

// the finished page shrinks away towards the strip
function fly( shot ) {
    return new Promise( ( resolve ) => {
        const a = shot.animate( [ { transform: 'scale(1)', opacity: 1 }, { transform: 'translate(-30%, 40%) scale(0.2)', opacity: 0.2 } ], { duration: 450, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' } );
        a.onfinish = resolve;
        a.oncancel = resolve;
    } );
}

function thumbnail( canvas ) {
    const c = document.createElement( 'canvas' );
    const k = THUMB / canvas.width;
    c.width = THUMB;
    c.height = Math.round( canvas.height * k );
    c.getContext( '2d' ).drawImage( canvas, 0, 0, c.width, c.height );
    return c.toDataURL( 'image/jpeg', 0.7 );
}

// the pages taken so far, and the buttons for the next one and for sending
function strip( ctx ) {
    const s = ctx.screen( 'camera' );
    const pages = ctx.state.pages;
    $( '[data-strip]', s ).innerHTML = pages.map( ( p, i ) => '<img class="pagethumb" src="' + p.thumb + '" alt="" title="' + ( i + 1 ) + '">' ).join( '' );
    $( '[data-pagebar]', s ).hidden = !pages.length;
    $( '[data-done]', s ).textContent = ctx.t( 'cam.done', { n: pages.length } );
}

// files from the desk: the camera screen without the camera, every file through the same path
export async function open( ctx, files ) {
    ctx.state.pages = ctx.state.pages || [];
    ctx.state.reviewing = true;
    await ctx.router.sheet.close();
    if ( ctx.router.top().id !== 'camera' ) {
        await ctx.router.push( 'camera', 'modal' );
    }
    stop( ctx );
    for ( const file of files ) {
        await take( ctx, file );
    }
    ctx.state.reviewing = false;
}

// A chosen file as a page: an image the browser can open. Anything else is said and left out.
async function take( ctx, file ) {
    const source = file.type.startsWith( 'image/' ) ? await load( file ).catch( () => null ) : null;
    if ( !source ) {
        ctx.toast( ctx.t( 'cam.onlyimages' ) );
        return;
    }
    await ingest( ctx, source );
}

function load( file ) {
    return new Promise( ( resolve, reject ) => {
        const url = URL.createObjectURL( file );
        const im = new Image();
        im.onload = () => {
            const c = document.createElement( 'canvas' );
            const k = Math.min( 1, 4000 / Math.max( im.width, im.height ) );
            c.width = Math.round( im.width * k );
            c.height = Math.round( im.height * k );
            c.getContext( '2d' ).drawImage( im, 0, 0, c.width, c.height );
            URL.revokeObjectURL( url );
            resolve( c );
        };
        im.onerror = reject;
        im.src = url;
    } );
}

export function wire( ctx ) {
    const s = ctx.screen( 'camera' );
    // the shutter by hand: the live frame as it is, the sheet searched in it
    $( '[data-shutter]', s ).addEventListener( 'click', ( e ) => {
        if ( !ctx.state.stream ) {
            return;
        }
        e.preventDefault();
        cancelAnimationFrame( ctx.state.watch );
        shoot( ctx, $( '[data-video]', s ) );
    } );
    $( '[data-file]', s ).addEventListener( 'change', async ( e ) => {
        const files = [ ...e.target.files ];
        e.target.value = '';
        for ( const file of files ) {
            await take( ctx, file );
        }
    } );
    $( '[data-retake]', s ).addEventListener( 'click', () => {
        ctx.state.pages.pop();
        strip( ctx );
        live( ctx );
    } );
    $( '[data-next]', s ).addEventListener( 'click', () => live( ctx ) );
    $( '[data-done]', s ).addEventListener( 'click', () => {
        const pages = ctx.state.pages;
        ctx.state.pages = [];
        ctx.state.photo = pages[ 0 ]?.thumb || null;
        stop( ctx );
        verify.startJob( ctx, pages );
    } );
    $( '[data-nophoto]', s ).addEventListener( 'click', () => {
        ctx.state.photo = null;
        ctx.state.pages = [];
        stop( ctx );
        verify.recognize( ctx );
    } );
}
