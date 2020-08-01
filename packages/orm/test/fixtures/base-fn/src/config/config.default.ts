import {join} from 'path';

export default (appInfo) => {
  return {
    orm: {
      type: 'sqlite',
      database: join(__dirname, '../../test.sqlite'),
      logging: true,
    }
  }
}
