import { cloneDeep } from '../src/util';
import * as assert from 'assert';

class OriginClass {
  callback() {
    return 'origin';
  }

  get ip() {
    return '127'
  }
}

class TargetClassParent {

  HTTPCLIENT;

  constructor() {
    this.HTTPCLIENT = Symbol('EggApplication#httpclient');
  }


  callback() {
    return 'target';
  }

  get ip() {
    return '127.0.0.1'
  }

  get config() {
    return {
      a: 1,
      b: 2
    }
  }
}

class TargetClassChild extends TargetClassParent {
  callback() {
    return 'target child';
  }

  get ip() {
    return '127.0.0.1:3000'
  }
}

describe('/test/util.test.ts', () => {
  it('should test copy normal property and symbol', () => {
    const origin = {};
    const a = Symbol('a');
    const source = {
      bbb: '123'
    }
    source[a] = 'localSymbol';
    cloneDeep(origin, source);
    assert(origin['bbb'] === '123');
    assert(origin[a] === 'localSymbol');
  });

  it('should test copy normal property and symbol by proto', () => {
    const origin = { bbb: '321'};
    const newOrigin = Object.create(origin);
    const a = Symbol('a');
    const source = {}
    source[a] = 'localSymbol';
    cloneDeep(newOrigin, source);
    assert(newOrigin['bbb'] === '321');
    assert(newOrigin[a] === 'localSymbol');
  });

  it('should test object merge and blacklist', () => {
    const origin = new OriginClass();
    const targetClassChild = new TargetClassChild();
    cloneDeep(origin, targetClassChild);

    assert.deepStrictEqual(origin.callback(), 'target child');
    // Todo: should chan change?
    assert.deepStrictEqual(origin.ip, '127.0.0.1');
    assert.deepStrictEqual((origin as any).config, { a: 1, b: 2 });


    const origin1 = new OriginClass();
    const targetClassChild1 = new TargetClassChild();
    cloneDeep(origin1, targetClassChild1, ['callback', 'ip']);

    assert.deepStrictEqual(origin1.callback(), 'origin');
    assert.deepStrictEqual(origin1.ip, '127');
    assert.deepStrictEqual((origin1 as any).config, { a: 1, b: 2 });
  });

});
