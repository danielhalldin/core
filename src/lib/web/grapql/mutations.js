import indexClient from '../../worker/clients/indexClient';
import config from '../../../config';

const deleteBeer = async (_, { systembolagetArticleId }, { dataSources, untappd_access_token }) => {
  const data = await dataSources.UntappdAPI.user(untappd_access_token);
  if (data.name === config.superUser && systembolagetArticleId) {
    const responseData = await indexClient.deleteFromIndex({
      index: 'systembolaget',
      type: 'artikel',
      id: systembolagetArticleId
    });
    if (responseData) {
      return true;
    } else {
      return false;
    }
  }

  return false;
};

const updateUntappdId = async (_, { systembolagetArticleId, untappdId }, { dataSources, untappd_access_token }) => {
  const data = await dataSources.UntappdAPI.user(untappd_access_token);
  if (data.name === config.superUser && systembolagetArticleId) {
    const responseData = await indexClient.updateDocument({
      index: 'systembolaget',
      type: 'artikel',
      id: systembolagetArticleId,
      documentBody: {
        untappdId: Number(untappdId),
        untappdData: null
      }
    });
    if (responseData) {
      return true;
    } else {
      return false;
    }
  }

  return false;
};

export { updateUntappdId, deleteBeer };
