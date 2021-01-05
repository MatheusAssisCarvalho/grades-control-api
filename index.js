import express from "express";
import gradesRouter from "./routes/grades.js";
import winston from "winston";
import cors from "cors";

global.fileName = "grades.json";

const { combine, timestamp, label, printf } = winston.format
const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
})

global.logger = winston.createLogger({
    level: "silly",
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: "myBacnkAPI.log" })
    ],
    format: combine(
        label({ label: "myBankAPI" }),
        timestamp(),
        myFormat
    )
})

const app = express();
app.use(express.json());
app.use(cors());
app.use("/grade", gradesRouter);

app.listen(3000, async () => {
    try {
        await readFile(global.fileName);
        global.logger.info("API Started!");
    } catch (err) {
        const initialJson = {
            nextId: 1,
            grades: []
        }
        writeFile(global.fileName, JSON.stringify(initialJson).then(() => {
            global.logger.info("API started and create file!");
        }).catch(err => {
            global.logger.error(err);
        }))
    }
})