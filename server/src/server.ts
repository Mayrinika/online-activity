import express from 'express';
import cors from "cors";
import {readFileSync} from 'file-system';

const app = express();
const port = 9000;

type gameType = {
    id: string;
    players: string[];
    wordToGuess: string;
    painter: string;
    img: string;
    chatMessages: string[];
    time: number,
    winner: string
}

const games: gameType[] = [];
const timerIds = {

}

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
    games.push({id: req.params.gameId, players: [], wordToGuess: '', painter: '', img: '', chatMessages: [], time: 1*60, winner: ''});
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
    const currentGame = games.find(game => game.id === req.params.gameId);
    currentGame.img = req.body.img;
    res.status(200).send(games);
})

app.post('/:gameId/addWordAndPainter', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame.wordToGuess === '') {
        const words = readFileSync("./src/utils/words.txt", 'utf8').split('\r\n');
        currentGame.wordToGuess = getRandomWord(words);
    }
    if (currentGame.painter === '') {
        currentGame.painter = getPainter(currentGame.players);
    } if (currentGame.time === 1*60) {
        timerIds[currentGame.id] = setInterval(decreaseTime, 1000, currentGame);
    }
    res.status(200).send(games);
});

app.post('/:gameId/clearCountdown', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    clearTimeout(timerIds[currentGame.id]);
    res.status(200).send(games);
})

app.post('/:gameId/setWinner', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    currentGame.winner = req.body.winner
    res.status(200).send(games);
})

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log(`Example app listening at http://localhost:${port}`);
})

function getRandomWord(words): string {
    const randomIdx = Math.floor(Math.random() * words.length);
    return words[randomIdx];
}

function getPainter(players): string {
    const randomIdx = Math.floor(Math.random() * players.length);
    return players[randomIdx];
}

function decreaseTime(currentGame) {
    currentGame.time -= 1
}