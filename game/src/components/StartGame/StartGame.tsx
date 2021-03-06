import React, {Component} from "react";
import {RouteComponentProps} from 'react-router-dom';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getDomRoutes from "../../utils/domRoutes";
import websocket from "../../utils/websocket";
import {Player} from "../../utils/Types/types";
import copyGameId from "../../utils/copyGameId";
import setInterval from "../../utils/setWebsocketInterval";
//styles
import './StartGame.css'
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Typography, Box, TextField} from '@material-ui/core';

let newWS: WebSocket;

const styles = (theme: { content: any; }) => (
    theme.content
);

interface StartGameProps extends RouteComponentProps, WithStyles<typeof styles> {
}

interface StartGameState {
    players: Player[];
}

class StartGame extends Component<StartGameProps, StartGameState> {
    private _isMounted: boolean;
    static contextType = ApiContext;

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
        const game = await this.context.getGame();
        if (this._isMounted) {
            this.setState({
                players: game.players,
            });
        }
        newWS.onmessage = (response) => {
            if (JSON.parse(response.data).id === localStorage.getItem('gameId')) {
                if (JSON.parse(response.data).painter.name){
                    this.props.history.push(getDomRoutes(localStorage.getItem('gameId')).game);
                }
                if (this._isMounted) {
                    this.setState({players: JSON.parse(response.data).players});
                }
            }
        };
    }

    componentWillUnmount() {
        this._isMounted = false;
        newWS.close();
    }

    refreshConnection = (): void => {
        newWS = new WebSocket('ws://localhost:9000');
        const send = setInterval(newWS);
        send(JSON.stringify({'messageType': websocket.refresh, 'gameId': localStorage.getItem('gameId')}));
    };

    startGame = async (): Promise<void> => {
        await this.addWordAndPainter();
        this.props.history.push(getDomRoutes(localStorage.getItem('gameId')).game);
    };

    addWordAndPainter = async (): Promise<void> => {
        newWS.send(JSON.stringify({
            'messageType': websocket.addWordAndPainter,
            'gameId': localStorage.getItem('gameId')
        }));
    };

    render() {
        const {players} = this.state;
        const {classes} = this.props;
        return (
            <Container className={classes.outerContainer + " StartGame"} maxWidth='sm'>
                <Box className="StartGame">
                    <Box className="InviteFriends">
                        <Typography variant='h4' paragraph>
                            Пригласи друзей!
                        </Typography>
                        <Box className="StartGame-Copy">
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
                                onClick={copyGameId}>
                                Copy
                            </Button>
                        </Box>
                    </Box>
                    <Typography variant='h5' paragraph>
                        Все игроки в сборе?
                    </Typography>
                    <Box className={classes.innerContainer + " StartGame-Container"}>
                            {players && players.map(player => {
                                return <div key={player.name} className={classes.playerContainer}>
                                    {player.avatar && <img src={player.avatar as string} alt="avatar" className="avatar"/>}
                                    <Typography variant='subtitle1'>{player.name} </Typography>
                                </div>;
                            })}
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