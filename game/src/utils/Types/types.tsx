import {GetSet} from "konva/types/types";
import {Stage} from "konva/types/Stage";

export interface Api {
    user?: User | null;
    changeGameId: (gameId: string) => void;
    addGame: () => Promise<void>;
    getUserLoginData: () => Promise<UserLoginData>;
    signup: (name: string, password: string, avatar: string | ArrayBuffer | null) => Promise<User>;
    getAllUsers: () => Promise<User[]>;
    login: (name: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    getAllGames: () => Promise<GameType[]>;
    getGame: () => Promise<GameType>;
    clearCountdown: () => Promise<void>;
    sendLineToServer: (line: Line) => Promise<void>;
    getLeaderboardDataFromServer: () => Promise<[userId: string, score: number][]>;
    getSuggestWordsFromServer: () => Promise<SuggestedWord[]>;
    deleteLine: () => Promise<void>;
    changePassword: (oldPassword: string, newPassword: string, name: string) => Promise<boolean>;
    changeAvatar: (oldPassword: string, newAvatar: string, name: string) => Promise<User>;
}

export interface UserLoginData {
    loggedIn: boolean;
    user: User;
}

export interface User {
    id: string;
    name: string;
    password: string;
    avatar?: string | ArrayBuffer | null;
}

export interface SuggestedWord {
    id: string;
    word: string;
    likes: string[];
    dislikes: string[];
    isApproved: boolean;
    isDeclined: boolean;
    isInDictionary: boolean;
}

export interface GameType {
    id: string;
    players: Player[];
    wordToGuess: string;
    isWordGuessed: boolean;
    isGameOver: boolean;
    isTimeOver: boolean
    painter: Player;
    img: string;
    chatMessages: Message[];
    time: number;
    winner: string;
    lines: Line[];
    scores: { player: Player, score: number }[]
}

export interface Message {
    id: string;
    name: string;
    avatar: string | ArrayBuffer | null;
    text: string;
    marks: {
        hot: boolean;
        cold: boolean;
    };
}

export interface Player {
    name: string,
    avatar: string | ArrayBuffer | null;
}

export interface Line {
    tool: string;
    points: GetSet<number, Stage>[];
    color: string;
}

export interface Message {
    id: string;
    name: string;
    avatar: string | ArrayBuffer | null;
    text: string;
    marks: {
        hot: boolean;
        cold: boolean;
    };
}