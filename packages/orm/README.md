### midway orm component

* How to use ?
  * in Configuration.ts file
  ```
  @Configuration({
    imports: [
      join(__dirname, '../../../../src')
    ],
    importConfigs: [
      './config'
    ]
  })
  export class ContainerConfiguration {
  }

  ```
  * in config files
  ```
    orm: {
      type: 'sqlite',  // or use mysql see typeorm docs
      database: join(__dirname, '../../test.sqlite'),
      logging: true,
    }
  ```

  * in code files
  ```
  @Inject('orm:getRepository')
  getRepo: getRepository;

  @Func('index.handler')
  async handler() {
    const repo: Repository<User> = this.getRepo(User);
    const u = new User();
    u.name = 'oneuser1';
    const uu = await repo.save(u);
    console.log('user one id = ', uu.id);
    const user = new User();
    user.id = 1;
    const users = await repo.findAndCount(user);
    return 'hello world' + JSON.stringify(users);
  }
  ```