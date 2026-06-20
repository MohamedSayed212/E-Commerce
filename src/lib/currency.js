const EGP_RATE = 50;

/**
 * Converts a USD price to a formatted EGP string.
 * Example: formatEGP(29.99) → "1,500 EGP"
 */
export function formatEGP(usdPrice) {
  const egp = Math.round(Number(usdPrice) * EGP_RATE);
  return egp.toLocaleString("en-US") + " EGP";
}
