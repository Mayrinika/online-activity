import fs from "fs-extra";
import {User, Player,} from "./utils/types";

const paths: { [path: string]: string } = {
    leaderboard: '/leaderboard.json',
    users: '/users.json',
    words: '/words.json',
};

const dbPrefix = '/db';

export function initializeDb(): void {
    if (!fs.ensureDir(dbPrefix))
        fs.mkdirsSync(dbPrefix);

    if (!fs.existsSync(__dirname + dbPrefix + paths.users))
        fs.outputFileSync(__dirname + dbPrefix + paths.users, '[]');
    if (!fs.existsSync(__dirname + dbPrefix + paths.leaderboard))
        fs.outputFileSync(__dirname + dbPrefix + paths.leaderboard, '{"players": []}');
    if (!fs.existsSync(__dirname + dbPrefix + paths.words))
        fs.outputFileSync(__dirname + dbPrefix + paths.words, '{"words": []}');
}

function getFile(path: string) { //TODO return type
    return fs.readJsonSync(__dirname + dbPrefix + path);
}

function writeToFile<T>(path: string, data: T) { //TODO return type
    fs.outputJsonSync(__dirname + dbPrefix + path, data);
}

export default {
    getLeaderboard: (): { players: { player: Player, score: number }[] } => getFile(paths.leaderboard),
    saveLeaderboard: (leaderboard: { players: { player: Player, score: number }[] }): void => writeToFile(paths.leaderboard, leaderboard),

    getUsers: (): User[] => getFile(paths.users),
    saveUsers: (users: User[]): void => writeToFile(paths.users, users),

    getWords: (): { words: string[] } => getFile(paths.words),
    saveWords: ({words}: { words?: string[] | undefined}): void => writeToFile(paths.words, words),
};