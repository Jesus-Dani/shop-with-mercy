/** Format an integer-Naira amount for display. e.g. 2500 → "₦2,500" */
export function formatNaira(amount: number): string {
	return `₦${amount.toLocaleString('en-NG')}`;
}
