/**
 * Helper script to run debug and test tools
 * 
 * Usage: node dev-tools.js [type] [name]
 * 
 * Examples:
 *   node dev-tools.js list              - List all available tools
 *   node dev-tools.js test auth         - Run auth test
 *   node dev-tools.js debug auth        - Run auth debug server
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Define directories
const DEV_TOOLS_DIR = path.join(__dirname, 'dev-tools');
const TESTS_DIR = path.join(DEV_TOOLS_DIR, 'tests');
const DEBUG_DIR = path.join(DEV_TOOLS_DIR, 'debug');

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'list';
const tool = args[1];

// Function to list available tools
function listTools() {
  console.log('Portfolio Development Tools');
  console.log('==========================');
  console.log('');

  console.log('Available test tools:');
  const testFiles = fs.readdirSync(TESTS_DIR)
    .filter(file => file.endsWith('.js'))
    .map(file => file.replace('.js', ''));

  testFiles.forEach(file => {
    if (file !== 'README') console.log(`  - ${file}`);
  });

  console.log('');
  console.log('Available debug tools:');
  const debugFiles = fs.readdirSync(DEBUG_DIR)
    .filter(file => file.endsWith('.js'))
    .map(file => file.replace('.js', ''));

  debugFiles.forEach(file => {
    if (file !== 'README') console.log(`  - ${file}`);
  });

  console.log('');
  console.log('Usage:');
  console.log('  node dev-tools.js test [name]  - Run a test tool');
  console.log('  node dev-tools.js debug [name] - Run a debug tool');
}

// Function to run a specified tool
function runTool(type, toolName) {
  if (!toolName) {
    console.error(`Error: Please specify a ${type} tool name`);
    console.log(`Run "node dev-tools.js list" to see available tools`);
    return;
  }

  const dir = type === 'test' ? TESTS_DIR : DEBUG_DIR;

  // Check if tool exists with exact name
  let toolPath = path.join(dir, `${toolName}.js`);

  // If not found, try with prefix
  if (!fs.existsSync(toolPath)) {
    toolPath = path.join(dir, `${type}-${toolName}.js`);
  }

  // If still not found, try with different prefixes
  if (!fs.existsSync(toolPath)) {
    const files = fs.readdirSync(dir);
    const matchingFile = files.find(file =>
      file.includes(toolName) && file.endsWith('.js')
    );

    if (matchingFile) {
      toolPath = path.join(dir, matchingFile);
    }
  }

  if (!fs.existsSync(toolPath)) {
    console.error(`Error: Could not find ${type} tool with name "${toolName}"`);
    console.log(`Run "node dev-tools.js list" to see available tools`);
    return;
  }

  console.log(`Running ${type} tool: ${path.basename(toolPath)}`);
  console.log('========================================');

  const child = spawn('node', [toolPath], { stdio: 'inherit' });

  child.on('close', (code) => {
    console.log(`Tool exited with code ${code}`);
  });
}

// Main logic
switch (command) {
  case 'list':
    listTools();
    break;
  case 'test':
    runTool('test', tool);
    break;
  case 'debug':
    runTool('debug', tool);
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.log('Available commands: list, test, debug');
}
