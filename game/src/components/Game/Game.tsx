import React, {Component} from 'react';
import './Game.css';
import Timer from '../Timer/Timer';
import Canvas from "../Canvas/Canvas";
import Chat from "../Chat/Chat";
import ListOfPlayers from "../ListOfPlayers/ListOfPlayers";
import words from "../../utils/words";
import getRoutes from '../../utils/routes';
const TIME: number = 3*60;

type gameState = {
    wordToGuess: string;
    painter: string;
    timeIsOver: boolean;
    gameIsOver: boolean;
    imgURL: string;
    players: string[];
}

type gameProps = {
    currentPlayer: string;
    currentGameId: string;
}

class Game extends Component<gameProps, gameState> {
    constructor(props: gameProps) {
        super(props);
        this.state = {
            wordToGuess: '',
            painter: '',
            timeIsOver: false,
            gameIsOver: false,
            imgURL: '',
            players: []
        }
    }
    async componentDidMount() {
        await this.getDataFromServer();
    }

    timeIsOver = () => {
        this.setState({ timeIsOver: true });
    }
    getDataFromServer = async () => {
        const res = await fetch(getRoutes(this.props.currentGameId).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        this.setState({ imgURL: game.img, wordToGuess: game.wordToGuess, painter: game.painter, players: game.players});
    }
    render() {
        const wordToDisplay = (this.props.currentPlayer === this.state.painter) ? this.state.wordToGuess : this.state.wordToGuess.replace(/[А-Яа-я]/g,'?'); //TODO либо убрать регулярку, либо не показывать вопросительные знаки вместо слова. В общем, решить, что будут видеть "нехудожники"
        const guessers = [...this.state.players];
        guessers.splice(this.state.players.indexOf(this.state.painter), 1);
        const isPainter = this.props.currentPlayer === this.state.painter
        return (
            <div className="Game">
                <header>
                    <div className="Game-Word">Загаданное слово: {wordToDisplay}</div>
                    <Timer time={TIME} timeIsOver={this.timeIsOver}/>
                </header>
                <main>
                    {isPainter ?
                        <Canvas currentGameId={this.props.currentGameId}/> :
                        this.state.imgURL !== '' ?
                            <img src={this.state.imgURL} alt='img from server' /> :
                            <div className="Game emptyDiv"/>}
                    <aside>
                        <ListOfPlayers players={guessers} painter={this.state.painter}/>
                        <Chat currentPlayer={this.props.currentPlayer} currentGameId={this.props.currentGameId}/>
                    </aside>
                </main>
            </div>
        );
    }
}

export default Game;
