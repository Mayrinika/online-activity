import React, {Component} from 'react';

//components
import Timer from '../Timer/Timer';
import Canvas from "../Canvas/Canvas";
import Chat from "../Chat/Chat";
import ListOfPlayers from "../ListOfPlayers/ListOfPlayers";
import GameOver from "../GameOver/GameOver"
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
    wordIsGuessed: boolean;
    imgURL: string;
    players: string[];
    winner: string
}

interface gameProps {
    currentPlayer: string | null;
    currentGameId: string | null;
}

class Game extends Component<gameProps, gameState> {
    constructor(props: gameProps) {
        super(props);
        this.state = {
            wordToGuess: '',
            painter: '',
            timeIsOver: false,
            gameIsOver: false,
            wordIsGuessed: false,
            imgURL: '',
            players: [],
            winner: ''
        }
    }

    async componentDidMount() {
        await this.getDataFromServer();
    }

    timeIsOver = async () => {
        this.setState({timeIsOver: true});
        await this.clearCountdown();
    }

    wordIsGuessed = async () => {
        this.setState({wordIsGuessed: true});
        await this.clearCountdown();
        await this.setWinner();
    }

    clearCountdown = async () => {
        await fetch(getRoutes(localStorage.getItem('id')).clearCountdown, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        });
    }

    setWinner = async () => {
        await fetch(getRoutes(localStorage.getItem('id')).setWinner, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({winner: localStorage.getItem('name')})
        });
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
            `Загаданное слово: ${wordToGuess}`
            : 'Отгадайте слово!';
        const guessers = [...players];
        guessers.splice(players.indexOf(painter), 1);
        const isPainter = currentPlayer === painter;
        const gameIsOver: boolean = this.state.timeIsOver || this.state.wordIsGuessed;
        return (
            <div className="Game">
                <header>
                    <div className="Game-Word">{wordToDisplay}</div>
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
                        <Chat currentPlayer={currentPlayer} currentGameId={currentGameId} isPainter={isPainter}
                              wordIsGuessed={this.wordIsGuessed} wordToGuess={this.state.wordToGuess}/>
                    </aside>
                </main>
                {gameIsOver && <GameOver timeIsOver={this.state.timeIsOver} wordToGuess={this.state.wordToGuess}
                                         wordIsGuessed={this.state.wordIsGuessed}/>}
            </div>
        );
    }
}

export default Game;
