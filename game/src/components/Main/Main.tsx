import React, {Component, ReactElement} from 'react';
import {Link, RouteComponentProps} from 'react-router-dom';
import {v4 as uuidv4} from 'uuid';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getDomRoutes from "../../utils/domRoutes";
import {GameType} from "../../utils/Types/types";
import websocket from "../../utils/websocket";
import setInterval from "../../utils/setWebsocketInterval";
//styles
import './Main.css'
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
    allGames: GameType[];
    isCodeIncorrect: boolean;
}

class Main extends Component<LoginProps, LoginState> {
    static contextType = ApiContext;

    constructor(props: LoginProps) {
        super(props);
        this.state = {
            code: '',
            allGames: [],
            isCodeIncorrect: false,
        };
    }

    addPlayer = async (gameId: string, player: string | null): Promise<void> => {
        ws = new WebSocket('ws://localhost:9000');
        const send = setInterval(ws);
        send(JSON.stringify({'gameId': gameId, 'messageType': websocket.register, 'player': player}));
    };

    joinGame = async (player: string | null, gameId: string): Promise<void> => {
        await this.getAllGames();
        if (this.state.allGames.some(game => game.id === gameId)) {
            await this.addPlayer(gameId, player);
        } else {
            await this.context.addGame(gameId);
            await this.addPlayer(gameId, player);
        }
    };

    getAllGames = async (): Promise<void> => {
        const allGames = await this.context.getAllGames();
        this.setState({allGames: allGames});
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
        const name = this.context.user ? this.context.user.name : undefined;
        evt.preventDefault();
        await this.getAllGames();
        if (code === '') {
            const newCode = uuidv4();
            await this.startGame(name, newCode);
        } else if (this.state.allGames.some(game => game.id === code)) {
            await this.startGame(name, code);
        } else {
            this.setState({isCodeIncorrect: true});
        }
    };

    startGame = async (playerName: string | null, gameId: string): Promise<void> => { //TODO moved
        localStorage.setItem('gameId', gameId);
        this.context.changeGameId(gameId);
        await this.joinGame(playerName, gameId);
        this.props.history.push(getDomRoutes(gameId).startGame);
    };

    renderForm = (): ReactElement => {
        const {classes} = this.props;
        const {isCodeIncorrect, code} = this.state;
        return (
            <form onSubmit={this.handleSubmit} className={classes.innerContainer}>
                {!this.context.user ?
                    <div>Пожалуйста,
                        <Link to={getDomRoutes().login}><Typography>войдите</Typography></Link>
                        или
                        <Link to={getDomRoutes().signup}><Typography>зарегистрируйтесь</Typography></Link>
                    </div>
                    : <div>
                        <div className="Main-Welcome">
                            <Typography>Добро пожаловать,</Typography>
                            <Link to={getDomRoutes().userProfile} className="Main-Welcome_UserProfile-link">
                                <img src={this.context.user.avatar} alt='avatar' className="avatar"/>
                                <Typography> {this.context.user ? this.context.user.name : undefined}</Typography>
                            </Link>
                        </div>
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
        );
    }

    render() {
        const {classes} = this.props;
        return (
            <Container className={classes.outerContainer + " Main"} maxWidth='md'>
                <Typography variant='h4' paragraph>
                    Онлайн - активити
                </Typography>
                <Grid container spacing={10} xs={12} justify="center" alignContent="center">
                    <Grid item md={5} xs={1} className="Main-Img-Container">
                        <div className={classes.imgContainer}>
                            <img className="Main-Img" src={crocoImg} alt="Крокодил"/>
                        </div>
                    </Grid>
                    <Grid item md={5} xs={12} className={classes.mainFormContainer}>
                        {this.renderForm()}
                    </Grid>
                </Grid>
            </Container>
        );
    }
}

export default (withStyles(styles)(Main));
