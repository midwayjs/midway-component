import { Controller, Get, Provide, RequestPath } from "@midwayjs/decorator";
import { getAbsoluteFSPath } from 'swagger-ui-dist';
import { readFileSync } from 'fs';
import { join } from 'path';

const swaggerUiAssetPath = getAbsoluteFSPath();

@Provide()
@Controller('/swagger-ui')
export class SwaggerController {

  @Get('/json')
  async renderJSON() {
  
  }

  @Get('/*')
  async renderSwagger(@RequestPath() requestPath) {
    console.log('///', requestPath)
    if (requestPath === '/') {
      requestPath = '/index.html';
    }
    return readFileSync(join(swaggerUiAssetPath, requestPath), {
      encoding: 'utf8'
    }).toString();
  }
}