import jwt from "jwt-simple";

const secret = "testing";

const encrypt = payload => jwt.encode(payload, secret);

const decrypt = token => jwt.decode(token, secret);

export { encrypt, decrypt };
