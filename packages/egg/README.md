# midway component for egg


## Install

```bash
npm i @midwayjs-component/egg --save
```

## Usage

add egg plugin in `config.default.ts` or other env.

Tip: `eggPlugins` is equivalent to `plugins.js`

```js
// config.default.ts
{
  eggPlugins: {
    mysql: {
      enable: true,
      package: 'egg-mysql'
    }
  },
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
