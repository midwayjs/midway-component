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

    delegateProperty(this.app, eggApp);
    delegateProperty(this.app.context, eggApp.context);
    delegateProperty(this.app.request, eggApp.request);
    delegateProperty(this.app.response, eggApp.response);

    // add middleware from egg middleware
    if ((this.app as any)?.use && eggApp.middleware?.length) {
      await (this.app as any).useMiddleware(eggApp.middleware.filter(el => {
        return !['bodyParser', 'dispatch'].includes(el.name);
      }));
    }
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
}

function delegateProperty(originalProto, proto) {
  let properties: any[] = Object.getOwnPropertyNames(proto);
  properties = properties.concat(Object.getOwnPropertySymbols(proto));

  for (const property of properties) {
    if(!originalProto.hasOwnProperty(property)) {
      // Copy descriptor
      let descriptor = Object.getOwnPropertyDescriptor(proto, property);
      let originalDescriptor = Object.getOwnPropertyDescriptor(proto, property);
      if (!originalDescriptor) {
        // try to get descriptor from originalPrototypes
        if (originalProto) {
          originalDescriptor = Object.getOwnPropertyDescriptor(originalProto, property);
        }
      }
      if (originalDescriptor) {
        // don't override descriptor
        descriptor = Object.assign({}, descriptor);
        if (!descriptor.set && originalDescriptor.set) {
          descriptor.set = originalDescriptor.set;
        }
        if (!descriptor.get && originalDescriptor.get) {
          descriptor.get = originalDescriptor.get;
        }
      }
      Object.defineProperty(originalProto, property, descriptor);
    }
  }
}
