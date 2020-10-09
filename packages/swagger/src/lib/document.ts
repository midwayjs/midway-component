function arrayToJSON(arr) {
  if (!arr) return;
  return arr.map(el => el.toJSON());
}

function arrayToObject(arr, objectKey: string) {
  if (!arr) return;
  const o = {};
  arr.forEach(el => {
    o[el[objectKey]] = el.toJSON();
  });
  return o;
}

export class SwaggerDocument {
  info: SwaggerDocumentInfo;
  host: string;
  basePath: string;
  tags: SwaggerDocumentTag[];
  schemes: string[];
  paths: SwaggerDocumentRouter[];

  addRouter(router: SwaggerDocumentRouter) {
    if (!this.paths) {
      this.paths = [];
    }
    this.paths.push(router);
  }

  toJSON() {
    return {
      openapi: '3.0.0',
      info: this.info?.toJSON(),
      host: this.host,
      basePath: this.basePath,
      tags: arrayToJSON(this.tags),
      schemas: this.schemes,
      paths: arrayToObject(this.paths, 'url'),
    };
  }
}

export class SwaggerDocumentInfo {
  description: string;
  version: string;
  title: string;

  toJSON() {
    return {
      description: this.description,
      version: this.version,
      title: this.title,
    };
  }
}

export class SwaggerDocumentTag {
  name: string;
  description: string;

  toJSON() {
    return {
      name: this.name,
      description: this.description,
    };
  }
}

export class SwaggerDocumentRouter {
  method: 'get' | 'post' | 'put' | 'delete' | 'options' | 'head' | 'patch';
  url: string;
  tags: string[];
  summary: string;
  description: string;
  operationId: string;
  consumes: string[];
  produces: string[];
  parameters: SwaggerDocumentParameter[];
  responses: {};
  security: [];

  constructor(method, url) {
    this.method = method;
    this.url = url;
  }

  toJSON() {
    const router = {};
    router[this.method] = {
      tags: this.tags,
      summary: this.summary,
      description: this.description,
      operationId: this.operationId,
      consumes: this.consumes,
      produces: this.produces,
      parameters: arrayToJSON(this.parameters),
    };
    return router;
  }
}

export class SwaggerDocumentParameter {
  in: string;
  name: string;
  description: string;
  required: boolean;

  toJSON() {
    return {
      in: this.in,
      name: this.name,
      description: this.description,
      required: this.required,
    };
  }
}
