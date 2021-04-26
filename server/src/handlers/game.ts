import {GameType, SuggestedWord} from "../utils/types";
import express from 'express';
import db from "../db";

const MIN_GAME_TIME: number = 2 * 60;
export const GAME_TIME: number = 3 * 60;
export const timerIds: { [id: string]: ReturnType<typeof setTimeout> } = {};

export const suggestedWords: SuggestedWord[] = [];
export const games: GameType[] = [];

export const getAllGames = (req: express.Request, res: express.Response): void => {
    if (games)
        res.status(200).send(games);
    else
        res.status(404).send(`games not found`);
};

export const getSuggestedWords = (req: express.Request, res: express.Response): void => {
    if (suggestedWords)
        res.status(200).send(suggestedWords);
    else
        res.status(404).send(`suggestedWords not found`);
};

export const getLeaderboard = (req: express.Request, res: express.Response): void => {
    const leaderboard = db.getLeaderboard();
    if (leaderboard)
        res.status(200).send(leaderboard.players);
    else
        res.status(404).send(`leaderboard not found`);
};

export const getPossibleGames = (req: express.Request, res: express.Response): void => {
    const possibleGames = games.filter((game: GameType) => game.time > MIN_GAME_TIME);
    if (possibleGames)
        res.status(200).send(possibleGames);
    else
        res.status(404).send(`possibleGames not found`);
};

export const getCurrentGame = (req: express.Request, res: express.Response): void => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame)
        res.status(200).send(currentGame);
    else
        res.status(404).send(`game with id={${req.params.gameId}} not found`);
};

export const addGame = (req: express.Request, res: express.Response): void => {
    if (games) {
        games.push({
            id: req.params.gameId,
            players: [],
            wordToGuess: '',
            painter: {name: '', avatar: null},
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
    } else
        res.status(404).send(`games not found`);
};

export const addLine = (req: express.Request, res: express.Response): void => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.lines.push(req.body.line);
        res.status(200).send(games);
    } else {
        res.status(404).send(`game with id={${req.params.gameId}} not found`);
    }
};

export const deleteLine = (req: express.Request, res: express.Response): void => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.lines.pop();
        res.status(200).send(games);
    } else {
        res.status(404).send(`game with id={${req.params.gameId}} not found`);
    }
};

export const clearCountdown = (req: express.Request, res: express.Response): void => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        clearTimeout(timerIds[currentGame.id]);
        res.status(200).send(games);
    } else {
        res.status(404).send(`game with id={${req.params.gameId}} not found`);
    }
};

export const setTimeIsOver = (req: express.Request, res: express.Response): void => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.isTimeOver = true;
        currentGame.isGameOver = true;
        res.status(200).send(games);
    } else {
        res.status(404).send(`game with id={${req.params.gameId}} not found`);
    }
};


