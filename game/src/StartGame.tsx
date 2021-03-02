import React, {Component} from "react";
import Game from "./Game";
import './StartGame.css'

class StartGame extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state= {
            areYouReady: false,
        }
        this.startGame = this.startGame.bind(this);
    }
    startGame() {
        this.setState({areYouReady: true});
    }
    render() {
        const gameComponent = <Game players={this.props.players} currentPlayer={this.props.currentPlayer}/>
        const startGame =
            <div className="StartGame">
                <h3>Игроки: {this.props.players.join(', ')}</h3>
                <h3>Все игроки в сборе?</h3>
                <button onClick={this.startGame}>Да! Начать игру!</button>
            </div>
        return (
            this.state.areYouReady ? gameComponent : startGame
        );
    }
}

export default StartGame;