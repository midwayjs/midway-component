import { App, Config, Configuration } from '@midwayjs/decorator';
import { IMidwayCoreApplication } from '@midwayjs/core';
import { FaaSHTTPContext, FaaSHTTPRequest, FaaSHTTPResponse } from '@midwayjs/faas-typings';
import { EggApplication } from './application';
import { ParentConfiguration } from '@midwayjs/egg-base-module';

@Configuration({
  importConfigs: [
    './config'
  ]
})
export class ContainerConfiguration extends ParentConfiguration {

  @App()
  app: IMidwayCoreApplication & {
    request: FaaSHTTPRequest;
    response: FaaSHTTPResponse;
    context: FaaSHTTPContext;
  };

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

}