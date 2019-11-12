import querystring from 'querystring';
import fetch from 'node-fetch';

import config from '../../../config';
import { encrypt } from '../../jwtHandler';

const login = app => {
  app.get('/login', function(req, res) {
    const params = {
      client_id: config.untappd.clientID,
      response_type: 'code',
      redirect_url: encodeURI(config.newBeers.authUrl)
    };

    const url = config.untappd.authBaseUrl + '/authenticate/?' + querystring.stringify(params);

    res.redirect(url);
  });

  app.get('/auth', async function(req, res) {
    const code = req.query.code;
    const params = {
      client_id: config.untappd.clientID,
      client_secret: config.untappd.clientSecret,
      response_type: 'code',
      redirect_url: encodeURI(config.newBeers.authUrl),
      code: code
    };

    const url = config.untappd.authBaseUrl + '/authorize/?' + querystring.stringify(params);
    const authorizeResponse = await fetch(url);
    const token = (await authorizeResponse.json()).response.access_token;
    const jwt = encrypt(token);
    res.redirect(`${config.newBeers.url}/?token=${jwt}`);
  });
};

export default login;
