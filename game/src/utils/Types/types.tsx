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
    painter: Player;
    img: string;
    chatMessages: Message[];
    time: number;
    winner: string;
    lines: Line[];
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