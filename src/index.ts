import express from "express";

const app = express();

// https://hooks.zapier.com/hooks/catch/17043103/22b8496/

app.post("/hooks/catch/:userId/:zapId", async(req, res) => {
  console.log("Accessing to the webhook");
  const userId = req.params.userId
  const zapId = req.params.zapId

  // store in DB a new trigger happened
    
  // push it to a queue ( kafka or redis )

  res.send("heyyy");
});

app.get("/", (req, res) => {
  console.log("Hello User");
  res.send("heyyy");
});

app.listen(3000, () => {
    console.log("The server is listening in port http://localhost:3000")
})