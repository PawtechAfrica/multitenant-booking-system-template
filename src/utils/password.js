const bcrypt = require('bcrypt')

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)

const hashPassword = password => bcrypt.hash(password, SALT_ROUNDS)

const comparePassword = (password, hash) => bcrypt.compare(password, hash)

module.exports = { hashPassword, comparePassword }