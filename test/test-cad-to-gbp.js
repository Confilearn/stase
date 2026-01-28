/**
 * Test CAD to GBP conversion specifically
 */

const BASE_URL = 'http://localhost:8081';

async function testCadToGbp() {
  console.log('🧪 Testing CAD to GBP conversion');
  
  // Convert 100 CAD to GBP
  // 100 CAD = 100/1.36 USD = 73.53 USD
  // 73.53 USD = 73.53 * 0.73 GBP = 53.68 GBP
  const convertFromAmount = 100;
  const convertToAmount = 53.68; // Calculated rate: 100 * (0.73/1.36)
  
  console.log(`💰 Converting ${convertFromAmount} CAD to ${convertToAmount} GBP`);
  console.log(`📊 Exchange rate: 1 CAD = ${(convertToAmount/convertFromAmount).toFixed(4)} GBP`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/convertMoney`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        convertFromAmount,
        convertFromAccountCurrency: 'CAD',
        convertToAmount,
        convertToAccountCurrency: 'GBP',
        currencyPairs: 'CAD-GBP',
        userId: '674e749098b040d5f65b9e1e',
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ CAD to GBP conversion successful!');
      console.log(`💰 Actual exchange rate used: ${result.data.conversionDetails.exchangeRate}`);
      console.log(`📊 Updated balances:`);
      console.log(`   CAD Account: ${result.data.updatedAccounts.sourceAccount.previousBalance} → ${result.data.updatedAccounts.sourceAccount.balance}`);
      console.log(`   GBP Account: ${result.data.updatedAccounts.targetAccount.previousBalance} → ${result.data.updatedAccounts.targetAccount.balance}`);
    } else {
      console.log('❌ Conversion failed:', result.message);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('💡 Make sure Expo server is running on port 8081');
  }
}

testCadToGbp();
