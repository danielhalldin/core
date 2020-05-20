import querystring from 'querystring';
import fetch from 'node-fetch';
import cookie from 'cookie';
import config from '../../../config';
import { encrypt } from '../../jwtHandler';

const login = (app) => {
  app.get('/login', function (req, res) {
    // Handle returnUrl
    const returnUrl = req.query.returnUrl;
    if (returnUrl.includes(config.newBeers.url) || returnUrl.includes('https://web.newbeers.se')) {
      res.setHeader(
        'Set-Cookie',
        cookie.serialize('returnUrl', String(req.query.returnUrl), {
          httpOnly: true,
          maxAge: 60 * 10, // 10 minutes
        })
      );
    }

    const params = {
      client_id: config.untappd.clientID,
      response_type: 'code',
      redirect_url: encodeURI(config.newBeers.authUrl),
    };
    const url = config.untappd.authBaseUrl + '/authenticate/?' + querystring.stringify(params);

    res.redirect(url);
  });

  app.get('/auth', async function (req, res) {
    const code = req.query.code;
    const params = {
      client_id: config.untappd.clientID,
      client_secret: config.untappd.clientSecret,
      response_type: 'code',
      redirect_url: encodeURI(config.newBeers.authUrl),
      code: code,
    };

    const url = config.untappd.authBaseUrl + '/authorize/?' + querystring.stringify(params);
    const authorizeResponse = await fetch(url);
    const token = (await authorizeResponse.json()).response.access_token;
    const jwt = encrypt(token);

    // Handle returnUrl
    const cookies = cookie.parse(req.headers.cookie || '');
    const returnUrl = cookies.returnUrl || config.newBeers.url;
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('returnUrl', String(''), {
        httpOnly: true,
        maxAge: 1,
      })
    );

    res.redirect(`${returnUrl}/?token=${jwt}`);
  });
};

export default login;
