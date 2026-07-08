import { createClient } from "redis";

let redisClient;
let isRedisConnected = false;

export const connectRedis = async () => {
  if (process.env.DISABLE_REDIS === "true") {
    console.log("Redis caching is disabled via configuration.");
    return;
  }

  redisClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 2) {
          // Stop retrying after 3 failed connections
          return false;
        }
        return 3000; // wait 3 seconds before next retry
      }
    }
  });

  redisClient.on("error", (err) => {
    console.warn("[Redis] Connection error. Caching bypassed (falling back to direct DB queries):", err.message);
    isRedisConnected = false;
  });

  redisClient.on("connect", () => {
    console.log("[Redis] Connected to server successfully.");
    isRedisConnected = true;
  });

  try {
    await redisClient.connect();
  } catch (err) {
    console.warn("[Redis] Connection failed. Caching bypassed (falling back to direct DB queries).");
    isRedisConnected = false;
  }
};

export const getCache = async (key) => {
  if (!isRedisConnected || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.warn(`[Redis] Failed to get cache for key: ${key}`, err.message);
    return null;
  }
};

export const setCache = async (key, val, expiration = 300) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    await redisClient.set(key, JSON.stringify(val), {
      EX: expiration
    });
  } catch (err) {
    console.warn(`[Redis] Failed to set cache for key: ${key}`, err.message);
  }
};

export const deleteCache = async (key) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    await redisClient.del(key);
  } catch (err) {
    console.warn(`[Redis] Failed to delete cache for key: ${key}`, err.message);
  }
};

export const clearJobsCache = async () => {
  if (!isRedisConnected || !redisClient) return;
  try {
    const keys = await redisClient.keys("jobs:all:*");
    if (keys && keys.length > 0) {
      await redisClient.del(keys);
      console.log(`[Redis] Stale cache cleared. Removed ${keys.length} job listing keys.`);
    }
  } catch (err) {
    console.warn("[Redis] Failed to clear jobs cache:", err.message);
  }
};
