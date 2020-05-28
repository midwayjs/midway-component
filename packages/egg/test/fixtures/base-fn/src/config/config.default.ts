import { join } from 'path';

export default (appInfo) => {
  return {
    eggPlugins: {
      mysql: {
        enable: true,
        path: join(appInfo.baseDir, '../../../../../node_modules/egg-mysql')
      }
    },
    middleware: ['bbb']
  }
}