const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('https://thedeepcollection.com')) {
        content = content.replace(/https:\/\/thedeepcollection\.com/g, '');
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    }
});
