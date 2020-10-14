import { savePropertyMetadata } from '@midwayjs/decorator';

export const SWAGGER_DOCUMENT_KEY = 'common:swagger_doc_api';

export interface ApiFormat {
  summary: string;
  description: string;
  params: APIParamFormat[];
  response: APIResponseFormat[];
  example: string;
}

export interface APIParamFormat {
  summary: string;
  description: string;
}

export interface APIResponseFormat {
  status: string;
  resultType: string;
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

  param(summary: string, description?: string) {
    this._params.push({
      summary,
      description,
    });
    return this;
  }

  response(status: number, resultType: any) {
    this._response.push({
      status,
      resultType,
    });
    return this;
  }

  example(example: any) {
    this._example = example;
    return this;
  }

  buildJSON(): ApiFormat {
    return {
      summary: this._summary,
      description: this._description,
      params: this._params,
      response: this._response,
      example: this._example,
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
