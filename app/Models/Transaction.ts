import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Transaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public txn_type: 'Debit' | 'Credit'

  @column()
  public purpose: string

  @column()
  public amount: number

  @column()
  public wallet_id: number

  @column()
  public reference: number

  @column()
  public balance_before: number

  @column()
  public balance_after: number

  @column()
  public metadata: string

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
