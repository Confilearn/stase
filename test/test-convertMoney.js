/**
 * Test script for the convertMoney API endpoint
 * This script tests currency conversion between different account currencies
 */

const BASE_URL = 'http://localhost:8081';

// Test user ID (same as used in other tests)
const TEST_USER_ID = '674e749098b040d5f65b9e1e';

// Test cases for currency conversion
const testCases = [
  {
    name: 'USD to CAD conversion',
    data: {
      convertFromAmount: 100,
      convertFromAccountCurrency: 'USD',
      convertToAmount: 136, // 100 * 1.36
      convertToAccountCurrency: 'CAD',
      currencyPairs: 'USD-CAD',
      userId: TEST_USER_ID,
    },
  },
  {
    name: 'CAD to USD conversion',
    data: {
      convertFromAmount: 136,
      convertFromAccountCurrency: 'CAD',
      convertToAmount: 100, // 136 / 1.36
      convertToAccountCurrency: 'USD',
      currencyPairs: 'CAD-USD',
      userId: TEST_USER_ID,
    },
  },
  {
    name: 'USD to GBP conversion',
    data: {
      convertFromAmount: 100,
      convertFromAccountCurrency: 'USD',
      convertToAmount: 73, // 100 * 0.73
      convertToAccountCurrency: 'GBP',
      currencyPairs: 'USD-GBP',
      userId: TEST_USER_ID,
    },
  },
  {
    name: 'EUR to USD conversion',
    data: {
      convertFromAmount: 85,
      convertFromAccountCurrency: 'EUR',
      convertToAmount: 100, // 85 / 0.85
      convertToAccountCurrency: 'USD',
      currencyPairs: 'EUR-USD',
      userId: TEST_USER_ID,
    },
  },
  {
    name: 'Small amount conversion (GBP to EUR)',
    data: {
      convertFromAmount: 10.50,
      convertFromAccountCurrency: 'GBP',
      convertToAmount: 12.23, // 10.50 * (0.85/0.73) ≈ 12.23
      convertToAccountCurrency: 'EUR',
      currencyPairs: 'GBP-EUR',
      userId: TEST_USER_ID,
    },
  },
];

// Error test cases
const errorTestCases = [
  {
    name: 'Invalid currency pair',
    data: {
      convertFromAmount: 100,
      convertFromAccountCurrency: 'USD',
      convertToAmount: 136,
      convertToAccountCurrency: 'CAD',
      currencyPairs: 'USD-EUR', // Mismatch
      userId: TEST_USER_ID,
    },
    expectedError: 'Currency pair mismatch',
  },
  {
    name: 'Insufficient balance',
    data: {
      convertFromAmount: 999999, // Very high amount
      convertFromAccountCurrency: 'USD',
      convertToAmount: 999999 * 1.36,
      convertToAccountCurrency: 'CAD',
      currencyPairs: 'USD-CAD',
      userId: TEST_USER_ID,
    },
    expectedError: 'Insufficient balance',
  },
  {
    name: 'Invalid conversion rate',
    data: {
      convertFromAmount: 100,
      convertFromAccountCurrency: 'USD',
      convertToAmount: 200, // Wrong rate
      convertToAccountCurrency: 'CAD',
      currencyPairs: 'USD-CAD',
      userId: TEST_USER_ID,
    },
    expectedError: 'Invalid conversion rate',
  },
  {
    name: 'Negative amount',
    data: {
      convertFromAmount: -100,
      convertFromAccountCurrency: 'USD',
      convertToAmount: -136,
      convertToAccountCurrency: 'CAD',
      currencyPairs: 'USD-CAD',
      userId: TEST_USER_ID,
    },
    expectedError: 'positive numbers',
  },
];

/**
 * Test a successful currency conversion
 */
async function testSuccessfulConversion(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📤 Converting ${testCase.data.convertFromAmount} ${testCase.data.convertFromAccountCurrency} to ${testCase.data.convertToAccountCurrency}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/convertMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.data),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Conversion successful!');
      console.log(`💰 Exchange rate: ${result.data.conversionDetails.exchangeRate}`);
      console.log(`📊 Updated balances:`);
      console.log(`   Source (${result.data.updatedAccounts.sourceAccount.currency}): ${result.data.updatedAccounts.sourceAccount.previousBalance} → ${result.data.updatedAccounts.sourceAccount.balance}`);
      console.log(`   Target (${result.data.updatedAccounts.targetAccount.currency}): ${result.data.updatedAccounts.targetAccount.previousBalance} → ${result.data.updatedAccounts.targetAccount.balance}`);
      console.log(`📝 Transactions created: ${Object.keys(result.data.transactions).length}`);
      
      return true;
    } else {
      console.log('❌ Conversion failed:', result.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

/**
 * Test error cases
 */
async function testErrorCase(testCase) {
  console.log(`\n🧪 Testing error case: ${testCase.name}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/convertMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.data),
    });

    const result = await response.json();
    
    if (!response.ok && !result.success && result.message.includes(testCase.expectedError)) {
      console.log('✅ Error handled correctly:', result.message);
      return true;
    } else {
      console.log('❌ Unexpected response:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return false;
  }
}

/**
 * Run all test cases
 */
async function runAllTests() {
  console.log('🚀 Starting convertMoney API tests...');
  console.log(`🌐 Testing against: ${BASE_URL}`);
  
  let successCount = 0;
  let totalTests = testCases.length + errorTestCases.length;
  
  // Test successful conversions
  console.log('\n📈 Testing successful conversions...');
  for (const testCase of testCases) {
    const success = await testSuccessfulConversion(testCase);
    if (success) successCount++;
  }
  
  // Test error cases
  console.log('\n⚠️ Testing error cases...');
  for (const testCase of errorTestCases) {
    const success = await testErrorCase(testCase);
    if (success) successCount++;
  }
  
  // Summary
  console.log(`\n📊 Test Summary:`);
  console.log(`✅ Passed: ${successCount}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Please check the API implementation.');
  }
}

/**
 * Check user's current account balances before and after tests
 */
async function checkUserBalances() {
  console.log('\n💼 Checking current user balances...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/checkUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: TEST_USER_ID,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data.bankAccounts) {
        console.log('💰 Current account balances:');
        result.data.bankAccounts.forEach(account => {
          console.log(`   ${account.currency}: ${account.balance}`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Could not fetch balances:', error.message);
  }
}

// Run the tests
async function main() {
  await checkUserBalances();
  await runAllTests();
  await checkUserBalances(); // Check final balances
}

// Execute tests
main().catch(console.error);
