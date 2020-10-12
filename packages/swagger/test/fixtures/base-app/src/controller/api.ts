import {
  Controller,
  Post,
  Get,
  Provide,
  Inject,
  Query,
  Body,
  HttpCode,
  Redirect,
  Headers,
} from '@midwayjs/decorator';
import { UserService } from '../service/user';
import { IMidwayKoaContext } from '@midwayjs/koa';

export class User {
  firstName: string;
  lastName: number
}

@Provide()
@Controller('/')
export class APIController {
  @Inject()
  ctx: IMidwayKoaContext;

  @Inject()
  userService: UserService;

  @Post()
  async postData(@Body() bbbb) {
    return 'data';
  }

  @Get('/', { middleware: []})
  @HttpCode(201)
  async home(@Query() name: string, @Query() age: number, @Headers() user: User) {
    return 'hello world,' + name + age;
  }

  @Get('/login')
  @Redirect('/')
  async redirect() {}
}
