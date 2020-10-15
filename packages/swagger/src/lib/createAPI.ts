import { savePropertyMetadata } from '@midwayjs/decorator';

export const SWAGGER_DOCUMENT_KEY = 'common:swagger_doc_api';

export interface ApiFormat {
  summary: string;
  description: string;
  params: APIParamFormat[];
  response: APIResponseFormat[];
}

export interface APIParamFormat {
  description: string;
  required: boolean;
  deprecated: boolean;
  allowEmptyValue: boolean;
  example: any;
}

export interface APIResponseFormat {
  status: string;
  description: string;
  headers: any;
  content: any;
  example: any;
}

export class SwaggerAPI {
  _summary: string;
  _description: string;
  _params = [];
  _response = [];
  _example: string;

  summary(summary: string) {
    this._summary = summary;
    return this;
  }

  description(desc: string) {
    this._description = desc;
    return this;
  }

  param(description: Partial<APIParamFormat>);
  param(description: string, options: Partial<APIParamFormat>);
  param(description: any, options?: Partial<APIParamFormat>) {
    if (typeof description === 'string') {
      this._params.push({
        description,
        ...options,
      });
    } else {
      options.example = convertExample(description.example);
      this._params.push(options);
    }

    return this;
  }

  respond(
    status: number,
    description: string,
    respondType?: string,
    options?: Partial<APIResponseFormat>
  ) {
    const respondContentType = convertRespondType(respondType, options);
    if (respondContentType) {
      this._response.push({
        status,
        description,
        content: respondContentType,
        ...options,
      });
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

export function CreateAPI(): SwaggerAPI;
export function CreateAPI(data: any): MethodDecorator;
export function CreateAPI(data?: any): MethodDecorator | SwaggerAPI {
  if (data) {
    return (target: any, property: string) => {};
  } else {
    return new SwaggerAPI();
  }
}

function convertExample(example) {
  if (example === null || example === undefined) {
    return undefined;
  }

  if (typeof example === 'object') {
    return JSON.stringify(example, null, 2);
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
