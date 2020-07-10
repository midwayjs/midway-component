const { AppWorkerLoader, Application } = require('egg');
import { createEggApplication, createAppWorkerLoader } from '@midwayjs/egg-base-module';

const EggAppWorkerLoader = createAppWorkerLoader(AppWorkerLoader);

const BaseEggApplication = createEggApplication(Application);

const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');

export class EggApplication extends BaseEggApplication {

  constructor(options) {
    super(options);
  }

  get [EGG_LOADER]() {
    return EggAppWorkerLoader;
  }

  get [EGG_PATH]() {
    return __dirname;
  }

}
