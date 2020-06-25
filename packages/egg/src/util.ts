export function completeAssign(target, source, blackList) {
  let descriptors = Object.getOwnPropertyNames(source).reduce((descriptors, key) => {
    if (!blackList.includes(key)) {
      descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
    }
    return descriptors;
  }, {});

  // Object.assign 默认也会拷贝可枚举的Symbols
  Object.getOwnPropertySymbols(source).forEach(sym => {
    if(!Object.getOwnPropertyDescriptor(target, sym)) {
      let descriptor = Object.getOwnPropertyDescriptor(source, sym)
      descriptors[sym] = descriptor;
    }
  });
  Object.defineProperties(target, descriptors);
  return target;
}

export function cloneDeep(target, source, blackList = []) {
  let obj = source;

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
export function getAllPropertyNames( obj ) {
  const props = [];

  do {
    Object.getOwnPropertyNames( obj ).forEach(function ( prop ) {
      if ( props.indexOf( prop ) === -1 ) {
        props.push( prop );
      }
    });
  } while ( obj = Object.getPrototypeOf( obj ) );

  return props;
}
