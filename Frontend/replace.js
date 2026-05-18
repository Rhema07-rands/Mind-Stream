const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

const replacements = [
  { search: /BIU E-Library/gi, replace: 'MindStream' },
  { search: /the E-Library/gi, replace: 'MindStream' },
  { search: /<h2>BIU<\/h2>/g, replace: '<h2>Mind</h2>' },
  { search: /<span>E-LIBRARY<\/span>/g, replace: '<span>STREAM</span>' },
  { search: /BIU\/2023\/1234/g, replace: 'MS/2023/1234' },
  { search: /--biu-maroon/g, replace: '--primary' },
  { search: /--biu-gold/g, replace: '--accent' },
  { search: /BIU Maroon/g, replace: 'Primary' },
  { search: /BIU Gold/g, replace: 'Accent' },
  { search: /BIU Brand Colors/g, replace: 'MindStream Brand Colors' },
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.html')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(directory);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  replacements.forEach(({ search, replace }) => {
    content = content.replace(search, replace);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
