// Test script for transferMoney API endpoint
// Run with: node test-transferMoney.js

const testTransferMoney = async () => {
  const baseUrl = 'http://localhost:8081'; // Expo default port

  console.log('💸 Testing transferMoney API endpoint...\n');

  // Test 1: Successful transfer by email
  console.log('Test 1: Successful transfer by email');
  try {
    const response = await fetch(`${baseUrl}/api/transferMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'jane.smith@example.com',
        accountCurrency: 'USD',
        amount: 50.00
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Successful transfer by username
  console.log('Test 2: Successful transfer by username');
  try {
    const response = await fetch(`${baseUrl}/api/transferMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'janesmith',
        accountCurrency: 'EUR',
        amount: 25.50
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Insufficient balance
  console.log('Test 3: Insufficient balance');
  try {
    const response = await fetch(`${baseUrl}/api/transferMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'jane.smith@example.com',
        accountCurrency: 'USD',
        amount: 999999.99
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Negative amount
  console.log('Test 4: Negative amount');
  try {
    const response = await fetch(`${baseUrl}/api/transferMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'jane.smith@example.com',
        accountCurrency: 'USD',
        amount: -50.00
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: Zero amount
  console.log('Test 5: Zero amount');
  try {
    const response = await fetch(`${baseUrl}/api/transferMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'jane.smith@example.com',
        accountCurrency: 'USD',
        amount: 0
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 6: Non-existent recipient
  console.log('Test 6: Non-existent recipient');
  try {
    const response = await fetch(`${baseUrl}/api/transferMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        accountCurrency: 'USD',
        amount: 50.00
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 7: Invalid currency
  console.log('Test 7: Invalid currency');
  try {
    const response = await fetch(`${baseUrl}/api/transferMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'jane.smith@example.com',
        accountCurrency: 'INVALID',
        amount: 50.00
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 8: Missing required fields
  console.log('Test 8: Missing required fields');
  try {
    const response = await fetch(`${baseUrl}/api/transferMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'jane.smith@example.com'
        // Missing accountCurrency and amount
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 9: Invalid email format
  console.log('Test 9: Invalid email format');
  try {
    const response = await fetch(`${baseUrl}/api/transferMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email',
        accountCurrency: 'USD',
        amount: 50.00
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n✅ transferMoney API tests completed!');
};

// Run tests
testTransferMoney().catch(console.error);
