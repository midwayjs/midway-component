import {
  Controller,
  Get,
  Param,
  Provide,
  Inject,
  App,
} from '@midwayjs/decorator';
import { readFileSync } from 'fs';
import { join, extname } from 'path';
import {
  safeRequire,
  IMidwayApplication,
  MidwayFrameworkType,
} from '@midwayjs/core';

@Provide()
@Controller('/swagger-ui')
export class SwaggerController {
  swaggerUiAssetPath: string;

  @App()
  app: IMidwayApplication;

  @Inject()
  ctx: any;

  @Inject()
  swaggerGenerator: any;

  constructor() {
    const { getAbsoluteFSPath } = safeRequire('swagger-ui-dist');
    this.swaggerUiAssetPath = getAbsoluteFSPath();
  }

  @Get('/json')
  async renderJSON() {
    return this.swaggerGenerator.generate();
  }

  @Get('/')
  @Get('/:fileName')
  async renderSwagger(@Param() fileName: string) {
    if (!this.swaggerUiAssetPath) {
      return 'please run "npm install swagger-ui-dist" first';
    }
    if (!fileName) {
      fileName = '/index.html';
    }
    if (extname(fileName)) {
      if (this.app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
        this.ctx.res.type(extname(fileName));
      } else {
        this.ctx.type = extname(fileName);
      }
    }

    if (fileName.indexOf('index.html') !== -1) {
      const htmlContent = this.getSwaggerUIResource(fileName, 'utf-8');
      return htmlContent.replace(
        'https://petstore.swagger.io/v2/swagger.json',
        '/swagger-ui/json'
      );
    } else {
      return this.getSwaggerUIResource(fileName);
    }
  }

  getSwaggerUIResource(requestPath, encoding?: string) {
    return readFileSync(join(this.swaggerUiAssetPath, requestPath), encoding);
  }
}
