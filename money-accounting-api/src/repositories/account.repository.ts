import {inject} from '@loopback/core';
import {DbDataSource} from '../datasources';
import {Account, AccountRelations} from '../models';
import {InMemoeryTransactionalRepository} from './inmemory.transactiona.repository';

export class AccountRepository extends InMemoeryTransactionalRepository<
  Account,
  typeof Account.prototype.id,
  AccountRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Account, dataSource);
  }
}
