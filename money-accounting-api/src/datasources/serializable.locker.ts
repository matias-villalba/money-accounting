import {AnyObject} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {Deferred} from './deferred';

export class SerializableLocker {
  static instance: SerializableLocker;

  locked: AnyObject;

  waitingQueue: Array<AnyObject>;

  timeoutByTxId: AnyObject;

  constructor() {
    this.locked = {};
    this.waitingQueue = [];
    this.timeoutByTxId = {};
  }

  static getInstance() {
    SerializableLocker.instance = SerializableLocker.instance
      ? SerializableLocker.instance
      : new SerializableLocker();
    return SerializableLocker.instance;
  }

  isLocked(entity: string, currentTransactionId: string) {
    if (
      this.locked.txId &&
      currentTransactionId !== this.locked.txId &&
      this.locked.entities &&
      this.locked.entities.has(entity)
    ) {
      return true;
    }

    return false;
  }

  lock(entity: string, txId: string) {
    if (!this.locked.txId) {
      this.locked.txId = txId;
      this.locked.entities = new Set();
      this.locked.entities.add(entity);
      return;
    }
    if (txId && this.locked.txId !== txId) {
      throw new Error('there is already an active locking');
    }
    if (this.locked.txId === txId) {
      this.locked.entities.add(entity);
    }
  }

  unlock(txId: string) {
    this.locked.txId = null;
    this.locked.entities = null;

    let toUnlock;
    do {
      toUnlock = this.waitingQueue.pop();

      if (toUnlock) {
        clearTimeout(toUnlock.setTimeout);
        const deferred = toUnlock.deferred;
        deferred.resolve();
      }
    } while (toUnlock && !toUnlock.txId);
  }

  putTimeoutByTx(txId: string, timeout: number) {
    this.timeoutByTxId[txId] = timeout;
  }
  getUnlockPromise(txId?: string) {
    let timeout;
    if (txId && this.timeoutByTxId[txId]) {
      timeout = this.timeoutByTxId[txId];
      delete this.timeoutByTxId[txId];
    } else {
      timeout = 6000;
    }

    const deferred = new Deferred();
    const toUnlock = {
      deferred,
      txId,
      setTimeout: setTimeout(
        () =>
          deferred.reject(
            new HttpErrors.RequestTimeout('Db transaction timeout'),
          ),
        timeout,
      ),
    };
    this.waitingQueue.unshift(toUnlock);

    return deferred.promise;
  }
}
