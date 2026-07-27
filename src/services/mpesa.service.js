// const axios = require('axios')

// const BASE_URL = process.env.MPESA_ENV === 'production'
//   ? 'https://api.safaricom.co.ke'
//   : 'https://sandbox.safaricom.co.ke'

// const getTimestamp = () => {
//   const d = new Date()
//   const pad = n => String(n).padStart(2, '0')
//   return (
//     d.getFullYear().toString() +
//     pad(d.getMonth() + 1) +
//     pad(d.getDate()) +
//     pad(d.getHours()) +
//     pad(d.getMinutes()) +
//     pad(d.getSeconds())
//   )
// }

// const getAccessToken = async () => {
//   const credentials = Buffer.from(
//     `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
//   ).toString('base64')

//   const response = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
//     headers: { Authorization: `Basic ${credentials}` }
//   })

//   return response.data.access_token
// }

// const stkPush = async ({ phoneNumber, amount, accountReference, transactionDesc }) => {
//   const accessToken = await getAccessToken()
//   const timestamp = getTimestamp()
//   const password = Buffer.from(
//     `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
//   ).toString('base64')

//   const response = await axios.post(
//     `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
//     {
//       BusinessShortCode: process.env.MPESA_SHORTCODE,
//       Password: password,
//       Timestamp: timestamp,
//       TransactionType: 'CustomerPayBillOnline',
//       Amount: Math.ceil(amount),
//       PartyA: phoneNumber,
//       PartyB: process.env.MPESA_SHORTCODE,
//       PhoneNumber: phoneNumber,
//       CallBackURL: process.env.MPESA_CALLBACK_URL,
//       AccountReference: accountReference,
//       TransactionDesc: transactionDesc
//     },
//     { headers: { Authorization: `Bearer ${accessToken}` } }
//   )

//   return response.data // contains CheckoutRequestID, MerchantRequestID
// }

// module.exports = { stkPush }









const axios = require('axios')

const BASE_URL = process.env.MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

console.log(`🔧 M-Pesa Environment: ${process.env.MPESA_ENV || 'sandbox'}`)
console.log(`📍 Base URL: ${BASE_URL}`)

const getTimestamp = () => {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  )
}

const getAccessToken = async () => {
  console.log('🔄 Generating access token...')
  
  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET
  
  console.log(`📋 Consumer Key: ${consumerKey ? '✅ Set' : '❌ Missing'}`)
  console.log(`📋 Consumer Secret: ${consumerSecret ? '✅ Set' : '❌ Missing'}`)
  
  if (!consumerKey || !consumerSecret) {
    console.error('❌ ERROR: Consumer Key or Secret is missing!')
    throw new Error('Missing consumer credentials')
  }

  const credentials = Buffer.from(
    `${consumerKey}:${consumerSecret}`
  ).toString('base64')

  console.log(`🔑 Authorization Header: Basic ${credentials.substring(0, 20)}...`)

  try {
    const response = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${credentials}` }
    })

    console.log('✅ Access token generated successfully!')
    console.log(`🎫 Access Token: ${response.data.access_token.substring(0, 20)}...`)
    console.log(`⏰ Expires in: ${response.data.expires_in} seconds`)
    
    return response.data.access_token
  } catch (error) {
    console.error('❌ Failed to get access token:')
    if (error.response) {
      console.error(`   Status: ${error.response.status}`)
      console.error(`   Data:`, error.response.data)
    } else {
      console.error(`   Error: ${error.message}`)
    }
    throw error
  }
}

const stkPush = async ({ phoneNumber, amount, accountReference, transactionDesc }) => {
  console.log('\n🚀 Starting STK Push Request...')
  console.log('==========================================')
  console.log(`📱 Phone Number: ${phoneNumber}`)
  console.log(`💰 Amount: ${amount}`)
  console.log(`📝 Account Reference: ${accountReference}`)
  console.log(`📄 Transaction Description: ${transactionDesc}`)
  console.log('==========================================\n')

  try {
    console.log('Step 1: Getting access token...')
    const accessToken = await getAccessToken()
    
    console.log('\nStep 2: Preparing STK Push payload...')
    const timestamp = getTimestamp()
    console.log(`⏰ Timestamp: ${timestamp}`)

    const shortcode = process.env.MPESA_SHORTCODE
    const passkey = process.env.MPESA_PASSKEY
    const callbackURL = process.env.MPESA_CALLBACK_URL

    console.log(`🏢 Shortcode: ${shortcode ? '✅ Set' : '❌ Missing'}`)
    console.log(`🔐 Passkey: ${passkey ? '✅ Set' : '❌ Missing'}`)
    console.log(`🔗 Callback URL: ${callbackURL || '⚠️ Not set'}`)

    if (!shortcode || !passkey) {
      console.error('❌ ERROR: Shortcode or Passkey is missing!')
      throw new Error('Missing required credentials')
    }

    const password = Buffer.from(
      `${shortcode}${passkey}${timestamp}`
    ).toString('base64')

    console.log(`🔑 Password: ${password.substring(0, 20)}...`)

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: phoneNumber,
      PartyB: shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: callbackURL,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    }

    console.log('\n📦 Request Payload:')
    console.log(JSON.stringify({
      ...payload,
      Password: '***HIDDEN***'
    }, null, 2))

    console.log('\nStep 3: Sending STK Push request...')
    
    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    console.log('\n✅ STK Push request successful!')
    console.log('==========================================')
    console.log('📊 Response Data:')
    console.log(JSON.stringify(response.data, null, 2))
    console.log('==========================================')
    
    if (response.data.ResponseCode === '0') {
      console.log('✅ STK Push sent successfully!')
      console.log(`📋 CheckoutRequestID: ${response.data.CheckoutRequestID}`)
      console.log(`📋 MerchantRequestID: ${response.data.MerchantRequestID}`)
      console.log('💡 Customer should receive prompt on their phone')
    } else {
      console.warn(`⚠️ Response Code: ${response.data.ResponseCode}`)
      console.warn(`⚠️ Response Description: ${response.data.ResponseDescription}`)
    }

    return response.data // contains CheckoutRequestID, MerchantRequestID

  } catch (error) {
    console.error('\n❌ STK Push Request Failed!')
    console.error('==========================================')
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`HTTP Status: ${error.response.status}`)
      console.error(`Status Text: ${error.response.statusText}`)
      console.error('Response Data:')
      console.error(JSON.stringify(error.response.data, null, 2))
      
      if (error.response.data.errorCode) {
        console.error(`Error Code: ${error.response.data.errorCode}`)
        console.error(`Error Message: ${error.response.data.errorMessage || error.response.data.message}`)
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server')
      console.error(`Request: ${error.request._currentUrl || 'Unknown'}`)
      console.error(`Error: ${error.message}`)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(`Error Message: ${error.message}`)
    }
    
    console.error('==========================================')
    throw error
  }
}

module.exports = { stkPush }

// Debugger Logs
if (require.main === module) {
  console.log('\n🔍 M-Pesa Module Loaded')
  console.log('📋 Environment Variables Check:')
  console.log(`   MPESA_ENV: ${process.env.MPESA_ENV || 'not set (defaults to sandbox)'}`)
  console.log(`   MPESA_CONSUMER_KEY: ${process.env.MPESA_CONSUMER_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`   MPESA_CONSUMER_SECRET: ${process.env.MPESA_CONSUMER_SECRET ? '✅ Set' : '❌ Missing'}`)
  console.log(`   MPESA_SHORTCODE: ${process.env.MPESA_SHORTCODE ? '✅ Set' : '❌ Missing'}`)
  console.log(`   MPESA_PASSKEY: ${process.env.MPESA_PASSKEY ? '✅ Set' : '❌ Missing'}`)
  console.log(`   MPESA_CALLBACK_URL: ${process.env.MPESA_CALLBACK_URL || '⚠️ Not set (will use default)'}`)
  console.log('\n💡 To test, call: stkPush({ phoneNumber: "2547XXXXXXXX", amount: 10, accountReference: "Test", transactionDesc: "Test Payment" })')
}