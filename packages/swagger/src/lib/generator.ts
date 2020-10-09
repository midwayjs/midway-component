import {
  CONTROLLER_KEY,
  ControllerOption,
  getClassMetadata,
  getPropertyDataFromClass,
  RouterOption,
  RouterParamValue,
  WEB_ROUTER_KEY,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import {
  SwaggerDocument,
  SwaggerDocumentParameter,
  SwaggerDocumentRouter,
} from './document';

export class SwaggerMetaGenerator {
  document: SwaggerDocument;

  constructor() {
    this.document = new SwaggerDocument();
  }

  generateController(module) {
    const controllerOption: ControllerOption = getClassMetadata(
      CONTROLLER_KEY,
      module
    );

    const prefix = controllerOption.prefix;
    // const globalMiddleware = controllerOption.routerOptions.middleware;

    // get router info
    const webRouterInfo: RouterOption[] = getClassMetadata(
      WEB_ROUTER_KEY,
      module
    );

    for (const webRouter of webRouterInfo) {
      const url = prefix + webRouter.path;
      const router = new SwaggerDocumentRouter(webRouter.requestMethod, url);
      this.generateRouter(webRouter, router);
      this.document.addRouter(router);
    }
  }

  generate() {
    return this.document.toJSON();
  }

  generateRouter(
    webRouterInfo: RouterOption,
    swaggerRouter: SwaggerDocumentRouter
  ) {
    swaggerRouter.summary = webRouterInfo.routerName;
    swaggerRouter.operationId = webRouterInfo.method;
    const routeArgsInfo: RouterParamValue[] =
      getPropertyDataFromClass(
        WEB_ROUTER_PARAM_KEY,
        module,
        webRouterInfo.method
      ) || [];

    for (const routeArgs of routeArgsInfo) {
      const swaggerParameter = new SwaggerDocumentParameter();
      swaggerRouter.parameters.push(swaggerParameter);
      swaggerParameter.name = routeArgs.propertyData;
    }
  }
}
