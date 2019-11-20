import webpush from 'web-push';
import config from '../config';

const mapSortimentToPath = sortiment => {
  switch (sortiment) {
    case 'Fast sortiment':
      return '/fast-sortiment';
    case 'Ordervaror':
      return '/ordervaror';
    case 'Lokalt & Småskaligt':
      return '/lokalt-och-smaskaligt';
    case 'Tillfälligt sortiment':
      return '/tillfalligt-sortiment';
    case 'Säsong':
      return '/sasong';
    default:
      return '/rekommenderade';
  }
};
export const send = async ({ redisClient, systembolagetData, untappdData }) => {
  if (!redisClient) {
    return;
  }

  const payload = JSON.stringify({
    title: `${untappdData.beer.beer_name} - ${untappdData.brewery.brewery_name}`,
    body: `[${systembolagetData._source.SortimentText}]`,
    icon: untappdData.beer.beer_label,
    data: { path: mapSortimentToPath(systembolagetData._source.SortimentText) }
  });
  let subscriptionsKeys = [];
  try {
    subscriptionsKeys = await redisClient.keys('subscription-*');
    await subscriptionsKeys.map(async subscriptionKey => {
      webpush.setVapidDetails(config.webPush.vapidEmail, config.webPush.vapidPublicKey, config.webPush.vapidPrivateKey);
      const subscription = JSON.parse(await redisClient.get(subscriptionKey));
      await webpush.sendNotification(subscription, payload).catch(_error => {
        //console.error('webpush', error.stack);
      });
    });
  } catch (e) {
    console.error(e);
  }
};