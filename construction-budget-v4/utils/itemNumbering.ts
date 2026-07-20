// AI-created (budget-upload and estimator) line items need a real, sortable
// item number like "9000-4" rather than a placeholder label. This finds the
// highest existing suffix for a category so a batch of new items can be
// numbered sequentially without colliding with what's already there.
export function computeMaxItemSuffix(items: { itemNumber: string }[], itemNumberPrefix?: string): number {
  let maxSuffix = 0;
  items.forEach(item => {
    const match = item.itemNumber.match(/^(\d+)-(\d+)$/);
    if (match && itemNumberPrefix && match[1] === itemNumberPrefix) {
      maxSuffix = Math.max(maxSuffix, parseInt(match[2]));
    }
  });
  return maxSuffix;
}
