import React, {Component} from 'react';
import words from "../../utils/words";
//components
import Timer from '../Timer/Timer';
import Canvas from "../Canvas/Canvas";
import Chat from "../Chat/Chat";
import ListOfPlayers from "../ListOfPlayers/ListOfPlayers";
//utils
import getRoutes from '../../utils/routes';
//styles
import './Game.css';

const TIME: number = 3 * 60;

interface gameState {
    wordToGuess: string;
    painter: string;
    timeIsOver: boolean;
    gameIsOver: boolean;
    imgURL: string;
    players: string[];
}

interface gameProps {
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
        this.setState({timeIsOver: true});
    }

    getDataFromServer = async () => {
        const res = await fetch(getRoutes(this.props.currentGameId).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        this.setState({imgURL: game.img, wordToGuess: game.wordToGuess, painter: game.painter, players: game.players});
    }

    render() {
        const {painter, wordToGuess, players, imgURL} = this.state;
        const {currentPlayer, currentGameId} = this.props;
        const wordToDisplay = (currentPlayer === painter) ?
            wordToGuess
            : wordToGuess
                .replace(/[А-Яа-я]/g, '?'); //TODO либо убрать регулярку, либо не показывать вопросительные знаки вместо слова. В общем, решить, что будут видеть "нехудожники"
        const guessers = [...players];
        guessers.splice(players.indexOf(painter), 1);
        const isPainter = currentPlayer === painter;
        return (
            <div className="Game">
                <header>
                    <div className="Game-Word">Загаданное слово: {wordToDisplay}</div>
                    <Timer time={TIME} timeIsOver={this.timeIsOver}/>
                </header>
                <main>
                    {isPainter ?
                        <Canvas currentGameId={currentGameId}/>
                        : imgURL !== '' ?
                            <img src={imgURL} alt='img from server'/>
                            : <div className="Game emptyDiv"/>}
                    <aside>
                        <ListOfPlayers players={guessers} painter={painter}/>
                        <Chat currentPlayer={currentPlayer} currentGameId={currentGameId}/>
                    </aside>
                </main>
            </div>
        );
    }
}

export default Game;
