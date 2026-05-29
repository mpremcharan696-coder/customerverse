import fs from 'fs';

const logPath = "C:/Users/Lok prasad/.gemini/antigravity/brain/de7cfdbb-3aa3-4f68-ad19-9dc38cdffebd/.system_generated/logs/transcript.jsonl";
const targetPath = "D:/ecomestore/src/pages/LandingPage.jsx";

function restore() {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');

  for (let line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      if (obj.step_index === 98 && obj.tool_calls && obj.tool_calls[0]) {
        const args = obj.tool_calls[0].args;
        const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
        const rawCode = parsedArgs.CodeContent;
        if (rawCode) {
          let trimmed = rawCode.trim();
          if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            trimmed = trimmed.slice(1, -1);
          }
          
          let decoded = trimmed
            .replace(/\\r\\n/g, '\n')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');

          fs.writeFileSync(targetPath, decoded, 'utf8');
          console.log("Successfully restored LandingPage.jsx from step 98 with proper trim!");
          return;
        }
      }
    } catch (err) {
      // Ignore
    }
  }
  console.log("Failed to find step 98 or extract CodeContent.");
}

restore();
