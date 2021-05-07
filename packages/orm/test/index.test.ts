import { IMidwayApplication, LightFramework } from '@midwayjs/core';
import { createApp, close } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import { existsSync, unlinkSync } from 'fs';

describe('/test/index.test.ts', () => {

  it.skip('should use one db', async () => {
    cleanFile(join(__dirname, 'fixtures/base-fn', 'default.sqlite'));
    const app: IMidwayApplication = await createApp(join(__dirname, 'fixtures/base-fn'), {}, LightFramework);

    const handlerFunction: any = await app.createAnonymousContext().requestContext.getAsync('indexHandler');
    const result: any = await handlerFunction.run();
    assert(result && result.indexOf('hello world') > -1);
    assert(result === 'hello world[[{"id":1,"name":"oneuser1"}],1]');
  });

  it('use two db in one config', async () => {
    cleanFile(join(__dirname, 'fixtures/base-fn-multiple-db', 'default.sqlite'));
    cleanFile(join(__dirname, 'fixtures/base-fn-multiple-db', 'test.sqlite'));

    const app: IMidwayApplication = await createApp(join(__dirname, 'fixtures/base-fn-multiple-db'), {}, LightFramework);

    const handlerFunction: any = await app.createAnonymousContext().requestContext.getAsync('indexHandler');
    const result: any = await handlerFunction.run();
    assert(result && result.indexOf('hello world') > -1);
    assert(result === 'hello world[[{"id":1,"name":"oneuser1"}],1]');
    await close(app);
  });
});

function cleanFile(file) {
  if (existsSync(file)) {
    unlinkSync(file);
  }
}

