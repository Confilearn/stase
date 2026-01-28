const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8081';

// Test user token (replace with actual token from your auth system)
const TEST_TOKEN = 'test-user-token';

async function testDeposit() {
  console.log('🧪 Testing depositMoney endpoint...\n');
  
  const depositData = {
    amount: 500,
    accountCurrency: 'USD',
    transactionPin: '1234'
  };

  try {
    const response = await fetch(`${BASE_URL}/api/depositMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify(depositData)
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Deposit successful!');
    } else {
      console.log('❌ Deposit failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testWithdraw() {
  console.log('\n🧪 Testing withdrawMoney endpoint...\n');
  
  const withdrawData = {
    amount: 200,
    accountCurrency: 'USD',
    transactionPin: '1234'
  };

  try {
    const response = await fetch(`${BASE_URL}/api/withdrawMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify(withdrawData)
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Withdrawal successful!');
    } else {
      console.log('❌ Withdrawal failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testEdgeCases() {
  console.log('\n🧪 Testing edge cases...\n');
  
  // Test invalid PIN
  console.log('1. Testing invalid PIN:');
  try {
    const response = await fetch(`${BASE_URL}/api/depositMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        amount: 100,
        accountCurrency: 'USD',
        transactionPin: '9999' // Invalid PIN
      })
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Test amount exceeding limit
  console.log('\n2. Testing amount exceeding $100,000 limit:');
  try {
    const response = await fetch(`${BASE_URL}/api/depositMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        amount: 150000,
        accountCurrency: 'USD',
        transactionPin: '1234'
      })
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Test insufficient funds
  console.log('\n3. Testing insufficient funds:');
  try {
    const response = await fetch(`${BASE_URL}/api/withdrawMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({
        amount: 999999,
        accountCurrency: 'USD',
        transactionPin: '1234'
      })
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API tests for deposit and withdraw endpoints...\n');
  
  await testDeposit();
  await testWithdraw();
  await testEdgeCases();
  
  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error);
