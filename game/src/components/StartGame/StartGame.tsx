import React, {Component} from "react";
import {RouteComponentProps} from 'react-router-dom';
//components
//utils
import getDomRoutes from "../../utils/domRoutes";
//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Typography, Box} from '@material-ui/core';
import getRoutes from "../../utils/routes";

const newWS= new WebSocket('ws://localhost:8080');

const styles = (theme: { content: any; }) => ({
    ...theme.content,
});

interface StartGameProps extends RouteComponentProps, WithStyles<typeof styles> {
    ws: any
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
    }

    async componentDidMount() {
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
        this._isMounted = true;
        const res = await fetch(getRoutes(localStorage.getItem('gameId')).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        this.setState({
            players: game.players,
        });
        if (this.props.ws) {
            this.props.ws.onmessage = (response: any) => {
                this.setState({players: JSON.parse(response.data).players});
            }
        }
        newWS.onmessage = (response: any) => {
            this.setState({players: JSON.parse(response.data).players});
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        if (this.props.ws) {
            this.props.ws.close();
        }
        if (newWS) {
            newWS.close();
        }
    }

    startGame = async () => {
        await this.addWordAndPainter(localStorage.getItem('gameId'));
        this.props.history.push(getDomRoutes(localStorage.getItem('gameId')).game);
    };

    addWordAndPainter = async (gameId: string | null) => {
        this.props.ws ?
            this.props.ws.send(JSON.stringify({'messageType': 'addWordAndPainter', 'gameId': localStorage.getItem('gameId')}))
            : newWS.send(JSON.stringify({'messageType': 'addWordAndPainter', 'gameId': localStorage.getItem('gameId')}));

        // await fetch(getRoutes(gameId).addWordAndPainter, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json;charset=utf-8'
        //     },
        //     body: JSON.stringify({})
        // });
    };

    render() {
        const {players} = this.state;
        const {classes} = this.props;
        return (
            <Container className={classes.outerContainer} maxWidth='sm'>
                <Box>
                    <Typography variant='h5' paragraph>
                        Все игроки в сборе?
                    </Typography>
                    <Box className={classes.innerContainer}>
                        <Typography variant='subtitle1'>
                            {players && players.map(player=>{
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