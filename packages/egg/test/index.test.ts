import { join } from 'path';
import * as assert from 'assert';

describe('/test/index.test.ts', () => {

  it('should use origin http trigger in ice + faas demo by args', async () => {
    if (/^v10/.test(process.version)) {
      return;
    }
    process.env.MIDWAY_TS_MODE = 'true';
    const invoke = require('@midwayjs/serverless-invoke').invoke;
    const result: any = await invoke({
      functionDir: join(__dirname, 'fixtures/base-fn'),
      functionName: 'test1',
      data: [require('./http_meta.json')],
    });
    process.env.MIDWAY_TS_MODE = 'false';
    assert(result && result.body === 'hello world');
  });

});
