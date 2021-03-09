import React, {Component} from 'react';
import './Game.css';
import Timer from './Timer';
import Canvas from "./Canvas";
import Chat from "./Chat";
import ListOfPlayers from "./ListOfPlayers";
import words from "./words";
const TIME: number = 3*60;

type gameState = {
    wordToGuess: string | undefined;
}

class Game extends Component<any, any> {
    constructor(props:any) {
        super(props);
        this.state = {
            wordToGuess: getRandomWord(),
            painter: getPainter(this),
            timeIsOver: false,
            gameIsIOver: false
        }
        this.timeIsOver = this.timeIsOver.bind(this);
    }
    timeIsOver() {
        this.setState({ timeIsOver: true });
    }
    render() {

        const wordToDisplay = (this.props.currentPlayer === this.state.painter) ? this.state.wordToGuess : this.state.wordToGuess.replace(/[А-Яа-я]/g,'?');
        const guessers = [...this.props.players];
        guessers.splice(this.props.players.indexOf(this.state.painter), 1);
        return (
            <div className="Game">
                <header>
                    <div className="Game-Word">Загаданное слово: {wordToDisplay}</div>
                    <Timer time={TIME} timeIsOver={this.timeIsOver}/>
                </header>
                <main>
                    <Canvas />
                    <aside>
                        <ListOfPlayers players={guessers} painter={this.state.painter}/>
                        <Chat currentPlayer={this.props.currentPlayer}/>
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
