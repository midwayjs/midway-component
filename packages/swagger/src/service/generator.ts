import { Provide, Scope, ScopeEnum, CONTROLLER_KEY, listModule } from '@midwayjs/decorator';
import { SwaggerMetaGenerator } from '../lib/generator';
import { SwaggerController } from '../controller/swagger';

@Provide('swaggerGenerator')
@Scope(ScopeEnum.Singleton)
export class SwaggerGenerator {
  generate() {
    const controllerModules = listModule(CONTROLLER_KEY);
    const generator = new SwaggerMetaGenerator();

    for (const module of controllerModules) {
      if (module !== SwaggerController) {
        generator.generateController(module);
      }
    }
    return generator.generate();
  }
}
