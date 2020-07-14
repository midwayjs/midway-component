export function completeAssign(target, source, blackList) {
  const descriptors = Object.getOwnPropertyNames(source).reduce((descriptors, key) => {
    if (!blackList.includes(key)) {
      // Todo: unnessary check writable
      const targetDescriptor = Object.getOwnPropertyDescriptor(target, key);
      if (targetDescriptor && !targetDescriptor.writable) {
        return descriptors;
      }
      descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
    }
    return descriptors;
  }, {});

  // Object.assign 默认也会拷贝可枚举的Symbols
  Object.getOwnPropertySymbols(source).forEach(sym => {
    if (!Object.getOwnPropertyDescriptor(target, sym)) {
      const descriptor = Object.getOwnPropertyDescriptor(source, sym)
      descriptors[sym] = descriptor;
    }
  });
  Object.defineProperties(target, descriptors);
  return target;
}

export function cloneDeep(target, source, blackList = []) {
  const obj = source;

  if (Object.getPrototypeOf(obj) && Object.getPrototypeOf(obj) != Object) {
    cloneDeep(target, Object.getPrototypeOf(obj), blackList);
    completeAssign(target, obj, blackList);
  } else {
    // completeAssign(target, obj, blackList);
  }
  // do {
  //   completeAssign(target, obj, blackList);
  // } while (obj = Object.getPrototypeOf(obj));
}

// 获取所有属性方法封装
export function getAllPropertyNames(obj) {
  const props = [];

  do {
    Object.getOwnPropertyNames(obj).forEach(function (prop) {
      if (props.indexOf(prop) === -1) {
        props.push(prop);
      }
    });
    // tslint:disable-next-line:no-conditional-assignment
  } while (obj = Object.getPrototypeOf(obj));

  return props;
}
