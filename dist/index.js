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
const express_1 = __importDefault(require("express"));
const prisma_1 = require("./generated/prisma");
const prisma = new prisma_1.PrismaClient();
const app = (0, express_1.default)();
// https://hooks.zapier.com/hooks/catch/17043103/22b8496/ (this is the sample zapier webhook that we wanna build)
app.post("/hooks/catch/:userId/:zapId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Accessing to the webhook");
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const metadata = req.body;
    // store in DB a new trigger happened
    const response = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const run = yield tx.zapRun.create({
            data: {
                zapId,
                metadata
            },
        });
        const outbox = yield tx.zapRunOutbox.create({
            data: {
                zapRunId: run.id,
            },
        });
        return { run, outbox };
    }));
    /**
   * Explanation :
      You pass a callback to $transaction if you want to use await/async logic.
      The tx parameter is a transactional Prisma client.
      Both operations are guaranteed to either complete or roll back together.
   */
    // push it to a queue ( kafka or redis )
    res.send("heyyy");
}));
app.get("/", (req, res) => {
    console.log("Hello User");
    res.send("heyyy");
});
app.listen(3000, () => {
    console.log("The server is listening in port http://localhost:3000");
});
