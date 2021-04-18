import getRoutes from "../../utils/routes";
import {Api, User, Player, UserLoginData, GameType, SuggestedWord} from "../../utils/Types/types";
import React from "react";

export const ApiContext = React.createContext<Api>({} as Api);

interface ApiProviderState {
    user: User | undefined;
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

    private setUser = (user?: User) => {
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
    private readonly setUser: (user?: User) => void;

    constructor(setUser: (user?: User) => void) {
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
            .catch(err => console.log('Something went wrong:', err));
    };

    getUserLoginData = async (): Promise<UserLoginData> => {
        const result = await fetch(getRoutes().login)
            .then(res => {
                this.checkStatus(res);
                return res;
            })
            .then(res => res.json())
            .catch(err => console.log('Something went wrong:', err));
        if (result.loggedIn)
            this.setUser(result.user);
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
            .catch(err => console.log('Something went wrong:', err));
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
            .catch(err => console.log('Something went wrong:', err));
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
            .catch(err => console.log('Something went wrong:', err));
        //this.user = user;
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
            .catch(err => console.log('Something went wrong:', err));
        this.setUser(undefined);
    };

    checkAuthorization = async (): Promise<void> => {
        await fetch('/cookie-auth-protected-route', {credentials: 'include'})
            .then(res => this.checkStatus(res))
            .catch(err => console.log('Something went wrong:', err));
    };

    getAllGames = async (): Promise<GameType[]> => {
        return await fetch(getRoutes().app)
            .then(res => {
                this.checkStatus(res);
                return res;
            })
            .then(res => res.json())
            .catch(err => console.log('Something went wrong:', err));
    };

    getGame = async (): Promise<GameType> => {
        return await fetch(getRoutes(this._gameId).gameId)
            .then(res => {
                this.checkStatus(res);
                return res;
            })
            .then(res => res.json())
            .catch(err => console.log('Something went wrong:', err));
    };

    clearCountdown = async (): Promise<void> => {
        await fetch(getRoutes(this._gameId).clearCountdown, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        })
            .then(res => res.json())
            .catch(err => console.log('Something went wrong:', err));
    };

    sendLineToServer = async (line: any): Promise<void> => {
        await fetch(getRoutes(this._gameId).addLine, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({line})
        })
            .then(res => res.json())
            .catch(err => console.log('Something went wrong:', err));
    };

    getLeaderboardDataFromServer = async (): Promise<[userId: string, score: number][]> => {
        return await fetch(getRoutes().leaderboard)
            .then(res => {
                this.checkStatus(res);
                return res;
            })
            .then(res => res.json())
            .catch(err => console.log('Something went wrong:', err));
    };

    getSuggestWordsFromServer = async (): Promise<SuggestedWord[]> => {
        return await fetch(getRoutes().suggestedWords)
            .then(res => {
                this.checkStatus(res);
                return res;
            })
            .then(res => res.json())
            .catch(err => console.log('Something went wrong:', err));
    };

    deleteLine = async (): Promise<void> => {
        await fetch(getRoutes(this._gameId).deleteLine, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        })
            .then(res => res.json())
            .catch(err => console.log('Something went wrong:', err));
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