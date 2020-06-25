# midway component for egg


## Install

```bash
npm i @midwayjs-component/egg --save
```

## Usage

add egg plugin in `plugin.ts` or other env.

```js
// plugin.ts
export default {
  mysql: {
    enable: true,
    package: 'egg-mysql'
  }
},
```

```js
// config.default.ts
{
  mysql: {
    //... other config for mysql plugin
  }
}
```

In Code, you can use plugin like midway.

```ts

export class IndexHandler implements FunctionHandler {
  @Inject()
  ctx: FaaSContext;

  @Plugin()
  mysql;

  @Func('index.handler')
  async handler() {
    // this.mysql.xxxx
    // or this.ctx.xxxx
  }
}

```


## Some differences

- No agent worker and IPC Messager
- Does not support stream related plugins
- Will not load the current directory as a plugin