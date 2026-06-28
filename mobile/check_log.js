const fs = require('fs');

const log = fs.readFileSync('/home/pavan/.gemini/antigravity/brain/5baef336-4b6e-46b2-bd65-d744ca6a05c4/.system_generated/logs/overview.txt', 'utf8');
const lines = log.split('\n');

for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const obj = JSON.parse(line);
    if (obj.source === 'SYSTEM' && obj.type === 'TOOL_RESPONSE' && obj.content.includes('CoursePlayerScreen.tsx')) {
      if (obj.content.includes('Total Bytes: 50293') || obj.content.includes('Showing lines 507 to 530')) {
        console.log("Found chunk!", obj.content.substring(0, 200));
      }
    }
  } catch (e) {}
}
