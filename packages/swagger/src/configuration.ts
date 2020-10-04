import { Configuration, CONTROLLER_KEY, listModule } from '@midwayjs/decorator';


@Configuration({
  namespace: 'swagger'
})
export class AutoConfiguration {

  async onReady() {

    const controllerModules = listModule(CONTROLLER_KEY);

    for (const module of controllerModules) {
      // generate swagger json from metadata
      console.log('iii', module);
      
    }
  }
}