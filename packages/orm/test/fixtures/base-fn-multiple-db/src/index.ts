import { FunctionHandler, FaaSContext } from '@midwayjs/faas';
import { Provide, Inject, Func } from '@midwayjs/decorator';
import { InjectEntityModel } from '../../../../src';
import { User } from './model/user';
import { Repository } from 'typeorm';
import * as assert from 'assert';

@Provide()
export class IndexHandler implements FunctionHandler {
  @Inject()
  ctx: FaaSContext;

  @InjectEntityModel(User, 'test')
  testUserModel: Repository<User>;

  @InjectEntityModel(User)
  defaultUserModel: Repository<User>;

  @Func('index.handler')
  async handler() {
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

    return 'hello world' + JSON.stringify(users);
  }
}
