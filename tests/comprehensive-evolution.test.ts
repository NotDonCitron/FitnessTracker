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

async function runComprehensiveEvolutionTests() {
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
    
    // Test cases for different evolution lines
    const testCases = [
      {
        name: 'Silcoon',
        expectedEvolution: 'beautifly',
        description: 'Silcoon should evolve to Beautifly'
      },
      {
        name: 'Cascoon',
        expectedEvolution: 'dustox',
        description: 'Cascoon should evolve to Dustox'
      },
      {
        name: 'Tyrogue',
        expectedEvolution: 'hitmonlee', // First evolution option
        description: 'Tyrogue should evolve to Hitmonlee'
      },
      {
        name: 'Eevee',
        expectedEvolution: 'vaporeon', // First evolution option
        description: 'Eevee should evolve to Vaporeon'
      },
      {
        name: 'Poliwag',
        expectedEvolution: 'poliwhirl',
        description: 'Poliwag should evolve to Poliwhirl'
      },
      {
        name: 'Slowpoke',
        expectedEvolution: 'slowbro', // First evolution option
        description: 'Slowpoke should evolve to Slowbro'
      },
      {
        name: 'Nidoran-f',
        expectedEvolution: 'nidorina',
        description: 'Nidoran♀ should evolve to Nidorina'
      },
      {
        name: 'Nidoran-m',
        expectedEvolution: 'nidorino',
        description: 'Nidoran♂ should evolve to Nidorino'
      },
      {
        name: 'Shelmet',
        expectedEvolution: 'accelgor',
        description: 'Shelmet should evolve to Accelgor'
      },
      {
        name: 'Shelgon',
        expectedEvolution: 'salamence',
        description: 'Shelgon should evolve to Salamence'
      }
    ];
    
    // Test final forms that should not evolve
    const finalFormTests = [
      {
        name: 'Ribombee',
        description: 'Ribombee should be identified as final form'
      },
      {
        name: 'Ursaluna',
        description: 'Ursaluna should be identified as final form'
      },
      {
        name: 'Ditto',
        description: 'Ditto should be identified as final form'
      },
      {
        name: 'Accelgor',
        description: 'Accelgor should be identified as final form'
      },
      {
        name: 'Salamence',
        description: 'Salamence should be identified as final form'
      }
    ];
    
    // Test final forms
    for (const finalFormTest of finalFormTests) {
      console.log(`Testing ${finalFormTest.description}...`);
      try {
        // Click Test Evolution button
        await page.click('button:has-text("Test Evolution")');
        
        // Wait for the modal to appear
        await page.waitForSelector('div:has-text("Select Pokemon to Evolve")');
        
        // Check if the Pokemon is in the list
        const pokemonExists = await page.$(`div:has-text("${finalFormTest.name}")`);
        if (pokemonExists) {
          console.log(`${finalFormTest.name} found in the collection`);
          
          // Click on the Pokemon
          await page.click(`div:has-text("${finalFormTest.name}")`);
          
          // Wait for the alert or message
          await delay(3000);
          
          // Check if the correct message is shown
          const finalFormMessage = await page.$('div:has-text("already at its final evolution stage")');
          if (finalFormMessage) {
            console.log(`✓ ${finalFormTest.name} correctly identified as final form`);
          } else {
            console.log(`✗ ${finalFormTest.name} final form check failed`);
          }
        } else {
          console.log(`${finalFormTest.name} not found in the collection`);
        }
      } catch (error) {
        console.log(`Error testing ${finalFormTest.name} evolution:`, error.message);
      }
      
      // Close any open modal
      try {
        await page.click('button:has-text("✕")');
        await delay(1000);
      } catch (error) {
        // Ignore if no modal is open
      }
    }
    
    // Close any open modal
    try {
      await page.click('button:has-text("✕")');
      await delay(1000);
    } catch (error) {
      // Ignore if no modal is open
    }
    
    // Test other evolutions
    for (const testCase of testCases) {
      console.log(`Testing ${testCase.description}...`);
      try {
        // Click Test Evolution button
        await page.click('button:has-text("Test Evolution")');
        
        // Wait for the modal to appear
        await page.waitForSelector('div:has-text("Select Pokemon to Evolve")');
        
        // Check if the Pokemon is in the list
        const pokemonExists = await page.$(`div:has-text("${testCase.name}")`);
        if (pokemonExists) {
          console.log(`${testCase.name} found in the collection`);
          
          // Click on the Pokemon
          await page.click(`div:has-text("${testCase.name}")`);
          
          // Wait for evolution process
          await delay(3000);
          
          // Check if evolution was successful
          const evolvedToExpected = await page.$(`div:has-text("${testCase.expectedEvolution}")`);
          if (evolvedToExpected) {
            console.log(`✓ ${testCase.name} successfully evolved to ${testCase.expectedEvolution}`);
          } else {
            console.log(`✗ ${testCase.name} evolution to ${testCase.expectedEvolution} failed`);
          }
        } else {
          console.log(`${testCase.name} not found in the collection`);
        }
      } catch (error) {
        console.log(`Error testing ${testCase.name} evolution:`, error.message);
      }
      
      // Close any open modal
      try {
        await page.click('button:has-text("✕")');
        await delay(1000);
      } catch (error) {
        // Ignore if no modal is open
      }
    }
    
    // Close the browser
    await browser.close();
    
    console.log('Comprehensive evolution tests completed');
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
runComprehensiveEvolutionTests().catch(console.error);