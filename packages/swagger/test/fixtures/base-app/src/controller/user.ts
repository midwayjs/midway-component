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

@Provide()
@Controller('/user')
export class UserController {

  @Inject()
  ctx: IMidwayKoaContext;

  @Inject()
  userService: UserService;


  @Get('/:userId')
  async getUser(@Param() userId: number): Promise<UserDTO> {
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
