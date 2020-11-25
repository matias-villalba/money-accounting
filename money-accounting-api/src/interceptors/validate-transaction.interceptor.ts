import {
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: ValidateTransactionInterceptor.BINDING_KEY}})
export class ValidateTransactionInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${ValidateTransactionInterceptor.name}`;

  /*
  constructor() {}
  */

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    if (invocationCtx.methodName === 'create') {
      const transactionToCreate = invocationCtx.args[0];

      if (
        transactionToCreate.type !== 'credit' &&
        transactionToCreate.type !== 'debit'
      ) {
        throw new HttpErrors.UnprocessableEntity(
          'Transaction type must be: debit or credit',
        );
      }

      if (
        typeof transactionToCreate.amount !== 'number' ||
        transactionToCreate.amount <= 0
      ) {
        throw new HttpErrors.UnprocessableEntity(
          'Transaction amount must be: a positive number',
        );
      }
    }
    const result = await next();
    // Add post-invocation logic here
    return result;
  }
}
