import getRoutes from "../../utils/routes";
import {Api, User, Player, UserLoginData, GameType, SuggestedWord} from "../../utils/Types/types";
import React from "react";

export const ApiContext = React.createContext<Api>({} as Api);

class ApiProvider extends React.Component<{}, {}> {
    private apiMethods: Api = new ApiMethods();

    render() {
        return (
            <ApiContext.Provider value={this.apiMethods}>
                {this.props.children}
            </ApiContext.Provider>
        );
    }
}

class ApiMethods implements Api {
    private _gameId: null | string = localStorage.getItem('gameId');
    user: User | undefined = undefined;

    changeGameId = (gameId: string): void => {
        this._gameId = gameId;
    };

    addGame = async (): Promise<void> => {
        await fetch(getRoutes(this._gameId).gameId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        });
    };

    getUserLoginData = async (): Promise<UserLoginData> => {
        const res = await fetch(getRoutes().login);
        const data = await res.text();
        return JSON.parse(data);
    };

    signup = async (name: string, password: string, avatar: string | ArrayBuffer | null): Promise<User | undefined> => {
        const response = await fetch(getRoutes().signup, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({name, password, avatar})
        });
        const user = await response.json();
        this.user = user;
        return user;
    };

    getAllUsers = async (): Promise<User[]> => {
        const res = await fetch(getRoutes().signup);
        const data = await res.text();
        return JSON.parse(data);
    };

    login = async (name: string, password: string): Promise<User | undefined> => {
        const response = await fetch(getRoutes().login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({name, password})
        });
        const user = await response.json();
        this.user = user;
        return user;
    };

    checkAuthorization = async (): Promise<void> => {
        await fetch('/cookie-auth-protected-route', {credentials: 'include'});
    };

    getAllGames = async (): Promise<GameType[]> => {
        const res = await fetch(getRoutes().app);
        const data = await res.text();
        return JSON.parse(data);
    };

    getGame = async (): Promise<GameType> => {
        const res = await fetch(getRoutes(this._gameId).gameId);
        const data = await res.text();
        return JSON.parse(data);
    };

    clearCountdown = async (): Promise<void> => {
        await fetch(getRoutes(this._gameId).clearCountdown, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
    };

    sendLineToServer = async (line: any): Promise<void> => {
        await fetch(getRoutes(this._gameId).addLine, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({line})
        });
    };

    getLeaderboardDataFromServer = async (): Promise<[userId: string, score: number][]> => {
        const res = await fetch(getRoutes().leaderboard);
        const data = await res.text();
        return JSON.parse(data);
    };

    getSuggestWordsFromServer = async (): Promise<SuggestedWord[]> => {
        const res = await fetch(getRoutes().suggestedWords);
        const data = await res.text();
        return JSON.parse(data);
    };

    deleteLine = async (): Promise<void> => {
        await fetch(getRoutes(this._gameId).deleteLine, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
    };
}

export default ApiProvider;