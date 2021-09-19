'use strict'

import Wallet from 'App/Models/Wallet'
import Transaction from 'App/Models/Transaction'

export default class Help {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  static processInitialCardCharge (chargeResult) {
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

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  static async creditAccount ({ amount, reference, metadata, userId }) {
    try {
      const account = await Wallet.findBy('userId', userId)

      if (!account) {
        return {
          success: false,
          error: 'Account does not exist',
        }
      }

      account.balance = Number(account.balance) + Number(amount)

      await account.save()

      await Transaction.create({
        txn_type: 'Credit',
        amount,
        purpose : 'Card funding',
        wallet_id: account.id,
        reference,
        metadata,
        balance_before: Number(account.balance),
        balance_after: Number(account.balance) + Number(amount),
      })
      return {
        success: true,
        message: 'Credit successful',
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      }
    }
  }
}

