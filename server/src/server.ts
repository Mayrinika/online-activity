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
import {
    getAllUsers,
    signup,
    getUserLoginData,
    login,
    logout,
    changePassword,
    changeAvatar
} from './handlers/user';
import {
    getAllGames,
    getSuggestedWords,
    getLeaderboard,
    getPossibleGames,
    getCurrentGame,
    addGame,
    addLine,
    deleteLine,
    clearCountdown,
    setTimeIsOver
} from "./handlers/game";
import * as wsMethods from './handlers/websocketMethods';
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

//app.use(express.static(path.join(__dirname + 'build')));

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

/*app.get('/static/!**', function (req, res) {
    const url = req.path.split('static')[1];
    const file = path.join(__dirname, 'build', 'static', url);
    res.sendFile(file);
});

app.get('/!*.(ico|png|txt|json)', function (req, res) {
    const url = req.path.split('/')[1];
    const file = path.join(__dirname, 'build', url);
    res.sendFile(file);
});*/

app.get('/api/games', getAllGames);

//user routes
app.get('/api/signup', getAllUsers);
app.post('/api/signup', signup);
app.get('/api/login', getUserLoginData);
app.post('/api/login', login);
app.post('/api/logout', logout);
app.post('/api/changePassword', changePassword);
app.post('/api/changeAvatar', changeAvatar);
//game routes
app.get('/api/suggestedWords', getSuggestedWords);
app.get('/api/leaderboard', getLeaderboard);
app.get('/api/possibleGames', getPossibleGames);

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

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const {messageType, parsedMessage, gameId, currentGame, suggestedWord, author} = wsMethods.parse(message as string);
        switch (messageType) {
        case WebsocketMessage.sendSuggestedWordToServer:
            wsMethods.sendSuggestedWordToServer(parsedMessage, wss);
            break;
        case WebsocketMessage.likeWord:
            wsMethods.likeWord(suggestedWord, author, wss);
            break;
        case WebsocketMessage.dislikeWord:
            wsMethods.dislikeWord(suggestedWord, author, wss);
            break;
        case WebsocketMessage.register:
            wsMethods.register(parsedMessage, currentGame, gameId, ws);
            break;
        case WebsocketMessage.refresh:
            wsMethods.refresh(gameId, ws, currentGame);
            break;
        case WebsocketMessage.addWordAndPainter:
            wsMethods.addWordAndPainter(currentGame, gameId);
            break;
        case WebsocketMessage.sendMessage:
            wsMethods.sendMessage(currentGame, parsedMessage, gameId);
            break;
        case WebsocketMessage.postMarks:
            wsMethods.postMarks(currentGame, parsedMessage, gameId);
            break;
        case WebsocketMessage.setWinner:
            wsMethods.setWinner(currentGame, parsedMessage, gameId);
            break;
        case WebsocketMessage.sendImg:
            wsMethods.sendImg(currentGame, parsedMessage, gameId);
            break;
        }
    });
});
