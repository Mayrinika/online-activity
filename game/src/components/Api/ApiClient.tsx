import React, {Component} from 'react';
import getRoutes from "../../utils/routes";

class ApiClient extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            gameId: ''
        };
    }

    changeGameId = (gameId: string) => {
        this.setState({gameId});
    };

    addGame = async (gameId: string) => {
        await fetch(getRoutes(gameId).gameId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        });
        console.log('addGame');
    }


}

export default ApiClient;