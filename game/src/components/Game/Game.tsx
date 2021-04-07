import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
//components
import Timer from '../Timer/Timer';
import Canvas from '../Canvas/Canvas';
import Chat from '../Chat/Chat';
import ListOfPlayers from '../ListOfPlayers/ListOfPlayers';
//utils
import getRoutes from '../../utils/routes';
import getDomRoutes from "../../utils/domRoutes";
//styles
import './Game.css';

const newWS= new WebSocket('ws://localhost:8080');

interface GameState {
    wordToGuess: string;
    painter: string;
    isGameOver: boolean;
    imgURL: string;
    players: string[];
    chatMessages: Message[];
    time: number;
}

interface Message {
    id: string;
    name: string;
    text: string;
    marks: {
        hot: boolean;
        cold: boolean;
    };
}

interface GameProps extends RouteComponentProps {
    ws: any //todo поправить тип
}

class Game extends Component<GameProps, GameState> {
    constructor(props: GameProps) {
        super(props);
        this.state = {
            wordToGuess: '',
            painter: '',
            isGameOver: false,
            imgURL: '',
            players: [],
            chatMessages: [],
            time: 0
        };
    }

    async componentDidMount() {
        await this.getDataFromServer();
        if (this.props.ws) {
            this.props.ws.onmessage = (response: any) => {
                this.setState({
                    chatMessages: JSON.parse(response.data).chatMessages,
                    isGameOver: JSON.parse(response.data).isGameOver,
                    time: JSON.parse(response.data).time,
                    imgURL: JSON.parse(response.data).img,
                    players: JSON.parse(response.data).players
                });
            }
        }
        newWS.onmessage = (response: any) => {
            this.setState({
                chatMessages: JSON.parse(response.data).chatMessages,
                isGameOver: JSON.parse(response.data).isGameOver,
                time: JSON.parse(response.data).time,
                imgURL: JSON.parse(response.data).img
            });
        }
    }

    componentDidUpdate() {
        if (this.state.isGameOver) this.gameOver();
    }

    getDataFromServer = async () => {
        const send = function (message: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
            waitForConnection(function () {
                return newWS.send(message);
            }, 1000);
        };

        const waitForConnection = function (callback: () => void, interval: number) {
            if (newWS.readyState === 1) {
                callback();
            } else {
                setTimeout(function () {
                    waitForConnection(callback, interval);
                }, interval);
            }
        };
        send(JSON.stringify({'messageType':'refresh','gameId':localStorage.getItem('gameId')}));
        const res = await fetch(getRoutes(localStorage.getItem('gameId')).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        this.setState({
            imgURL: game.img,
            wordToGuess: game.wordToGuess,
            painter: game.painter,
            players: game.players,
            isGameOver: game.isGameOver,
            chatMessages: game.chatMessages,
            time: game.time,
        });
    };

    gameOver = () => {
        const {history, ws} = this.props;
        history.push(getDomRoutes(localStorage.getItem('gameId')).gameOver);
        ws.close();
        newWS.close();
    };

    sendMessage = (message: Message) => {
        this.props.ws.send(JSON.stringify({'messageType':'sendMessage','gameId':localStorage.getItem('gameId'), 'message':message}));
    }
    postMarks = (value: {id: string, marks: {hot: boolean, cold: boolean}}) => {
        this.props.ws.send(JSON.stringify({'messageType':'postMarks','gameId':localStorage.getItem('gameId'), 'value':value}));
    }
    setWinner = (winner: string | null) => {
        this.props.ws.send(JSON.stringify({'messageType':'setWinner','gameId':localStorage.getItem('gameId'), 'winner':winner}));
    }
    sendImg = (img: string) => {
        this.props.ws.send(JSON.stringify({'messageType':'sendImg','gameId':localStorage.getItem('gameId'), 'img':img}));
    }

    render() {
        const { painter, wordToGuess, players, imgURL, chatMessages } = this.state;
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
                    <Timer time={this.state.time}/>
                </header>
                <main>
                    {isPainter ?
                        <Canvas sendImg={this.sendImg}/>
                        : imgURL !== '' ?
                            <img src={imgURL} alt='img from server' />
                            : <div className='Game emptyDiv' />}
                    <aside>
                        <ListOfPlayers players={guessers} painter={painter} />
                        <Chat
                            isPainter={isPainter}
                            wordToGuess={wordToGuess}
                            painter={painter}
                            sendMessage={this.sendMessage}
                            chatMessages={chatMessages}
                            postMarks={this.postMarks}
                            setWinner={this.setWinner}
                        />
                    </aside>
                </main>
            </div>
        );
    }
}

export default Game;
