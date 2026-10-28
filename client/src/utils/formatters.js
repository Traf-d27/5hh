/**
 * Utility functions for formatting Indian Rupee (INR), kWh, percentages and dates
 */

export function formatInr(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatKwh(kwh) {
  if (kwh === undefined || kwh === null || isNaN(kwh)) return "0 kWh";
  return `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(kwh)} kWh`;
}

export function formatPercent(val) {
  if (val === undefined || val === null || isNaN(val)) return "0%";
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(1)}%`;
}

export function formatDateTime(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch (e) {
    return isoString;
  }
}

export function formatDateOnly(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch (e) {
    return isoString;
  }
}
