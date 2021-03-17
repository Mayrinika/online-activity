import React, {Component} from 'react';
import './Game.css';
import Timer from '../Timer/Timer';
import Canvas from "../Canvas/Canvas";
import Chat from "../Chat/Chat";
import ListOfPlayers from "../ListOfPlayers/ListOfPlayers";
import words from "../../utils/words";
const TIME: number = 3*60;
import getRoutes from '../../utils/routes';

type gameState = {
    wordToGuess: string;
    painter: string;
    timeIsOver: boolean;
    gameIsOver: boolean;
    imgURL: string;
}

type gameProps = {
    players: string[];
    currentPlayer: string;
    currentGameId: string;
}

class Game extends Component<gameProps, gameState> {
    constructor(props: gameProps) {
        super(props);
        this.state = {
            wordToGuess: getRandomWord(),
            painter: getPainter(this),
            timeIsOver: false,
            gameIsOver: false,
            imgURL: ''
        }
    }
    async componentDidMount() {
        await this.getImage();
    }

    timeIsOver = () => {
        this.setState({ timeIsOver: true });
    }
    getImage = async () => {
        const res = await fetch(getRoutes(this.props.currentGameId).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        console.log(game, game.img);
        this.setState({ imgURL: game.img});
    }
    render() {
        const wordToDisplay = (this.props.currentPlayer === this.state.painter) ? this.state.wordToGuess : this.state.wordToGuess.replace(/[А-Яа-я]/g,'?'); //либо убрать регулярку, либо не показывать вопросительные знаки вместо слова. В общем, решить, что будут видеть "нехудожники"
        const guessers = [...this.props.players];
        guessers.splice(this.props.players.indexOf(this.state.painter), 1);
        const isPainter = this.props.currentPlayer === this.state.painter
        return (
            <div className="Game">
                <header>
                    <div className="Game-Word">Загаданное слово: {wordToDisplay}</div>
                    <Timer time={TIME} timeIsOver={this.timeIsOver}/>
                </header>
                <main>
                    {isPainter ? <Canvas currentGameId={this.props.currentGameId}/> : <img src={this.state.imgURL} alt='img from server'/>}
                    <aside>
                        <ListOfPlayers players={guessers} painter={this.state.painter}/>
                        <Chat currentPlayer={this.props.currentPlayer} currentGameId={this.props.currentGameId}/>
                    </aside>
                </main>
            </div>
        );
    }
}

function getRandomWord(): string {
    let randomIdx = Math.floor(Math.random()*words.length);
    return words[randomIdx];
}

function getPainter(game: Game): string {
    let randomIdx = Math.floor(Math.random()*game.props.players.length);
    return game.props.players[randomIdx];
}

export default Game;
