import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';

const app = express();
const port = 9000;
const GAME_TIME: number = 1 * 60; //TODO 1 минута для тестирования, на продакшн изменить время (напрмиер 3 минуты)

interface Message {
    id: string;
    name: string;
    text: string;
    marks: {
        hot: boolean;
        cold: boolean;
    };
}

interface GameType {
    id: string;
    players: string[];
    wordToGuess: string;
    painter: string;
    img: string;
    chatMessages: Message[];
    time: number;
    winner: string;
    isWordGuessed: boolean;
    isTimeOver: boolean;
    isGameOver: boolean;
    lines: any[]; //TODO разобраться с типом
}

interface TimerIds {
    [index: number]: number;
    [index: string]: number;
}

const games: GameType[] = [];
const timerIds: TimerIds = {};

app.use(cors());
app.use(express.json());

app.use((err: any, req: any, res: any, next: any) => { //TODO разобраться с типом
    const {status = 500, message = 'Something went wrong'} = err;
    res.status(status).send(message);
});

app.get('/app', (req, res) => {
    res.status(200).send(games);
});

app.get('/leaderboard', (req, res) => {
    const leaderboard = fs.readJsonSync('./src/utils/leaderboard.json');
    res.status(200).send(leaderboard.players);
});

app.post('/leaderboard', (req, res) => {
    const leaderboard = fs.readJsonSync('./src/utils/leaderboard.json');
    for (const {playerName, score} of req.body) {
        if (playerName in leaderboard.players)
            leaderboard.players[playerName] += score;
        else
            leaderboard.players[playerName] = score;
    }
    fs.outputJsonSync('./src/utils/leaderboard.json', leaderboard);
    res.status(200).send(leaderboard);
});

app.get('/:gameId', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    res.status(200).send(currentGame);
});

app.post('/:gameId', (req, res) => {
    games.push({
        id: req.params.gameId,
        players: [],
        wordToGuess: '',
        painter: '',
        img: '',
        chatMessages: [],
        time: GAME_TIME, winner: '',
        isWordGuessed: false,
        isTimeOver: false,
        isGameOver: false,
        lines: []
    });
    res.status(200).send(games);
});

app.post('/:gameId/addPlayer', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.players.push(req.body.player);
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
});

app.get('/:gameId/chatMessages', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        res.status(200).send(currentGame.chatMessages);
    } else {
        res.status(500).send('Game not found');
    }
});

app.post('/:gameId/chatMessages', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.chatMessages.push(req.body);
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
});

app.post('/:gameId/addMark', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        const currentMessage = currentGame.chatMessages.find(item => item.id === req.body.id);
        if (currentMessage) {
            currentMessage.marks = req.body.marks;
            res.status(200).send(games);
        } else {
            res.status(500).send('Message not found');
        }
    } else {
        res.status(500).send('Game not found');
    }
});

app.post('/:gameId/addImg', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.img = req.body.img;
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
});

app.post('/:gameId/addLine', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.lines.push(req.body.line);
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
});

app.post('/:gameId/addWordAndPainter', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        if (currentGame.wordToGuess === '') {
            const words = fs.readJsonSync('./src/utils/words.json').words;
            currentGame.wordToGuess = getRandomWord(words);
        }
        if (currentGame.painter === '') {
            currentGame.painter = getPainter(currentGame.players);
        }
        if (currentGame.time === GAME_TIME) { //TODO разобраться с типом
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            timerIds[currentGame.id] = setInterval((currentGame) => {
                if (currentGame.time > 0) {
                    currentGame.time -= 1;
                } else {
                    currentGame.isTimeOver = true;
                    currentGame.isGameOver = true;
                    clearInterval(timerIds[currentGame]);
                }
            }, 1000, currentGame);
        }
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
});

app.post('/:gameId/clearCountdown', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        clearTimeout(timerIds[currentGame.id]);
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
});

app.post('/:gameId/setWinner', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.winner = req.body.winner;
        currentGame.isWordGuessed = true;
        currentGame.isGameOver = true;
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
});

app.post('/:gameId/setTimeIsOver', (req, res) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.isTimeOver = true;
        currentGame.isGameOver = true;
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
});

app.listen(port, () => { //TODO (err) ?
    // if (err) {
    //     return console.log('something bad happened', err);
    // }
    console.log(`Example app listening at http://localhost:${port}/app`);
});

function getRandomWord(words: []): string {
    const randomIdx = Math.floor(Math.random() * words.length);
    return words[randomIdx];
}

function getPainter(players: string[]): string {
    const randomIdx = Math.floor(Math.random() * players.length);
    return players[randomIdx];
}

