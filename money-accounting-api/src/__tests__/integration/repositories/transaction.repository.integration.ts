import {AnyObject, IsolationLevel} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {expect} from '@loopback/testlab';
import {fail} from 'assert';
import {DbDataSource} from '../../../datasources/db.datasource';
import {AccountRepository, TransactionRepository} from '../../../repositories';

describe('TransactionRepository (integration)', function () {
  const accountRepository = new AccountRepository(new DbDataSource());
  const transactionRepository = new TransactionRepository(new DbDataSource());

  describe('Commit a transaction', function () {
    beforeEach('setup db', async () => {
      await accountRepository.create({balance: 0});
      await transactionRepository.deleteAll();
    });

    afterEach('cleanup db', async () => {
      await accountRepository.deleteAll();
      await transactionRepository.deleteAll();
    });

    it('should get the new transaction in db and the account balance updated', async function () {
      const transaction: AnyObject = {
        amount: 200,
        type: 'credit',
        effectiveDate: null,
      };

      const tx = await accountRepository.beginTransaction({
        isolationLevel: IsolationLevel.SERIALIZABLE,
        timeout: 5000,
      });

      const account = await accountRepository.findOne(undefined, {
        transaction: tx,
      });
      if (!account)
        throw new HttpErrors.InternalServerError('there is not an account');

      transaction.effectiveDate = new Date();
      const transationCreated = await transactionRepository.create(
        transaction,
        {transaction: tx},
      );

      account.increaseOrDecreaseBalanceBy(transationCreated);

      await accountRepository.update(account, {transaction: tx});

      await new Promise((resolve, reject) => setTimeout(resolve, 200));

      await tx.commit();

      const transationsFound = await transactionRepository.find();
      expect(transationsFound.length).to.equal(1);
      expect(transationsFound[0]).to.deepEqual(transationCreated);

      const accountAfterUpdate = await accountRepository.findOne();

      expect(accountAfterUpdate?.balance).to.equal(200);
    }).timeout(20000);

    it('should lock the read operation until write operation is commited', async function () {
      const transaction: AnyObject = {
        amount: 350,
        type: 'credit',
        effectiveDate: null,
      };

      const tx = await accountRepository.beginTransaction({
        isolationLevel: IsolationLevel.SERIALIZABLE,
        timeout: 500,
      });

      const account = await accountRepository.findOne(undefined, {
        transaction: tx,
      });
      if (!account)
        throw new HttpErrors.InternalServerError('there is not an account');

      transaction.effectiveDate = new Date();
      const transationCreated = await transactionRepository.create(
        transaction,
        {transaction: tx},
      );

      account.increaseOrDecreaseBalanceBy(transationCreated);

      await accountRepository.update(account, {transaction: tx});

      await new Promise((resolve, reject) => setTimeout(resolve, 1000));

      try {
        await transactionRepository.find();
      } catch (e) {
        expect(e).ok();
        expect(e).instanceOf(HttpErrors.RequestTimeout);
        await tx.rollback();
        return;
      }
      fail('find() should be blocked beacause it is doing find out of the tx');
    }).timeout(20000);

    it('should not lock the read operation when it is into the same tx', async function () {
      const transaction: AnyObject = {
        amount: 780,
        type: 'credit',
        effectiveDate: null,
      };

      const tx = await accountRepository.beginTransaction({
        isolationLevel: IsolationLevel.SERIALIZABLE,
        timeout: 500,
      });

      const account = await accountRepository.findOne(undefined, {
        transaction: tx,
      });
      if (!account)
        throw new HttpErrors.InternalServerError('there is not an account');

      transaction.effectiveDate = new Date();
      const transationCreated = await transactionRepository.create(
        transaction,
        {transaction: tx},
      );

      account.increaseOrDecreaseBalanceBy(transationCreated);

      await accountRepository.update(account, {transaction: tx});

      await new Promise((resolve, reject) => setTimeout(resolve, 50));

      const transationsFound = await transactionRepository.find(undefined, {
        transaction: tx,
      });
      const accountAfterUpdate = await accountRepository.findOne(undefined, {
        transaction: tx,
      });

      await tx.commit();

      expect(transationsFound.length).to.equal(1);
      expect(transationsFound[0]).to.deepEqual(transationCreated);
      expect(accountAfterUpdate?.balance).to.equal(780);
    }).timeout(10000);
  });
});
