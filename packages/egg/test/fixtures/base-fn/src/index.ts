import { FunctionHandler, FaaSContext } from '@midwayjs/faas';
import { Provide, Inject, Func, Plugin } from '@midwayjs/decorator';
import * as assert from 'assert';

@Provide()
export class IndexHandler implements FunctionHandler {
  @Inject()
  ctx: FaaSContext;

  @Plugin()
  mysql;

  @Func('index.handler')
  async handler() {
    assert(this.mysql);
    return 'hello world';
  }
}
