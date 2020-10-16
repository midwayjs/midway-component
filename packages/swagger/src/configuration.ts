import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';

@Configuration({
  namespace: 'swagger',
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {
  async onReady(container) {
    const swaggerGenerator = await container.getAsync('swagger:swaggerGenerator');
    console.log(JSON.stringify(swaggerGenerator.generate()));
  }
}
