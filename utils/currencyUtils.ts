// Currency utility functions and constants

export const currencySymbols: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  CAD: "$",
};

export const getCurrencySymbol = (currency: string): string => {
  switch (currency.toUpperCase()) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "CAD":
      return "c$";
    default:
      return currency;
  }
};

export const formatBalance = (balance: number, currency: string): string => {
  const symbol = currencySymbols[currency] || "";
  return `${symbol}${balance.toLocaleString()}`;
};

export const formatAmount = (amount: number, currency: string): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString()}`;
};
