const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');

const extend = require('extend2');

export const createAppWorkerLoader = (AppWorkerLoader) => {
  class EggAppWorkerLoader extends (AppWorkerLoader as any) {
    loadConfig() {
      super.loadConfig();
      this.afterLoadConfig();
    }

    afterLoadConfig() {
      // mix config
      extend(true, this.config, this.app.appOptions['allConfig']);
    }

    getEggPaths() {
      const customEggPaths = this.app.appOptions['eggPaths'];
      return super.getEggPaths().concat(customEggPaths);
    }
  }

  return EggAppWorkerLoader as any;
}

export const createEggApplication = (Application) => {
  class EggApplication extends (Application as any) {

    constructor(options) {
      super(options);
    }

    get appOptions() {
      return this.options;
    }

    get [EGG_LOADER]() {
      return null;
    }

    get [EGG_PATH]() {
      return __dirname;
    }
  }

  return EggApplication as any;
}
