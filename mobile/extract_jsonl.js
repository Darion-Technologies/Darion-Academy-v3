const fs = require('fs');
const path = require('path');

const brainDir = '/home/pavan/.gemini/antigravity/brain';
const convs = [
  'eb05efe8-d004-447f-bc12-c05b474be1d7',
  '5537a12d-74e9-4223-8136-4ded3429cc3e',
  '5baef336-4b6e-46b2-bd65-d744ca6a05c4',
  '55cb097c-b459-423c-9c19-cdf4fe740a7f',
  '8cd50d54-60ae-4000-af58-b92a3010e0b2',
  '70389f8d-7104-4afe-9e42-652072ec60c6',
  '77469f33-d7b6-4c50-8fd9-e8941a7f2725'
];

let dashboardOrig = '';
let playerOrig = '';

for (const conv of convs) {
  const logPath = path.join(brainDir, conv, '.system_generated/logs/overview.txt');
  if (!fs.existsSync(logPath)) continue;
  
  const lines = fs.readFileSync(logPath, 'utf8').split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      // It might be in obj.content or obj.tool_calls
      let textToSearch = '';
      if (typeof obj.content === 'string') textToSearch += obj.content;
      if (Array.isArray(obj.tool_calls)) textToSearch += JSON.stringify(obj.tool_calls);
      if (obj.tool_response) textToSearch += JSON.stringify(obj.tool_response); // If it exists
      
      if (textToSearch.includes('The following code has been modified to include a line number')) {
        if (textToSearch.includes('DashboardHomeScreen.tsx')) dashboardOrig = textToSearch;
        if (textToSearch.includes('CoursePlayerScreen.tsx')) playerOrig = textToSearch;
      }
    } catch (e) {}
  }
}

const clean = (raw) => {
  // raw could be a string or JSON stringified. We just want to extract lines that look like "1: ..."
  // But wait, \n might be escaped!
  const unescaped = raw.replace(/\\n/g, '\n');
  const lines = unescaped.split('\n');
  const result = [];
  let capturing = false;
  for (const p of lines) {
    if (p.includes('The following code has been modified')) {
      capturing = true;
      continue;
    }
    if (capturing) {
      if (p.includes('The above content shows the entire')) break;
      const match = p.match(/^\d+:\s(.*)$/);
      if (match) result.push(match[1]);
      else if (p.match(/^\d+:$/)) result.push('');
    }
  }
  return result.join('\n');
};

if (dashboardOrig) fs.writeFileSync('DashboardHomeScreen_recovered.tsx', clean(dashboardOrig));
if (playerOrig) fs.writeFileSync('CoursePlayerScreen_recovered.tsx', clean(playerOrig));
console.log(`Found Dashboard: ${!!dashboardOrig}, Found Player: ${!!playerOrig}`);
