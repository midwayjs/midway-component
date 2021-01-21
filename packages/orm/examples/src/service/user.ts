import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '../../../src';
import { User } from '../entities/User.entity';
import { Repository } from 'typeorm';

@Provide()
export class UserService {
  @InjectEntityModel(User)
  userModel: Repository<User>;

  async getUser(): Promise<User[]> {
    return await this.userModel.find();
  }

  async createUser(): Promise<User> {
    return await this.userModel.save({
      name: 'abc123',
    });
  }
}
