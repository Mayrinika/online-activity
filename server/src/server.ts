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
    const game = games.filter(game => game.id === req.params.gameId)[0];
    res.status(200).send(game);
})

app.post('/:gameId', (req, res) => {
    games.push({id: req.params.gameId, players: [], wordToGuess: '', painter: '', img: '', chatMessages: []});
    res.status(200).send(games);
})

app.post('/:gameId/addPlayer', (req, res) => {
    let game = games.filter(game => game.id === req.params.gameId)[0];
    game.players.push(req.body.player);
    res.status(200).send(games);
})

app.get('/:gameId/chatMessages', (req, res) => {
    const game = games.find(game => game.id === req.params.gameId);
    res.status(200).send(game.chatMessages);
})

app.post('/:gameId/chatMessages', (req, res) => {
    const game = games.find(game => game.id === req.params.gameId);
    game.chatMessages.push(req.body);
    res.status(200).send(games);
})

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log(`Example app listening at http://localhost:${port}`);
})