import React, {Component} from 'react';
import {RouteComponentProps} from 'react-router-dom';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getDomRoutes from "../../utils/domRoutes";
import {GameType} from "../../utils/Types/types";
import {WS} from "../../utils/websocket";
//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, TextField, Typography, Box} from '@material-ui/core';

const styles = (theme: { content: any; }) => (
    theme.content
);

let ws = new WS();

interface PossibleGamesProps extends RouteComponentProps, WithStyles<typeof styles> {
}

interface PossibleGamesState {
    possibleGames: GameType[];
}

class PossibleGames extends Component<PossibleGamesProps, PossibleGamesState> {
    static contextType = ApiContext;

    constructor(props: PossibleGamesProps) {
        super(props);
        this.state = {
            possibleGames: [],
        };
    }

    async componentDidMount() {
        const possibleGames = await this.context.getPossibleGamesFromServer();
        this.setState({possibleGames});
    }

    handleJoin = async (gameId: string): Promise<void> => {
        const playerName = this.context.user ? this.context.user.name : undefined;
        await this.startGame(playerName, gameId);
    }

    startGame = async (playerName: string | null, gameId: string): Promise<void> => {
        localStorage.setItem('gameId', gameId);
        this.context.changeGameId(gameId);
        await ws.addPlayer(gameId, playerName);
        this.props.history.push(getDomRoutes(gameId).startGame);
    };

    render() {
        const {classes} = this.props;
        const {possibleGames} = this.state;
        return (
            <Container className={classes.outerContainer} maxWidth='md'>
                <Typography variant='h5' paragraph>Выбирай и играй!</Typography>
                {possibleGames.length===0 ?  <Typography variant='subtitle1' paragraph>Нет доступных игр. Создай свою!</Typography>
                    : possibleGames.map((game) => {
                    return (
                        <Box key={game.id} m={2}>
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
                                color='primary'
                                onClick={() => this.handleJoin(game.id)}>
                                Join
                            </Button>
                        </Box>
                    );
                })}
            </Container>
        );
    }
}

export default (withStyles(styles)(PossibleGames));