import React, {Component} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {v4 as uuidv4} from 'uuid';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getDomRoutes from "../../utils/domRoutes";
import {GameType} from "../../utils/Types/types";
import websocket from "../../utils/websocket";
//styles
import crocoImg from '../../img/cocodrilo.png';
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Grid, Typography, TextField} from '@material-ui/core';

const styles = (theme: { content: any; }) => (
    theme.content
);
let ws: WebSocket;

interface LoginProps extends RouteComponentProps, WithStyles<typeof styles> {
}

interface LoginState {
    code: string;
    possibleGames: GameType[];
    isCodeIncorrect: boolean;
    isNameExist: boolean;
}

class Main extends Component<LoginProps, LoginState> {
    static contextType = ApiContext;

    constructor(props: LoginProps) {
        super(props);
        this.state = {
            code: '',
            possibleGames: [],
            isCodeIncorrect: false,
            isNameExist: false
        };
    }

    addPlayer = async (gameId: string, player: string | null) => { //TODO return type
        ws = new WebSocket('ws://localhost:8080');
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

    joinGame = async (player: string | null, gameId: string): Promise<void> => {
        await this.getAllGames();
        if (this.state.possibleGames.some(game => game.id === gameId)) {
            await this.addPlayer(gameId, player);
        } else {
            await this.context.addGame(gameId);
            await this.addPlayer(gameId, player);
        }
    };

    getAllGames = async (): Promise<void> => {
        const allGames = await this.context.getAllGames();
        this.setState({possibleGames: allGames});
    };

    handleChange = async (evt: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        this.setState((state) => ({
            ...state,
            isCodeIncorrect: false,
            isNameExist: false,
            [evt.target.name]: evt.target.value
        }));
    };

    handleSubmit = async (evt: React.ChangeEvent<HTMLFormElement>): Promise<void> => {
        const {code} = this.state;
        const name = localStorage.getItem('playerName');
        evt.preventDefault();
        await this.getAllGames();
        if (code === '') {
            const newCode = uuidv4();
            await this.startGame(name, newCode);
        } else if (this.state.possibleGames.some(game => game.id === code)) {
            const currentGameId = this.state.possibleGames.find(game => game.id === code);
            if (currentGameId!.players.some(player => player.name === name)) {
                this.setState({isNameExist: true});
            } else {
                await this.startGame(name, code);
            }
        } else {
            this.setState({isCodeIncorrect: true});
        }
    };

    startGame = async (name: string | null, code: string): Promise<void> => {
        localStorage.setItem('gameId', code);
        this.context.changeGameId(code);
        await this.joinGame(name, code);
        this.props.history.push(getDomRoutes(code).startGame);
    };

    render() {
        const {classes} = this.props;
        const {isCodeIncorrect, code, isNameExist} = this.state;
        return (
            <Container className={classes.outerContainer} maxWidth='lg' style={{height: 500}}>
                <Grid container spacing={2} justify="center">
                    <Grid item xs={5}>
                        <div className={classes.imgContainer}>
                            <img className="Login-Img" src={crocoImg} alt="Крокодил"/>
                        </div>
                    </Grid>
                    <Grid item xs={5} className={classes.loginFormContainer}>
                        <Typography variant='h4' paragraph>
                            Онлайн - активити
                        </Typography>
                        <form onSubmit={this.handleSubmit} className={classes.innerContainer}
                              style={{paddingBottom: 16}}>
                            {!this.context.user ?
                                <p>Пожалуйста, войдите или зарегистрируйтесь</p>
                                : <div>
                                    {isNameExist ?
                                        <p>{localStorage.getItem('playerName')}, не стоит жульничать!</p>
                                        : <p>Добро пожаловать, {localStorage.getItem('playerName')}</p>}
                                    <TextField
                                        variant="outlined"
                                        margin="normal"
                                        fullWidth
                                        id="code"
                                        label="У меня есть код приглашения"
                                        name="code"
                                        onChange={this.handleChange}
                                        value={code}
                                        error={isCodeIncorrect}
                                        helperText={isCodeIncorrect ? 'Неверный код' : ''}
                                    />
                                    <Button
                                        className={classes.button}
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        size="large"
                                    >
                                        Играть!
                                    </Button>
                                </div>
                            }
                        </form>
                    </Grid>
                </Grid>
            </Container>
        );
    }
}

export default (withStyles(styles)(Main));
