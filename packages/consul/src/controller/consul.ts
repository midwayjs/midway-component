import {Controller, Get, Provide} from "@midwayjs/decorator";

@Provide()
@Controller('/consul')
export class ConsulController {

  @Get('/health/self/check')
  async healthCheck() {
    return {status: 'success'};
  }

}
