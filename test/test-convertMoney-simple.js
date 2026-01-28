/**
 * Simple test to verify convertMoney API endpoint exists and responds
 */

const BASE_URL = 'http://localhost:8081';

async function testEndpointExists() {
  console.log('🔍 Testing if convertMoney endpoint exists...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/convertMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        convertFromAmount: 1,
        convertFromAccountCurrency: 'USD',
        convertToAmount: 1.36,
        convertToAccountCurrency: 'CAD',
        currencyPairs: 'USD-CAD',
        userId: '674e749098b040d5f65b9e1e',
      }),
    });

    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const text = await response.text();
    console.log(`Response: ${text}`);
    
    if (response.status === 404) {
      console.log('❌ Endpoint not found - server may not be running or route not registered');
    } else if (response.status === 500) {
      console.log('⚠️ Server error - endpoint exists but has issues');
    } else {
      console.log('✅ Endpoint is accessible');
    }
    
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    console.log('💡 Make sure Expo server is running on port 8081');
  }
}

testEndpointExists();
