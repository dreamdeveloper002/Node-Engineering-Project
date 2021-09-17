import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Wallet from './Wallet'
import Transaction from './Transaction'
import CardTransaction from './CardTransaction'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public email: string

  @column()
  public password: string

  @column()
  public username: string

  @hasOne(() => Wallet)
  public wallet: HasOne<typeof Wallet>

  @hasMany(() => Transaction)
  public transaction: HasMany<typeof Transaction>

  @hasMany(() => CardTransaction)
  public cardTransaction: HasMany<typeof CardTransaction>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
