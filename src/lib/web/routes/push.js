import _get from 'lodash/get';
import config from '../../../config';

import webpush from 'web-push';
import { set, get, keys } from '../../../lib/redisClient';

webpush.setVapidDetails(config.webPush.vapidEmail, config.webPush.vapidPublicKey, config.webPush.vapidPrivateKey);

const push = app => {
  app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    if (_get(subscription, 'keys.p256dh')) {
      set(`subscription-${_get(subscription, 'keys.p256dh')}`, JSON.stringify(subscription), 'EX', 3600 * 24 * 365);
    }
    res.status(201).json({});
  });

  app.get('/push', async (req, res) => {
    const payload = JSON.stringify({
      title: 'Daniel testar lite',
      body: 'Information om en ny öl ☀️',
      data: { path: '/rekommenderade' },
      icon: 'https://untappd.akamaized.net/site/beer_logos/beer-3092221_5cf17_sm.jpeg'
    });
    let subscriptionsKeys = [];
    try {
      subscriptionsKeys = await keys('subscription-*');
      await subscriptionsKeys.map(async subscriptionKey => {
        const subscription = JSON.parse(await get(subscriptionKey));
        await webpush.sendNotification(subscription, payload).catch(error => {
          console.error('webpush', error.stack);
        });
      });
    } catch (e) {
      console.error(e);
    }
    res.json(subscriptionsKeys).send(201);
  });
};

export default push;
