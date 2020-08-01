import { providerWrapper, IMidwayContainer } from '@midwayjs/core';
import { Connection } from 'typeorm';
import { CONNECTION_KEY } from '.';

export function getRepository(context: IMidwayContainer, args?: any) {
  return (clzz) => {
    const connection = context.get<Connection>(CONNECTION_KEY);
    return connection.getRepository(clzz);
  };
};

export function getTreeRepository(context: IMidwayContainer, args?: any) {
  return (clzz) => {
    const connection = context.get<Connection>(CONNECTION_KEY);
    return connection.getTreeRepository(clzz);
  };
}

export function getMongoRepository(context: IMidwayContainer, args?: any) {
  return (clzz) => {
    const connection = context.get<Connection>(CONNECTION_KEY);
    return connection.getMongoRepository(clzz);
  };
}

export function getCustomRepository(context: IMidwayContainer, args?: any) {
  return (clzz) => {
    const connection = context.get<Connection>(CONNECTION_KEY);
    return connection.getCustomRepository(clzz);
  };
}

providerWrapper([
  {
    id: 'getRepository',
    provider: getRepository
  },
  {
    id: 'getTreeRepository',
    provider: getTreeRepository
  },
  {
    id: 'getMongoRepository',
    provider: getMongoRepository
  },
  {
    id: 'getCustomRepository',
    provider: getCustomRepository
  },
])