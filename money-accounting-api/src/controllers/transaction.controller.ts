import {intercept} from '@loopback/core';
import {IsolationLevel, repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  post,
  requestBody,
} from '@loopback/rest';
import {ValidateTransactionInterceptor} from '../interceptors';
import {Transaction} from '../models';
import {AccountRepository, TransactionRepository} from '../repositories';

export class TransactionController {
  constructor(
    @repository(TransactionRepository)
    public transactionRepository: TransactionRepository,

    @repository(AccountRepository)
    public accountRepository: AccountRepository,
  ) {}

  @post('/transactions', {
    responses: {
      '200': {
        description: 'Commit a Transaction ',
        content: {'application/json': {schema: getModelSchemaRef(Transaction)}},
      },
    },
  })
  @intercept(ValidateTransactionInterceptor.BINDING_KEY)
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transaction, {
            title: 'transactionToCommit',
            exclude: ['id', 'effectiveDate'],
          }),
        },
      },
    })
    transaction: Omit<Transaction, 'id'>,
  ): Promise<Transaction> {
    const tx = await this.accountRepository.beginTransaction({
      isolationLevel: IsolationLevel.SERIALIZABLE,
      timeout: 15000,
    });
    try {
      const account = await this.accountRepository.findOne(undefined, {
        transaction: tx,
      });
      if (!account)
        throw new HttpErrors.InternalServerError('there is not an account');

      transaction.effectiveDate = new Date();
      const transationCreated = await this.transactionRepository.create(
        transaction,
        {transaction: tx},
      );

      account.increaseOrDecreaseBalanceBy(transationCreated);

      await this.accountRepository.update(account, {transaction: tx});

      await tx.commit();
      return transationCreated;
    } catch (error) {
      await tx.rollback();
      if (error instanceof HttpErrors.UnprocessableEntity) {
        throw error;
      } else {
        throw new HttpErrors.InternalServerError(error.message);
      }
    }
  }

  @get('/transactions', {
    responses: {
      '200': {
        description: 'Array of Transactions history',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Transaction, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(): Promise<Transaction[]> {
    return this.transactionRepository.find();
  }

  @get('/transactions/{id}', {
    responses: {
      '200': {
        description: 'Transaction model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Transaction, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<Transaction> {
    return this.transactionRepository.findById(id);
  }
}
