import {
  ALL,
  Body,
  Controller,
  Del,
  Get,
  Inject,
  Param,
  Post,
  Provide,
  Put,
  Rule,
  RuleType,
} from '@midwayjs/decorator';
import { UserService } from '../service/user';
import { IMidwayKoaContext } from '@midwayjs/koa';

export class UserDTO {

  @Rule(RuleType.string().required())
  name: string;

  @Rule(RuleType.number())
  age: number;
}

class SwaggerAPI {
  summary(summary: string) {
    return this;
  }

  description(desc: string) {
    return this;
  }

  addParameter(summary: string, description?: string) {
    return this;
  }

  addReturn(status: number, result) {
    return this;
  }

  example(example: any) {
    return this;
  }

  build() {
    return (target: any, property: string) => {

    }
  }
}

function CreateAPI() {
  return new SwaggerAPI();
}


@Provide()
@Controller('/user')
export class UserController {

  @Inject()
  ctx: IMidwayKoaContext;

  @Inject()
  userService: UserService;

  @CreateAPI()
    .summary('获取用户')
    .description('这是一个完整的获取用户的接口')
    .addParameter('用户 id')
    .example(require('./example/user'))
    .addReturn(200, UserDTO)
    .addReturn(500, Error)
    .build()
  @Get('/:userId')
  async getUser(@Param() userId: number) {
    return {
      name: 'harry',
      age: 18
    };
  }

  @Put('/')
  async createNewUser(@Body(ALL) user: UserDTO): Promise<UserDTO> {
    return {
      name: 'harry',
      age: 18
    };
  }

  @Post('/:userId')
  async updateData(@Param() userId: number, @Body() user: UserDTO): Promise<UserDTO> {
    return {
      name: 'harry',
      age: 18
    };
  }

  @Del('/:userId')
  async delUser(@Param() userId: number): Promise<UserDTO> {
    return {
      name: 'harry',
      age: 18
    };
  }

}
