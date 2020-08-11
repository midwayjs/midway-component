import { invoke } from '@midwayjs/serverless-invoke';
import { join } from 'path';
import * as assert from 'assert';

describe.only('/test/index.test.ts', () => {
  it('should use origin http trigger in ice + faas demo by args', async () => {
    process.env.MIDWAY_TS_MODE = 'true';
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/base-fn'),
      functionName: 'test1',
      data: [require('./http_meta.json')],
      clean: false
    });
    process.env.MIDWAY_TS_MODE = 'false';
    console.log('result.body', result);
    assert(result && result.body.indexOf('hello world') > -1);
    assert(result.body === 'hello world[[{"id":1,"name":"oneuser1"}],1]');
  });
});
