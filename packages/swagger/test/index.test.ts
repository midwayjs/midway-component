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
      const result = await createHttpRequest(app).get('/swagger/ui');
      expect(result.text).toMatch('<title>Swagger UI</title>');
      expect(result.type).toEqual('text/html');
    });

    it('should get css', async () => {
      const result = await createHttpRequest(app).get('/swagger/ui/swagger-ui.css');
      expect(result.text).toMatch('.swagger-ui');
      expect(result.type).toEqual('text/css');
    });

    it('should get swagger json', async () => {
      const result = await createHttpRequest(app).get('/swagger/json');
      expect(result.text).toMatch('hello world');
      expect(result.type).toEqual('application/json');
    });
  });

});
