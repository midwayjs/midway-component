import {
  Controller,
  Get,
  Param,
  Provide,
  RequestPath,
} from '@midwayjs/decorator';
import { getAbsoluteFSPath } from 'swagger-ui-dist';
import { readFileSync } from 'fs';
import { join } from 'path';

const swaggerUiAssetPath = getAbsoluteFSPath();

@Provide()
@Controller('/swagger')
export class SwaggerController {
  @Get('/json')
  async renderJSON() {
    return 'hello world';
  }

  @Get('/ui')
  @Get('/ui/:fileName')
  async renderSwagger(
    @RequestPath() requestPath: string,
    @Param() fileName?: string
  ) {
    if (fileName) {
      requestPath = fileName;
    } else {
      requestPath = requestPath.replace('/swagger/ui', '/');
      if (requestPath === '/') {
        requestPath = '/index.html';
      }
    }
    return this.getSwaggerUIResource(requestPath);
  }

  getSwaggerUIResource(requestPath) {
    return readFileSync(join(swaggerUiAssetPath, requestPath));
  }
}
