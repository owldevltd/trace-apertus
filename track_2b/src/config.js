import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Everything the app needs from outside: model access and where files live. Values come from the environment
// (see .env.example); paths default to the project folders.

const root = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );

export const config = {
    model:   process.env.MODEL    || 'swiss-ai/Apertus-v1.5-8B',
    baseUrl: process.env.BASE_URL || 'https://api.inference.cscs.ch/v1',
    apiKey:  process.env.API_KEY  || '',
    port:    Number( process.env.PORT || 8080 ),
    dataDir:    process.env.DATA_DIR    || path.join( root, 'data' ),
    storageDir: process.env.STORAGE_DIR || path.join( root, 'storage' ),
    root,
};
