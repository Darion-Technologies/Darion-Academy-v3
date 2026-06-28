const fs = require('fs');
const path = require('path');

const brainDir = '/home/pavan/.gemini/antigravity/brain';
const convDirs = fs.readdirSync(brainDir);

let found = false;

convDirs.forEach(dir => {
  const overviewPath = path.join(brainDir, dir, '.system_generated/logs/overview.txt');
  if (fs.existsSync(overviewPath)) {
    const content = fs.readFileSync(overviewPath, 'utf8');
    if (content.includes('CoursePlayerScreen.tsx') || content.includes('DashboardHomeScreen.tsx')) {
      console.log(`Found in: ${dir}`);
      found = true;
    }
  }
});

if (!found) console.log("Not found anywhere.");
