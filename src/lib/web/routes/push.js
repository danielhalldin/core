import _get from 'lodash/get';
import { send } from '../../push';
import RedisClient from '../../worker/clients/redisClient';

const redisClient = new RedisClient();

const pushRoute = app => {
  app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    if (_get(subscription, 'keys.p256dh')) {
      redisClient.set(
        `subscription-${_get(subscription, 'keys.p256dh')}`,
        JSON.stringify(subscription),
        'EX',
        3600 * 24 * 365
      );
    }
    res.status(201).json({});
  });

  app.get('/push', async (req, res) => {
    const systembolagetData = {
      _source: {
        SortimentText: 'Tillfälligt sortiment'
      }
    };
    const untappdData = {
      beer: {
        beer_name: 'Daniel testar lite',
        beer_label: 'https://untappd.akamaized.net/site/beer_logos/beer-3092221_5cf17_sm.jpeg'
      },
      brewery: {
        brewery_name: 'Information om en ny öl ☀️'
      }
    };
    send({ redisClient, systembolagetData, untappdData });
    res.json('Message sent').send(201);
  });
};

export default pushRoute;
