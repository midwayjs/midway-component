import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { Configuration, listModule, Config } from '@midwayjs/decorator';
import { createConnection, Connection } from 'typeorm';
import { ENTITY_MODEL_KEY, EVENT_SUBSCRIBER_KEY, CONNECTION_KEY } from '.';

@Configuration({
  importConfigs: [
    './config'
  ],
  namespace: 'orm'
})
export class OrmConfiguration implements ILifeCycle {
  @Config('orm')
  orm: any;

  async onReady(container: IMidwayContainer) {
    const entities = listModule(ENTITY_MODEL_KEY);
    const eventSubs = listModule(EVENT_SUBSCRIBER_KEY);

    const opts = this.orm;
    opts.entities = entities || [];
    opts.subscribers = eventSubs || [];
    const connection = await createConnection(opts);
    container.registerObject(CONNECTION_KEY, connection);
  }

  async onStop(container: IMidwayContainer) {
    const connection = await container.getAsync<Connection>(CONNECTION_KEY);
    await connection.close();
  }
}
