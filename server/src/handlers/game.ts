import fs from "fs-extra";
import {GameType, SuggestedWord} from "../utils/types";

export const GAME_TIME: number = 3 * 60;
export const timerIds: any = {}; //TODO разобраться с типом TimerIds

export const suggestedWords: SuggestedWord[] = [];

export const games: GameType[] = [];

export const getAllGames = (req:any, res:any) => {
    res.status(200).send(games);
};

export const getSuggestedWords = (req:any, res:any) => {
    res.status(200).send(suggestedWords);
};

export const getLeaderboard = (req:any, res:any) => {
    const leaderboard = fs.readJsonSync('./src/utils/leaderboard.json');
    res.status(200).send(leaderboard.players);
};

export const getCurrentGame = (req:any, res:any) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    res.status(200).send(currentGame);
};

export const addGame = (req:any, res:any) => {
    games.push({
        id: req.params.gameId,
        players: [],
        wordToGuess: '',
        painter: {name:'', avatar: null},
        img: '',
        chatMessages: [],
        time: GAME_TIME,
        winner: '',
        scores: [],
        isWordGuessed: false,
        isTimeOver: false,
        isGameOver: false,
        lines: [],
    });
    res.status(200).send(games);
};

export const addLine = (req:any, res:any) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.lines.push(req.body.line);
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
};

export const deleteLine = (req: any, res: any) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.lines.pop();
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
};

export const clearCountdown = (req:any, res:any) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        clearTimeout(timerIds[currentGame.id]);
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
};

export const setTimeIsOver = (req:any, res:any) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.isTimeOver = true;
        currentGame.isGameOver = true;
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
};


