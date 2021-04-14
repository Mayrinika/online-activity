import getRoutes from "../../utils/routes";
import React from "react";

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
}

interface Api {
    addGame: () => Promise<void>;
    getUserLoginData: () => Promise<UserLoginData>;
    changeGameId: (gameId: string) => void;
    getAllGames: () => Promise<GameType[]>;
    getGame: () => Promise<GameType>;
    clearCountdown: () => void;
    sendLineToServer: (line: string) => void;
    pushScoreToLeaderboard: (localLeaderboard: LocalLeaderboardType[]) => void;
    getLeaderboardDataFromServer: () => Promise<[userId: string, score: number][]>;
    getSuggestWordsFromServer: () => Promise<SuggestedWord[]>;
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
    players: string[];
    wordToGuess: string;
    painter: string;
    img: string;
    chatMessages: string[];
    time: number;
    winner: string;
    lines: any[]; //TODO разобраться с типом
}

export const ApiContext = React.createContext<Api>({} as Api);

class ApiProvider extends React.Component<{}, {}> {
    private _gameId: null | string = localStorage.getItem('gameId');

    render() {
        const {
            addGame,
            getUserLoginData,
            changeGameId,
            getAllGames,
            getGame,
            clearCountdown,
            sendLineToServer,
            pushScoreToLeaderboard,
            getLeaderboardDataFromServer,
            getSuggestWordsFromServer,
            props: {children}
        } = this;

        return (
            <ApiContext.Provider value={{
                addGame,
                getUserLoginData,
                changeGameId,
                getAllGames,
                getGame,
                clearCountdown,
                sendLineToServer,
                pushScoreToLeaderboard,
                getLeaderboardDataFromServer,
                getSuggestWordsFromServer,
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
        return Object.entries(leaderboard as { [playerName: string]: number })
            .sort((a, b) => b[1] - a[1]);
    };

    getSuggestWordsFromServer = async () => {
        const res = await fetch(getRoutes().suggestedWords);
        const data = await res.text();
        return JSON.parse(data);
    };
}

export default ApiProvider;