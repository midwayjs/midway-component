import {
  CONTROLLER_KEY,
  ControllerOption,
  getClassMetadata,
  getMethodParamTypes,
  getPropertyDataFromClass,
  getPropertyMetadata,
  isClass,
  RouteParamTypes,
  RouterOption,
  RouterParamValue,
  RULES_KEY,
  WEB_ROUTER_KEY,
  WEB_ROUTER_PARAM_KEY,
  getClassExtendedMetadata,
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
import { SwaggerGeneratorInfoOptions } from '../interface';

export class SwaggerMetaGenerator {
  document: SwaggerDocument;

  constructor(options?: SwaggerGeneratorInfoOptions) {
    this.document = new SwaggerDocument();
    const info = new SwaggerDocumentInfo();
    info.title = options?.title || 'Midway2 Swagger API';
    info.version = options.version || '1.0.0';

    info.description = options?.description;
    info.termsOfService = options?.termsOfService;
    info.contact = options?.contact;
    info.license = options?.license?.name ? options?.license : undefined;
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
      tag.name =
        controllerOption?.routerOptions.tagName ||
        (/^\//.test(prefix) ? prefix.split('/')[1] : prefix);
      tag.description = controllerOption?.routerOptions.description || tag.name;
    } else {
      tag.name = controllerOption?.routerOptions.tagName || 'default';
      tag.description = controllerOption?.routerOptions.description || tag.name;
    }
    this.document.tags.push(tag);
    // const globalMiddleware = controllerOption.routerOptions.middleware;
    // get router info
    const webRouterInfo: RouterOption[] = getClassMetadata(
      WEB_ROUTER_KEY,
      module
    );

    if (webRouterInfo && typeof webRouterInfo[Symbol.iterator] === 'function') {
      for (const webRouter of webRouterInfo) {
        let url = (prefix + webRouter.path).replace('//', '/');
        url = replaceUrl(url, parseParamsInPath(url));
        const router = new SwaggerDocumentRouter(webRouter.requestMethod, url);
        router.tags = [tag.name];
        this.generateRouter(webRouter, router, module);
        this.document.addRouter(router);
      }
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

    swaggerRouter.summary =
      swaggerApi?.summary || webRouterInfo.summary || webRouterInfo.routerName;
    swaggerRouter.description =
      swaggerApi?.description ||
      webRouterInfo.description ||
      webRouterInfo.routerName;
    // swaggerRouter.operationId = webRouterInfo.method;
    swaggerRouter.parameters = [];
    const routeArgsInfo: RouterParamValue[] =
      getPropertyDataFromClass(
        WEB_ROUTER_PARAM_KEY,
        module,
        webRouterInfo.method
      ) || [];

    // 获取方法参数类型
    const paramTypes = getMethodParamTypes(ins, webRouterInfo.method);
    for (const routeArgs of routeArgsInfo) {
      const swaggerParameter = new SwaggerDocumentParameter();
      const argsApiInfo = swaggerApi?.params[routeArgs.index];
      swaggerParameter.description = argsApiInfo?.description;
      swaggerParameter.name = argsApiInfo?.name || routeArgs?.propertyData;
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
          description: argsApiInfo?.description || routeArgs?.propertyData,
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
        headers: apiResponse?.headers,
        content: apiResponse?.content,
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

    const properties = getClassMetadata(SWAGGER_DOCUMENT_KEY, definitionClass);
    for (const propertyName in properties) {
      swaggerDefinition.properties[propertyName] = {
        type: properties[propertyName].type.toLowerCase(),
        description: properties[propertyName].description,
        example: properties[propertyName].example,
      };
    }

    // for rule decorator
    const rules = getClassExtendedMetadata(RULES_KEY, definitionClass);
    if (rules) {
      const properties = Object.keys(rules);
      for (const property of properties) {
        // set required
        if (rules[property]?._flags?.presence === 'required') {
          swaggerDefinition.required.push(property);
        }
        // 没找到这行代码对应的装饰器
        // get property description
        let propertyInfo: APIParamFormat = getPropertyMetadata(
          SWAGGER_DOCUMENT_KEY,
          definitionClass,
          property
        );
        if (!propertyInfo) {
          propertyInfo = this.generateSwaggerByJoiProperty(
            rules[property],
            joinCamel(definitionClass.name, property)
          );
        }
        if (swaggerDefinition.properties[property] && !propertyInfo?.$ref) {
          mixWhenPropertyEmpty(
            swaggerDefinition.properties[property],
            propertyInfo
          );
        } else {
          swaggerDefinition.properties[property] = propertyInfo;
        }
      }
    }
    this.document.definitions.push(swaggerDefinition);

    // DTO
    for (const key in properties) {
      // 必须加了属性装饰器
      if (
        !rules?.[key] &&
        properties[key].originDesign &&
        !properties[key].isBaseType
      ) {
        this.generateSwaggerDefinition(properties[key].originDesign);
        // 把复杂类型属性指向新的定义
        swaggerDefinition.properties[key] = {};
        swaggerDefinition.properties[key]['$ref'] =
          '#/components/schemas/' + properties[key].type;
      }
    }
  }

  generateSwaggerByJoiProperty(joiSchema, pathName?: string) {
    const describe = joiSchema.describe();
    if (describe.flags?.presence === 'forbidden') {
      return undefined;
    }
    let define: any = {
      type: describe.type,
      default: describe.flags?.default,
      description: describe.flags?.description,
      example: describe.examples?.join(' '),
    };

    let min;
    let max;
    for (const r of describe.rules || []) {
      if (r.name === 'min' && r.args) {
        min = r.args.limit;
      } else if (r.name === 'max') {
        max = r.args.limit;
      }
    }
    if (describe.flags?.only) {
      define.enum = describe.allow;
    }
    if (describe.invalid) {
      define.not = { enum: describe.invalid };
    }

    switch (describe.type) {
      case 'string':
        define.minLength = min;
        define.maxLength = max;
        break;
      case 'number':
        define.minimum = min;
        define.maximum = max;
        if (describe.rules?.some(r => r.name === 'integer')) {
          define.type = 'integer';
        }
        break;
      case 'date':
        define.type = 'string';
        define.format = 'date-time';
        break;
      case 'object': {
        const swaggerDefinition = new SwaggerDefinition();
        const schemaMeta = describe.metas?.find(m => Boolean(m.id));
        swaggerDefinition.name = schemaMeta?.id || pathName;
        swaggerDefinition.type = 'object';
        swaggerDefinition.required = [];
        for (const prop of joiSchema.$_terms?.keys) {
          if (prop.schema._flags?.presence === 'required') {
            swaggerDefinition.required.push(prop.key);
          }
          swaggerDefinition.properties[prop.key] =
            this.generateSwaggerByJoiProperty(
              prop.schema,
              joinCamel(pathName, prop.key)
            );
        }
        this.document.definitions.push(swaggerDefinition);
        define = { $ref: '#/components/schemas/' + swaggerDefinition.name };
        break;
      }
      case 'array':
        define.minItems = min;
        define.maxItems = max;
        define.items = this.generateSwaggerByJoiProperty(
          joiSchema.$_terms.items[0],
          pathName
        );
    }
    return define;
  }
}

function joinCamel(word1, word2) {
  return `${word1}${word2[0].toUpperCase()}${word2.slice(1)}`;
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

function mixWhenPropertyEmpty(target, source) {
  for (const key in source) {
    if (!target[key] && source[key]) {
      target[key] = source[key];
    }
  }
}
