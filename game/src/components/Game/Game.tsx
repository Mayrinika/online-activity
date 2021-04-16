import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
//components
import Timer from '../Timer/Timer';
import Canvas from '../Canvas/Canvas';
import Chat from '../Chat/Chat';
import ListOfPlayers from '../ListOfPlayers/ListOfPlayers';
//utils
import getDomRoutes from "../../utils/domRoutes";
import checkLogin from "../../utils/checkLogin";
import {Player, Message} from "../../utils/Types/types";
//styles
import './Game.css';
import websocket from "../../utils/websocket";
import {ApiContext} from "../Api/ApiProvider";

let newWS: any;

interface GameState {
    wordToGuess: string;
    painter: Player;
    isGameOver: boolean;
    imgURL: string;
    players: Player[];
    chatMessages: Message[];
    time: number;
}

interface GameProps extends RouteComponentProps {
    setAuthorized: () => void;
}

class Game extends Component<GameProps, GameState> {
    static contextType = ApiContext;
    constructor(props: GameProps) {
        super(props);
        this.state = {
            wordToGuess: '',
            painter: {name: '', avatar: null},
            isGameOver: false,
            imgURL: '',
            players: [],
            chatMessages: [],
            time: 0
        };
        this.refreshConnection();
    }

    async componentDidMount() {
        await this.getDataFromServer();
        checkLogin(this.props.setAuthorized);
        newWS.onmessage = (response: any) => {
            if (JSON.parse(response.data).id === localStorage.getItem('gameId')) {
                this.setState({
                    chatMessages: JSON.parse(response.data).chatMessages,
                    isGameOver: JSON.parse(response.data).isGameOver,
                    time: JSON.parse(response.data).time,
                    imgURL: JSON.parse(response.data).img,
                    players: JSON.parse(response.data).players
                });
            }
        }
    }

    componentDidUpdate() {
        if (this.state.isGameOver) this.gameOver();
    }
    componentWillUnmount() {
        newWS.close();
    }
    getDataFromServer = async () => {
        this.refreshConnection();
        const game = await this.context.getGame();
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
    refreshConnection = () => {
        newWS = new WebSocket('ws://localhost:8080');
        const send = function (message: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
            waitForConnection(function () {
                return newWS.send(message);
            }, 500);
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
        send(JSON.stringify({'messageType':websocket.refresh,'gameId':localStorage.getItem('gameId')}));
    }

    gameOver = () => {
        const {history} = this.props;
        history.push(getDomRoutes(localStorage.getItem('gameId')).gameOver);
        newWS.close();
    };

    sendMessage = (message: Message) => {
        newWS.send(JSON.stringify({'messageType':websocket.sendMessage,'gameId':localStorage.getItem('gameId'), 'message':message}));
    }
    postMarks = (value: {id: string, marks: {hot: boolean, cold: boolean}}) => {
        newWS.send(JSON.stringify({'messageType':websocket.postMarks,'gameId':localStorage.getItem('gameId'), 'value':value}));
    }
    setWinner = (winner: string | null) => {
        newWS.send(JSON.stringify({'messageType':websocket.setWinner,'gameId':localStorage.getItem('gameId'), 'winner':winner}))
    }
    sendImg = (img: string) => {
        newWS.send(JSON.stringify({'messageType':websocket.sendImg,'gameId':localStorage.getItem('gameId'), 'img':img}));
    }

    render() {
        const { painter, wordToGuess, players, imgURL, chatMessages } = this.state;
        const playerName = localStorage.getItem('playerName');
        const wordToDisplay = (playerName === painter.name) ?
            `Загаданное слово: ${wordToGuess}`
            : 'Отгадайте слово!';
        const guessers = players.filter(player => player.name !== painter.name);
        const isPainter = playerName === painter.name;
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
