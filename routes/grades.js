import express from 'express';
import { promises as fs, write } from 'fs';

const { readFile, writeFile } = fs;

const router = express.Router();

router.post("/", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        let grade = req.body;
        grade = {
            id: data.nextId++,
            student: grade.student,
            subject: grade.subject,
            type: grade.type,
            value: grade.value,
            timestamp: new Date()
        }

        data.grades.push(grade);

        writeFile(global.fileName, JSON.stringify(data, null, 2))
        res.send(grade);
        global.logger.info(`POST /grades - ${JSON.stringify(grade)}`);
    } catch (err) {
        next(err);
    }
})

router.get("/", async (_, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        delete data.nextId;

        res.send(data);
        global.logger.info(`GET /grades`);
    } catch (err) {
        next(err);
    }
})

router.get("/:id", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        const person = data.grades.find(grade => grade.id === parseInt(req.params.id));

        res.send(person);
        global.logger.info(`GET /grades/${req.params.id}`);
    } catch (err) {
        next(err);
    }
})

router.delete("/:id", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        let person = JSON.parse(await readFile(global.fileName));

        person.grades = person.grades.filter(grade => grade.id === parseInt(req.params.id));
        data.grades = data.grades.filter(grade => grade.id !== parseInt(req.params.id));

        writeFile(global.fileName, JSON.stringify(data, null, 2));
        res.send(person.grades);
        global.logger.info(`DELETE /grades/:id - ${JSON.stringify(person)}`);
    } catch (err) {
        next(err);
    }
})

router.put("/", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        const grade = {
            id: req.body.id,
            student: req.body.student,
            subject: req.body.subject,
            type: req.body.type,
            value: req.body.value,
            timestamp: new Date()
        }

        const index = data.grades.findIndex(g => g.id === grade.id);
        data.grades[index] = grade;

        writeFile(global.fileName, JSON.stringify(data, null, 2));
        res.send(grade);
        global.logger.info(`PUT /grades - ${JSON.stringify(grade)}`);
    } catch (err) {
        next(err);
    }
})

router.patch("/updateNotas", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        const grade = req.body;

        const index = data.grades.findIndex(g => g.id === grade.id);
        data.grades[index].value = grade.value;

        writeFile(global.fileName, JSON.stringify(data, null, 2));
        res.send(data.grades[index]);
        global.logger.info(`PATCH /grades - ${JSON.stringify(data.grades[index])}`);
    } catch (err) {
        next(err);
    }
})

router.post("/somaNotas", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        const grade = req.body;

        data.grades = data.grades.filter(g => g.student === grade.student);
        data.grades = data.grades.filter(g => g.subject === grade.subject);

        let total = 0
        for (let i = 0; i < data.grades.length; i++) {
            total += data.grades[i].value;
        }

        res.send(`Nota total do ${grade.student}: ${total}`);
        global.logger.info(`POST /grades/somaNotas - ${JSON.stringify(grade.student)} : ${total}`);
    } catch (err) {
        next(err);
    }
})

router.post("/mediaGrades", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        const grade = req.body;

        data.grades = data.grades.filter(g => g.subject === grade.subject);
        data.grades = data.grades.filter(g => g.type === grade.type);

        let media = 0
        for (let i = 0; i < data.grades.length; i++) {
            media += data.grades[i].value;
        }
        media = media / data.grades.length;

        res.send(`Média do ${grade.subject} e ${grade.type} = ${media}`);
        global.logger.info(`POST /grades/mediaGrades - ${JSON.stringify(grade.type)} : ${media}`);
    } catch (err) {
        next(err);
    }
})

router.post("/bestGrades", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        const grade = req.body;

        data.grades = data.grades.filter(g => g.subject === grade.subject);
        data.grades = data.grades.filter(g => g.type === grade.type);
        data.grades.sort((a, b) => b.value - a.value);
        data.grades.splice(3);

        res.send(data.grades);
        global.logger.info(`POST /grades/mediaGrades - ${JSON.stringify(data.grades)}`);
    } catch (err) {
        next(err);
    }
})

router.use("/", (err, req, res, next) => {
    global.logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
    res.status(400).send({ error: err.message });
})

export default router;