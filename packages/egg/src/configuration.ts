import { Configuration, App, Config } from '@midwayjs/decorator';
import { IMidwayCoreApplication } from '@midwayjs/core';
import {
  FaaSHTTPResponse,
  FaaSHTTPRequest,
  FaaSHTTPContext,
} from '@midwayjs/faas-typings';
import { EggApplication } from './application';

@Configuration({
  importConfigs: [
    './config'
  ]
})
export class ContainerConfiguration {

  @App()
  app: IMidwayCoreApplication & {
    request: FaaSHTTPRequest;
    response: FaaSHTTPResponse;
    context: FaaSHTTPContext;
  };

  @Config('eggPlugins')
  eggPlugins;

  @Config('eggPaths')
  eggPaths;

  async onReady() {
    const eggApp = this.getEggApplication();
    await eggApp.ready();

    cloneDeep(this.app, eggApp, this.getFilterPropertyList());
    cloneDeep(this.app.context, eggApp.context);
    cloneDeep(this.app.request, eggApp.request);
    cloneDeep(this.app.response, eggApp.response);

    await this.afterEggAppAssign(eggApp);
  }

  getEggApplication() {
    return new EggApplication({
      env: this.app.getEnv(),
      baseDir: this.app.getAppDir(),
      mode: 'single',
      plugins: this.eggPlugins,
      allConfig: this.app.getConfig(),
      eggPaths: this.eggPaths,
    });
  }

  async afterEggAppAssign(eggApp) {
    // add middleware from egg middleware
    if ((this.app as any)?.use && eggApp.middleware?.length) {
      await (this.app as any).useMiddleware(eggApp.middleware.filter(el => {
        return !['bodyParser', 'dispatch'].includes(el.name);
      }));
    }
  }

  getFilterPropertyList() {
    return ['req', 'request', 'res', 'response', 'context', 'callback'];
  }
}

function completeAssign(target, source, filterProperty) {
  let descriptors = Object.getOwnPropertyNames(source).reduce((descriptors, key) => {
    if(!target.hasOwnProperty(key) && filterProperty.indexOf(key) === -1) {
      descriptors[key] = Object.getOwnPropertyDescriptor(source, key)
    }
    return descriptors
  }, {})

  // Object.assign 默认也会拷贝可枚举的Symbols
  Object.getOwnPropertySymbols(source).forEach(sym => {
    let descriptor = Object.getOwnPropertyDescriptor(source, sym)
    descriptors[sym] = descriptor
  })
  Object.defineProperties(target, descriptors)
  return target;
}

function cloneDeep(target, source, filterProperty = []) {
  let obj = source;
  do {
    completeAssign(target, obj, filterProperty)
  } while (obj = Object.getPrototypeOf(obj));
}
