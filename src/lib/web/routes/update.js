import IndexClient from "../../worker/clients/indexClient";

const update = app => {
  app.get("/manual-update", async function(req, res) {
    const id = req.query.id;
    const uid = req.query.uid;
    let responseData;

    if (id && uid) {
      const indexClient = new IndexClient();
      responseData = await indexClient.updateDocument({
        index: "systembolaget",
        type: "artikel",
        id: id,
        documentBody: {
          untappdId: uid,
          untappdData: null
        }
      });
    }

    if (responseData) {
      res.send(responseData);
    } else {
      res.send("no match found");
    }
  });

  return app;
};

export default update;
