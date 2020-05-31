const { AppWorkerLoader, Application } = require('egg');
const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');

const extend = require('extend2');

export class EggAppWorkerLoader extends (AppWorkerLoader as any) {

  loadConfig() {
    super.loadConfig();
    this.afterLoadConfig();
  }

  afterLoadConfig() {
    // mix config
    extend(true, this.config, this.app.appOptions['allConfig']);
  }

  getEggPaths() {
    const customEggPaths = this.app.appOptions['eggPaths']
    return super.getEggPaths().concat(customEggPaths);
  }
}

export class EggApplication extends (Application as any) {

  constructor(options) {
    super(options);
  }

  get [EGG_LOADER]() {
    return EggAppWorkerLoader;
  }

  get [EGG_PATH]() {
    return __dirname;
  }

  get appOptions() {
    return this.options;
  }

}
