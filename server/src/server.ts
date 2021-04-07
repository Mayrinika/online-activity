import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import WebSocket from 'ws';

const app = express();
const port = process.env.PORT ||9000;
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

interface SuggestedWord {
    id: string;
    word: string;
    likes: string[];
    dislikes: string[];
    isApproved: boolean;
    isDeclined: boolean;
}

const games: GameType[] = [];
const timerIds: TimerIds = {};
const suggestedWords: SuggestedWord[] = [{id:'sf', word:'sf', likes:[], dislikes:[], isApproved: false, isDeclined: false}];

app.use(cors());
app.use(express.json());

app.use((err: any, req: any, res: any, next: any) => { //TODO разобраться с типом
    const {status = 500, message = 'Something went wrong'} = err;
    res.status(status).send(message);
});

app.get('/app', (req: any, res: any) => {
    res.status(200).send(games);
});

app.get('/suggestedWords', (req: any, res: any) => {
    res.status(200).send(suggestedWords);
});

app.get('/leaderboard', (req: any, res: any) => {
    const leaderboard = fs.readJsonSync('./src/utils/leaderboard.json');
    res.status(200).send(leaderboard.players);
});

app.post('/leaderboard', (req: any, res: any) => {
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

app.get('/:gameId', (req: any, res: any) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    res.status(200).send(currentGame);
});

app.post('/:gameId', (req: any, res: any) => {
    games.push({
        id: req.params.gameId,
        players: [],
        wordToGuess: '',
        painter: '',
        img: '',
        chatMessages: [],
        time: GAME_TIME,
        winner: '',
        isWordGuessed: false,
        isTimeOver: false,
        isGameOver: false,
        lines: [],
    });
    res.status(200).send(games);
});

app.post('/:gameId/addLine', (req: any, res: any) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.lines.push(req.body.line);
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
});

app.post('/:gameId/clearCountdown', (req: any, res: any) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        clearTimeout(timerIds[currentGame.id]);
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
});

app.post('/:gameId/setTimeIsOver', (req: any, res: any) => {
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

const wss = new WebSocket.Server({port: 8080});
const webSockets: any = {}; //TODO

wss.on('connection', (ws: any) => {
    ws.on('message', (message: any) => { //TODO
        const messageType = JSON.parse(message).messageType;
        const gameId = JSON.parse(message).gameId;
        const currentGame = games.find(game => game.id === gameId) || games[0];
        const suggestedWord = suggestedWords.find(word => word.id === JSON.parse(message).wordId) || suggestedWords[0];
        const author = JSON.parse(message).author;
        // if (currentGame === undefined) {
        //     return;
        // }
        switch (messageType) {
        case 'sendSuggestedWord':
            suggestedWords.push({word: JSON.parse(message).word, id: JSON.parse(message).id, likes: [], dislikes: [], isApproved: false, isDeclined: false});
            wss.clients.forEach((client: { send: (arg0: string) => void; }) => {
                client.send(JSON.stringify(suggestedWords));
            });
            break;
        case 'likeWord':
            if (suggestedWord.dislikes.includes(author)) {
                suggestedWord.dislikes.splice(suggestedWord.dislikes.indexOf(author), 1);
            } else if (!suggestedWord.likes.includes(author)) {
                suggestedWord.likes.push(author);
            }
            wss.clients.forEach((client: { send: (arg0: string) => void; }) => {
                client.send(JSON.stringify(suggestedWords));
            });
            if (suggestedWord.likes.length > 2) {
                suggestedWord.isApproved = true;
                wss.clients.forEach((client: { send: (arg0: string) => void; }) => {
                    client.send(JSON.stringify(suggestedWords));
                });
                const words = fs.readJsonSync('./src/utils/words.json');
                const newWords: {words?: string[]} = {};
                newWords.words = [...words.words, suggestedWord.word];
                fs.outputJsonSync('./src/utils/words.json', newWords);
                suggestedWords.splice(suggestedWords.indexOf(suggestedWord), 1);
            }
            break;
        case 'dislikeWord':
            if (suggestedWord.likes.includes(author)) {
                suggestedWord.likes.splice(suggestedWord.likes.indexOf(author), 1);
            } else if (!suggestedWord.dislikes.includes(author)) {
                suggestedWord.dislikes.push(author);
            }
            wss.clients.forEach((client: { send: (arg0: string) => void; }) => {
                client.send(JSON.stringify(suggestedWords));
            });
            if (suggestedWord.dislikes.length > 2) {
                suggestedWord.isDeclined = true;
                wss.clients.forEach((client: { send: (arg0: string) => void; }) => {
                    client.send(JSON.stringify(suggestedWords));
                });
                suggestedWords.splice(suggestedWords.indexOf(suggestedWord), 1);
            }
            break;
        case 'register':
            addPlayer(currentGame, JSON.parse(message).player);
            if (webSockets[gameId]) {
                webSockets[gameId].push(ws);
            } else {
                webSockets[gameId] = [ws];
            }
            webSockets[gameId].forEach((client: { send: (arg0: string) => void; }) => {
                client.send(JSON.stringify(currentGame));
            });
            break;
        case 'refresh':
            if (webSockets[gameId]) {
                webSockets[gameId].push(ws);
            } else {
                webSockets[gameId] = [ws];
            }
            webSockets[gameId].forEach((client: { send: (arg0: string) => void; }) => {
                client.send(JSON.stringify(currentGame));
            });
            break;
        case 'addWordAndPainter':
            if (currentGame.wordToGuess === '') {
                const words = fs.readJsonSync('./src/utils/words.json').words;
                currentGame.wordToGuess = getRandomWord(words);
            }
            if (currentGame.painter === '') {
                currentGame.painter = getPainter(currentGame.players);
            }
            if (currentGame.time === GAME_TIME) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                timerIds[currentGame.id] = setInterval((currentGame) => {
                    if (currentGame.time > 0) {
                        currentGame.time -= 1;
                        webSockets[gameId].forEach((client: { send: (arg0: string) => void; }) => {
                            client.send(JSON.stringify(currentGame));
                        });
                    } else {
                        currentGame.isTimeOver = true;
                        currentGame.isGameOver = true;
                        clearInterval(timerIds[currentGame]);
                        webSockets[gameId].forEach((client: { send: (arg0: string) => void; }) => {
                            client.send(JSON.stringify(currentGame));
                        });
                    }
                }, 1000, currentGame);
            }
            break;
        case 'sendMessage':
            currentGame.chatMessages.push(JSON.parse(message).message);
            webSockets[gameId].forEach((client: { send: (arg0: string) => void; }) => {
                client.send(JSON.stringify(currentGame));
            });
            break;
        case 'postMarks':
            const currentMessage = currentGame.chatMessages //TODO
                .find(item => item.id === JSON.parse(message).value.id);
            if (currentMessage === undefined)
                return;
            currentMessage.marks = JSON.parse(message).value.marks;
            webSockets[gameId].forEach((client: { send: (arg0: string) => void; }) => {
                client.send(JSON.stringify(currentGame));
            });
            break;
        case 'setWinner':
            currentGame.winner = JSON.parse(message).winner;
            currentGame.isWordGuessed = true;
            currentGame.isGameOver = true;
            webSockets[gameId].forEach((client: { send: (arg0: string) => void; }) => {
                client.send(JSON.stringify(currentGame));
            });
            break;
        case 'sendImg':
            currentGame.img = JSON.parse(message).img;
            webSockets[gameId].forEach((client: { send: (arg0: string) => void; }) => {
                client.send(JSON.stringify(currentGame));
            });
            break;
        }
    });
});

function getRandomWord(words: []): string {
    const randomIdx = Math.floor(Math.random() * words.length);
    return words[randomIdx];
}

function getPainter(players: string[]): string {
    const randomIdx = Math.floor(Math.random() * players.length);
    return players[randomIdx];
}

function addPlayer(currentGame: GameType, player: string) {
    currentGame.players.push(player);
}

