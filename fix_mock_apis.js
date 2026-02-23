const fs = require('fs');
const path = require('path');

const directoryPath = 'd:\\Kochi-Metro-Rail\\frontend\\src';

const replacements = {
    '/mock-api/metro_trains.json': '/api/metro/trains/live',
    '/mock-api/fare_stations.json': '/api/metro/stations',
    '/mock-api/stations.json': '/api/metro/stations',
    '/mock-api/lines.json': '/api/lines/lines',
    '/mock-api/news_all.json': '/api/news/all'
};

function readAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            readAndReplace(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            for (const [mock, real] of Object.entries(replacements)) {
                if (content.includes(mock)) {
                    content = content.replace(new RegExp(mock, 'g'), real);
                    changed = true;
                }
            }
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

readAndReplace(directoryPath);
console.log('Done replacing mock-api endpoints.');
