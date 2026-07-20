// Budget dollar amounts are whole numbers throughout the app (detailed budget,
// review screens, CSV export). Round up rather than to nearest so a partial
// dollar never quietly disappears from a borrower's stated budget.
export function roundBudget(value: number): number {
  return Math.ceil(value || 0);
}
