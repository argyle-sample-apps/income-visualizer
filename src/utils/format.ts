import currency from "currency.js";
import { Address } from "models/profile";

export function formatAddress(address: Address) {
  const optional = address.line2 ? `${address.line2}` : " ";
  return `${address.line1}${optional}${address.state} ${address.postal_code}, ${address.country}`;
}

export function formatPercent(num: number) {
  return Math.round(num) + "%";
}

export function formatCurrency(value: number | string) {
  return currency(value, { precision: 0 }).format();
}
