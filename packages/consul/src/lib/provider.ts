import {IConsulProviderInfoOptions, IConsulRegisterInfoOptions} from "../interface";
import * as Consul from 'consul';

export class ConsulProvider {
  private readonly consul: Consul.Consul;

  constructor(providerOptions: IConsulProviderInfoOptions) {
    // should be, ignore config
    providerOptions.promisify = true;
    this.consul = Consul(providerOptions);
  }

  getConsul(): Consul.Consul {
    return this.consul;
  }

  async registerService(registerOptions: IConsulRegisterInfoOptions) {
    await this.consul.agent.service.register(registerOptions);
  }

  async deregisterService(deregisterOptions) {
    await this.consul.agent.service.deregister(deregisterOptions);
  }

}
