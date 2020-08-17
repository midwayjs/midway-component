/**
 * 只实现单数据库实例场景
 */
export default {
  orm: {
    type: 'mysql',
    host: '',
    port: 3306,
    username: '',
    password: '',
    database: undefined,
    synchronize: true,
    logging: false,
 }
};