import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, HasMany, hasMany, hasOne, HasOne } from '@ioc:Adonis/Lucid/Orm'
import Wallet from './Wallet'
import Transaction from './Transaction'
import CardTransaction from './CardTransaction'
import Hash from '@ioc:Adonis/Core/Hash'
import Beneficiary from './Beneficiary'

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

  @hasMany(() => Beneficiary)
  public beneficiary: HasMany<typeof Beneficiary>

  @hasMany(() => CardTransaction)
  public cardTransaction: HasMany<typeof CardTransaction>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
