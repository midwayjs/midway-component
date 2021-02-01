# midway orm component

## How to use

In `Configuration.ts` file:

```ts
@Configuration({
  imports: [
    '@midwayjs/orm',
  ],
  importConfigs: [
    './config'
  ]
})
export class ContainerConfiguration {}
```

## Configuration

In config files

```ts
import { ConnectionOptions } from 'typeorm';

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
 } as ConnectionOptions; // use ConnectionOptions type as restriction
};
```

or

```ts
export const orm = {
  type: 'sqlite',
  database: join(__dirname, './test.sqlite'),
  logging: true,
}
```

See [TypeORM Connection Options](https://typeorm.io/#/connection-options) for more informations.

## Define EntityModel

```ts
// model/user.ts
import { EntityModel } from '@midwayjs/orm';
import { PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@EntityModel('test_user') // create a table named "test_user"
export class User {
  @PrimaryGeneratedColumn({ name: "id" })
  id: number;

  @Column({ name: "name" })
  name: string;

  @OneToMany(type => Message, message => message.sender)
  messages: Message[];
}
```

See [TypeORM Entity](https://typeorm.io/#/entities) for more informations.

## Inject Repo / EntityManager

In code files

```ts
import { InjectEntityModel, InjectEntityManager } from '@midwayjs/orm';
import { User } from './model/user';
import { Repository, EntityManager } from 'typeorm';

@Provide()
export class IndexHandler {

  @InjectEntityModel(User)
  userModel: Repository<User>;

  @InjectEntityManager()
  entityManager: EntityManager;

  @Func('index.handler')
  async handler() {
    const u = new User();
    u.name = 'oneuser1';
    const uu = await this.userModel.save(u);
    console.log('user one id = ', uu.id);

    const user = new User();
    user.id = 1;
    const users = await this.userModel.findAndCount(user);
    return 'hello world' + JSON.stringify(users);
  }
}
```

## Example

We provide a sample based on SQLite3 [here](https://github.com/midwayjs/midway-examples/tree/master/v2/demo-typeorm).
