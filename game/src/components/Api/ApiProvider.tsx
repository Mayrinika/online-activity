import getRoutes from "../../utils/routes";
import {Api, User, UserLoginData, GameType, SuggestedWord, Line} from "../../utils/Types/types";
import React from "react";

export const ApiContext = React.createContext<Api>({} as Api);

interface ApiProviderState {
    user: User | undefined | null;
}

class ApiProvider extends React.Component<{}, ApiProviderState> {
    private readonly apiMethods: Api;

    constructor(props: {}) {
        super(props);
        this.apiMethods = new ApiMethods(this.setUser);
        this.state = {
            user: undefined
        };
    }

    private setUser = (user: User | null): void => {
        this.setState({user});
    };

    componentDidMount() {
        this.apiMethods.getUserLoginData();
    }

    render() {
        return (
            <ApiContext.Provider value={{...this.apiMethods, user: this.state.user}}>
                {this.props.children}
            </ApiContext.Provider>
        );
    }
}

class ApiMethods implements Api {
    private _gameId: null | string = localStorage.getItem('gameId');
    private readonly setUser: (user: User | null) => void;

    constructor(setUser: (user: User | null) => void) {
        this.setUser = setUser;
    }

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
            .then(res => this.checkStatus(res))
            .catch(err => this.reportError(err));
    };

    getUserLoginData = async (): Promise<UserLoginData> => {
        const result = await fetch(getRoutes().login)
            .then(res => {
                this.checkStatus(res);
                return res;
            })
            .then(res => res.json())
            .catch(err => this.reportError(err));
        this.setUser(result.loggedIn ? result.user : null);
        return result;
    };

    signup = async (name: string, password: string, avatar: string | ArrayBuffer | null): Promise<User> => {
        const user = await fetch(getRoutes().signup, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({name, password, avatar})
        })
            .then(res => {
                this.checkStatus(res);
                return res;
            })
            .then(res => res.json())
            .catch(err => this.reportError(err));
        if (!user.error)
            this.setUser(user);
        return user;
    };

    getAllUsers = async (): Promise<User[]> => {
        return await fetch(getRoutes().signup)
            .then(res => {
                this.checkStatus(res);
                return res;
            })
            .then(res => res.json())
            .catch(err => this.reportError(err));
    };

    login = async (name: string, password: string): Promise<User> => {
        const user = await fetch(getRoutes().login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({name, password})
        })
            .then(res => {
                this.checkStatus(res);
                return res;
            })
            .then(res => res.json())
            .catch(err => this.reportError(err));
        if (!user.error)
            this.setUser(user);
        return user;
    };

    logout = async (): Promise<void> => {
        await fetch(getRoutes().logout, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        })
            .then(res => this.checkStatus(res))
            .catch(err => this.reportError(err));
        this.setUser(null);
    };

    checkAuthorization = async (): Promise<void> => {
        await fetch('/cookie-auth-protected-route', {credentials: 'include'})
            .then(res => this.checkStatus(res))
            .catch(err => this.reportError(err));
    };

    getAllGames = async (): Promise<GameType[]> => {
        return await fetch(getRoutes().app)
            .then(res => {
                this.checkStatus(res);
                return res;
            })
            .then(res => res.json())
            .catch(err => this.reportError(err));
    };

    getGame = async (): Promise<GameType> => {
        return await fetch(getRoutes(this._gameId).gameId)
            .then(res => {
                this.checkStatus(res);
                return res;
            })
            .then(res => res.json())
            .catch(err => this.reportError(err));
    };

    clearCountdown = async (): Promise<void> => {
        await fetch(getRoutes(this._gameId).clearCountdown, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        })
            .then(res => res.json())
            .catch(err => this.reportError(err));
    };

    sendLineToServer = async (line: Line): Promise<void> => {
        await fetch(getRoutes(this._gameId).addLine, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({line})
        })
            .then(res => res.json())
            .catch(err => this.reportError(err));
    };

    getLeaderboardDataFromServer = async (): Promise<[userId: string, score: number][]> => {
        return await fetch(getRoutes().leaderboard)
            .then(res => {
                this.checkStatus(res);
                return res;
            })
            .then(res => res.json())
            .catch(err => this.reportError(err));
    };

    getSuggestWordsFromServer = async (): Promise<SuggestedWord[]> => {
        return await fetch(getRoutes().suggestedWords)
            .then(res => {
                this.checkStatus(res);
                return res;
            })
            .then(res => res.json())
            .catch(err => this.reportError(err));
    };

    deleteLine = async (): Promise<void> => {
        await fetch(getRoutes(this._gameId).deleteLine, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        })
            .then(res => res.json())
            .catch(err => this.reportError(err));
    };

    private reportError(err: string): void {
        console.log('Something went wrong:', err);
    }

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
                throw new Error(serverResponse.error);
            }
            throw new Error(errorText);
        }
    }
}

export default ApiProvider;