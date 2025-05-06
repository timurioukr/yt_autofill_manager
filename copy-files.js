import { copyFileSync } from 'fs';
import { resolve } from 'path';

const filesToCopy = ['manifest.json'];

filesToCopy.forEach(file => {
    copyFileSync(
        resolve(process.cwd(), file),
        resolve(process.cwd(), 'dist', file)
    );
}); 