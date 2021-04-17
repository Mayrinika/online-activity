export interface Api {
    user?: User;
    changeGameId: (gameId: string) => void;
    addGame: () => Promise<void>;
    getUserLoginData: () => Promise<UserLoginData>;
    signup: (name: string, password: string, avatar: string | ArrayBuffer | null) => Promise<User>;
    getAllUsers: () => Promise<User[]>;
    login: (name: string, password: string) => Promise<User>;
    checkAuthorization: () => Promise<void>;
    getAllGames: () => Promise<GameType[]>;
    getGame: () => Promise<GameType>;
    clearCountdown: () => Promise<void>;
    sendLineToServer: (line: string) => Promise<void>;
    getLeaderboardDataFromServer: () => Promise<[userId: string, score: number][]>;
    getSuggestWordsFromServer: () => Promise<SuggestedWord[]>;
    deleteLine: () => Promise<void>;
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
    points: number[];
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