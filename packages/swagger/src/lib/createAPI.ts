import { savePropertyMetadata, attachClassMetadata, getPropertyType } from '@midwayjs/decorator';

export const SWAGGER_DOCUMENT_KEY = 'common:swagger_doc_api';

export interface ApiFormat {
  summary: string;
  description: string;
  params: APIParamFormat[];
  response: APIResponseFormat[];
}

export interface APIParamFormat {
  name: string;
  description: string;
  required: boolean;
  deprecated: boolean;
  allowEmptyValue: boolean;
  example: any;
}

export interface APIPropertyFormat {
  description: string;
  example: any;
}

export interface APIResponseFormat {
  status: string;
  description: string;
  headers: {
    [name: string]: {
      description?: string;
      type?: string;
    };
  };
  content: any;
  example: any;
}

export class SwaggerAPI {
  private _summary: string;
  private _description: string;
  private _params = [];
  private _response = [];

  summary(summary: string): SwaggerAPI {
    this._summary = summary;
    return this;
  }

  description(desc: string): SwaggerAPI {
    this._description = desc;
    return this;
  }

  param(description: Partial<APIParamFormat>): SwaggerAPI;
  param(description: string, options?: Partial<APIParamFormat>): SwaggerAPI;
  param(description: any, options?: Partial<APIParamFormat>): SwaggerAPI {
    if (typeof description === 'string') {
      this._params.push({
        description,
        ...options,
      });
    } else {
      if (!options) {
        options = {};
      }
      options.example = convertExample(description?.example);
      this._params.push(options);
    }

    return this;
  }

  respond(
    status: number,
    description?: string,
    respondType?: string,
    options?: Partial<APIResponseFormat>
  ): SwaggerAPI {
    const respondContentType = convertRespondType(respondType, options);
    if (respondContentType) {
      this._response.push(
        convertRespondOptions({
          status,
          description: description || '',
          content: respondContentType,
          ...options,
        })
      );
    } else {
      this._response.push(
        convertRespondOptions({
          status,
          description: description || '',
          ...options,
        })
      );
    }

    return this;
  }

  buildJSON(): ApiFormat {
    return {
      summary: this._summary,
      description: this._description,
      params: this._params,
      response: this._response,
    };
  }

  build() {
    return (target: any, property: string) => {
      savePropertyMetadata(
        SWAGGER_DOCUMENT_KEY,
        this.buildJSON(),
        target,
        property
      );
    };
  }
}

export function CreateApiDoc(): SwaggerAPI;
export function CreateApiDoc(data: any): MethodDecorator;
export function CreateApiDoc(data?: any): MethodDecorator | SwaggerAPI {
  if (data) {
    return (target: any, property: string) => {};
  } else {
    return new SwaggerAPI();
  }
}

export function CreateApiPropertyDoc(
  description: Partial<APIPropertyFormat>
): PropertyDecorator;
export function CreateApiPropertyDoc(
  description: string,
  options?: Partial<APIPropertyFormat>
): PropertyDecorator;
export function CreateApiPropertyDoc(
  description: any,
  options?: Partial<APIPropertyFormat>
): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    const metadata = getPropertyType(target, propertyKey);
    attachClassMetadata(
      SWAGGER_DOCUMENT_KEY,
      {
        description,
        type: metadata.name,
        isBaseType: metadata.isBaseType,
        originDesign: metadata.originDesign,
        ...options,
      },
      target,
      propertyKey
    );
  };
}

function convertExample(example) {
  if (example === null || example === undefined) {
    return undefined;
  }

  if (typeof example === 'object') {
    return JSON.stringify(example);
  }

  return example.toString();
}

function convertRespondType(
  respondType: string,
  options?: Partial<APIResponseFormat>
) {
  switch (respondType) {
    case 'text':
      return {
        'text/plain': {
          schema: {
            type: 'string',
            example: convertExample(options?.example),
          },
        },
      };
    case 'object':
      return {
        'application/json': {
          schema: {
            type: 'object',
            example: convertExample(options?.example),
          },
        },
      };
    case 'json':
      return {
        'application/json': {
          schema: {
            type: 'object',
            example: convertExample(options?.example),
          },
        },
      };
    case 'boolean':
      return {
        'text/plain': {
          schema: {
            type: 'string',
            example: convertExample(options?.example),
          },
        },
      };
    case 'number':
      return {
        'text/plain': {
          schema: {
            type: 'string',
            example: convertExample(options?.example),
          },
        },
      };
    case 'html':
      return {
        'text/html': {
          schema: {
            type: 'string',
            example: convertExample(options?.example),
          },
        },
      };
    case 'css':
      return {
        'text/css': {
          schema: {
            type: 'string',
            example: convertExample(options?.example),
          },
        },
      };
    case 'js':
      return {
        'application/javascript': {
          schema: {
            type: 'string',
            example: convertExample(options?.example),
          },
        },
      };
    case 'svg':
      return {
        'image/svg+xml': {
          schema: {
            type: 'string',
            example: convertExample(options?.example),
          },
        },
      };
    case 'gif':
      return {
        'image/gif': {
          schema: {
            type: 'string',
            example: convertExample(options?.example),
          },
        },
      };
    case 'jpg':
      return {
        'image/jpeg': {
          schema: {
            type: 'string',
            example: convertExample(options?.example),
          },
        },
      };
    case 'png':
      return {
        'mage/png': {
          schema: {
            type: 'string',
            example: convertExample(options?.example),
          },
        },
      };
    default:
      return undefined;
  }
}

function convertRespondOptions(respond) {
  if (respond.headers) {
    for (const headerName in respond.headers) {
      const originRespondHeader = respond.headers[headerName];
      respond.headers[headerName] = {
        description: originRespondHeader.description,
        schema: {
          type: originRespondHeader.type,
        },
      };
    }
  }

  return respond;
}
