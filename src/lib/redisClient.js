import redis from "redis";
import { promisify } from "util";
import config from "../config";

const client = redis.createClient(config.rediscloudUrl);

const getTtl = promisify(client.ttl).bind(client);

const setExpireat = promisify(client.expireat).bind(client);

export { getTtl, setExpireat };
