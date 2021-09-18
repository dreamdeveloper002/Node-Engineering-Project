'use strict'

// import Wallet from 'App/Models/Wallet'
// import Transaction from 'App/Models/Transaction'
// import CardTransaction from 'App/Models/CardTransaction'

const Wallet = require('../Models/Wallet')



console.log(Wallet.model)

module.exports = class Help {
  static processInitialCardCharge () {
    console.log('it works')
    if (chargeResult.data.status === 'success') {
      return {
        success: true,
        message: chargeResult.data.status,
        data: {
          shouldCreditAccount: true,
          reference: chargeResult.data.reference,
        },
      }
    }
    return {
      success: true,
      message: chargeResult.data.status,
      data: {
        shouldCreditAccount: false,
        reference: chargeResult.data.reference,
      },
    }
  }
  // static async creditAccount (amount, auth, purpose, reference = v4(), metadata, trx) {
  //   console.log('it works')
  //   const wallet = await Wallet.findBy('userId', auth.id)
  //   if (!wallet) {
  //     return {
  //       success: false,
  //       error: 'Wallet does not exist',
  //     }
  //   }

  //   await Wallet.where('userId', '=', auth.id).decrement('balance', amount)

  //   await Transaction.create({
  //     txn_type: 'credit',
  //     purpose,
  //     amount,
  //     account_id,
  //     reference,
  //     metadata,
  //     balance_before: Number(account.balance),
  //     balance_after: Number(account.balance) + Number(amount),
  //     created_at: Date.now(),
  //     updated_at: Date.now(),
  //   }, trx)
  //   return {
  //     success: true,
  //     message: 'Credit successful',
  //   }
  // }
}

