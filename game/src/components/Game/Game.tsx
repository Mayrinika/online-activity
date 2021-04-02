import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
//components
import Timer from '../Timer/Timer';
import Canvas from '../Canvas/Canvas';
import Chat from '../Chat/Chat';
import ListOfPlayers from '../ListOfPlayers/ListOfPlayers';
//utils
import getRoutes from '../../utils/routes';
//styles
import './Game.css';

interface GameState {
    wordToGuess: string;
    painter: string;
    isGameOver: boolean;
    imgURL: string;
    players: string[];
}

interface GameProps extends RouteComponentProps {
}

class Game extends Component<GameProps, GameState> {
    constructor(props: GameProps) {
        super(props);
        this.state = {
            wordToGuess: '',
            painter: '',
            isGameOver: false,
            imgURL: '',
            players: []
        };
    }

    async componentDidMount() {
        await this.getDataFromServer();
    }

    componentDidUpdate() {
        if (this.state.isGameOver) this.gameOver();
    }

    getDataFromServer = async () => {
        const res = await fetch(getRoutes(localStorage.getItem('gameId')).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        this.setState({
            imgURL: game.img,
            wordToGuess: game.wordToGuess,
            painter: game.painter,
            players: game.players,
            isGameOver: game.isGameOver
        });
    };

    gameOver = () => {
        this.props.history.push(`/${localStorage.getItem('gameId')}/game-over`);
    };

    render() {
        const { painter, wordToGuess, players, imgURL } = this.state;
        const playerName = localStorage.getItem('playerName');
        const wordToDisplay = (playerName === painter) ?
            `Загаданное слово: ${wordToGuess}`
            : 'Отгадайте слово!';
        const guessers = [...players];
        guessers.splice(players.indexOf(painter), 1);
        const isPainter = playerName === painter;

        return (
            <div className='Game'>
                <header>
                    <div className='Game-Word'>{wordToDisplay}</div>
                    <Timer />
                </header>
                <main>
                    {isPainter ?
                        <Canvas />
                        : imgURL !== '' ?
                            <img src={imgURL} alt='img from server' />
                            : <div className='Game emptyDiv' />}
                    <aside>
                        <ListOfPlayers players={guessers} painter={painter} />
                        <Chat isPainter={isPainter} wordToGuess={wordToGuess} painter={painter} />
                    </aside>
                </main>
            </div>
        );
    }
}

export default Game;
