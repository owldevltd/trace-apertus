import { $, $$, reducedMotion, isDesktop } from './dom.js';

// Navigation: a stack of screens. On the phone the screens move the way they do on iOS: a pushed screen slides
// in from the right while the one below slips a third to the left and darkens; back slides it out again, also
// by dragging from the left edge; a modal rises from the bottom and shrinks the screen below; the tab bar
// rides along. On the desktop, and with reduced motion, screens simply cross-fade. Built by main.js and handed
// to the screens as ctx.router; hooks say when a screen is entered or left.

const DUR = 420;
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const EDGE = 28;

export function createRouter( { root, onEnter, onLeave, roots } ) {
    const state = { stack: [ { id: roots[ 0 ], kind: 'root' } ], busy: false };
    const el = ( id ) => $( '#s-' + id, root );
    const dim = $( '.dim', root );
    const bar = $( '.tabs', root );
    const moving = () => !reducedMotion() && !isDesktop();
    const dur = () => ( moving() ? DUR : 0 );

    function top() {
        return state.stack[ state.stack.length - 1 ];
    }

    function show( id ) {
        const e = el( id );
        e.classList.add( 'active' );
        return e;
    }

    function hide( id ) {
        const e = el( id );
        e.classList.remove( 'active', 'pushed' );
        e.style.transform = '';
        e.style.zIndex = '';
    }

    function markTab( id ) {
        $$( '[data-tab]', root ).forEach( ( b ) => b.classList.toggle( 'on', b.dataset.tab === id ) );
    }

    // the tab bar slides away under a screen that has none
    async function tabs( visible ) {
        if ( !bar ) {
            return;
        }
        if ( isDesktop() ) {
            bar.hidden = false;
            return;
        }
        if ( visible && bar.hidden ) {
            bar.hidden = false;
            await bar.animate( [ { transform: 'translateY(100%)' }, { transform: 'translateY(0)' } ], { duration: dur(), easing: EASE } ).finished;
        } else if ( !visible && !bar.hidden ) {
            await bar.animate( [ { transform: 'translateY(0)' }, { transform: 'translateY(100%)' } ], { duration: dur(), easing: EASE } ).finished;
            bar.hidden = true;
        }
    }

    function hasTabs( id ) {
        return !el( id ).classList.contains( 'no-tabs' );
    }

    async function fade( from, to ) {
        to.style.zIndex = 2;
        from.style.zIndex = 1;
        const d = reducedMotion() ? 0 : 140;
        await Promise.all( [
            from.animate( [ { opacity: 1 }, { opacity: 0 } ], { duration: d, easing: 'ease-in', fill: 'forwards' } ).finished,
            to.animate( [ { opacity: 0 }, { opacity: 1 } ], { duration: d, easing: 'ease-out' } ).finished,
        ] );
        from.getAnimations().forEach( ( a ) => a.cancel() );
    }

    // switch to a tab's root screen: the old one fades out, the new one comes in with a small shift towards the tab
    async function goRoot( id ) {
        if ( state.busy ) {
            return;
        }
        const fromId = top().id;
        if ( fromId === id && state.stack.length === 1 ) {
            return;
        }
        state.busy = true;
        const dir = roots.indexOf( id ) >= roots.indexOf( state.stack[ 0 ].id ) ? 1 : -1;
        for ( const s of state.stack ) {
            if ( s.id !== id && s.id !== fromId ) {
                onLeave( s.id );
                hide( s.id );
            }
        }
        state.stack = [ { id, kind: 'root' } ];
        markTab( id );
        if ( bar ) {
            bar.hidden = false;
        }
        const from = el( fromId );
        const to = show( id );
        onLeave( fromId );
        onEnter( id );
        if ( fromId !== id ) {
            if ( moving() ) {
                to.style.zIndex = 2;
                from.style.zIndex = 1;
                await Promise.all( [
                    from.animate( [ { opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(' + ( -dir * 16 ) + 'px)' } ], { duration: 180, easing: 'ease-in', fill: 'forwards' } ).finished,
                    to.animate( [ { opacity: 0, transform: 'translateX(' + ( dir * 22 ) + 'px)' }, { opacity: 1, transform: 'translateX(0)' } ], { duration: 320, easing: EASE } ).finished,
                ] );
                from.getAnimations().forEach( ( a ) => a.cancel() );
            } else {
                await fade( from, to );
            }
            hide( fromId );
            to.style.zIndex = '';
        }
        state.busy = false;
    }

    // push: the new screen from the right (or, as a modal, from the bottom)
    async function push( id, kind = 'push' ) {
        if ( state.busy || top().id === id ) {
            return;
        }
        state.busy = true;
        const prevId = top().id;
        const prev = el( prevId );
        const next = show( id );
        state.stack.push( { id, kind } );
        onEnter( id );
        tabs( hasTabs( id ) );
        if ( !moving() ) {
            await fade( prev, next );
        } else {
            next.style.zIndex = 3;
            prev.style.zIndex = 1;
            next.classList.add( 'pushed' );
            dim.style.display = 'block';
            if ( kind === 'modal' ) {
                await Promise.all( [
                    next.animate( [ { transform: 'translateY(100%)' }, { transform: 'translateY(0)' } ], { duration: DUR, easing: EASE } ).finished,
                    prev.animate( [ { transform: 'scale(1)', borderRadius: '0px' }, { transform: 'scale(0.93)', borderRadius: '28px' } ], { duration: DUR, easing: EASE, fill: 'forwards' } ).finished,
                    dim.animate( [ { opacity: 0 }, { opacity: 0.35 } ], { duration: DUR, easing: EASE, fill: 'forwards' } ).finished,
                ] );
            } else {
                await Promise.all( [
                    next.animate( [ { transform: 'translateX(100%)' }, { transform: 'translateX(0)' } ], { duration: DUR, easing: EASE } ).finished,
                    prev.animate( [ { transform: 'translateX(0)' }, { transform: 'translateX(-30%)' } ], { duration: DUR, easing: EASE, fill: 'forwards' } ).finished,
                    dim.animate( [ { opacity: 0 }, { opacity: 0.12 } ], { duration: DUR, easing: EASE, fill: 'forwards' } ).finished,
                ] );
            }
            dim.style.display = 'none';
            dim.getAnimations().forEach( ( a ) => a.cancel() );
            prev.getAnimations().forEach( ( a ) => a.cancel() );
        }
        prev.classList.remove( 'active' );
        next.style.zIndex = '';
        prev.style.zIndex = '';
        state.busy = false;
    }

    // back: the top screen slides out to the right (or down); fromX is where a drag let go
    async function pop( fromX = null ) {
        if ( state.busy || state.stack.length < 2 ) {
            return;
        }
        state.busy = true;
        const cur = state.stack.pop();
        const prevId = top().id;
        const curEl = el( cur.id );
        const prev = show( prevId );
        onLeave( cur.id );
        tabs( hasTabs( prevId ) );
        if ( !moving() ) {
            await fade( curEl, prev );
        } else {
            curEl.style.zIndex = 3;
            prev.style.zIndex = 1;
            dim.style.display = 'block';
            const p = fromX === null ? 0 : Math.min( 1, Math.max( 0, fromX / root.clientWidth ) );
            const d = Math.round( DUR * ( 1 - p ) * 0.85 );
            if ( cur.kind === 'modal' ) {
                await Promise.all( [
                    curEl.animate( [ { transform: 'translateY(0)' }, { transform: 'translateY(100%)' } ], { duration: DUR, easing: EASE } ).finished,
                    prev.animate( [ { transform: 'scale(0.93)', borderRadius: '28px' }, { transform: 'scale(1)', borderRadius: '0px' } ], { duration: DUR, easing: EASE } ).finished,
                    dim.animate( [ { opacity: 0.35 }, { opacity: 0 } ], { duration: DUR, easing: EASE } ).finished,
                ] );
            } else {
                await Promise.all( [
                    curEl.animate( [ { transform: 'translateX(' + ( p * 100 ) + '%)' }, { transform: 'translateX(100%)' } ], { duration: d, easing: EASE } ).finished,
                    prev.animate( [ { transform: 'translateX(' + ( -30 + 30 * p ) + '%)' }, { transform: 'translateX(0)' } ], { duration: d, easing: EASE } ).finished,
                    dim.animate( [ { opacity: 0.12 * ( 1 - p ) }, { opacity: 0 } ], { duration: d, easing: EASE } ).finished,
                ] );
            }
            dim.style.display = 'none';
        }
        hide( cur.id );
        prev.style.zIndex = '';
        prev.style.transform = '';
        onEnter( prevId );
        state.busy = false;
    }

    // end a flow: the top screen drops away, the wanted tab lies underneath
    async function finish( rootId ) {
        if ( state.busy ) {
            return;
        }
        state.busy = true;
        const cur = top();
        const curEl = el( cur.id );
        for ( const s of state.stack ) {
            if ( s.id !== cur.id && s.id !== rootId ) {
                onLeave( s.id );
                hide( s.id );
            }
        }
        onLeave( cur.id );
        const prev = show( rootId );
        state.stack = [ { id: rootId, kind: 'root' } ];
        markTab( rootId );
        onEnter( rootId );
        tabs( true );
        if ( !moving() ) {
            await fade( curEl, prev );
        } else {
            curEl.style.zIndex = 3;
            prev.style.zIndex = 1;
            await Promise.all( [
                curEl.animate( [ { transform: 'translateY(0)' }, { transform: 'translateY(100%)' } ], { duration: DUR, easing: EASE } ).finished,
                prev.animate( [ { transform: 'scale(0.93)' }, { transform: 'scale(1)' } ], { duration: DUR, easing: EASE } ).finished,
            ] );
        }
        hide( cur.id );
        prev.style.zIndex = '';
        state.busy = false;
    }

    // dragging from the left edge pulls the screen; letting go decides
    function edgeSwipe() {
        let drag = null;
        root.addEventListener( 'pointerdown', ( e ) => {
            if ( !moving() ) {
                return;
            }
            const r = root.getBoundingClientRect();
            if ( e.clientX - r.left > EDGE || state.busy || state.stack.length < 2 || top().kind === 'modal' ) {
                return;
            }
            drag = { x0: e.clientX, t0: performance.now(), w: root.clientWidth, cur: el( top().id ), prev: el( state.stack[ state.stack.length - 2 ].id ), moved: false };
            drag.prev.classList.add( 'active' );
            drag.prev.style.transform = 'translateX(-30%)';
            drag.cur.style.zIndex = 3;
            root.setPointerCapture( e.pointerId );
        } );
        root.addEventListener( 'pointermove', ( e ) => {
            if ( !drag ) {
                return;
            }
            const dx = Math.max( 0, e.clientX - drag.x0 );
            if ( dx > 4 ) {
                drag.moved = true;
            }
            const p = Math.min( 1, dx / drag.w );
            drag.cur.style.transform = 'translateX(' + dx + 'px)';
            drag.prev.style.transform = 'translateX(' + ( -30 + 30 * p ) + '%)';
        } );
        const end = ( e ) => {
            if ( !drag ) {
                return;
            }
            const dx = Math.max( 0, e.clientX - drag.x0 );
            const v = dx / Math.max( 1, performance.now() - drag.t0 );
            const d = drag;
            drag = null;
            d.cur.style.transform = '';
            d.cur.style.zIndex = '';
            if ( d.moved && ( dx > d.w / 3 || v > 0.6 ) ) {
                pop( dx );
            } else if ( d.moved ) {
                d.cur.animate( [ { transform: 'translateX(' + dx + 'px)' }, { transform: 'translateX(0)' } ], { duration: 260, easing: EASE } );
                d.prev.animate( [ { transform: d.prev.style.transform }, { transform: 'translateX(-30%)' } ], { duration: 260, easing: EASE } ).finished.then( () => {
                    d.prev.classList.remove( 'active' );
                    d.prev.style.transform = '';
                } );
            } else {
                d.prev.classList.remove( 'active' );
                d.prev.style.transform = '';
            }
        };
        root.addEventListener( 'pointerup', end );
        root.addEventListener( 'pointercancel', end );
    }

    // the "New" sheet: from the bottom on the phone, a centred dialog on the desktop (the CSS places it)
    const sheet = {
        open() {
            const s = $( '.sheet', root );
            s.classList.add( 'show' );
            if ( !moving() ) {
                return;
            }
            $( '.sheet-back', s ).animate( [ { opacity: 0 }, { opacity: 0.45 } ], { duration: DUR, easing: EASE, fill: 'forwards' } );
            $( '.sheet-inner', s ).animate( [ { transform: 'translateY(100%)' }, { transform: 'translateY(0)' } ], { duration: DUR, easing: EASE, fill: 'forwards' } );
        },
        async close() {
            const s = $( '.sheet', root );
            if ( !s.classList.contains( 'show' ) ) {
                return;
            }
            if ( moving() ) {
                await Promise.all( [
                    $( '.sheet-back', s ).animate( [ { opacity: 0.45 }, { opacity: 0 } ], { duration: 300, easing: EASE, fill: 'forwards' } ).finished,
                    $( '.sheet-inner', s ).animate( [ { transform: 'translateY(0)' }, { transform: 'translateY(100%)' } ], { duration: 300, easing: EASE, fill: 'forwards' } ).finished,
                ] );
            }
            s.classList.remove( 'show' );
        },
    };

    edgeSwipe();
    return { top, root: goRoot, push, pop, finish, sheet, isBusy: () => state.busy };
}

// Content under the pills changes: the old pane goes briefly, the new one comes in shifted towards the pill.
export async function switchPane( body, dir, render ) {
    const old = $( '.pane', body );
    const still = reducedMotion();
    if ( old && !still ) {
        await old.animate( [ { opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(' + ( -dir * 14 ) + 'px)' } ], { duration: 130, easing: 'ease-in', fill: 'forwards' } ).finished;
    }
    render();
    const pane = $( '.pane', body );
    if ( pane && !still ) {
        pane.animate( [ { opacity: 0, transform: 'translateX(' + ( dir * 20 ) + 'px)' }, { opacity: 1, transform: 'translateX(0)' } ], { duration: 300, easing: EASE } );
    }
}
