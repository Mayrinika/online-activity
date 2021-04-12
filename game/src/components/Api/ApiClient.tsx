import {Component} from 'react';
import getRoutes from "../../utils/routes";

class ApiClient extends Component<any, any> {
    private _gameId: string | undefined = undefined;
    constructor(props: any) {
        super(props);
        this.state = {
            gameId: ''
        };
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
    }

    getAllGames = async () => {
        const res = await fetch(getRoutes().app);
        const data = await res.text();
        return JSON.parse(data);
    };
}

export default ApiClient;