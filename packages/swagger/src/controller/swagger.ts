import {
  Controller,
  Get,
  Param,
  Provide,
  ContentType,
  Inject,
  App,
} from '@midwayjs/decorator';
import { readFileSync } from 'fs';
import { join, extname } from 'path';
import { safeRequire, IMidwayApplication, MidwayFrameworkType } from '@midwayjs/core';
import { SwaggerMetaGenerator } from '../lib/generator';
import { CONTROLLER_KEY, listModule } from '@midwayjs/decorator';

@Provide()
@Controller('/swagger')
export class SwaggerController {
  swaggerUiAssetPath: string;

  @App()
  app: IMidwayApplication;

  @Inject()
  ctx: any;

  constructor() {
    const {getAbsoluteFSPath} = safeRequire('swagger-ui-dist');
    this.swaggerUiAssetPath = getAbsoluteFSPath();
  }

  @Get('/json')
  async renderJSON() {
    return this.generateSwaggerDocument();
  }

  @Get('/ui')
  @ContentType('html')
  async renderSwaggerMain() {
    if (!this.swaggerUiAssetPath) {
      return 'please run "npm install swagger-ui-dist" first';
    }
    const requestPath = '/index.html';
    return this.getSwaggerUIResource(requestPath);
  }

  @Get('/ui/:fileName')
  async renderSwagger(
    @Param() fileName: string
  ) {
    if (!this.swaggerUiAssetPath) {
      return 'please run "npm install swagger-ui-dist" first';
    }
    if (extname(fileName)) {
      if (this.app.getFrameworkType() === MidwayFrameworkType.WEB_EXPRESS) {
        this.ctx.res.type(extname(fileName));
      } else {
        this.ctx.type = extname(fileName);
      }
    }
    return this.getSwaggerUIResource(fileName);
  }

  getSwaggerUIResource(requestPath) {
    return readFileSync(join(this.swaggerUiAssetPath, requestPath));
  }

  generateSwaggerDocument() {
    const controllerModules = listModule(CONTROLLER_KEY);
    const generator = new SwaggerMetaGenerator();

    for (const module of controllerModules) {
      if (module !== SwaggerController) {
        generator.generateController(module);
      }
    }
    return generator.generate();
  }
}
