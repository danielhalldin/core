import jwt from 'jwt-simple';
import config from '../config';

const secret = config.jwtSecret;

const encrypt = payload => jwt.encode(payload, secret);

const decrypt = token => jwt.decode(token, secret);

export { encrypt, decrypt };
