/**
 * Static currency exchange rates for the Stase fintech app
 * All rates are relative to USD (base currency)
 * These are fixed reference rates used for all conversions (not live market rates)
 */

export interface CurrencyRate {
  [key: string]: number;
}

/**
 * Exchange rates where 1 USD equals the specified amount
 * USD is used as the base currency for all conversions
 */
export const EXCHANGE_RATES: CurrencyRate = {
  USD: 1.00,      // US Dollar - Base currency
  CAD: 1.36,      // Canadian Dollar
  EUR: 0.85,      // Euro
  GBP: 0.73,      // British Pound
};

/**
 * Supported currencies in the system
 */
export const SUPPORTED_CURRENCIES = ['USD', 'CAD', 'EUR', 'GBP'] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

/**
 * Convert amount from one currency to another
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): number {
  // Validate currencies
  if (!SUPPORTED_CURRENCIES.includes(fromCurrency)) {
    throw new Error(`Unsupported source currency: ${fromCurrency}`);
  }
  
  if (!SUPPORTED_CURRENCIES.includes(toCurrency)) {
    throw new Error(`Unsupported target currency: ${toCurrency}`);
  }

  // If same currency, return original amount
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert to USD first (base currency), then to target currency
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  const convertedAmount = amountInUSD * EXCHANGE_RATES[toCurrency];

  // Round to 2 decimal places for currency
  return Math.round(convertedAmount * 100) / 100;
}

/**
 * Get exchange rate between two currencies
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Exchange rate (how many target currency units equal 1 source currency unit)
 */
export function getExchangeRate(
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): number {
  if (fromCurrency === toCurrency) {
    return 1.0;
  }

  // Convert through USD base
  const usdRate = 1 / EXCHANGE_RATES[fromCurrency];
  const targetRate = usdRate * EXCHANGE_RATES[toCurrency];
  
  return Math.round(targetRate * 100000) / 100000; // 5 decimal places for rates
}

/**
 * Validate if a currency pair is supported
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns True if both currencies are supported
 */
export function isValidCurrencyPair(
  fromCurrency: string,
  toCurrency: string
): boolean {
  return SUPPORTED_CURRENCIES.includes(fromCurrency as SupportedCurrency) &&
         SUPPORTED_CURRENCIES.includes(toCurrency as SupportedCurrency);
}

/**
 * Get all supported currency codes
 * @returns Array of supported currency codes
 */
export function getSupportedCurrencies(): SupportedCurrency[] {
  return [...SUPPORTED_CURRENCIES];
}
