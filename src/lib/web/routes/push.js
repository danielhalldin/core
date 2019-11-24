import _get from 'lodash/get';
import { generateAndPush } from '../../push';
import redisClient from '../../worker/clients/redisClient';

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
    generateAndPush({ redisClient, systembolagetData, untappdData });
    res.status(200).send('Message sent');
  });
};

export default pushRoute;
