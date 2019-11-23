import redis from 'redis';
import { promisify } from 'util';
import config from '../../../config';

class RedisClient {
  constructor() {
    this._client = redis.createClient(config.rediscloudUrl);
    this._client.set = promisify(this._client.set).bind(this._client);
    this._client.get = promisify(this._client.get).bind(this._client);
    this._client.keys = promisify(this._client.keys).bind(this._client);
    this._client.ttl = promisify(this._client.ttl).bind(this._client);
    this._client.expireat = promisify(this._client.expireat).bind(this._client);
  }

  set(key, value, timeUnit, time) {
    return this._client.set(key, value, timeUnit, time);
  }
  get(key) {
    return this._client.get(key);
  }
  keys(keys) {
    return this._client.keys(keys);
  }
  ttl(key) {
    return this._client.ttl(key);
  }
  setExpireat(key, ttl) {
    return this._client.expireat(key, ttl);
  }
}

export default RedisClient;
