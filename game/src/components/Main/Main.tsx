import React, {Component} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {v4 as uuidv4} from 'uuid';
import crocoImg from '../../img/cocodrilo.png';
//components
//utils
import getRoutes from "../../utils/routes";
import getDomRoutes from "../../utils/domRoutes";
import checkLogin from "../../utils/checkLogin";
//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Grid, Typography, TextField} from '@material-ui/core';

const styles = (theme: { content: any; }) => (
    theme.content
);

interface LoginProps extends RouteComponentProps, WithStyles<typeof styles> {
    joinGame: (player: string | null, gameId: string) => void;
    isAuthorized: boolean;
    setAuthorized: () => void;
}

interface GameType {
    id: string;
    players: Player[];
    wordToGuess: string;
    painter: Player;
    img: string;
    chatMessages: string[];
    time: number;
    winner: string;
}

interface LoginState {
    code: string;
    possibleGames: GameType[]
}

interface Player {
    name: string,
    avatar: string | ArrayBuffer | null;
}

class Main extends Component<LoginProps, LoginState> {
    constructor(props: LoginProps) {
        super(props);
        this.state = {
            code: '',
            possibleGames: []
        };
    }
    componentDidMount() {
        checkLogin(this.props.setAuthorized);
    }

    getAllGames = async () => {
        const res = await fetch(getRoutes().app);
        const data = await res.text();
        this.setState({possibleGames: JSON.parse(data)});
    };

    handleChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState((state) => ({
            ...state,
            [evt.target.name]: evt.target.value
        }));
    };

    handleSubmit = async (evt: React.ChangeEvent<HTMLFormElement>) => {
        const {code} = this.state;
        const name = localStorage.getItem('playerName');
        evt.preventDefault();
        await this.getAllGames();
        if (code === '') {
            const newCode = uuidv4();
            await this.joinGame(name, newCode);
        } else if (this.state.possibleGames.some(game => game.id === code)) {
            const currentGameId = this.state.possibleGames.find(game => game.id === code);
            if (currentGameId?.players.some(player => player.name === name)) { //TODO добавить проверку
                alert(`name ${name} already exist`); //TODO использовать библиотеку TOAST вместо alarm
            } else {
                await this.joinGame(name, code);
            }
        } else {
            alert('no such play'); //TODO использовать библиотеку TOAST вместо alarm
        }
    };

    joinGame = async (name: string | null, code: string) => {
        const {joinGame, history} = this.props;
        localStorage.setItem('gameId', code);
        await joinGame(name, code);
        history.push(getDomRoutes(code).startGame);
    };

    render() {
        const {classes} = this.props;
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
                        <form onSubmit={this.handleSubmit} className={classes.innerContainer} style={{paddingBottom: 16}}>
                            {!this.props.isAuthorized ?
                                <p>Пожалуйста, войдите или зарегистрируйтесь</p>
                                : <div>
                                    <p>Добро пожаловать, {localStorage.getItem('playerName')}</p>
                                    <TextField
                                        variant="outlined"
                                        margin="normal"
                                        fullWidth
                                        id="code"
                                        label="У меня есть код приглашения"
                                        name="code"
                                        onChange={this.handleChange}
                                        value={this.state.code}
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
