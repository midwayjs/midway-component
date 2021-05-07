import { invoke } from '@midwayjs/serverless-invoke';
import { join } from 'path';
import * as assert from 'assert';

describe('/test/index.test.ts', () => {

  if (/^v10/.test(process.version)) {
    it('skip node v10', () => {});
    return;
  }

  it('should use origin http trigger in ice + faas demo by args', async () => {
    process.env.MIDWAY_TS_MODE = 'true';
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/base-fn'),
      functionName: 'test1',
      data: [require('./http_meta.json')],
    });
    process.env.MIDWAY_TS_MODE = 'false';
    assert(result && result.body === 'hello world');
  });
});
