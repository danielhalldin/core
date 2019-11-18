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

  set(data) {
    return this._client.set(data);
  }
  get(data) {
    return this._client.get(data);
  }
  keys(data) {
    return this._client.keys(data);
  }
  ttl(data) {
    return this._client.ttl(data);
  }
  expireat(data) {
    return this._client.expireat(data);
  }
}

export default RedisClient;
