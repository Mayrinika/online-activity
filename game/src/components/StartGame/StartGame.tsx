import React, {Component} from "react";
import {RouteComponentProps} from 'react-router-dom';
//components
//utils
import getDomRoutes from "../../utils/domRoutes";
//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Typography, Box} from '@material-ui/core';
import getRoutes from "../../utils/routes";

let newWS: any;

const styles = (theme: { content: any; }) => (
    theme.content
);

interface StartGameProps extends RouteComponentProps, WithStyles<typeof styles> {
}

interface StartGameState {
    players: string[];
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
        const res = await fetch(getRoutes(localStorage.getItem('gameId')).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        this.setState({
            players: game.players,
        });
        newWS.onmessage = (response: any) => {
            this.setState({players: JSON.parse(response.data).players});
        };
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
        send(JSON.stringify({'messageType': 'refresh', 'gameId': localStorage.getItem('gameId')}));
    };

    componentWillUnmount() {
        this._isMounted = false;
        newWS.close();
    }

    startGame = async () => {
        await this.addWordAndPainter(localStorage.getItem('gameId'));
        this.props.history.push(getDomRoutes(localStorage.getItem('gameId')).game);
    };

    addWordAndPainter = async (gameId: string | null) => {
        newWS.send(JSON.stringify({'messageType': 'addWordAndPainter', 'gameId': localStorage.getItem('gameId')}));
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
                        <Typography variant='subtitle1' paragraph className={classes.playerContainer}
                                    style={{backgroundColor: '#F3F3F3'}}>
                            {localStorage.getItem('gameId')}
                        </Typography>
                    </Box>
                    <Typography variant='h5' paragraph>
                        Все игроки в сборе?
                    </Typography>
                    <Box className={classes.innerContainer}>
                        <Typography variant='subtitle1'>
                            {players && players.map(player => {
                                return <div key={player} className={classes.playerContainer}>{player}</div>;
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