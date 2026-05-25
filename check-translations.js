const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const enDir = path.join(process.cwd(), 'src/content/posts/en');
const hrDir = path.join(process.cwd(), 'src/content/posts/hr');

function getPosts(dir) {
  const files = fs.readdirSync(dir);
  const posts = {};
  
  files.forEach(file => {
    if (file.endsWith('.md') || file.endsWith('.mdx')) {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data } = matter(content);
      if (data.translationKey) {
        posts[data.translationKey] = { file, slug: data.slug, title: data.title };
      }
    }
  });
  
  return posts;
}

const enPosts = getPosts(enDir);
const hrPosts = getPosts(hrDir);

console.log('=== ARTICLES WITH TRANSLATIONS ===\n');
const enKeys = Object.keys(enPosts);
const hrKeys = Object.keys(hrPosts);
const allKeys = new Set([...enKeys, ...hrKeys]);

let matched = 0, enOnly = 0, hrOnly = 0;

allKeys.forEach(key => {
  const en = enPosts[key];
  const hr = hrPosts[key];
  
  if (en && hr) {
    matched++;
    console.log(`✓ ${key}`);
  } else if (en) {
    enOnly++;
    console.log(`✗ EN ONLY: ${en.title} (${key})`);
  } else {
    hrOnly++;
    console.log(`✗ HR ONLY: ${hr.title} (${key})`);
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Matched pairs: ${matched}`);
console.log(`EN only: ${enOnly}`);
console.log(`HR only: ${hrOnly}`);
