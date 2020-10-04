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
      const result = await createHttpRequest(app).get('/').query({ name: 'harry', age: 18 });
      expect(result.status).toBe(201);
      expect(result.text).toBe('hello world,harry18');
    });

    it('test get method with redirect', async () => {
      const result = await createHttpRequest(app).get('/login');
      expect(result.status).toBe(302);
    });
  });

});
