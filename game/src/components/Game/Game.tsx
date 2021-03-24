import React, {Component} from 'react';
import {RouteComponentProps} from 'react-router-dom';
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
    isGameOver: boolean;
    imgURL: string;
    players: string[];
    currentGameId: string | null;
    currentPlayer: string | null;
}

interface gameProps extends RouteComponentProps {
}

class Game extends Component<gameProps, gameState> {
    constructor(props: gameProps) {
        super(props);
        this.state = {
            wordToGuess: '',
            painter: '',
            isGameOver: false,
            imgURL: '',
            players: [],
            currentPlayer: null,
            currentGameId: null
        }
    }

    async componentDidMount() {
        this.setState({
            currentGameId: localStorage.getItem('id'),
            currentPlayer: localStorage.getItem('name')
        }, (async () => await this.getDataFromServer()));
    }

    componentDidUpdate() {
        if (this.state.isGameOver) this.gameOver();
    }

    timeIsOver = async () => {
        await this.clearCountdown();
        await this.setTimeIsOver();
    }

    wordIsGuessed = async () => {
        await this.clearCountdown();
        await this.setWinner();
    }

    clearCountdown = async () => {
        await fetch(getRoutes(this.state.currentGameId).clearCountdown, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        });
    }

    setWinner = async () => {
        await fetch(getRoutes(this.state.currentGameId).setWinner, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({winner: localStorage.getItem('name')})
        });
    }

    setTimeIsOver = async () => {
        await fetch(getRoutes(localStorage.getItem('id')).setTimeIsOver, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
        });
    }

    getDataFromServer = async () => {
        const res = await fetch(getRoutes(localStorage.getItem('id')).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        this.setState({
            imgURL: game.img,
            wordToGuess: game.wordToGuess,
            painter: game.painter,
            players: game.players,
            isGameOver: game.isGameOver,
        });
    }

    gameOver = () => {
        this.props.history.push(`/${localStorage.getItem('id')}/game-over`);
    }

    render() {
        const {painter, wordToGuess, players, imgURL, currentPlayer, currentGameId} = this.state;
        const wordToDisplay = (currentPlayer === painter) ?
            `Загаданное слово: ${wordToGuess}`
            : 'Отгадайте слово!';
        const guessers = [...players];
        guessers.splice(players.indexOf(painter), 1);
        const isPainter = currentPlayer === painter;

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
                              wordToGuess={wordToGuess}/>
                    </aside>
                </main>
            </div>
        );
    }
}

export default Game;
