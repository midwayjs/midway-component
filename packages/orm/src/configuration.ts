import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { Configuration, listModule, Config } from '@midwayjs/decorator';
import { createConnection, getConnection, getRepository } from 'typeorm';
import { ENTITY_MODEL_KEY, EVENT_SUBSCRIBER_KEY, CONNECTION_KEY } from '.';

@Configuration({
  importConfigs: [
    './config'
  ],
  namespace: 'orm'
})
export class OrmConfiguration implements ILifeCycle {
  @Config('orm')
  private ormConfig: any;

  private connectionNames: string[] = [];

  async onReady(container: IMidwayContainer) {
    (container as any).registerDataHandler('ORM_MODEL_KEY', (key: { modelKey, connectionName }) => {
      // return getConnection(key.connectionName).getRepository(key.modelKey);
      let repo = getRepository(key.modelKey, key.connectionName);
      return repo;
    });

    const entities = listModule(ENTITY_MODEL_KEY);
    const eventSubs = listModule(EVENT_SUBSCRIBER_KEY);

    const opts = this.formatConfig();

    for (const connectionOption of opts) {
      connectionOption.entities = entities || [];
      connectionOption.subscribers = eventSubs || [];
      this.connectionNames.push(connectionOption.name || 'default');
      await createConnection(connectionOption);
    }

    container.registerObject(CONNECTION_KEY, (instanceName) => {
      if (!instanceName) {
        instanceName = 'default';
      }
      return getConnection(instanceName);
    });
  }

  async onStop(container: IMidwayContainer) {
    await Promise.all(Object.values(this.connectionNames).map((connectionName) => {
      const conn = getConnection(connectionName);
      if(conn.isConnected) {
        return conn.close();
      }
      return Promise.resolve();
    }));

    this.connectionNames.length = 0;
  }

  formatConfig() {
    const originConfig = this.ormConfig;
    if(originConfig?.type) {
      originConfig.name = 'default';
      return [
        originConfig
      ]
    } else {
      const newArr = [];

      for(const [key, value] of Object.entries(originConfig)) {
        (value as any).name = key;
        newArr.push(value);
      }

      return newArr;
    }
  }
}
