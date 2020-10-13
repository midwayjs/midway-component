import { Controller, Get, Inject, Param, Provide, Query, Redirect, } from '@midwayjs/decorator';
import { IMidwayKoaContext } from '@midwayjs/koa';

class homeDataDTO {
  value: string;
}

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  ctx: IMidwayKoaContext;

  @Get('/')
  async home() {
    return 'hello world';
  }

  @Get('/list')
  async listData(@Query() pageSize: number, @Query() pageIdx: number): Promise<homeDataDTO[]> {
    return [
      {
        value: '123'
      },
      {
        value: '321'
      }
    ];
  }

  @Get('/list/:id')
  async listDataById(@Param() id: number): Promise<homeDataDTO> {
    return {
      value: '123'
    };
  }

  @Get('/login')
  @Redirect('/')
  async redirect() {
  }
}
