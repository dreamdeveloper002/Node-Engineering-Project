import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class CardTransaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public external_reference: string

  @column()
  public wallet_id: number

  @column()
  public amount: number

  @column()
  public last_response: string

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}


// {
//   "email": "bbnaija20254445563@gmail.com",
//   "cvv": "408",
//   "number" : "4084084084084081",
//   "expiry_year":"22",
//   "expiry_month":"01",
//   "amount": 10000

// }