import { App, Config, Configuration } from '@midwayjs/decorator';
import { IMidwayCoreApplication } from '@midwayjs/core';
import { FaaSHTTPContext, FaaSHTTPRequest, FaaSHTTPResponse, } from '@midwayjs/faas-typings';
import { EggApplication } from './application';
import { join } from 'path';
import * as extend from 'extend2';

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
    // 由 midway 加载应用层面的配置和 plugin 配置
    // 由 egg 去加载它本身的插件
    return new EggApplication({
      env: this.app.getEnv(),
      baseDir: this.app.getAppDir(),
      mode: 'single',
      plugins: this.loadUserEggPlugin(),
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

  loadUserEggPlugin() {
    const baseDir = this.app.getBaseDir();
    const currentEnv = this.app.getEnv();
    const pluginConfigPaths = [];
    let userPluginConfig = {};

    pluginConfigPaths.push(join(baseDir, 'config/plugin.default'));
    pluginConfigPaths.push(join(baseDir, 'config/plugin'));
    pluginConfigPaths.push(join(baseDir, `config/plugin.${currentEnv}`));

    for(const pluginConfigPath of pluginConfigPaths) {
      try {
        const pluginConfig = require(pluginConfigPath);
        extend(userPluginConfig, formatPlugin(pluginConfig));
      } catch (err) {
        // ignore
      }
    }
    return userPluginConfig;
  }
}

function formatPlugin(userPluginConfig) {
  if (userPluginConfig['default']) {
    userPluginConfig = userPluginConfig['default'];
  }
  for (const key in userPluginConfig) {
    if (typeof userPluginConfig[key ] === 'boolean') {
      userPluginConfig[key] = {
        enable: userPluginConfig[key]
      }
    }
  }
  return userPluginConfig;
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
