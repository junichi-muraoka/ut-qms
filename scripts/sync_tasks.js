const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TASK_FILE = 'C:\\Users\\jmura\\.gemini\\antigravity\\brain\\0eef2cb5-6a71-4b48-bf2c-bf4a62728b64\\task.md';

function syncTasks() {
  const content = fs.readFileSync(TASK_FILE, 'utf8');
  const lines = content.split('\n');
  
  let currentPhase = '';
  
  lines.forEach(line => {
    if (line.startsWith('## Phase')) {
      currentPhase = line.replace('## ', '');
    }
    
    // Match task items like "- [ ] Task Name"
    const match = line.match(/- \[([ x/])\] (.*)/);
    if (match) {
      const status = match[1];
      const title = `${currentPhase}: ${match[2]}`;
      
      if (status === ' ' || status === '/') {
        console.log(`Creating Issue: ${title}`);
        try {
          // Check if issue already exists to avoid duplicates
          const existsOutput = execSync(`gh issue list --search "${title}" --json title --repo junichi-muraoka/ut-qms`).toString().trim();
          if (existsOutput === '[]' || existsOutput === '') {
            execSync(`gh issue create --title "${title}" --body "Task from implementation plan." --label "task" --repo junichi-muraoka/ut-qms`);
          }
        } catch (e) {
          console.error(`Failed to sync task: ${title}`, e.message);
        }
      }
    }
  });
}

// Running sync...
// syncTasks(); 
// Not running automatically yet, safety first.
