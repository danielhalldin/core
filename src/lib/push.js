import webpush from 'web-push';
import config from '../config';

const mapSortimentToPath = (sortiment) => {
  switch (sortiment) {
    case 'Fast sortiment':
      return '/katagorier/fast-sortiment';
    case 'Ordervaror':
      return '/katagorier/ordervaror';
    case 'Lokalt & Småskaligt':
      return '/katagorier/lokalt-och-smaskaligt';
    case 'Tillfälligt sortiment':
      return '/katagorier/tillfalligt-sortiment';
    case 'Säsong':
      return '/katagorier/sasong';
    default:
      return '/rekommenderade';
  }
};

export const generateAndPush = async ({ redisClient, systembolagetData, untappdData }) => {
  push({
    redisClient,
    title: `${untappdData.beer.beer_name} - ${untappdData.brewery.brewery_name}`,
    body: `[${systembolagetData._source.SortimentText}]`,
    icon: untappdData.beer.beer_label_hd || untappdData.beer.beer_label,
    data: { path: mapSortimentToPath(systembolagetData._source.SortimentText) },
    tag: `new-beers${mapSortimentToPath(systembolagetData._source.SortimentText)}`,
  });
};

export const push = async ({ redisClient, title, body, icon, data, tag }) => {
  if (!redisClient) {
    return;
  }

  const payload = JSON.stringify({ title, body, icon, data, tag });
  let subscriptionsKeys = [];
  try {
    subscriptionsKeys = await redisClient.keys('subscription-*');
    await subscriptionsKeys.map(async (subscriptionKey) => {
      webpush.setVapidDetails(config.webPush.vapidEmail, config.webPush.vapidPublicKey, config.webPush.vapidPrivateKey);
      const subscription = JSON.parse(await redisClient.get(subscriptionKey));
      // eslint-disable-next-line no-unused-vars
      await webpush.sendNotification(subscription, payload).catch((_error) => {
        //console.error('webpush', _error.stack);
      });
    });
  } catch (e) {
    console.error(e);
  }
};
