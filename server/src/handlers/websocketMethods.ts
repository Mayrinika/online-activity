import {GAME_TIME, games, suggestedWords, timerIds} from "./game";
import db from "../db";
import {GameType, Message, Player, SuggestedWord, User} from "../utils/types";
import WebSocket from "ws";

const webSockets: { [id: string]: WebSocket[] } = {};

export function parse(message: string) {
    const parsedMessage = JSON.parse(message);
    const messageType = parsedMessage.messageType;
    const gameId = parsedMessage.gameId;
    const currentGame = games.find(game => game.id === gameId) || games[0]; //TODO придумать как обрабатывать вариант, когда currentGame===undefined
    const suggestedWord = suggestedWords.find(word => word.id === parsedMessage.wordId) || suggestedWords[0]; //TODO придумать как обрабатывать вариант, когда suggestedWord===undefined
    const author = parsedMessage.author;
    return {messageType, parsedMessage, gameId, currentGame, suggestedWord, author};
}

export function sendSuggestedWordToServer(parsedMessage: { word: string, id: string }, wss: WebSocket.Server): void {
    const dictionary = db.getWords();
    if (dictionary.words.includes(parsedMessage.word)) {
        addSuggestedWord(parsedMessage, true);
        sendSuggestedWordsToAllClients(wss);
        const wordToDelete = suggestedWords.find(el => el.word === parsedMessage.word);
        deleteElementFromArray(suggestedWords, wordToDelete);
    } else {
        addSuggestedWord(parsedMessage, false);
        sendSuggestedWordsToAllClients(wss);
    }
}

export function likeWord(suggestedWord: SuggestedWord, author: string, wss: WebSocket.Server): void {
    if (suggestedWord.dislikes.includes(author)) {
        deleteElementFromArray(suggestedWord.dislikes, author);
    } else if (!suggestedWord.likes.includes(author)) {
        suggestedWord.likes.push(author);
    }
    sendSuggestedWordsToAllClients(wss);
    if (suggestedWord.likes.length > 2) {
        suggestedWord.isApproved = true;
        sendSuggestedWordsToAllClients(wss);
        addNewWordToDictionary(suggestedWord.word);
        deleteElementFromArray(suggestedWords, suggestedWord);
    }
}

export function dislikeWord(suggestedWord: SuggestedWord, author: string, wss: WebSocket.Server): void {
    if (suggestedWord.likes.includes(author)) {
        deleteElementFromArray(suggestedWord.likes, author);
    } else if (!suggestedWord.dislikes.includes(author)) {
        suggestedWord.dislikes.push(author);
    }
    sendSuggestedWordsToAllClients(wss);
    if (suggestedWord.dislikes.length > 2) {
        suggestedWord.isDeclined = true;
        sendSuggestedWordsToAllClients(wss);
        deleteElementFromArray(suggestedWords, suggestedWord);
    }
}

export function register(parsedMessage: { player: string }, currentGame: GameType, gameId: string, ws: WebSocket): void {
    const users = db.getUsers();
    const user = users.find((user: User) => user.name === parsedMessage.player);
    const avatar = user ? user.avatar : null;
    addPlayer(currentGame, parsedMessage.player, avatar);
    addNewWebSocketClient(gameId, ws);
    sendGameToClientsByGameId(gameId, currentGame);
}

export function refresh(gameId: string, ws: WebSocket, currentGame: GameType): void {
    addNewWebSocketClient(gameId, ws);
    sendGameToClientsByGameId(gameId, currentGame);
}

export function addWordAndPainter(currentGame: GameType, gameId: string): void {
    chooseWordToGuess(currentGame);
    choosePainter(currentGame);
    setTimerForGame(currentGame, gameId);
}

export function sendMessage(currentGame: GameType, parsedMessage: { message: Message }, gameId: string): void {
    const foundPlayer = currentGame.players.find(player => player.name === parsedMessage.message.name);
    const newAvatar = foundPlayer ? foundPlayer.avatar : null;
    const newMessage = {...parsedMessage.message, avatar: newAvatar};
    currentGame.chatMessages.push(newMessage);
    sendGameToClientsByGameId(gameId, currentGame);
}

export function postMarks(currentGame: GameType, parsedMessage: { value: { id: string, marks: { hot: boolean, cold: boolean } } }, gameId: string): void {
    const currentMessage = currentGame.chatMessages
        .find(item => item.id === parsedMessage.value.id);
    if (currentMessage !== undefined) {
        currentMessage.marks = parsedMessage.value.marks;
        sendGameToClientsByGameId(gameId, currentGame);
    }
}

export function setWinner(currentGame: GameType, parsedMessage: { winner: string }, gameId: string): void {
    currentGame.winner = parsedMessage.winner;
    const winner = currentGame.players.find(player => player.name === parsedMessage.winner);
    currentGame.isWordGuessed = true;
    currentGame.isGameOver = true;
    addLocalScore(currentGame, winner);
    sendGameToClientsByGameId(gameId, currentGame);
    updateLeaderboard(currentGame.scores);
}

export function sendImg(currentGame: GameType, parsedMessage: { img: string }, gameId: string): void {
    currentGame.img = parsedMessage.img;
    sendGameToClientsByGameId(gameId, currentGame);
}

export function getRandomWord(words: string[]): string {
    const randomIdx = Math.floor(Math.random() * words.length);
    return words[randomIdx];
}

export function getPainter(players: Player[]): Player {
    const randomIdx = Math.floor(Math.random() * players.length);
    return players[randomIdx];
}

export function addPlayer(currentGame: GameType, name: string, avatar: string | null | ArrayBuffer): void {
    let isAlreadyExist = false;
    for (const player of currentGame.players) {
        if (player.name === name) {
            isAlreadyExist = true;
            break;
        }
    }
    if (!isAlreadyExist)
        currentGame.players.push({name: name, avatar: avatar});
}

export function sendSuggestedWordsToAllClients(wss: WebSocket.Server): void {
    wss.clients.forEach((client: { send: (arg0: string) => void; }) => {
        client.send(JSON.stringify(suggestedWords));
    });
}

export function addSuggestedWord(parsedMessage: { word: string, id: string }, inDictionary: boolean): void {
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

export function addNewWordToDictionary(word: string): void {
    const words = db.getWords();
    const newWords: { words?: string[] } = {};
    newWords.words = [...words.words, word];
    db.saveWords(newWords);
}

export function deleteElementFromArray<T>(array: T[], element: T): void {
    array.splice(array.indexOf(element), 1);
}

export function addNewWebSocketClient(gameId: string, ws: WebSocket): void {
    if (webSockets[gameId]) {
        webSockets[gameId].push(ws);
    } else {
        webSockets[gameId] = [ws];
    }
}

export function sendGameToClientsByGameId(gameId: string, currentGame: GameType): void {
    webSockets[gameId].forEach((client: { send: (arg0: string) => void; }) => {
        client.send(JSON.stringify(currentGame));
    });
}

export function chooseWordToGuess(currentGame: GameType): void {
    if (currentGame.wordToGuess === '') {
        const words = db.getWords().words;
        currentGame.wordToGuess = getRandomWord(words);
    }
}

export function choosePainter(currentGame: GameType): void {
    if (currentGame.painter.name === '') {
        currentGame.painter = getPainter(currentGame.players);
    }
}

export function setTimerForGame(currentGame: GameType, gameId: string): void {
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

export function addLocalScore(currentGame: GameType, winner: Player | undefined): void {
    if (currentGame.scores.length === 0) {
        currentGame.scores.push({player: currentGame.painter, score: currentGame.time});
        if (winner !== undefined) {
            currentGame.scores.push({player: winner, score: 50});
        }
        addScoreForMarks(currentGame);
    }
}

export function addScoreForMarks(currentGame: GameType): void {
    currentGame.chatMessages.map(message => {
        if (message.marks.hot) {
            const player = currentGame.scores.find(score => score.player.name === message.name);
            if (player) {
                if (player.score + 2 < 50) {
                    player.score += 2;
                }
            } else {
                const foundPlayer = currentGame.players.find(player => player.name === message.name);
                const avatar = foundPlayer ? foundPlayer.avatar : null;
                currentGame.scores.push({player: {name: message.name, avatar}, score: 2});
            }
        }
    });
}

export function updateLeaderboard(localScores: { player: Player, score: number }[]): void {
    const leaderboard = db.getLeaderboard();
    for (const {player, score} of localScores) {
        const playerFound = leaderboard.players.find((playerGlobal) => playerGlobal.player.name === player.name);
        if (playerFound) {
            playerFound.score += score;
        } else {
            leaderboard.players.push({player, score});
        }
    }
    leaderboard.players.sort((item1: { player: Player, score: number }, item2: { player: Player, score: number }) =>
        item2.score - item1.score);
    db.saveLeaderboard(leaderboard);
}