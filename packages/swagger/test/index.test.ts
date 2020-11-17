import { close, createApp, createHttpRequest } from '@midwayjs/mock';
import { IMidwayKoaApplication } from '@midwayjs/koa';

describe('/test/feature.test.ts', () => {

  describe('test new features', () => {
    let app: IMidwayKoaApplication;
    beforeAll(async () => {
      app = await createApp('base-app', {}, '@midwayjs/koa');
    });

    afterAll(async () => {
      await close(app);
    });

    it('test get method with return value', async () => {
      const result = await createHttpRequest(app).get('/swagger-ui');
      expect(result.text).toMatch('<title>Swagger UI</title>');
      expect(result.type).toEqual('text/html');
    });

    it('should get css', async () => {
      const result = await createHttpRequest(app).get('/swagger-ui/swagger-ui.css');
      expect(result.text).toMatch('.swagger-ui');
      expect(result.type).toEqual('text/css');
    });

    it('should get swagger json', async () => {
      const result = await createHttpRequest(app).get('/swagger-ui/json');
      expect(result.type).toEqual('application/json');


      const swaggerData = result.text;
      const swaggerJSON = JSON.parse(swaggerData);
      // info check
      expect(swaggerData).toMatch('3.0.0');
      expect(swaggerData).toMatch('This is a swagger-ui for midwayjs project');

      // tag
      expect(swaggerJSON.tags.length).toEqual(2);
      expect(swaggerJSON.tags).toContainEqual({
        'name': 'default',
        'description': 'default'
      });
      expect(swaggerJSON.tags).toContainEqual({
        'name': 'user',
        'description': 'user'
      });

      // paths
      expect(swaggerJSON.paths).toHaveProperty('/');
      expect(swaggerJSON.paths).toHaveProperty('/list');
      expect(swaggerJSON.paths).toHaveProperty('/list/{id}');
      expect(swaggerJSON.paths).toHaveProperty('/login');
      expect(swaggerJSON.paths).toHaveProperty('/user/{userId}');
      expect(swaggerJSON.paths).toHaveProperty('/user/');

      // components
      expect(swaggerJSON.components.schemas['UserDTO']).toEqual({
        'type': 'object',
        'properties': {
          'name': {
            'type': 'string',
            'description': '姓名',
            'example': 'harry'
          },
          'age': {
            'type': 'number',
            'description': '年龄'
          },
          'school': {
            'type': 'object',
            'description': '学校信息'
          }
        },
        'required': [
          'name',
          'school'
        ]
      });
    });
  });

});
