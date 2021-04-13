import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import WebSocket from 'ws';
import WebsocketMessage from './utils/websocket';
import bcrypt from 'bcrypt';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import {v4 as uuidv4} from 'uuid';

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

// interface TimerIds { //TODO разобраться с типом TimerIds
//     [index: number]: number;
//
//     [index: string]: number;
// }

interface SuggestedWord {
    id: string;
    word: string;
    likes: string[];
    dislikes: string[];
    isApproved: boolean;
    isDeclined: boolean;
    isInDictionary: boolean;
}
interface Names {
    id: string;
    name: string;
    password: string;
}

const games: GameType[] = [];
const timerIds: any = {}; //TODO разобраться с типом TimerIds
const suggestedWords: SuggestedWord[] = [];
const names: Names[] = [{id: 'etituiuru',name: 'admin', password: '123'}];

app.use(cors({
    origin: ["https://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret:'shpora-frontend2021',
    name: "userId",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        maxAge: 24 * 60 * 60 * 1000,
    }
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((err: any, req: any, res: any, next: any) => { //TODO разобраться с типом
    const {status = 500, message = 'Something went wrong'} = err;
    res.status(status).send(message);
});

app.get('/app', (req: any, res: any) => {
    res.status(200).send(games);
});

app.get('/signup', (req: any, res: any) => {
    res.status(200).send(names);
});

app.post('/signup', async (req: any, res: any) => {
    const {name, password} = req.body;
    const hash = await hashPassword(password);
    const user = {id: uuidv4(), name, password: hash};
    names.push(user);
    req.session.user = user;
    res.status(200).send(names);
});

app.get('/login', (req, res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const {user} = req.session;
    if (!user) {
        res.send({loggedIn: false});
    } else {
        res.send({loggedIn: true, user: user});
    }
});

app.post('/login', async (req: any, res: any) => {
    const {name, password} = req.body;
    const user = names.find(user => user.name === name);
    if (!user) {
        res.status(501).send('Некорректное имя пользователя или пароль');
    } else {
        const valid = await bcrypt.compare(password, user.password);
        if (valid) {
            req.session.user = user;
            res.status(200).send('ок');
        } else {
            res.status(501).send('Некорректное имя пользователя или пароль');
        }
    }
});

app.get('/suggestedWords', (req: any, res: any) => {
    res.status(200).send(suggestedWords);
});

app.get('/leaderboard', (req: any, res: any) => {
    const leaderboard = fs.readJsonSync('./src/utils/leaderboard.json');
    res.status(200).send(leaderboard);
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
        const currentGame = games.find(game => game.id === gameId) || games[0]; //TODO придумать как обрабатывать вариант, когда currentGame===undefined
        const suggestedWord = suggestedWords.find(word => word.id === JSON.parse(message).wordId) || suggestedWords[0]; //TODO придумать как обрабатывать вариант, когда suggestedWord===undefined
        const author = JSON.parse(message).author;
        switch (messageType) {
        case WebsocketMessage.sendSuggestedWordToServer:
            const dictionary = fs.readJsonSync('./src/utils/words.json');
            if (dictionary.words.includes(JSON.parse(message).word)) {
                addSuggestedWord(message, true);
                sendSuggestedWordsToAllClients();
                deleteElementFromArray(suggestedWords, JSON.parse(message).word);
            } else {
                addSuggestedWord(message, false);
                sendSuggestedWordsToAllClients();
            }
            break;
        case WebsocketMessage.likeWord:
            if (suggestedWord.dislikes.includes(author)) {
                deleteElementFromArray(suggestedWord.dislikes, author);
            } else if (!suggestedWord.likes.includes(author)) {
                suggestedWord.likes.push(author);
            }
            sendSuggestedWordsToAllClients();
            if (suggestedWord.likes.length > 2) {
                suggestedWord.isApproved = true;
                sendSuggestedWordsToAllClients();
                addNewWordToDictionary(suggestedWord.word);
                deleteElementFromArray(suggestedWords, suggestedWord);
            }
            break;
        case WebsocketMessage.dislikeWord:
            if (suggestedWord.likes.includes(author)) {
                deleteElementFromArray(suggestedWord.likes, author);
            } else if (!suggestedWord.dislikes.includes(author)) {
                suggestedWord.dislikes.push(author);
            }
            sendSuggestedWordsToAllClients();
            if (suggestedWord.dislikes.length > 2) {
                suggestedWord.isDeclined = true;
                sendSuggestedWordsToAllClients();
                deleteElementFromArray(suggestedWords, suggestedWord);
            }
            break;
        case WebsocketMessage.register:
            addPlayer(currentGame, JSON.parse(message).player);
            addNewWebSocketClient(gameId, ws);
            sendGameToClientsByGameId(gameId, currentGame);
            break;
        case WebsocketMessage.refresh:
            addNewWebSocketClient(gameId, ws);
            sendGameToClientsByGameId(gameId, currentGame);
            break;
        case WebsocketMessage.addWordAndPainter:
            chooseWordToGuess(currentGame);
            choosePainter(currentGame);
            setTimerForGame(currentGame, gameId);
            break;
        case WebsocketMessage.sendMessage:
            currentGame.chatMessages.push(JSON.parse(message).message);
            sendGameToClientsByGameId(gameId, currentGame);
            break;
        case WebsocketMessage.postMarks:
            const currentMessage = currentGame.chatMessages
                .find(item => item.id === JSON.parse(message).value.id);
            if (currentMessage === undefined)
                return;
            currentMessage.marks = JSON.parse(message).value.marks;
            sendGameToClientsByGameId(gameId, currentGame);
            break;
        case WebsocketMessage.setWinner:
            currentGame.winner = JSON.parse(message).winner;
            currentGame.isWordGuessed = true;
            currentGame.isGameOver = true;
            sendGameToClientsByGameId(gameId, currentGame);
            break;
        case WebsocketMessage.sendImg:
            currentGame.img = JSON.parse(message).img;
            sendGameToClientsByGameId(gameId, currentGame);
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

function sendSuggestedWordsToAllClients() {
    wss.clients.forEach((client: { send: (arg0: string) => void; }) => {
        client.send(JSON.stringify(suggestedWords));
    });
}
function addSuggestedWord(message: any, inDictionary: boolean): void {
    suggestedWords.push({
        word: JSON.parse(message).word,
        id: JSON.parse(message).id,
        likes: [],
        dislikes: [],
        isApproved: false,
        isDeclined: false,
        isInDictionary: inDictionary,
    });
}
function addNewWordToDictionary(word: string) {
    const words = fs.readJsonSync('./src/utils/words.json');
    const newWords: {words?: string[]} = {};
    newWords.words = [...words.words, word];
    fs.outputJsonSync('./src/utils/words.json', newWords);
}
function deleteElementFromArray (array: any[], element: any) {
    array.splice(array.indexOf(element), 1);
}
function addNewWebSocketClient(gameId: string, ws: any) {
    if (webSockets[gameId]) {
        webSockets[gameId].push(ws);
    } else {
        webSockets[gameId] = [ws];
    }
}
function sendGameToClientsByGameId(gameId: string, currentGame: GameType) {
    webSockets[gameId].forEach((client: { send: (arg0: string) => void; }) => {
        client.send(JSON.stringify(currentGame));
    });
}
function chooseWordToGuess(currentGame: GameType) {
    if (currentGame.wordToGuess === '') {
        const words = fs.readJsonSync('./src/utils/words.json').words;
        currentGame.wordToGuess = getRandomWord(words);
    }
}
function choosePainter(currentGame: GameType) {
    if (currentGame.painter === '') {
        currentGame.painter = getPainter(currentGame.players);
    }
}
function setTimerForGame(currentGame: GameType, gameId: string) {
    if (currentGame.time === GAME_TIME) {
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
}

const hashPassword = async (password: string): Promise<string> => {
    const hash = await bcrypt.hash(password, 12);
    return hash;
};


