import React, {Component} from 'react';
import {RouteComponentProps} from 'react-router-dom';
//components
import Timer from '../Timer/Timer';
import Canvas from '../Canvas/Canvas';
import Chat from '../Chat/Chat';
import ListOfPlayers from '../ListOfPlayers/ListOfPlayers';
import {ApiContext} from "../Api/ApiProvider";
//utils
import getDomRoutes from "../../utils/domRoutes";
import {Player, Message} from "../../utils/Types/types";
import websocket from "../../utils/websocket";
//styles
import './Game.css';
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Box, Button, Container, TextField, Typography} from '@material-ui/core';

let newWS: WebSocket;

const styles = (theme: { content: any; }) => (
    theme.content
);

interface GameState {
    wordToGuess: string;
    painter: Player;
    isGameOver: boolean;
    imgURL: string;
    players: Player[];
    chatMessages: Message[];
    time: number;
}

interface GameProps extends RouteComponentProps, WithStyles<typeof styles> {
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
        newWS.onmessage = (response) => {
            if (JSON.parse(response.data).id === localStorage.getItem('gameId')) {
                this.setState({
                    chatMessages: JSON.parse(response.data).chatMessages,
                    isGameOver: JSON.parse(response.data).isGameOver,
                    time: JSON.parse(response.data).time,
                    imgURL: JSON.parse(response.data).img,
                    players: JSON.parse(response.data).players
                });
            }
        };
    }

    componentDidUpdate() {
        if (this.state.isGameOver) this.gameOver();
    }

    componentWillUnmount() {
        newWS.close();
    }

    getDataFromServer = async (): Promise<void> => {
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
    refreshConnection = (): void => {
        newWS = new WebSocket('ws://localhost:9000');
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
        send(JSON.stringify({'messageType': websocket.refresh, 'gameId': localStorage.getItem('gameId')}));
    };

    gameOver = (): void => {
        const {history} = this.props;
        history.push(getDomRoutes(localStorage.getItem('gameId')).gameOver);
        newWS.close();
    };

    sendMessage = (message: Message): void => {
        newWS.send(JSON.stringify({
            'messageType': websocket.sendMessage,
            'gameId': localStorage.getItem('gameId'),
            'message': message
        }));
    };
    postMarks = (value: { id: string, marks: { hot: boolean, cold: boolean } }): void => {
        newWS.send(JSON.stringify({
            'messageType': websocket.postMarks,
            'gameId': localStorage.getItem('gameId'),
            'value': value
        }));
    };
    setWinner = (winner: string | null): void => {
        newWS.send(JSON.stringify({
            'messageType': websocket.setWinner,
            'gameId': localStorage.getItem('gameId'),
            'winner': winner
        }));
    };
    sendImg = (img: string): void => {
        newWS.send(JSON.stringify({
            'messageType': websocket.sendImg,
            'gameId': localStorage.getItem('gameId'),
            'img': img
        }));
    };

    copyGameId = (): void => {
        const inputEl = document.querySelector('#gameId') as HTMLInputElement;
        const inputValue = inputEl!.value.trim();

        if (!navigator.clipboard) {
            inputEl.select();
            document.execCommand("copy");
        } else {
            navigator.clipboard.writeText(inputValue)
                .then(() => {
                    inputEl.select();
                })
                .catch(err => {
                    console.log('Something went wrong', err);
                });
        }
    };

    render() {
        const {painter, wordToGuess, players, imgURL, chatMessages} = this.state;
        const playerName = this.context.user ? this.context.user.name : undefined;
        const wordToDisplay = (playerName === painter.name) ?
            `Загаданное слово: ${wordToGuess}`
            : 'Отгадайте слово!';
        const guessers = players.filter(player => player.name !== painter.name);
        const isPainter = playerName === painter.name;
        const {classes} = this.props;
        return (
            <Container className={classes.outerContainer + " Game"} maxWidth='lg'>
                <header>
                    <Timer time={this.state.time}/>
                    <Typography variant='h6' paragraph>{wordToDisplay}</Typography>
                    <Box>
                        <TextField
                            id='gameId'
                            variant="outlined"
                            size='small'
                            value={localStorage.getItem('gameId')}
                        />
                        <Button
                            id='readButton'
                            variant="contained"
                            size='medium'
                            color='secondary'
                            onClick={this.copyGameId}>
                            Copy
                        </Button>
                    </Box>
                </header>
                <main>
                    {isPainter ?
                        <Canvas sendImg={this.sendImg} />
                        : imgURL !== '' ?
                            <img src={imgURL} alt='img from server' className="Game-Image"/>
                            : <div className="Game-EmptyDiv"/>}
                    <aside>
                        <ListOfPlayers players={guessers} painter={painter}/>
                        <Chat
                            isPainter={isPainter}
                            wordToGuess={wordToGuess}
                            painter={painter}
                            sendMessage={this.sendMessage}
                            chatMessages={chatMessages}
                            postMarks={this.postMarks}
                            setWinner={this.setWinner}
                            {...this.props}
                        />
                    </aside>
                </main>
            </Container>
        );
    }
}

export default (withStyles(styles)(Game));
