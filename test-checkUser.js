// Test script for checkUser API endpoint
// Run with: node test-checkUser.js

const testCheckUser = async () => {
  const baseUrl = 'http://localhost:8081'; // Expo default port

  console.log('🔍 Testing checkUser API endpoint...\n');

  // Test 1: Check existing user by email
  console.log('Test 1: Check existing user by email');
  try {
    const response = await fetch(`${baseUrl}/api/checkUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john.doe@example.com'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Check existing user by username
  console.log('Test 2: Check existing user by username');
  try {
    const response = await fetch(`${baseUrl}/api/checkUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'johndoe'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Check non-existent user
  console.log('Test 3: Check non-existent user');
  try {
    const response = await fetch(`${baseUrl}/api/checkUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nonexistent@example.com'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Invalid request (no email or username)
  console.log('Test 4: Invalid request (no email or username)');
  try {
    const response = await fetch(`${baseUrl}/api/checkUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: Invalid email format
  console.log('Test 5: Invalid email format');
  try {
    const response = await fetch(`${baseUrl}/api/checkUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  console.log('\n✅ checkUser API tests completed!');
};

// Run tests
testCheckUser().catch(console.error);
