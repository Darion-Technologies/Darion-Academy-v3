const fs = require('fs');
const path = require('path');

const brainDir = '/home/pavan/.gemini/antigravity/brain';
const convs = [
  'eb05efe8-d004-447f-bc12-c05b474be1d7',
  '5537a12d-74e9-4223-8136-4ded3429cc3e',
  '5baef336-4b6e-46b2-bd65-d744ca6a05c4',
  '55cb097c-b459-423c-9c19-cdf4fe740a7f',
  '8cd50d54-60ae-4000-af58-b92a3010e0b2',
  '70389f8d-7104-4afe-9e42-652072ec60c6'
];

const extractFile = (fileName, targetPath) => {
  for (const conv of convs) {
    const overviewPath = path.join(brainDir, conv, '.system_generated/logs/overview.txt');
    if (!fs.existsSync(overviewPath)) continue;
    
    const lines = fs.readFileSync(overviewPath, 'utf8').split('\n');
    let capturing = false;
    let content = [];
    
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].includes('The above content shows the entire, complete file contents')) {
        capturing = true;
        continue;
      }
      
      if (capturing) {
        if (lines[i].includes(`File Path: \`file://${targetPath}\``)) {
          // Reversing content since we read backwards
          content.reverse();
          
          // Strip line numbers
          const clean = content.map(line => {
            const match = line.match(/^\d+:\s(.*)$/);
            if (match) return match[1];
            if (line.match(/^\d+:$/)) return '';
            return line;
          });
          
          fs.writeFileSync(path.basename(targetPath) + '_orig.tsx', clean.join('\n'));
          console.log(`Successfully extracted ${fileName} from ${conv}`);
          return;
        } else {
          content.push(lines[i]);
        }
      }
    }
  }
  console.log(`Could not find ${fileName}`);
}

extractFile('DashboardHomeScreen.tsx', '/home/pavan/DT/darion-academy/mobile/src/screens/dashboard/DashboardHomeScreen.tsx');
extractFile('CoursePlayerScreen.tsx', '/home/pavan/DT/darion-academy/mobile/src/screens/learn/CoursePlayerScreen.tsx');
