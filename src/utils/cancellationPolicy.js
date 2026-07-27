// Full-refund deadline = check-in date minus the days_before of the 100%-refund tier.
const computeCancellationDeadline = (tiers, checkInDate) => {
  if (!Array.isArray(tiers) || tiers.length === 0) return null

  const fullRefundTiers = tiers.filter(t => t.refund_pct === 100 && t.days_before != null)
  if (fullRefundTiers.length === 0) return null

  const daysBefore = Math.max(...fullRefundTiers.map(t => t.days_before))
  const deadline = new Date(checkInDate)
  deadline.setDate(deadline.getDate() - daysBefore)
  return deadline
}

module.exports = { computeCancellationDeadline }