import {
  CONTROLLER_KEY,
  ControllerOption,
  getClassMetadata,
  getPropertyDataFromClass,
  RouterOption,
  RouterParamValue,
  WEB_ROUTER_KEY,
  WEB_ROUTER_PARAM_KEY,
  RouteParamTypes,
  getMethodParamTypes,
} from '@midwayjs/decorator';
import {
  SwaggerDocument, SwaggerDocumentInfo,
  SwaggerDocumentParameter,
  SwaggerDocumentRouter,
} from './document';

export class SwaggerMetaGenerator {
  document: SwaggerDocument;

  constructor() {
    this.document = new SwaggerDocument();
    const info = new SwaggerDocumentInfo();
    info.title = 'midway2 swagger api';
    info.version = '1.0.0'
    this.document.info = info;
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
      let url = (prefix + webRouter.path).replace('//', '/');
      url = replaceUrl(url, parseParamsInPath(url))
      const router = new SwaggerDocumentRouter(webRouter.requestMethod, url);
      this.generateRouter(webRouter, router, module);
      this.document.addRouter(router);
    }
  }

  generate() {
    return this.document.toJSON();
  }

  generateRouter(
    webRouterInfo: RouterOption,
    swaggerRouter: SwaggerDocumentRouter,
    module
  ) {
    swaggerRouter.summary = webRouterInfo.routerName;
    // swaggerRouter.operationId = webRouterInfo.method;
    swaggerRouter.parameters = [];
    const routeArgsInfo: RouterParamValue[] =
      getPropertyDataFromClass(
        WEB_ROUTER_PARAM_KEY,
        module,
        webRouterInfo.method
      ) || [];

    const paramTypes = getMethodParamTypes(new module(), webRouterInfo.method);
    for (const routeArgs of routeArgsInfo) {
      const swaggerParameter = new SwaggerDocumentParameter();

      swaggerParameter.name = routeArgs.propertyData;
      swaggerParameter.in = convertTypeToString(routeArgs.type)
      if (swaggerParameter.in === 'path') {
        swaggerParameter.required = true;

        // if path not include this args, must be ignore
        if (swaggerRouter.url.indexOf('{' + swaggerParameter.name + '}') === -1) {
          continue;
        }
      }
      swaggerParameter.schema = {
        type: convertSchemaType(paramTypes[routeArgs.index].name),
        name: undefined,
      }

      // add parameter
      swaggerRouter.parameters.push(swaggerParameter);
    }

    swaggerRouter.responses = {
      200: {
        description: ''
      }
    };
  }
}

function convertTypeToString(type: RouteParamTypes) {
  switch (type) {
    case RouteParamTypes.HEADERS:
      return 'header';
    case RouteParamTypes.QUERY:
      return 'query';
    case RouteParamTypes.PARAM:
      return 'path';
    default:
      return 'header';
  }
}


/**
 * 解释路由上的参数
 * @param url
 */
function parseParamsInPath(url: string) {
  const names: string[] = []
  url.split('/').forEach((item) => {
    if (item.startsWith(':')) {
      const paramName = item.substr(1)
      names.push(paramName)
    }
  })
  return names
}

/**
 * 替换成 openapi 的url
 * @param url
 * @param names
 */
function replaceUrl(url: string, names: string[]) {
  names.forEach((n) => {
    url = url.replace(`:${n}`, `{${n}}`)
  })
  return url
}

function convertSchemaType(value) {
  switch (value) {
    case 'Object':
      return 'object';
    case 'Boolean':
      return 'boolean';
    case 'Interger':
      return 'interger';
    case 'Number':
      return 'number';
    case 'String':
      return 'string';
    default:
      return 'object';
  }
}
