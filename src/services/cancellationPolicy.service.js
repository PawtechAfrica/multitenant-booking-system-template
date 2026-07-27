const { CancellationPolicy, sequelize } = require('../database/models')
const AppError = require('../utils/AppError')

const serializePolicy = (policy) => ({
  id: policy.id,
  propertyId: policy.property_id,
  name: policy.name,
  tiers: policy.tiers,
  depositPct: policy.deposit_pct,
  isDefault: policy.is_default
})

const findOwnedPolicy = async (propertyId, policyId) => {
  const policy = await CancellationPolicy.findOne({ where: { id: policyId, property_id: propertyId } })
  if (!policy) {
    throw new AppError('Cancellation policy not found.', 404, 'VALIDATION_ERROR')
  }
  return policy
}

const listPolicies = async (propertyId) => {
  const policies = await CancellationPolicy.findAll({
    where: { property_id: propertyId },
    order: [['created_at', 'DESC']]
  })
  return policies.map(serializePolicy)
}

const createPolicy = async (propertyId, payload) => {
  return sequelize.transaction(async (t) => {
    if (payload.isDefault) {
      await CancellationPolicy.update(
        { is_default: false },
        { where: { property_id: propertyId }, transaction: t }
      )
    }

    const policy = await CancellationPolicy.create({
      property_id: propertyId,
      name: payload.name,
      tiers: payload.tiers,
      deposit_pct: payload.depositPct,
      is_default: payload.isDefault
    }, { transaction: t })

    return serializePolicy(policy)
  })
}

const updatePolicy = async (propertyId, policyId, payload) => {
  return sequelize.transaction(async (t) => {
    const policy = await CancellationPolicy.findOne({
      where: { id: policyId, property_id: propertyId },
      transaction: t
    })
    if (!policy) {
      throw new AppError('Cancellation policy not found.', 404, 'VALIDATION_ERROR')
    }

    if (payload.isDefault) {
      await CancellationPolicy.update(
        { is_default: false },
        { where: { property_id: propertyId }, transaction: t }
      )
    }

    if (payload.name !== undefined) policy.name = payload.name
    if (payload.tiers !== undefined) policy.tiers = payload.tiers
    if (payload.depositPct !== undefined) policy.deposit_pct = payload.depositPct
    if (payload.isDefault !== undefined) policy.is_default = payload.isDefault

    await policy.save({ transaction: t })
    return serializePolicy(policy)
  })
}

const deletePolicy = async (propertyId, policyId) => {
  const policy = await findOwnedPolicy(propertyId, policyId)

  if (policy.is_default) {
    throw new AppError('Cannot delete the default cancellation policy. Set another one as default first.', 409, 'VALIDATION_ERROR')
  }

  await policy.destroy()
}

const setDefault = async (propertyId, policyId) => {
  return sequelize.transaction(async (t) => {
    const policy = await CancellationPolicy.findOne({
      where: { id: policyId, property_id: propertyId },
      transaction: t
    })
    if (!policy) {
      throw new AppError('Cancellation policy not found.', 404, 'VALIDATION_ERROR')
    }

    await CancellationPolicy.update(
      { is_default: false },
      { where: { property_id: propertyId }, transaction: t }
    )

    policy.is_default = true
    await policy.save({ transaction: t })

    return serializePolicy(policy)
  })
}

module.exports = { listPolicies, createPolicy, updatePolicy, deletePolicy, setDefault }