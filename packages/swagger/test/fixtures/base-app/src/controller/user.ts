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
  Query,
} from '@midwayjs/decorator';
import { UserService } from '../service/user';
import { IMidwayKoaContext } from '@midwayjs/koa';
import { CreateAPIDoc, CreateAPIPropertyDoc } from '../../../../../src';

export class UserDTO {

  @CreateAPIPropertyDoc('这是一个参数属性', {
    required: true,
    example: 18
  })
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

  @CreateAPIDoc()
    .summary('获取用户')
    .description('这是一个完整的获取用户的接口')
    .param('用户 id', {
      required: true,
      example: 2
    })
    .param('用户名')
    .respond(200, '正常返回', 'text', {
      example: 'hello world'
    })
    .respond(500, '抛出错误')
    .build()

  @Get('/:userId')
  async getUser(@Param() userId: number, @Query() name?: string) {
    return {
      name: 'harry',
      age: 18
    };
  }

  @CreateAPIDoc()
    .summary('创建新用户')
    .param('用户 DTO')
    .param('用户名')
    .respond(200, '正常返回', 'text', {
      example: 'hello world'
    })
    .respond(500, '抛出错误')
    .build()

  @Put('/')
  async createNewUser(@Body(ALL) user: UserDTO, @Query() name?: string): Promise<UserDTO> {
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
