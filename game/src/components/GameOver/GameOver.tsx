import React, {Component} from 'react';
import {RouteComponentProps} from 'react-router-dom';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getDomRoutes from "../../utils/domRoutes";
import {GameType, Player} from "../../utils/Types/types";
//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Typography, Box} from '@material-ui/core';
import websocket from "../../utils/websocket";

const styles = (theme: { content: any; }) => (
    theme.content
);
let ws: WebSocket;

interface GameOverProps extends RouteComponentProps, WithStyles<typeof styles> {
}

interface GameOverState {
    scores: { player: Player, score: number }[];
    isWordGuessed: boolean;
    isTimeOver: boolean;
    winner: string;
    wordToGuess: string;
    allGames: GameType[];
}

class GameOver extends Component<GameOverProps, GameOverState> {
    static contextType = ApiContext;

    constructor(props: GameOverProps) {
        super(props);
        this.state = {
            scores: [],
            isWordGuessed: false,
            isTimeOver: false,
            winner: '',
            wordToGuess: '',
            allGames: [],
        };
    }

    componentDidMount() {
        this.getDataFromServer();
    }

    getDataFromServer = async (): Promise<void> => {
        const game = await this.context.getGame();
        this.setState({
            scores: game.scores,
            isWordGuessed: game.isWordGuessed,
            isTimeOver: game.isTimeOver,
            winner: game.winner,
            wordToGuess: game.wordToGuess,
        });
    };

    startOver = (): void => {
        this.props.history.push(getDomRoutes().main);
    };

    restartGame = async (): Promise<void> => {
        const name = this.context.user ? this.context.user.name : undefined;
        const gameId = localStorage.getItem('gameId');
        if (!gameId) return;
        await this.startGame(name, gameId);
    };

    startGame = async (playerName: string | null, gameId: string): Promise<void> => { 
        await this.joinGame(playerName, gameId);
        this.props.history.push(getDomRoutes(gameId).startGame);
    };

    joinGame = async (player: string | null, gameId: string): Promise<void> => {
        await this.context.restartGame(gameId);
        await this.addPlayer(gameId, player);
    };

    addPlayer = async (gameId: string, player: string | null): Promise<void> => {
        ws = new WebSocket('ws://localhost:9000');
        const send = function (message: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
            waitForConnection(function () {
                return ws.send(message);
            }, 100);
        };

        const waitForConnection = function (callback: () => void, interval: number) {
            if (ws.readyState === 1) {
                callback();
            } else {
                setTimeout(function () {
                    waitForConnection(callback, interval);
                }, interval);
            }
        };
        send(JSON.stringify({'gameId': gameId, 'messageType': websocket.register, 'player': player}));
    };

    render() {
        const {scores, isWordGuessed, isTimeOver, winner, wordToGuess} = this.state;
        const {classes} = this.props;
        return (
            <Container className={classes.outerContainer} maxWidth='sm'>
                <Box>
                    <Typography variant='h5' paragraph>Игра окончена!</Typography>
                    {isTimeOver &&
                    <div>
                        <Typography variant='h6' paragraph>Время вышло!</Typography>
                        <Typography variant='h6' paragraph>Слово было: {wordToGuess}</Typography>
                    </div>
                    }
                    <div>
                        {(isWordGuessed && !isTimeOver) &&
                        <Typography variant='h6' paragraph>Игрок {winner} отгадал слово {wordToGuess}</Typography>
                        }
                        {scores.length > 0 &&
                        <div>
                            <Typography variant='h6' paragraph>Заработанные очки: </Typography>
                            <div className={classes.innerContainer}>
                                {scores.map(item => {
                                    return (
                                        <Typography variant='subtitle1' paragraph
                                                    className={classes.playerContainer}
                                                    key={item.player.name}>
                                            {item.player.avatar &&
                                            <img src={item.player.avatar as string} alt="avatar" className="avatar"/>}
                                            {item.player.name}: {item.score}
                                        </Typography>
                                    );
                                })
                                }
                            </div>
                        </div>
                        }
                    </div>
                    <Button
                        className={classes.button}
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={this.restartGame}
                    >Играть ёщё раз</Button>
                    <Button
                        className={classes.button}
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={this.startOver}
                    >Новая игра</Button>
                </Box>
            </Container>
        );
    }

}

export default (withStyles(styles)(GameOver));