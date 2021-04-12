import {Component} from 'react';
import getRoutes from "../../utils/routes";

interface LocalLeaderboardType {
    playerName: string;
    score: number;
}

class ApiClient extends Component<any, any> {
    private _gameId: string | undefined; //TODO
    constructor(props: any) {
        super(props);
        this._gameId = props;
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
        return  Object.entries(leaderboard as { [playerName: string]: number })
            .sort((a, b) => b[1] - a[1]);
    };

    getSuggestWordsFromServer = async () => {
        const res = await fetch(getRoutes().suggestedWords);
        const data = await res.text();
        return  JSON.parse(data);
    };
}

export default ApiClient;