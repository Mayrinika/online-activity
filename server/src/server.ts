import express from 'express';
import cors from 'cors';
import WebSocket, {Server} from 'ws';
import WebsocketMessage from './utils/websocket';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
//db
import db, {initializeDb} from './db';
//handlers
import {games, suggestedWords, GAME_TIME, timerIds} from "./handlers/game";
import {getAllUsers, signup, getUserLoginData, login, logout} from './handlers/user';
import {
    getAllGames,
    getSuggestedWords,
    getLeaderboard,
    getCurrentGame,
    addGame,
    addLine,
    deleteLine,
    clearCountdown,
    setTimeIsOver
} from "./handlers/game";
//utils
import {Player, Message, GameType, User, SuggestedWord} from "./utils/types";
import * as path from "path";

initializeDb();
const app = express();
const port = process.env.PORT || 9000;

app.use(cors({ //TODO cors?
    origin: ["https://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.static(path.join(__dirname + 'build')));

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

app.use((err: { status: number, message: string }, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const {status = 500, message = 'Something went wrong'} = err;
    res.status(status).send(message);
});

app.get('/static/!**', function (req, res) {
    const url = req.path.split('static')[1];
    const file = path.join(__dirname, 'build', 'static', url);
    res.sendFile(file);
});

app.get('/!*.(ico|png|txt|json)', function (req, res) {
    const url = req.path.split('/')[1];
    const file = path.join(__dirname, 'build', url);
    res.sendFile(file);
});

app.get('/api/games', getAllGames);

//user routes
app.get('/api/signup', getAllUsers);
app.post('/api/signup', signup);
app.get('/api/login', getUserLoginData);
app.post('/api/login', login);
app.post('/api/logout', logout);
//game routes
app.get('/api/suggestedWords', getSuggestedWords);

app.get('/api/leaderboard', getLeaderboard);

app.get('/api/:gameId', getCurrentGame);
app.post('/api/:gameId', addGame);
app.post('/api/:gameId/addLine', addLine);
app.post('/api/:gameId/deleteLine', deleteLine);
app.post('/api/:gameId/clearCountdown', clearCountdown);
app.post('/api/:gameId/setTimeIsOver', setTimeIsOver);

// app.get('*', function (req, res) {
//     const index = path.join(__dirname, 'build', 'index.html');
//     res.sendFile(index);
// });

const server = app.listen(port, () => { //TODO (err) ?
    // if (err) {
    //     return console.log('something bad happened', err);
    // }
    console.log(`Example app listening at http://localhost:${port}`);
});

const wss = new Server({server});
const webSockets: {[id: string]: WebSocket[]} = {};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const {messageType, parsedMessage, gameId, currentGame, suggestedWord, author} = parse(message as string);
        switch (messageType) {
        case WebsocketMessage.sendSuggestedWordToServer:
            sendSuggestedWordToServer(parsedMessage);
            break;
        case WebsocketMessage.likeWord:
            likeWord(suggestedWord, author);
            break;
        case WebsocketMessage.dislikeWord:
            dislikeWord(suggestedWord, author);
            break;
        case WebsocketMessage.register:
            register(parsedMessage, currentGame, gameId, ws);
            break;
        case WebsocketMessage.refresh:
            refresh(gameId, ws, currentGame);
            break;
        case WebsocketMessage.addWordAndPainter:
            addWordAndPainter(currentGame, gameId);
            break;
        case WebsocketMessage.sendMessage:
            sendMessage(currentGame, parsedMessage, gameId);
            break;
        case WebsocketMessage.postMarks:
            postMarks(currentGame, parsedMessage, gameId);
            break;
        case WebsocketMessage.setWinner:
            setWinner(currentGame, parsedMessage, gameId);
            break;
        case WebsocketMessage.sendImg:
            sendImg(currentGame, parsedMessage, gameId);
            break;
        }
    });
});

function parse(message: string) {
    const parsedMessage = JSON.parse(message);
    const messageType = parsedMessage.messageType;
    const gameId = parsedMessage.gameId;
    const currentGame = games.find(game => game.id === gameId) || games[0]; //TODO придумать как обрабатывать вариант, когда currentGame===undefined
    const suggestedWord = suggestedWords.find(word => word.id === parsedMessage.wordId) || suggestedWords[0]; //TODO придумать как обрабатывать вариант, когда suggestedWord===undefined
    const author = parsedMessage.author;
    return {messageType, parsedMessage, gameId, currentGame, suggestedWord, author};
}

function sendSuggestedWordToServer(parsedMessage: {word: string, id: string}) {
    const dictionary = db.getWords();
    if (dictionary.words.includes(parsedMessage.word)) {
        addSuggestedWord(parsedMessage, true);
        sendSuggestedWordsToAllClients();
        const wordToDelete = suggestedWords.find(el => el.word === parsedMessage.word);
        deleteElementFromArray(suggestedWords, wordToDelete);
    } else {
        addSuggestedWord(parsedMessage, false);
        sendSuggestedWordsToAllClients();
    }
}

function likeWord(suggestedWord: SuggestedWord, author: string) {
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
}

function dislikeWord(suggestedWord: SuggestedWord, author: string) {
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
}

function register(parsedMessage: {player: string}, currentGame: GameType, gameId: string, ws: WebSocket) {
    const users = db.getUsers();
    const user = users.find((user: User) => user.name === parsedMessage.player);
    const avatar = user ? user.avatar : null;
    addPlayer(currentGame, parsedMessage.player, avatar);
    addNewWebSocketClient(gameId, ws);
    sendGameToClientsByGameId(gameId, currentGame);
}

function refresh(gameId: string, ws: WebSocket, currentGame: GameType) {
    addNewWebSocketClient(gameId, ws);
    sendGameToClientsByGameId(gameId, currentGame);
}

function addWordAndPainter(currentGame: GameType, gameId: string) {
    chooseWordToGuess(currentGame);
    choosePainter(currentGame);
    setTimerForGame(currentGame, gameId);
}

function sendMessage(currentGame: GameType, parsedMessage: { message: Message }, gameId: string) {
    const foundPlayer = currentGame.players.find(player => player.name === parsedMessage.message.name);
    const newAvatar = foundPlayer? foundPlayer.avatar : null;
    const newMessage = {...parsedMessage.message, avatar: newAvatar};
    currentGame.chatMessages.push(newMessage);
    sendGameToClientsByGameId(gameId, currentGame);
}

function postMarks(currentGame: GameType, parsedMessage: {value: { id: string, marks: { hot: boolean, cold: boolean } }}, gameId: string) {
    const currentMessage = currentGame.chatMessages
        .find(item => item.id === parsedMessage.value.id);
    if (currentMessage !== undefined) {
        currentMessage.marks = parsedMessage.value.marks;
        sendGameToClientsByGameId(gameId, currentGame);
    }
}

function setWinner(currentGame: GameType, parsedMessage: {winner: string}, gameId: string) {
    currentGame.winner = parsedMessage.winner;
    const winner = currentGame.players.find(player => player.name === parsedMessage.winner);
    currentGame.isWordGuessed = true;
    currentGame.isGameOver = true;
    addLocalScore(currentGame, winner);
    sendGameToClientsByGameId(gameId, currentGame);
    updateLeaderboard(currentGame.scores);
}

function sendImg(currentGame: GameType, parsedMessage: {img: string}, gameId: string) {
    currentGame.img = parsedMessage.img;
    sendGameToClientsByGameId(gameId, currentGame);
}

function getRandomWord(words: string[]): string {
    const randomIdx = Math.floor(Math.random() * words.length);
    return words[randomIdx];
}

function getPainter(players: Player[]): Player {
    const randomIdx = Math.floor(Math.random() * players.length);
    return players[randomIdx];
}

function addPlayer(currentGame: GameType, name: string, avatar: string | null | ArrayBuffer) {
    currentGame.players.push({name: name, avatar: avatar});
}

function sendSuggestedWordsToAllClients() {
    wss.clients.forEach((client: { send: (arg0: string) => void; }) => {
        client.send(JSON.stringify(suggestedWords));
    });
}

function addSuggestedWord(parsedMessage: { word: string, id: string }, inDictionary: boolean): void {
    suggestedWords.push({
        word: parsedMessage.word,
        id: parsedMessage.id,
        likes: [],
        dislikes: [],
        isApproved: false,
        isDeclined: false,
        isInDictionary: inDictionary,
    });
}

function addNewWordToDictionary(word: string) {
    const words = db.getWords();
    const newWords: { words?: string[] } = {};
    newWords.words = [...words.words, word];
    db.saveWords(newWords);
}

function deleteElementFromArray<T>(array: T[], element: T) {
    array.splice(array.indexOf(element), 1);
}

function addNewWebSocketClient(gameId: string, ws: WebSocket) {
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
        const words = db.getWords().words;
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
                clearInterval(timerIds[currentGame.id]);
                //addScoreForMarks(currentGame);
                //updateLeaderboard(currentGame.scores);
                webSockets[gameId].forEach((client: { send: (arg0: string) => void; }) => {
                    client.send(JSON.stringify(currentGame));
                });
            }
        }, 1000, currentGame);
    }
}

function addLocalScore(currentGame: GameType, winner: Player | undefined) {
    if (currentGame.scores.length === 0) {
        currentGame.scores.push({player: currentGame.painter, score: currentGame.time});
        if (winner !== undefined) {
            currentGame.scores.push({player: winner, score: 50});
        }
        addScoreForMarks(currentGame);
    }
}
function addScoreForMarks(currentGame: GameType) {
    currentGame.chatMessages.map(message => {
        if (message.marks.hot) {
            const player = currentGame.scores.find(score => score.player.name === message.name);
            if (player) {
                if (player.score + 2 < 50) {
                    player.score += 2;
                }
            } else {
                const foundPlayer = currentGame.players.find(player => player.name === message.name);
                const avatar = foundPlayer? foundPlayer.avatar : null;
                currentGame.scores.push({player: {name: message.name, avatar}, score: 2});
            }
        }
    });
}

function updateLeaderboard(localScores: {player: Player, score: number}[]) {
    const leaderboard = db.getLeaderboard();
    for (const {player, score} of localScores) {
        const playerFound = leaderboard.players.find((playerGlobal) => playerGlobal.player.name === player.name);
        if (playerFound) {
            playerFound.score += score;
        } else {
            leaderboard.players.push({player, score});
        }
    }
    leaderboard.players.sort((item1: {player: Player, score: number}, item2: {player: Player, score: number}) =>
        item2.score - item1.score);
    db.saveLeaderboard(leaderboard);
}


