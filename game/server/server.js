const express = require('express');
const cors = require("cors");

const app = express();
const port = 9000;

const chatMessages = [];

app.use(cors());
app.use(express.json());

app.get('/chatMessages', (req, res) => {
    res.status(200).json(chatMessages);
})

app.post('/chatMessages', (req, res) => {
    chatMessages.push(req.body);
    res.status(200).json(chatMessages);
})

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }

    console.log(`Example app listening at http://localhost:${port}`);
})