"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/generated/prisma/client");
const express_1 = __importDefault(require("express"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/hooks/catch/:userId/:zapId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Webhook hit");
    const { userId, zapId } = req.params;
    const body = req.body;
    const validMetadata = typeof body === "object" && body !== null ? body : {};
    try {
        const response = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const run = yield tx.zapRun.create({
                data: {
                    zapId,
                    metadata: validMetadata, // assuming body is JSON serializable
                },
            });
            const outbox = yield tx.zapRunOutbox.create({
                data: {
                    zapRunId: run.id,
                },
            });
            return { run, outbox };
        }));
        res.json({
            message: "Webhook received",
            zapRun: response.run,
            zapRunOutbox: response.outbox,
        });
        // TODO: Push to queue (Kafka, Redis, etc.)
    }
    catch (err) {
        console.error("Error handling webhook:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
app.get("/", (req, res) => {
    res.send("Server is running");
});
app.listen(3000, () => {
    console.log("Server is listening on http://localhost:3000");
});
