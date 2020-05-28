import { invoke } from '@midwayjs/serverless-invoke';
import { join } from 'path';
import * as assert from 'assert';

describe('/test/index.test.ts', () => {
  it('should use origin http trigger in ice + faas demo by args', async () => {
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/base-fn'),
      functionName: 'test1',
      data: [require('./http_meta.json')],
      clean: false,
    });
    assert(result && result.body === 'hello world');
  });
});
