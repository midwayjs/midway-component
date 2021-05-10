import { Provide, Inject } from '@midwayjs/decorator';
import { InjectEntityModel } from '../../../../src';
import { User } from './model/user';
import { Repository } from 'typeorm';
import * as assert from 'assert';
// import { BaseFnMultipleHook } from './hook';

@Provide()
export class IndexHandler{
  @Inject()
  ctx;

  @InjectEntityModel(User, 'test')
  testUserModel: Repository<User>;

  @InjectEntityModel(User)
  defaultUserModel: Repository<User>;

  async run() {
    const u = new User();
    u.name = 'oneuser1';

    const uu = await this.defaultUserModel.save(u);

    console.log('user one id = ', uu.id);
    const user = new User();
    user.id = 1;

    const users = await this.defaultUserModel.findAndCount(user);
    assert(users[0][0]['name'] === 'oneuser1');


    const result = await this.testUserModel.findOne(user);
    assert(!result);

    const aa = await (this.ctx.requestContext as any).applicationContext.getAsync('baseFnMultipleHook');
    assert.equal(aa.bcreate, 1);
    assert.equal(aa.acreate, 1);
    // assert.equal(aa.bclose, 1);
    // assert.equal(aa.aclose, 1);

    return 'hello world' + JSON.stringify(users);
  }
}
