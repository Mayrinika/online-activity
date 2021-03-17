import express from 'express';
import cors from "cors";

const app = express();
const port = 9000;

type gameType = {
    id: string;
    players: string[];
    wordToGuess: string;
    painter: string;
    img: string;
    chatMessages: string[];
}

const games: gameType[] = [];

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send(games);
})

app.get('/:gameId', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    res.status(200).send(currentGame);
})

app.post('/:gameId', (req, res) => {
    games.push({id: req.params.gameId, players: [], wordToGuess: '', painter: '', img: '', chatMessages: []});
    res.status(200).send(games);
})

app.post('/:gameId/addPlayer', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    currentGame.players.push(req.body.player);
    res.status(200).send(games);
})

app.get('/:gameId/chatMessages', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    res.status(200).send(currentGame.chatMessages);
})

app.post('/:gameId/chatMessages', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    currentGame.chatMessages.push(req.body);
    res.status(200).send(games);
})

app.post('/:gameId/addImg', (req, res) => {
    console.log(req.body.img);
    const currentGame = games.find(game => game.id === req.params.gameId);
    currentGame.img = req.body.img;
    res.status(200).send(games);
})

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log(`Example app listening at http://localhost:${port}`);
})