import {
  CONTROLLER_KEY,
  ControllerOption,
  getClassMetadata,
  getMethodParamTypes,
  getParamNames,
  getPropertyDataFromClass,
  getPropertyMetadata,
  getPropertyType,
  isClass,
  RouteParamTypes,
  RouterOption,
  RouterParamValue,
  RULES_KEY,
  WEB_ROUTER_KEY,
  WEB_ROUTER_PARAM_KEY,
} from '@midwayjs/decorator';
import {
  SwaggerDefinition,
  SwaggerDocument,
  SwaggerDocumentInfo,
  SwaggerDocumentParameter,
  SwaggerDocumentRouter,
  SwaggerDocumentTag,
} from './document';
import { ApiFormat, APIParamFormat, SWAGGER_DOCUMENT_KEY } from './createAPI';

export class SwaggerMetaGenerator {
  document: SwaggerDocument;

  constructor() {
    this.document = new SwaggerDocument();
    const info = new SwaggerDocumentInfo();
    info.title = 'Midway2 Swagger API';
    info.version = '1.0.0';
    this.document.info = info;
  }

  generateController(module) {
    const controllerOption: ControllerOption = getClassMetadata(
      CONTROLLER_KEY,
      module
    );

    const prefix = controllerOption.prefix;
    const tag = new SwaggerDocumentTag();
    if (prefix !== '/') {
      tag.name = /^\//.test(prefix) ? prefix.split('/')[1] : prefix;
      tag.description = tag.name;
    } else {
      tag.name = 'default';
      tag.description = tag.name;
    }
    this.document.tags.push(tag);
    // const globalMiddleware = controllerOption.routerOptions.middleware;
    // get router info
    const webRouterInfo: RouterOption[] = getClassMetadata(
      WEB_ROUTER_KEY,
      module
    );

    for (const webRouter of webRouterInfo) {
      let url = (prefix + webRouter.path).replace('//', '/');
      url = replaceUrl(url, parseParamsInPath(url));
      const router = new SwaggerDocumentRouter(webRouter.requestMethod, url);
      router.tags = [tag.name];
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
    const ins = new module();
    const swaggerApi: ApiFormat = getPropertyMetadata(
      SWAGGER_DOCUMENT_KEY,
      ins,
      webRouterInfo.method
    );

    swaggerRouter.summary = swaggerApi?.summary || webRouterInfo.routerName;
    swaggerRouter.description =
      swaggerApi?.description || webRouterInfo.routerName;
    // swaggerRouter.operationId = webRouterInfo.method;
    swaggerRouter.parameters = [];
    const routeArgsInfo: RouterParamValue[] =
      getPropertyDataFromClass(
        WEB_ROUTER_PARAM_KEY,
        module,
        webRouterInfo.method
      ) || [];

    // 获取方法参数名
    const argsNames = getParamNames(ins[webRouterInfo.method]);

    // 获取方法参数类型
    const paramTypes = getMethodParamTypes(ins, webRouterInfo.method);
    for (const routeArgs of routeArgsInfo) {
      const swaggerParameter = new SwaggerDocumentParameter();
      const argsApiInfo = swaggerApi?.params[routeArgs.index];
      swaggerParameter.description = argsApiInfo?.description;
      swaggerParameter.name = argsApiInfo.name || argsNames[routeArgs.index];
      swaggerParameter.in = convertTypeToString(routeArgs.type);
      swaggerParameter.required = argsApiInfo?.required;
      swaggerParameter.deprecated = argsApiInfo?.deprecated;
      swaggerParameter.allowEmptyValue = argsApiInfo?.allowEmptyValue;
      swaggerParameter.example = argsApiInfo?.example;
      if (swaggerParameter.in === 'path') {
        swaggerParameter.required = true;

        // if path not include this args, must be ignore
        if (
          swaggerRouter.url.indexOf('{' + swaggerParameter.name + '}') === -1
        ) {
          continue;
        }
      }

      if (isClass(paramTypes[routeArgs.index])) {
        this.generateSwaggerDefinition(paramTypes[routeArgs.index]);
        swaggerParameter.schema = {
          $ref: '#/components/schemas/' + paramTypes[routeArgs.index].name,
        };
      } else {
        swaggerParameter.schema = {
          type: convertSchemaType(paramTypes[routeArgs.index].name),
          name: undefined,
        };
      }

      // add body
      if (swaggerParameter.in === 'body') {
        swaggerRouter.requestBody = {
          description: argsApiInfo?.description || argsNames[routeArgs.index],
          content: {
            'application/json': {
              schema: swaggerParameter.schema,
            },
          },
        };
        continue;
      }

      // add parameter
      swaggerRouter.parameters.push(swaggerParameter);
    }

    swaggerRouter.responses = {};
    for (const apiResponse of swaggerApi?.response || []) {
      // 获取方法返回值
      swaggerRouter.responses[apiResponse.status] = {
        description: apiResponse?.description,
        content: apiResponse?.content,
        headers: apiResponse?.headers,
      };
    }

    // 兜底加个 200
    if (Object.keys(swaggerRouter.responses).length === 0) {
      swaggerRouter.responses = { 200: { description: '' } };
    }
  }

  generateSwaggerDefinition(definitionClass) {
    const swaggerDefinition = new SwaggerDefinition();
    swaggerDefinition.name = definitionClass.name;
    swaggerDefinition.type = 'object';

    const target = new definitionClass();
    const rules = getClassMetadata(RULES_KEY, definitionClass);
    if (rules) {
      const properties = Object.keys(rules);
      for (const property of properties) {
        // set required
        if (rules[property]?._flags?.presence === 'required') {
          swaggerDefinition.required.push(property);
        }
        const type = getPropertyType(target, property);
        // get property description
        const propertyInfo: APIParamFormat = getPropertyMetadata(
          SWAGGER_DOCUMENT_KEY,
          definitionClass,
          property
        );
        swaggerDefinition.properties[property] = {
          type: convertSchemaType(type.name),
          description: propertyInfo?.description,
          example: propertyInfo?.example,
        };
      }
    }

    this.document.definitions.push(swaggerDefinition);
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
    case RouteParamTypes.BODY:
      return 'body';
    default:
      return 'header';
  }
}

/**
 * 解释路由上的参数
 * @param url
 */
function parseParamsInPath(url: string) {
  const names: string[] = [];
  url.split('/').forEach(item => {
    if (item.startsWith(':')) {
      const paramName = item.substr(1);
      names.push(paramName);
    }
  });
  return names;
}

/**
 * 替换成 openapi 的url
 * @param url
 * @param names
 */
function replaceUrl(url: string, names: string[]) {
  names.forEach(n => {
    url = url.replace(`:${n}`, `{${n}}`);
  });
  return url;
}

function convertSchemaType(value) {
  switch (value) {
    case 'Object':
      return 'object';
    case 'Boolean':
      return 'boolean';
    case 'Number':
      return 'number';
    case 'String':
      return 'string';
    default:
      return 'object';
  }
}
