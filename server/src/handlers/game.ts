import fs from "fs-extra";
import {GameType, SuggestedWord} from "../utils/types";
import express from 'express';

export const GAME_TIME: number = 3 * 60;
export const timerIds: { [id: string] : ReturnType<typeof setTimeout> } = {}; //TODO разобраться с типом TimerIds

export const suggestedWords: SuggestedWord[] = [];

export const games: GameType[] = [];

export const getAllGames = (req: express.Request, res: express.Response) => {
    res.status(200).send(games);
};

export const getSuggestedWords = (req: express.Request, res: express.Response) => {
    res.status(200).send(suggestedWords);
};

export const getLeaderboard = (req: express.Request, res: express.Response) => {
    const leaderboard = fs.readJsonSync('./src/utils/leaderboard.json');
    res.status(200).send(leaderboard.players);
};

export const getCurrentGame = (req: express.Request, res: express.Response) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    res.status(200).send(currentGame);
};

export const addGame = (req: express.Request, res: express.Response) => {
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

export const addLine = (req: express.Request, res: express.Response) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.lines.push(req.body.line);
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
};

export const deleteLine = (req: express.Request, res: express.Response) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.lines.pop();
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
};

export const clearCountdown = (req: express.Request, res: express.Response) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        clearTimeout(timerIds[currentGame.id]);
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
};

export const setTimeIsOver = (req: express.Request, res: express.Response) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.isTimeOver = true;
        currentGame.isGameOver = true;
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
};


