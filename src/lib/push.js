import webpush from 'web-push';
import { get, keys } from './redisClient';
import config from '../config';

export const send = async ({ systembolagetData, untappdData }) => {
  webpush.setVapidDetails(config.webPush.vapidEmail, config.webPush.vapidPublicKey, config.webPush.vapidPrivateKey);

  const payload = JSON.stringify({
    title: `${untappdData.beer_name} - ${untappdData.brewery.brewery_name}`,
    body: `[${systembolagetData._source.SortimentText}]`,
    icon: untappdData.beer_label
  });
  let subscriptionsKeys = [];
  try {
    subscriptionsKeys = await keys('subscription-*');
    await subscriptionsKeys.map(async subscriptionKey => {
      const subscription = JSON.parse(await get(subscriptionKey));
      await webpush.sendNotification(subscription, payload).catch(error => {
        //console.error('webpush', error.stack);
      });
    });
  } catch (e) {
    console.error(e);
  }
};
