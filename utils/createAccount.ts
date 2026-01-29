import { SupportedCurrency } from "./currencyRates";

export function generateAccountNumber(currency: SupportedCurrency): string {
  const prefix = {
    USD: "1234",
    CAD: "5678",
    EUR: "9012",
    GBP: "3456",
  };

  const randomDigits = Math.random().toString().substr(2, 8);
  return `${prefix[currency]}${randomDigits}`;
}

export function generateIBAN(): string {
  const countryCode = "DE";
  const checkDigits = Math.random().toString().substr(2, 2);
  const bankCode = "12345678";
  const accountNumber = Math.random().toString().substr(2, 10);
  return `${countryCode}${checkDigits}${bankCode}${accountNumber}`;
}

export function generateSortCode(): string {
  return `${Math.random().toString().substr(2, 2)}-${Math.random().toString().substr(2, 2)}-${Math.random().toString().substr(2, 2)}`;
}

export function getBankName(currency: SupportedCurrency): string {
  const banks = {
    USD: "Stase Bank USA",
    CAD: "Stase Bank Canada",
    EUR: "Stase Bank Europe",
    GBP: "Stase Bank UK",
  };
  return banks[currency];
}

export function getBankAddress(currency: SupportedCurrency): string {
  const addresses = {
    USD: "123 Wall Street, New York, NY 10005",
    CAD: "456 Bay Street, Toronto, ON M5V 2V6",
    EUR: "789 Friedrichstraße, Berlin, 10117",
    GBP: "321 Threadneedle Street, London, EC2R 8AY",
  };
  return addresses[currency];
}

export function getSwiftCode(currency: SupportedCurrency): string {
  const swiftCodes = {
    USD: "STASEUS33",
    CAD: "STASECA33",
    EUR: "STASEDE33",
    GBP: "STASEGB33",
  };
  return swiftCodes[currency];
}
