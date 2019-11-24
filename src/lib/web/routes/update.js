import indexClient from '../../worker/clients/indexClient';

const update = app => {
  app.get('/manual-update', async function(req, res) {
    const id = req.query.id;
    const uid = req.query.uid;
    let responseData;

    if (id) {
      responseData = await indexClient.updateDocument({
        index: 'systembolaget',
        type: 'artikel',
        id: id,
        documentBody: {
          untappdId: Number(uid),
          untappdData: null,
          untappdTimestamp: 0
        }
      });
    }

    if (responseData) {
      res.send(responseData);
    } else {
      res.send('no match found');
    }
  });

  return app;
};

export default update;
