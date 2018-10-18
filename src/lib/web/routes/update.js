import IndexClient from "../../worker/clients/indexClient";

const update = app => {
  app.get("/manual-update", async function(req, res) {
    const id = req.query.id;
    const uid = req.query.uid;
    const indexClient = new IndexClient();
    const documentBody = {
      untappdId: uid,
      untappdData: null
    };
    const responseData = await indexClient.updateDocument({
      index: "systembolaget",
      type: "artikel",
      id: id,
      documentBody: documentBody
    });
    if (responseData) {
      res.send(responseData);
    }
    res.send("no match found");
  });

  return app;
};

export default update;
