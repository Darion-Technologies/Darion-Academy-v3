const fs = require('fs');
const content = fs.readFileSync('/home/pavan/.gemini/antigravity/brain/77469f33-d7b6-4c50-8fd9-e8941a7f2725/.system_generated/logs/overview.txt', 'utf8');

const regex = /DashboardHomeScreen\.tsx/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(`Found at index ${match.index}. Context:`);
  console.log(content.substring(match.index - 50, match.index + 100));
  console.log('---');
}
