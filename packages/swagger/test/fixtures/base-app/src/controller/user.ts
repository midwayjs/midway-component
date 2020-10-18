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
import { CreateApiDoc, CreateApiPropertyDoc } from '../../../../../src';

export class SchoolDTO {
  @CreateApiPropertyDoc('地址')
  @Rule(RuleType.string())
  address: string;
}

export class UserDTO {

  @CreateApiPropertyDoc('姓名', {
    example: 'harry'
  })
  @Rule(RuleType.string().required())
  name: string;

  @CreateApiPropertyDoc('年龄')
  @Rule(RuleType.number())
  age: number;

  @CreateApiPropertyDoc('学校信息')
  @Rule(SchoolDTO)
  school: SchoolDTO;
}

@Provide()
@Controller('/user')
export class UserController {

  @Inject()
  ctx: IMidwayKoaContext;

  @Inject()
  userService: UserService;

  @CreateApiDoc()
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

  @CreateApiDoc({
    summary: '',
    description: ''
  })

  @Get('/:userId')
  async getUser(@Param() userId: number, @Query() name?: string) {
    return {
      name: 'harry',
      age: 18
    };
  }

  @CreateApiDoc()
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
      age: 18,
      school: {
        address: 'a'
      }
    };
  }

  @Post('/:userId')
  async updateData(@Param() userId: number, @Body() user: UserDTO): Promise<UserDTO> {
    return {
      name: 'harry',
      age: 18,
      school: {
        address: 'a'
      }
    };
  }

  @Del('/:userId')
  async delUser(@Param() userId: number): Promise<UserDTO> {
    return {
      name: 'harry',
      age: 18,
      school: {
        address: 'a'
      }
    };
  }

}
