import { cloneDeep } from './util';
import { join } from 'path';
import * as extend from 'extend2';

export abstract class ParentConfiguration {
  app: any;
  eggApp;
  eggPaths;

  async onReady() {
    const eggApp = this.getEggApplication();
    await eggApp.ready();

    cloneDeep(
      this.app,
      eggApp,
      Object.keys(this.app).concat(this.getFilterPropertyList())
    );
    cloneDeep(
      Object.getPrototypeOf(this.app.context),
      eggApp.context,
      Object.keys(Object.getPrototypeOf(this.app.context))
    );
    cloneDeep(
      Object.getPrototypeOf(this.app.request),
      eggApp.request,
      Object.keys(Object.getPrototypeOf(this.app.request))
    );
    cloneDeep(
      Object.getPrototypeOf(this.app.response),
      eggApp.response,
      Object.keys(Object.getPrototypeOf(this.app.response))
    );

    await this.afterEggAppAssign(eggApp);
  }

  async onStop() {
    await this.eggApp.close();
  }

  abstract getEggApplication();

  async afterEggAppAssign(eggApp) {
    // add middleware from egg middleware
    if ((this.app as any)?.use && eggApp.middleware?.length) {
      await (this.app as any).useMiddleware(
        eggApp.middleware.filter(el => {
          return !['bodyParser', 'dispatch'].includes(el.name);
        })
      );
    }
  }

  getFilterPropertyList() {
    return ['req', 'request', 'res', 'response', 'context', 'callback'];
  }

  loadUserEggPlugin() {
    const baseDir = this.app.getBaseDir();
    const currentEnv = this.app.getEnv();
    const pluginConfigPaths = [];
    const userPluginConfig = {};

    pluginConfigPaths.push(join(baseDir, 'config/plugin.default'));
    pluginConfigPaths.push(join(baseDir, 'config/plugin'));
    pluginConfigPaths.push(join(baseDir, `config/plugin.${currentEnv}`));

    for (const pluginConfigPath of pluginConfigPaths) {
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
    if (typeof userPluginConfig[key] === 'boolean') {
      userPluginConfig[key] = {
        enable: userPluginConfig[key],
      };
    }
  }
  return userPluginConfig;
}
