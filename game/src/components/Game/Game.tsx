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
    isTimeOver: boolean;
    isGameOver: boolean;
    isWordGuessed: boolean;
    imgURL: string;
    players: string[];
    winner: string
    currentGameId: string | null;
    currentPlayer: string | null;
}

interface gameProps {}

class Game extends Component<gameProps, gameState> {
    constructor(props: gameProps) {
        super(props);
        this.state = {
            wordToGuess: '',
            painter: '',
            isTimeOver: false,
            isGameOver: false,
            isWordGuessed: false,
            imgURL: '',
            players: [],
            winner: '',
            currentPlayer: null,
            currentGameId: null
        }
    }

    async componentDidMount() {
        this.setState({
            currentGameId: localStorage.getItem('id'),
            currentPlayer: localStorage.getItem('name')
        });
        await this.getDataFromServer();
    }

    timeIsOver = async () => {
        this.setState({isTimeOver: true});
        await this.clearCountdown();
    }

    wordIsGuessed = async () => {
        this.setState({isWordGuessed: true});
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
        const res = await fetch(getRoutes(localStorage.getItem('id')).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        this.setState({imgURL: game.img, wordToGuess: game.wordToGuess, painter: game.painter, players: game.players});
    }

    render() {
        const {painter, wordToGuess, players, imgURL, currentPlayer, currentGameId} = this.state;
        const wordToDisplay = (currentPlayer === painter) ?
            `Загаданное слово: ${wordToGuess}`
            : 'Отгадайте слово!';
        const guessers = [...players];
        guessers.splice(players.indexOf(painter), 1);
        const isPainter = currentPlayer === painter;
        const gameIsOver: boolean = this.state.isTimeOver || this.state.isWordGuessed;
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
                        <Chat isPainter={isPainter} wordIsGuessed={this.wordIsGuessed}
                              wordToGuess={this.state.wordToGuess}/>
                    </aside>
                </main>
                {gameIsOver && <GameOver isTimeOver={this.state.isTimeOver} wordToGuess={this.state.wordToGuess}
                                         isWordGuessed={this.state.isWordGuessed}/>}
            </div>
        );
    }
}

export default Game;
