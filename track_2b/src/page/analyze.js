import { loadPage } from './image.js';
import { measureUnit, findObjects, findAreas } from './slicer.js';
import { findLines } from './lines.js';
import { findMarks } from './marks.js';
import { findCells, typeElements } from './elements.js';
import { joinLines } from './joiner.js';

// One page image → its geometry: lines, tinted areas, text lines, tick marks, empty cells, objects, and the
// typed element list. No text and no model here; that is the reading step.
export async function analyzePage( file ) {
    const page = await loadPage( file );
    page.unit = measureUnit( page );
    const lines = findLines( page );
    const areas = findAreas( page );
    const marks = findMarks( page );
    const cells = findCells( page, lines );
    const { links, strips } = joinLines( page, lines );
    const objects = findObjects( page, links );
    const elements = typeElements( page, { lines, marks, areas, cells, objects } );
    return {
        file: page.file,
        width: page.width,
        height: page.height,
        scale: page.scale,
        paper: page.paper,
        ink: page.ink,
        unit: page.unit * page.scale,
        lines,
        areas,
        strips,
        marks,
        cells,
        elements,
        objects,
    };
}
