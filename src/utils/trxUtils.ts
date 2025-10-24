export function getTransactionId(prefix = "TRX"): string {
  const timestamp = Date.now().toString(36); // base36 for compactness
  const random = Math.random().toString(36).substring(2, 8); // 6-char random string
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

export function getFee(amount: number): number {
  const feeRate = 1.49 / 100;
  return parseFloat((amount * feeRate).toFixed(2));
}

export function getTotalAmount(
  amount: number,
  fee: number,
  commission?: number
): number {
  const totalDeduction = fee + (commission ?? 0);
  return parseFloat((amount + totalDeduction).toFixed(2));
}
