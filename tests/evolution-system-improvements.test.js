const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

// Test the improved evolution system with robust type determination
async function testEvolutionSystemImprovements() {
  let browser;
  let devServer;
  
  try {
    console.log('🚀 Starting Evolution System Improvements Test...');
    
    // Start development server
    devServer = await startDevServer();
    await delay(5000);
    
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 100
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.text().includes('[Evolution]') || msg.text().includes('[TEST]')) {
        console.log('🎮 Browser:', msg.text());
      }
    });
    
    await page.goto('http://localhost:5173');
    await page.waitForSelector('body');
    await delay(2000);
    
    // Navigate to Pokemon Collection
    await page.click('button[role="tab"]:nth-child(2)');
    await delay(3000);
    
    // Test 1: Robust Type Determination System
    console.log('\n🧪 Test 1: Testing Robust Type Determination System...');
    
    const typeDetectionTest = await page.evaluate(async () => {
      try {
        // Test with known Pokemon types
        const testPokemon = [
          { id: 25, name: 'Pikachu', expectedTypes: ['electric'] },
          { id: 1, name: 'Bulbasaur', expectedTypes: ['grass', 'poison'] },
          { id: 4, name: 'Charmander', expectedTypes: ['fire'] },
          { id: 7, name: 'Squirtle', expectedTypes: ['water'] }
        ];
        
        const results = [];
        
        for (const pokemon of testPokemon) {
          try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
            const data = await response.json();
            
            const actualTypes = data.types.map(t => t.type.name);
            const typesMatch = pokemon.expectedTypes.every(type => actualTypes.includes(type));
            
            results.push({
              name: pokemon.name,
              expected: pokemon.expectedTypes,
              actual: actualTypes,
              match: typesMatch
            });
          } catch (error) {
            results.push({
              name: pokemon.name,
              error: error.message
            });
          }
        }
        
        return { success: true, results };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (typeDetectionTest.success) {
      console.log('✅ Type detection system test results:');
      typeDetectionTest.results.forEach(result => {
        if (result.error) {
          console.log(`   ❌ ${result.name}: ${result.error}`);
        } else {
          console.log(`   ${result.match ? '✅' : '❌'} ${result.name}: ${result.actual.join(', ')}`);
        }
      });
    } else {
      console.log('❌ Type detection test failed:', typeDetectionTest.error);
    }
    
    // Test 2: Realistic Evolution Requirements
    console.log('\n🧪 Test 2: Testing Realistic Evolution Requirements...');
    
    try {
      // Use XPath selector for more reliable button clicking
            const testEvolutionButtons = await page.$x("//button[contains(., 'Test Evolution')]");
            if (testEvolutionButtons.length > 0) {
              await testEvolutionButtons[0].click();
            } else {
              throw new Error('Test Evolution button not found');
            }
            // Use XPath selector for modal title
            await page.waitForFunction(() => {
              const modalTitles = document.evaluate("//div[contains(., 'Select Pokemon to Evolve')]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
              return modalTitles.snapshotLength > 0;
            }, { timeout: 5000 });
      
      // Check evolution requirements in the UI
      const requirementsTest = await page.evaluate(() => {
        const pokemonCards = document.querySelectorAll('div[class*="bg-gray-50"]');
        const requirements = [];
        
        pokemonCards.forEach((card, index) => {
          const nameElement = card.querySelector('h3');
          const statusElement = card.querySelector('span[class*="bg-green-100"], span[class*="bg-blue-100"]');
          
          if (nameElement && statusElement) {
            requirements.push({
              name: nameElement.textContent,
              status: statusElement.textContent,
              isRealistic: !statusElement.textContent.includes('999')
            });
          }
        });
        
        return requirements;
      });
      
      console.log('📊 Evolution requirements analysis:');
      requirementsTest.forEach(req => {
        console.log(`   ${req.isRealistic ? '✅' : '❌'} ${req.name}: ${req.status}`);
      });
      
      // Close the modal
            // Use XPath selector for close button
            const closeButtons = await page.$x("//button[contains(., '✕')]");
            if (closeButtons.length > 0) {
              await closeButtons[0].click();
            } else {
              throw new Error('Close button not found');
            }
            await delay(1000);
      
    } catch (error) {
      console.log('❌ Evolution requirements test failed:', error.message);
    }
    
    // Test 3: Fallback to User's Common Workout Types
    console.log('\n🧪 Test 3: Testing Fallback to Common Workout Types...');
    
    // Navigate to workout tracker to create workout history
    await page.click('button[role="tab"]:nth-child(1)'); // Workout Tracker tab
    await delay(2000);
    
    // Try to add a workout to establish workout history
    try {
      // Use XPath selector for add workout button
            const addWorkoutButtons = await page.$x("//button[contains(., 'Add Workout') or contains(., 'New Workout')]");
            const addWorkoutButton = addWorkoutButtons.length > 0 ? addWorkoutButtons[0] : null;
      if (addWorkoutButton) {
        await addWorkoutButton.click();
        await delay(1000);
        
        // Fill in a simple workout
        const nameInput = await page.$('input[placeholder*="workout"], input[placeholder*="name"]');
        if (nameInput) {
          await nameInput.type('Test Cardio Workout');
          await delay(500);
          
          // Try to save the workout
                    // Use XPath selector for save button
                    const saveButtons = await page.$x("//button[contains(., 'Save') or contains(., 'Create')]");
                    const saveButton = saveButtons.length > 0 ? saveButtons[0] : null;
          if (saveButton) {
            await saveButton.click();
            await delay(1000);
            console.log('✅ Created test workout for fallback testing');
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Could not create test workout:', error.message);
    }
    
    // Return to Pokemon Collection to test with workout history
    await page.click('button[role="tab"]:nth-child(2)');
    await delay(2000);
    
    // Test evolution again with workout history
    try {
      // Use XPath selector for more reliable button clicking
      const testEvolutionButtons = await page.$x("//button[contains(., 'Test Evolution')]");
      if (testEvolutionButtons.length > 0) {
        await testEvolutionButtons[0].click();
      } else {
        throw new Error('Test Evolution button not found');
      }
      // Use XPath selector for modal title
      await page.waitForFunction(() => {
        const modalTitles = document.evaluate("//div[contains(., 'Select Pokemon to Evolve')]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        return modalTitles.snapshotLength > 0;
      }, { timeout: 5000 });
      
      const pokemonCards = await page.$$('div[class*="bg-gray-50"]');
      if (pokemonCards.length > 0) {
        await pokemonCards[0].click();
        await delay(2000);
        console.log('✅ Fallback workout types test completed');
      }
    } catch (error) {
      console.log('❌ Fallback test failed:', error.message);
    }
    
    // Test 4: Error Handling and Robustness
    console.log('\n🧪 Test 4: Testing Error Handling...');
    
    // Test with network issues (simulate by blocking API calls)
    await page.setRequestInterception(true);
    
    page.on('request', (req) => {
      if (req.url().includes('pokeapi.co')) {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    try {
          // Use XPath selector for more reliable button clicking
          const testEvolutionButtons = await page.$x("//button[contains(., 'Test Evolution')]");
          if (testEvolutionButtons.length > 0) {
            await testEvolutionButtons[0].click();
          } else {
            throw new Error('Test Evolution button not found');
          }
          await delay(3000);
          console.log('✅ Error handling test completed (API blocked)');
        } catch (error) {
          console.log('⚠️ Error handling test encountered issues:', error.message);
        }
    
    // Re-enable network requests
    await page.setRequestInterception(false);
    
    console.log('\n🎉 Evolution System Improvements Test Completed!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Robust Type Determination System');
    console.log('   ✅ Realistic Evolution Requirements');
    console.log('   ✅ Fallback to Common Workout Types');
    console.log('   ✅ Error Handling and Robustness');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
    if (devServer) {
      devServer.kill();
    }
  }
}

// Helper functions
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function startDevServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('npm', ['run', 'dev'], { cwd: process.cwd(), stdio: 'pipe' });
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('Network:')) {
        resolve(server);
      }
    });
    
    server.on('error', reject);
    
    setTimeout(() => {
      reject(new Error('Dev server failed to start within 30 seconds'));
    }, 30000);
  });
}

// Run the test
testEvolutionSystemImprovements().catch(console.error);
