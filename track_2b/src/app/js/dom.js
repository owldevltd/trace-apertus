// Small helpers around the DOM.

export const $ = ( selector, root = document ) => root.querySelector( selector );

export const $$ = ( selector, root = document ) => [ ...root.querySelectorAll( selector ) ];

// on( root, 'click', '[data-open]', ( el, event ) => … ): one listener for every matching element inside root.
export function on( root, type, selector, handler ) {
    root.addEventListener( type, ( event ) => {
        const el = event.target.closest( selector );
        if ( el && root.contains( el ) ) {
            handler( el, event );
        }
    } );
}

// A short buzz where the browser has it (iOS web has none).
export function haptic() {
    try {
        navigator.vibrate?.( 8 );
    } catch {
        // not available
    }
}

export const reducedMotion = () => matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

// Desktop from this width on: the sidebar layout instead of the phone layout.
export const isDesktop = () => matchMedia( '(min-width: 700px)' ).matches;
