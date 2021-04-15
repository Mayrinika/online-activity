import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import WebSocket from 'ws';
import WebsocketMessage from './utils/websocket';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
//handlers
import {games, suggestedWords, GAME_TIME, timerIds} from "./handlers/game";
import {getAllUsers, signup, getUser, login} from './handlers/user';
import {
    getAllGames,
    getSuggestedWords,
    getLeaderboard,
    updateLeaderboard,
    getCurrentGame,
    addGame,
    addLine,
    deleteLine,
    clearCountdown,
    setTimeIsOver
} from "./handlers/game";

const app = express();
const port = process.env.PORT || 9000;

interface Player {
    name: string,
    avatar: string | ArrayBuffer | null;
}

interface Message {
    id: string;
    name: string;
    avatar: string | ArrayBuffer | null;
    text: string;
    marks: {
        hot: boolean;
        cold: boolean;
    };
}

interface GameType {
    id: string;
    players: Player[];
    wordToGuess: string;
    painter: Player;
    img: string;
    chatMessages: Message[];
    time: number;
    winner: string;
    isWordGuessed: boolean;
    isTimeOver: boolean;
    isGameOver: boolean;
    lines: any[]; //TODO разобраться с типом
}
interface User {
    id: string;
    name: string;
    password: string;
    avatar: string | ArrayBuffer | null;
}

app.use(cors({
    origin: ["https://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: 'shpora-frontend2021',
    name: "userId",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        maxAge: 24 * 60 * 60 * 1000,
    }
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.use((err: any, req: any, res: any, next: any) => { //TODO разобраться с типом
    const {status = 500, message = 'Something went wrong'} = err;
    res.status(status).send(message);
});

app.get('/app', getAllGames);

//user routes
app.get('/signup', getAllUsers);
app.post('/signup', signup);
app.get('/login', getUser);
app.post('/login', login);

//game routes
app.get('/suggestedWords', getSuggestedWords);

app.get('/leaderboard', getLeaderboard);
app.post('/leaderboard', updateLeaderboard);

app.get('/:gameId', getCurrentGame);
app.post('/:gameId', addGame);
app.post('/:gameId/addLine', addLine);
app.post('/:gameId/deleteLine', deleteLine);
app.post('/:gameId/clearCountdown', clearCountdown);
app.post('/:gameId/setTimeIsOver', setTimeIsOver);

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
            const users = fs.readJsonSync('./src/utils/users.json');
            const user = users.find((user: User) => user.name === JSON.parse(message).player);

            const avatar = user.avatar;
            addPlayer(currentGame, JSON.parse(message).player, avatar);
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
            const newAvatar = currentGame.players.find(player => player.name === JSON.parse(message).message.name)?.avatar;
            const newMessage = {...JSON.parse(message).message, avatar: newAvatar};
            currentGame.chatMessages.push(newMessage);
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

function getPainter(players: Player[]): Player {
    const randomIdx = Math.floor(Math.random() * players.length);
    return players[randomIdx];
}

function addPlayer(currentGame: GameType, name: string, avatar: string) {
    currentGame.players.push({name: name, avatar: avatar});
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
    const newWords: { words?: string[] } = {};
    newWords.words = [...words.words, word];
    fs.outputJsonSync('./src/utils/words.json', newWords);
}

function deleteElementFromArray(array: any[], element: any) {
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
    if (currentGame.painter.name === '') {
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


