import IndexClient from "../../worker/clients/indexClient";

const update = app => {
  app.get("/manual-update", async function(req, res) {
    const id = req.query.id;
    const name = req.query.name;
    const indexClient = new IndexClient();
    const documentBody = {
      Namn: name,
      Namn2: null,
      untappdId: null,
      untappdData: null
    };
    const responseData = await indexClient.updateDocument({
      index: "systembolaget",
      type: "artikel",
      id: id,
      documentBody: documentBody
    });

    res.send(responseData);
  });

  return app;
};

export default update;
