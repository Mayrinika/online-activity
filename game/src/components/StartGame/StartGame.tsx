import React, {Component} from "react";
import {RouteComponentProps} from 'react-router-dom';
//components
//utils
import getDomRoutes from "../../utils/domRoutes";
//styles
import {createStyles, withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Typography, Box} from '@material-ui/core';

const styles = (theme: any) => createStyles({ //TODO
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
        }
        this._isMounted = false;
    }

    async componentDidMount() {
        this._isMounted = true;
        this.props.ws.onmessage = (response: any) => {
            if (this._isMounted) {
                this.setState({players: JSON.parse(response.data).players});
            }
        }
    }
    componentWillUnmount() {
        this._isMounted = false;
    }

    startGame = async () => {
        await this.addWordAndPainter(localStorage.getItem('gameId'));
        this.props.history.push(getDomRoutes(localStorage.getItem('gameId')).game);
    }

    addWordAndPainter = async (gameId: string | null) => {
        this.props.ws.send(JSON.stringify({'messageType':'addWordAndPainter','gameId':localStorage.getItem('gameId')}));
        // await fetch(getRoutes(gameId).addWordAndPainter, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json;charset=utf-8'
        //     },
        //     body: JSON.stringify({})
        // });
    }

    render() {
        const {players} = this.state;
        const {classes} = this.props;
        return (
            <Container className={classes.gameField} maxWidth='sm'>
                <Box>
                    <Typography component='h3' variant='h5' paragraph>
                        Игроки: {players && players.join(', ')}
                    </Typography>
                    <Typography component='h4' variant='h6' paragraph>
                        Все игроки в сборе?
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        size="large"
                        style={{marginTop: 32}}
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