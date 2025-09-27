/* Vitest globals for editor type checking */
declare namespace NodeJS {
  interface Global {
    describe: any;
    it: any;
    expect: any;
    beforeEach: any;
    afterEach: any;
  }
}

declare var describe: any;
declare var it: any;
declare var expect: any;
declare var beforeEach: any;
declare var afterEach: any;
