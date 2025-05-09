import express from "express";
import { PrismaClient } from "../prisma/generated/prisma";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  console.log("Webhook hit");
  const { userId, zapId } = req.params;
  const body = req.body;
  const validMetadata = typeof body === "object" && body !== null ? body : {};

  try {
    const response = await prisma.$transaction(async (tx) => {
      const run = await prisma.zapRun.create({
        data: {
          zapId,
          metadata: validMetadata, // assuming body is JSON serializable
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
      message: "Webhook received",
      zapRun: response.run,
      zapRunOutbox: response.outbox,
    });

    // TODO: Push to queue (Kafka, Redis, etc.)
  } catch (err) {
    console.error("Error handling webhook:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(3000, () => {
  console.log("Server is listening on http://localhost:3000");
});
