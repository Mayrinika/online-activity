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
        })
            .catch(err => this.checkStatus(err));
    };

    getUserLoginData = async (): Promise<UserLoginData> => {
        // return await fetch(getRoutes().login)
        //     .then(res => res.json())
        //     .catch(err => this.checkStatus(err));
        const res = await fetch(getRoutes().login);
        const data = await res.text();
        return JSON.parse(data);
    };

    signup = async (name: string, password: string, avatar: string | ArrayBuffer | null): Promise<User | undefined> => {
        await fetch(getRoutes().signup, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({name, password, avatar})
        })
            .then(res => res.json())
            .then(user => {
                this.user = user;
                if (this.user === undefined)
                    throw new Error('Failed to get user');
            })
            //.catch(err => this.checkStatus(err));
        return this.user;
    };

    getAllUsers = async (): Promise<User[]> => {
        const res = await fetch(getRoutes().signup);
        const data = await res.text();
        return JSON.parse(data);
        // return await fetch(getRoutes().signup)
        //     .then(res => res.json())
        //     .catch(err => this.checkStatus(err));
    };

    login = async (name: string, password: string): Promise<User | undefined> => {
        await fetch(getRoutes().login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({name, password})
        })
            .then(res => res.json())
            .then(user => {
                this.user = user;
                if (this.user === undefined)
                    throw new Error('Failed to get user');
            })
            //.catch(err => this.checkStatus(err)); //TODO
        return this.user;
    };

    checkAuthorization = async (): Promise<void> => {
        // await fetch('/cookie-auth-protected-route', {credentials: 'include'})
        //     .catch(err => this.checkStatus(err));
        await fetch('/cookie-auth-protected-route', {credentials: 'include'});
    };

    getAllGames = async (): Promise<GameType[]> => {
        // return await fetch(getRoutes().app)
        //     .then(res => res.json())
        //     .catch(err => this.checkStatus(err));
        const res = await fetch(getRoutes().app);
        const data = await res.text();
        return JSON.parse(data);
    };

    getGame = async (): Promise<GameType> => {
        // return await fetch(getRoutes(this._gameId).gameId)
        //     .then(res => res.json())
        //     .catch(err => this.checkStatus(err));
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
        })
            //.catch(err => this.checkStatus(err));
    };

    sendLineToServer = async (line: any): Promise<void> => {
        await fetch(getRoutes(this._gameId).addLine, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({line})
        })
            //.catch(err => this.checkStatus(err));
    };

    getLeaderboardDataFromServer = async (): Promise<[userId: string, score: number][]> => {
        const res = await fetch(getRoutes().leaderboard);
        const data = await res.text();
        return  JSON.parse(data);
       
        // const leaderboard = await fetch(getRoutes().leaderboard)
        //     .then(res => res.json())
        //     .catch(err => this.checkStatus(err));
        // return leaderboard.sort((item1: { player: Player, score: number }, item2: { player: Player, score: number }) =>
        //     item2.score - item1.score);
    };

    getSuggestWordsFromServer = async (): Promise<SuggestedWord[]> => {
        // return await fetch(getRoutes().suggestedWords)
        //     .then(res => res.json())
        //     .catch(err => this.checkStatus(err));
        const res = await fetch(getRoutes().suggestedWords);
        const data = await res.text();
        return JSON.parse(data);
    };

    deleteLine = async (): Promise<void> => {
        await fetch(getRoutes(this._gameId).deleteLine, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        })
            //.catch(err => this.checkStatus(err));
    };

    private async checkStatus(response: Response): Promise<void> {
        if (!(response.status >= 200 && response.status < 300)) {
            const errorText = await response.text();
            let serverResponse;
            try {
                serverResponse = JSON.parse(errorText);
            } catch (e) {
                serverResponse = undefined;
            }
            if (serverResponse !== undefined) {
                throw new Error(serverResponse.Message || serverResponse.message || serverResponse.Error);
            }
            throw new Error(errorText);
        }
    }
}

export default ApiProvider;