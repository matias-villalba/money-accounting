import {inject} from '@loopback/core';
import {DbDataSource} from '../datasources';
import {Transaction, TransactionRelations} from '../models';
import {InMemoeryTransactionalRepository} from './inmemory.transactiona.repository';

export class TransactionRepository extends InMemoeryTransactionalRepository<
  Transaction,
  typeof Transaction.prototype.id,
  TransactionRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Transaction, dataSource);
  }
}
