export const redisHelpers = {
  get: async ({ redisClient, key }) => {
    const cache = await redisClient.get(key);
    return cache ? JSON.parse(cache) : cache;
  },
  set: async ({ redisClient, key, value }) => {
    return redisClient.set(key, JSON.stringify(value));
  },
  setex: async ({ redisClient, key, value, expiry }) => {
    return redisClient.setex(key, expiry, JSON.stringify(value));
  },
};

export async function fetchFromCacheOrDB({ key, expiry, redisClient, fetchFromDB }) {
  const cache = await redisHelpers.get({ redisClient, key });
  if (cache) return cache;
  const data = await fetchFromDB();
  await redisHelpers.setex({ redisClient, key, value: data, expiry });
  return data;
}
