import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

// Function to wait for a specific amount of time
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to start the development server
function startDevServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('npm', ['run', 'dev'], { cwd: process.cwd(), stdio: 'pipe' });
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      if (output.includes('Local:') || output.includes('Network:')) {
        resolve(server);
      }
    });
    
    server.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    server.on('error', (error) => {
      reject(error);
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      reject(new Error('Dev server failed to start within 30 seconds'));
    }, 30000);
  });
}

// Function to stop the development server
function stopDevServer(server) {
  if (server) {
    server.kill();
  }
}

async function runEvolutionTests() {
  let browser;
  let devServer;
  
  try {
    // Start the development server
    console.log('Starting development server...');
    devServer = await startDevServer();
    console.log('Development server started');
    
    // Wait a bit more for the server to be fully ready
    await delay(5000);
    
    // Launch browser
    console.log('Launching browser...');
    browser = await puppeteer.launch({ 
      headless: false, // Set to false to see the browser
      slowMo: 50 // Slow down operations for better visibility
    });
    
    const page = await browser.newPage();
    
    // Navigate to the app
    console.log('Navigating to the app...');
    await page.goto('http://localhost:5173');
    
    // Wait for the app to load
    await page.waitForSelector('body');
    await delay(2000);
    
    // Navigate to Pokemon Collection tab
    console.log('Navigating to Pokemon Collection...');
    await page.click('button[role="tab"]:nth-child(2)'); // Assuming Pokemon Collection is the second tab
    
    // Wait for the collection to load
    await delay(3000);
    
    // Test Silcoon evolution
    console.log('Testing Silcoon evolution...');
    try {
      // Click Test Evolution button
      await page.click('button:has-text("Test Evolution")');
      
      // Wait for the modal to appear
      await page.waitForSelector('div:has-text("Select Pokemon to Evolve")');
      
      // Check if Silcoon is in the list
      const silcoonExists = await page.$('div:has-text("silcoon")');
      if (silcoonExists) {
        console.log('Silcoon found in the collection');
        
        // Click on Silcoon
        await page.click('div:has-text("silcoon")');
        
        // Wait for evolution process
        await delay(3000);
        
        // Check if evolution was successful
        const evolvedToBeautifly = await page.$('div:has-text("beautifly")');
        if (evolvedToBeautifly) {
          console.log('✓ Silcoon successfully evolved to Beautifly');
        } else {
          console.log('✗ Silcoon evolution failed');
        }
      } else {
        console.log('Silcoon not found in the collection');
      }
    } catch (error) {
      console.log('Error testing Silcoon evolution:', error.message);
    }
    
    // Close any open modal
    try {
      await page.click('button:has-text("✕")');
      await delay(1000);
    } catch (error) {
      // Ignore if no modal is open
    }
    
    // Test Ribombee evolution
    console.log('Testing Ribombee evolution...');
    try {
      // Click Test Evolution button again
      await page.click('button:has-text("Test Evolution")');
      
      // Wait for the modal to appear
      await page.waitForSelector('div:has-text("Select Pokemon to Evolve")');
      
      // Check if Ribombee is in the list
      const ribombeeExists = await page.$('div:has-text("ribombee")');
      if (ribombeeExists) {
        console.log('Ribombee found in the collection');
        
        // Click on Ribombee
        await page.click('div:has-text("ribombee")');
        
        // Wait for the alert or message
        await delay(3000);
        
        // Check if the correct message is shown
        const finalFormMessage = await page.$('div:has-text("already at its final evolution stage")');
        if (finalFormMessage) {
          console.log('✓ Ribombee correctly identified as final form');
        } else {
          console.log('✗ Ribombee final form check failed');
        }
      } else {
        console.log('Ribombee not found in the collection');
      }
    } catch (error) {
      console.log('Error testing Ribombee evolution:', error.message);
    }
    
    // Close the browser
    await browser.close();
    
    console.log('Evolution tests completed');
  } catch (error) {
    console.error('Error during tests:', error);
  } finally {
    // Stop the development server
    stopDevServer(devServer);
    
    // Close browser if it's still open
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

// Run the tests
runEvolutionTests().catch(console.error);