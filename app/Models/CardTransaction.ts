import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class CardTransaction extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public external_reference: number

  @column()
  public wallet_id: number

  @column()
  public bank_name: string

  @column()
  public amount: number

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
