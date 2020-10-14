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
import { CreateAPI } from '../../../../../src';

export class UserDTO {

  @Rule(RuleType.string().required())
  name: string;

  @Rule(RuleType.number())
  age: number;
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
    .param('用户 id')
    .example(require('../example/user'))
    .response(200, UserDTO)
    .response(500, Error)
    .build()

  @CreateAPI({
    summary: '获取用户',
    description: '这是一个完整的获取用户的接口',
    param: [
      {
        summary: '用户 id'
      }
    ],
    example: require('../example/user'),
    response: [
      {
        status: 200,
        type: UserDTO
      },
      {
        status: 500,
        type: Error
      }
    ]
  })

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
