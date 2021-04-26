import React, {Component} from 'react';
import {RouteComponentProps} from 'react-router-dom';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getDomRoutes from "../../utils/domRoutes";
import {GameType} from "../../utils/Types/types";
//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, TextField, Typography} from '@material-ui/core';
import websocket from "../../utils/websocket";

const styles = (theme: { content: any; }) => (
    theme.content
);
let ws: WebSocket;

interface PossibleGamesProps extends RouteComponentProps, WithStyles<typeof styles> {
}

interface PossibleGamesState {
    possibleGames: GameType[];
    allGames: GameType[];
}

class PossibleGames extends Component<PossibleGamesProps, PossibleGamesState> {
    static contextType = ApiContext;

    constructor(props: PossibleGamesProps) {
        super(props);
        this.state = {
            possibleGames: [],
            allGames: []
        };
    }

    async componentDidMount() {
        await this.getAllGames();
        const possibleGames = this.state.allGames.filter((game: GameType) => game.time > 120);
        this.setState({possibleGames});
    }

    getAllGames = async (): Promise<void> => {
        const allGames = await this.context.getAllGames();
        this.setState({allGames: allGames});
    };

    handleJoin = async (gameId: string): Promise<void> => {
        await this.startGame(localStorage.getItem('playerName'), gameId);
    }

    startGame = async (name: string | null, code: string): Promise<void> => {
        localStorage.setItem('gameId', code);
        this.context.changeGameId(code);
        await this.joinGame(name, code);
        this.props.history.push(getDomRoutes(code).startGame); //TODO
    };

    joinGame = async (player: string | null, gameId: string): Promise<void> => {
        //await this.getAllGames();
        // if (this.state.allGames.some(game => game.id === gameId)) {
        //     await this.addPlayer(gameId, player);
        // } else {
        //     await this.context.addGame(gameId);
        //     await this.addPlayer(gameId, player);
        // }
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
        const {classes} = this.props;
        const {possibleGames} = this.state;
        return (
            <Container className={classes.outerContainer} maxWidth='md'>
                <Typography variant='h5' paragraph>Выбирай и играй!</Typography>
                {possibleGames && possibleGames.map((game) => {
                    return (
                        <div key={game.id}>
                            <TextField
                                id={game.id}
                                variant="outlined"
                                size='small'
                                value={game.id}
                            />
                            <Button
                                id='readButton'
                                variant="contained"
                                size='medium'
                                color='secondary'
                                onClick={() => this.handleJoin(game.id)}>
                                Join
                            </Button>
                        </div>
                    );
                })}
            </Container>
        );
    }
}

export default (withStyles(styles)(PossibleGames));