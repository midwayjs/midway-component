import {
  Controller,
  Get,
  Param,
  Provide,
  RequestPath,
} from '@midwayjs/decorator';
import { readFileSync } from 'fs';
import { join } from 'path';
import { safeRequire } from "@midwayjs/core";

@Provide()
@Controller('/swagger')
export class SwaggerController {

  swaggerUiAssetPath: string;

  constructor() {
    const { getAbsoluteFSPath } = safeRequire('swagger-ui-dist');
    this.swaggerUiAssetPath = getAbsoluteFSPath();
  }

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
    if (!this.swaggerUiAssetPath) {
      return 'please run "npm install swagger-ui-dist" first';
    }
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
    return readFileSync(join(this.swaggerUiAssetPath, requestPath));
  }
}
