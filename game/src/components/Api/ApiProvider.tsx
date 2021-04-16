import getRoutes from "../../utils/routes";
import React from "react";
import {log} from "util";

interface LocalLeaderboardType {
    playerName: string;
    score: number;
}

interface UserLoginData {
    loggedIn: boolean;
    user: User;
}

interface User {
    id: string;
    name: string;
    password: string;
    avatar?: string | ArrayBuffer | null;
}

interface Api {
    addGame: () => Promise<void>;
    getUserLoginData: () => Promise<UserLoginData>;
    signup: (name: string, password: string, avatar: string | ArrayBuffer | null) => Promise<void>;
    getAllUsers: () => Promise<User[]>;
    login: (name: string, password: string) => Promise<Response>;
    checkAuthorization: () => void;
    changeGameId: (gameId: string) => void;
    getAllGames: () => Promise<GameType[]>;
    getGame: () => Promise<GameType>;
    clearCountdown: () => void;
    sendLineToServer: (line: string) => void;
    pushScoreToLeaderboard: (localLeaderboard: LocalLeaderboardType[]) => void;
    getLeaderboardDataFromServer: () => Promise<[userId: string, score: number][]>;
    getSuggestWordsFromServer: () => Promise<SuggestedWord[]>;
    deleteLine: () => void;
}

interface SuggestedWord {
    id: string;
    word: string;
    likes: string[];
    dislikes: string[];
    isApproved: boolean;
    isDeclined: boolean;
    isInDictionary: boolean;
}

interface GameType {
    id: string;
    players: Player[];
    wordToGuess: string;
    painter: Player;
    img: string;
    chatMessages: Message[];
    time: number;
    winner: string;
    lines: any[]; //TODO разобраться с типом
}
interface Message {
    id: string;
    name: string;
    avatar: string | ArrayBuffer | null;
    text: string;
    marks: {
        hot: boolean;
        cold: boolean;
    };
}
interface Player {
    name: string,
    avatar: string | ArrayBuffer | null;
}

export const ApiContext = React.createContext<Api>({} as Api);

class ApiProvider extends React.Component<{}, {}> {
    private _gameId: null | string = localStorage.getItem('gameId');

    render() {
        const {
            addGame,
            getUserLoginData,
            signup,
            getAllUsers,
            login,
            checkAuthorization,
            changeGameId,
            getAllGames,
            getGame,
            clearCountdown,
            sendLineToServer,
            pushScoreToLeaderboard,
            getLeaderboardDataFromServer,
            getSuggestWordsFromServer,
            deleteLine,
            props: {children}
        } = this;

        return (
            <ApiContext.Provider value={{
                addGame,
                getUserLoginData,
                signup,
                getAllUsers,
                login,
                checkAuthorization,
                changeGameId,
                getAllGames,
                getGame,
                clearCountdown,
                sendLineToServer,
                pushScoreToLeaderboard,
                getLeaderboardDataFromServer,
                getSuggestWordsFromServer,
                deleteLine,
            }}>
                {children}
            </ApiContext.Provider>
        );
    }


    changeGameId = (gameId: string) => {
        this._gameId = gameId;
    };

    addGame = async () => {
        await fetch(getRoutes(this._gameId).gameId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        });
    };

    getUserLoginData = async () => {
        const res = await fetch(getRoutes().login);
        const data = await res.text();
        return JSON.parse(data);
    };

    signup = async (name:string, password:string, avatar: string | ArrayBuffer | null) => {
        const response = await fetch(getRoutes().signup, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({name, password, avatar})
        });
        const user = await response.json();
        return user;
    }

    getAllUsers = async () => {
        const res = await fetch(getRoutes().signup);
        const data = await res.text();
        return JSON.parse(data);
    }

    login = async (name: string, password: string) => {
        const response = await fetch(getRoutes().login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({name, password})
        });
        const user = await response.json();
        return user;
    };

    checkAuthorization = async () => {
        await fetch('/cookie-auth-protected-route', {credentials: 'include'});
    }

    getAllGames = async () => {
        const res = await fetch(getRoutes().app);
        const data = await res.text();
        return JSON.parse(data);
    };

    getGame = async () => {
        const res = await fetch(getRoutes(this._gameId).gameId);
        const data = await res.text();
        return JSON.parse(data);
    };

    clearCountdown = async () => {
        await fetch(getRoutes(this._gameId).clearCountdown, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
    };

    sendLineToServer = async (line: any) => {
        await fetch(getRoutes(this._gameId).addLine, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({line})
        });
    };

    pushScoreToLeaderboard = (localLeaderboard: LocalLeaderboardType[]) => {
        fetch(getRoutes().leaderboard, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(localLeaderboard)
        });
    };

    getLeaderboardDataFromServer = async () => {
        const res = await fetch(getRoutes().leaderboard);
        const data = await res.text();
        const leaderboard = JSON.parse(data);
        return leaderboard.sort((item1: {player: Player, score: number}, item2: {player: Player, score: number}) => item2.score - item1.score);
    };

    getSuggestWordsFromServer = async () => {
        const res = await fetch(getRoutes().suggestedWords);
        const data = await res.text();
        return JSON.parse(data);
    };
    deleteLine = () => {
        fetch(getRoutes(this._gameId).deleteLine, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
    }
}

export default ApiProvider;