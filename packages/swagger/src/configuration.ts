import { Configuration, CONTROLLER_KEY, listModule } from '@midwayjs/decorator';
import { join } from 'path';
import { SwaggerMetaGenerator } from './lib/generator';
import { SwaggerController } from './controller/swagger';

@Configuration({
  namespace: 'swagger',
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {
  async onReady() {
    const controllerModules = listModule(CONTROLLER_KEY);
    const generator = new SwaggerMetaGenerator();

    for (const module of controllerModules) {
      if (module !== SwaggerController) {
        generator.generateController(module);
      }
    }

    console.log(JSON.stringify(generator.generate()));
  }
}
