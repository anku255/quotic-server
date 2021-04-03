import Redis from 'ioredis';

let client = null;

export const redisConnection = () => {
  if (client) return client;

  client = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    family: 4,
    password: process.env.REDIS_PASSWORD,
    db: 0,
  } as any);

  client.on('connect', () => console.log('Redis client connected'));

  client.on('error', err => console.error(`Something went wrong with redis: ${err}`));

  return client;
};

export const redisGet = async (key: string, redisClient: any) => {
  const data = await redisClient.get(key);
  if (!data) return null;
  return JSON.parse(data);
};

export const redisSet = async (key: string, value: any, redisClient: any) => {
  return redisClient.set(key, JSON.stringify(value));
};
