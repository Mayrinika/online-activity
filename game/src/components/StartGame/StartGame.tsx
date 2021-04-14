import React, {Component} from "react";
import {RouteComponentProps} from 'react-router-dom';
//components
//utils
import getDomRoutes from "../../utils/domRoutes";
import getRoutes from "../../utils/routes";
import websocket from "../../utils/websocket";
import checkLogin from "../../utils/checkLogin";

//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Typography, Box, TextField} from '@material-ui/core';

let newWS: any;

const styles = (theme: { content: any; }) => (
    theme.content
);

interface StartGameProps extends RouteComponentProps, WithStyles<typeof styles> {
    setAuthorized: () => void;
}

interface Player {
    name: string,
    avatar: string | ArrayBuffer | null;
}

interface StartGameState {
    players: Player[];
}

class StartGame extends Component<StartGameProps, StartGameState> {
    private _isMounted: boolean;

    constructor(props: StartGameProps) {
        super(props);
        this.state = {
            players: [],
        };
        this._isMounted = false;
        this.refreshConnection();
    }

    async componentDidMount() {
        this._isMounted = true;
        this.refreshConnection();
        checkLogin(this.props.setAuthorized);
        const res = await fetch(getRoutes(localStorage.getItem('gameId')).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        if (this._isMounted) {
            this.setState({
                players: game.players,
            });
        }
        newWS.onmessage = (response: any) => {
            if (JSON.parse(response.data).id === localStorage.getItem('gameId')) {
                this.setState({players: JSON.parse(response.data).players});
            }
        };
    }

    componentWillUnmount() {
        this._isMounted = false;
        newWS.close();
    }

    refreshConnection = () => {
        newWS = new WebSocket('ws://localhost:8080');
        const send = function (message: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
            waitForConnection(function () {
                return newWS.send(message);
            }, 100);
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

    startGame = async () => {
        await this.addWordAndPainter();
        this.props.history.push(getDomRoutes(localStorage.getItem('gameId')).game);
    };

    addWordAndPainter = async () => {
        newWS.send(JSON.stringify({'messageType': websocket.addWordAndPainter, 'gameId': localStorage.getItem('gameId')}));
    };

    copyGameId = () => {
        const inputEl = document.querySelector('#gameId') as HTMLInputElement;
        const inputValue = inputEl!.value.trim();

        if (!navigator.clipboard) {
            inputEl.select();
            document.execCommand("copy");
        } else {
            navigator.clipboard.writeText(inputValue)
                .then(() => {})
                .catch(err => {
                    console.log('Something went wrong', err);
                });
        }
    };

    render() {
        const {players} = this.state;
        const {classes} = this.props;
        return (
            <Container className={classes.outerContainer} maxWidth='sm'>
                <Box>
                    <Box style={{marginBottom: 32}}>
                        <Typography variant='h4' paragraph>
                            Пригласи друзей!
                        </Typography>
                        <Box>
                            <TextField id='gameId' variant="outlined" size='small'
                                       style={{backgroundColor: '#F3F3F3'}} value={localStorage.getItem('gameId')}/>
                            <Button id='readButton' variant="contained" size='medium' color='secondary'
                                    style={{marginLeft: 8}}
                                    onClick={this.copyGameId}>Copy
                            </Button>
                        </Box>
                    </Box>
                    <Typography variant='h5' paragraph>
                        Все игроки в сборе?
                    </Typography>
                    <Box className={classes.innerContainer}>
                        <Typography variant='subtitle1'>
                            {players && players.map(player => {
                                return <div key={player.name} className={classes.playerContainer}>
                                    {player.avatar && <img src={player.avatar as string} alt="avatar"/>}
                                    {player.name}
                                </div>;
                            })}
                        </Typography>
                    </Box>
                    <Button
                        className={classes.button}
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={this.startGame}
                    >
                        Да! Начать игру!
                    </Button>
                </Box>
            </Container>
        );
    }
}

export default (withStyles(styles)(StartGame));