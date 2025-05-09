import express from "express";
import { PrismaClient } from "../prisma/generated/prisma";
const prisma = new PrismaClient();
const app = express();
app.use(express.json())
// https://hooks.zapier.com/hooks/catch/17043103/22b8496/ (this is the sample zapier webhook that we wanna build)

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  console.log("Accessing to the webhook");
  const userId = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body

  // store in DB a new trigger happened
  const response = await prisma.$transaction(async (tx) => {
    const run = await prisma.zapRun.create({
      data: {
        zapId,
        metadata:body
      },
    });

    const outbox = await prisma.zapRunOutbox.create({
      data: {
        zapRunId: run.id,
      },
    });

    return { run, outbox };
  });
  res.json({
    "message":"webhook recieved",
    "zapRun":response.run,
    "zapRunOutbox":response.outbox
  })
  /**
 * Explanation :
    You pass a callback to $transaction if you want to use await/async logic.
    The tx parameter is a transactional Prisma client.
    Both operations are guaranteed to either complete or roll back together.
 */

  // push it to a queue ( kafka or redis )

  res.send("heyyy");
});

app.get("/", (req, res) => {
  console.log("Hello User");
  res.send("heyyy");
});

app.listen(3000, () => {
  console.log("The server is listening in port http://localhost:3000");
});
