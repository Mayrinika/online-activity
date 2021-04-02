import React, {Component} from "react";
import {RouteComponentProps} from 'react-router-dom';
//components
//utils
import getRoutes from '../../utils/routes';
//styles
import './StartGame.css';

interface StartGameProps extends RouteComponentProps {
    ws: any
}

interface StartGameState {
    players: string[];
}

class StartGame extends Component<StartGameProps, StartGameState> {
    constructor(props: StartGameProps) {
        super(props);
        this.state = {
            players: [],
        }
    }

    async componentDidMount() {
        this.props.ws.onmessage = (response: any) => {
            this.setState({players: JSON.parse(response.data).players});
        }
    }

    startGame = async () => {
        await this.addWordAndPainter(localStorage.getItem('gameId'));
        this.props.history.push(`/${localStorage.getItem('gameId')}/game`);
    }

    addWordAndPainter = async (gameId: string | null) => {
        this.props.ws.send(JSON.stringify({'messageType':'addWordAndPainter','gameId':localStorage.getItem('gameId')}));
        // await fetch(getRoutes(gameId).addWordAndPainter, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json;charset=utf-8'
        //     },
        //     body: JSON.stringify({})
        // });
    }

    render() {
        const {players} = this.state;
        return (
            <div className="StartGame">
                <h3>Игроки: {players && players.join(', ')}</h3>
                <h3>Все игроки в сборе?</h3>
                <button onClick={this.startGame}>Да! Начать игру!</button>
            </div>
        );
    }
}

export default StartGame;