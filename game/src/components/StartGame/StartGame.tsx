import React, {Component} from "react";
import {RouteComponentProps} from 'react-router-dom';
//components
//utils
import getDomRoutes from "../../utils/domRoutes";
//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Typography, Box} from '@material-ui/core';

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
        this._isMounted = true;
        this.props.ws.onmessage = (response: any) => {
            if (this._isMounted) {
                this.setState({players: JSON.parse(response.data).players});
            }
        };
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    startGame = async () => {
        await this.addWordAndPainter(localStorage.getItem('gameId'));
        this.props.history.push(getDomRoutes(localStorage.getItem('gameId')).game);
    };

    addWordAndPainter = async (gameId: string | null) => {
        this.props.ws.send(JSON.stringify({
            'messageType': 'addWordAndPainter',
            'gameId': localStorage.getItem('gameId')
        }));
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