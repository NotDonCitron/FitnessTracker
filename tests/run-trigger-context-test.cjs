// Simple test runner for the trigger context test
const { exec } = require('child_process');

console.log('🧪 Running TriggerContext normalization test...');

// Compile and run the TypeScript test
exec('npx ts-node tests/trigger-context-test.ts', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Test execution failed:', error);
    return;
  }
  
  if (stderr) {
    console.error('❌ Test errors:', stderr);
 }
  
  if (stdout) {
    console.log('📝 Test output:');
    console.log(stdout);
  }
  
  console.log('✅ Test execution completed');
});
