import React, {Component} from 'react';
import './Game.css';
import Timer from './Timer';
import Canvas from "./Canvas";
import Chat from "./Chat";
import ListOfPlayers from "./ListOfPlayers";
import words from "./words";

type gameState = {
    wordToGuess: string | undefined;
}

class Game extends Component<any, any> {
    constructor(props:any) {
        super(props);
        this.state = {
            wordToGuess: getRandomWord(),
            painter: getPainter(this),
        }
    }
    render() {
        return (
            <div className="Game">
                <header>
                    <div className="Game-Word">Загаданное слово: {this.state.wordToGuess}</div>
                    <Timer />
                </header>
                <main>
                    <Canvas />
                    <ListOfPlayers players={this.props.players} painter={this.state.painter}/>
                </main>
                <Chat />
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
