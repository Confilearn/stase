# Stase Fintech App - API Test Suite

This directory contains test scripts for all the API endpoints in the Stase fintech application.

## Test Files

### Core API Tests

- **`test-createAccount.js`** - Tests user account creation with automatic bank account generation
- **`test-checkUser.js`** - Tests user lookup by email or username
- **`test-depositWithdraw.js`** - Tests deposit and withdrawal functionality with PIN validation
- **`test-transferMoney.js`** - Tests money transfers between users via email/username

### Currency Conversion Tests

- **`test-convertMoney.js`** - Comprehensive currency conversion tests (USD↔CAD↔EUR↔GBP)
- **`test-convertMoney-simple.js`** - Basic endpoint connectivity test
- **`test-cad-to-gbp.js`** - Specific CAD to GBP conversion test

## Running Tests

### Prerequisites

1. Make sure the Expo development server is running on port 8081
2. Ensure MongoDB is accessible
3. Test user ID: `674e749098b040d5f65b9e1e` (pre-configured for testing)

### Execute Tests

```bash
# Navigate to test directory
cd test

# Run individual tests
node test-createAccount.js
node test-checkUser.js
node test-depositWithdraw.js
node test-transferMoney.js
node test-convertMoney.js

```

## Test Coverage

### Account Creation

- ✅ User creation with valid data
- ✅ Automatic generation of 4 bank accounts (USD, CAD, EUR, GBP)
- ✅ Default password and PIN assignment
- ✅ Error handling for invalid inputs

### User Lookup

- ✅ Find user by email
- ✅ Find user by username
- ✅ Handle non-existent users
- ✅ Validate email format
- ✅ Error handling for missing identifiers

### Deposits & Withdrawals

- ✅ Valid deposits and withdrawals
- ✅ PIN validation (default: 1234)
- ✅ Transaction limit enforcement ($100,000)
- ✅ Insufficient balance handling
- ✅ Error handling for invalid PINs

### Money Transfers

- ✅ Transfers by email and username
- ✅ Multi-currency support
- ✅ Insufficient balance validation
- ✅ Invalid amount handling (negative, zero)
- ✅ Non-existent recipient handling
- ✅ Invalid currency validation

### Currency Conversion

- ✅ All currency pair conversions (USD↔CAD↔EUR↔GBP)
- ✅ Exchange rate validation using static rates
- ✅ Account balance updates
- ✅ Transaction record creation
- ✅ Error handling for:
  - Invalid currency pairs
  - Insufficient balances
  - Incorrect conversion rates
  - Negative amounts

## Currency Exchange Rates

Static rates used for conversions (USD as base):

- 1 USD = 1.36 CAD
- 1 USD = 0.85 EUR
- 1 USD = 0.73 GBP

## API Endpoints Tested

| Endpoint             | Method | Description                        |
| -------------------- | ------ | ---------------------------------- |
| `/api/createAccount` | POST   | Create new user with bank accounts |
| `/api/checkUser`     | POST   | Lookup user by email/username      |
| `/api/depositMoney`  | POST   | Deposit funds to account           |
| `/api/withdrawMoney` | POST   | Withdraw funds from account        |
| `/api/transferMoney` | POST   | Transfer money to another user     |
| `/api/convertMoney`  | POST   | Convert between currencies         |

## Notes

- All tests use the Expo development server URL: `http://localhost:8081`
- Test user has pre-configured bank accounts for all supported currencies
- Transactions are atomic and use MongoDB sessions
- All currency conversions use static exchange rates (no real-time fetching)
