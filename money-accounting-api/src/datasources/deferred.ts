'use strict';

export class Deferred {
  resolve: Function;
  reject: Function;
  promise: Promise<string>;

  constructor() {
    this.promise = new Promise((resolve: Function, reject: Function) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    Object.freeze(this);
  }
}
