import React, {Component} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {v4 as uuidv4} from 'uuid';
import crocoImg from '../../img/cocodrilo.png';
//components
//utils
import getRoutes from "../../utils/routes";
import getDomRoutes from "../../utils/domRoutes";
//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Grid, Typography, TextField} from '@material-ui/core';

const styles = (theme: { content: any; }) => (
    theme.content
);

interface LoginProps extends RouteComponentProps, WithStyles<typeof styles> {
    joinGame: (player: string, gameId: string) => void;
}

interface GameType {
    id: string;
    players: string[];
    wordToGuess: string;
    painter: string;
    img: string;
    chatMessages: string[];
    time: number;
    winner: string;
}

interface LoginState {
    name: string;
    code: string;
    possibleGames: GameType[]
}

class Login extends Component<LoginProps, LoginState> {
    constructor(props: LoginProps) {
        super(props);
        this.state = {
            name: '',
            code: '',
            possibleGames: []
        };
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
        const {name, code} = this.state;
        evt.preventDefault();
        await this.getAllGames();
        if (code === '') {
            const newCode = uuidv4();
            await this.joinGame(name, newCode);
        } else if (this.state.possibleGames.some(game => game.id === code)) {
            const currentGameId = this.state.possibleGames.find(game => game.id === code);
            if (currentGameId?.players.includes(name)) { //TODO добавить проверку
                alert(`name ${name} already exist`); //TODO использовать библиотеку TOAST вместо alarm
            } else {
                await this.joinGame(name, code);
            }
        } else {
            alert('no such play'); //TODO использовать библиотеку TOAST вместо alarm
        }
    };

    joinGame = async (name: string, code: string) => {
        const {joinGame, history} = this.props;
        localStorage.setItem('playerName', name);
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
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Введите имя"
                                name="name"
                                autoFocus
                                onChange={this.handleChange}
                                value={this.state.name}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                fullWidth
                                id="code"
                                label="Введите код приглашения"
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
                        </form>
                    </Grid>
                </Grid>
            </Container>
        );
    }
}

export default (withStyles(styles)(Login));
