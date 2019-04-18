import redis from "redis";
import { promisify } from "util";
import config from "../config";

const client = redis.createClient(config.rediscloudUrl);

const set = promisify(client.set).bind(client);

const get = promisify(client.get).bind(client);

const keys = promisify(client.keys).bind(client);

const getTtl = promisify(client.ttl).bind(client);

const setExpireat = promisify(client.expireat).bind(client);

export { set, get, getTtl, setExpireat, keys };
