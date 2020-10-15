import {
  Controller,
  Get,
  Param,
  Provide,
  RequestPath,
} from '@midwayjs/decorator';
import { readFileSync } from 'fs';
import { join } from 'path';
import { safeRequire } from '@midwayjs/core';
import { SwaggerMetaGenerator } from '../lib/generator';
import { CONTROLLER_KEY, listModule } from '@midwayjs/decorator';

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
    return this.generateSwaggerDocument();
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
