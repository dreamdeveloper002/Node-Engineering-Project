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
  static async creditAccount ({ amount, purpose, reference, metadata, userId, trx }) {
    const account = await Wallet.findBy('user_id', userId)

    if (!account) {
      return {
        success: false,
        error: 'Account does not exist',
      }
    }

    account.balance = Number(account.balance) + Number(amount)
    // console.log(account)
    await account.save()

    await Transaction.create({
      txn_type: 'Credit',
      amount,
      purpose,
      wallet_id: account.id,
      reference,
      metadata,
      balance_before: Number(account.balance),
      balance_after: Number(account.balance) + Number(amount),
    }, trx)

    trx.commit()
    return {
      success: true,
      message: 'Credit successful',
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  static async debitAccount ({amount, userId, reference, purpose, metadata, trx }) {
    const account = await Wallet.findBy('id', userId)
    if (!account) {
      return {
        success: false,
        error: 'Account does not exist',
      }
    }

    if (Number(account.balance) < amount) {
      return {
        success: false,
        error: 'Insufficient balance',
      }
    }

    account.balance = Number(account.balance) - Number(amount)

    await account.save()

    await Transaction.create({
      txn_type: 'Debit',
      amount,
      purpose,
      wallet_id: account.id,
      reference,
      metadata,
      balance_before: Number(account.balance),
      balance_after: Number(account.balance) - Number(amount),
    }, trx)

    trx.commit()

    return {
      success: true,
      message: 'Debit successful',
    }
  }
}

