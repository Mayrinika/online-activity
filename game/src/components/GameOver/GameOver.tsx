import React, {Component} from 'react';
import {RouteComponentProps} from 'react-router-dom';
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getRoutes from '../../utils/routes';
import getDomRoutes from "../../utils/domRoutes";
//styles
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Typography} from '@material-ui/core';
import checkLogin from "../../utils/checkLogin";

const styles = (theme: { content: any; }) => (
    theme.content
);

interface Player {
    name: string,
    avatar: string | ArrayBuffer | null;
}

interface GameOverProps extends RouteComponentProps, WithStyles<typeof styles> {
    setAuthorized: () => void;
}

interface GameOverState {
    scores: {player: Player, score: number}[],
    isWordGuessed: boolean,
    isTimeOver: boolean,
    winner: string,
    wordToGuess: string
}

class GameOver extends Component<GameOverProps, GameOverState> {
    static contextType = ApiContext;
    constructor(props: GameOverProps) {
        super(props);
        this.state = {
            scores: [],
            isWordGuessed: false,
            isTimeOver: false,
            winner: '',
            wordToGuess: '',
        };
    }

    componentDidMount() {
        this.getDataFromServer();
        checkLogin(this.props.setAuthorized);
    }

    getDataFromServer = async () => {
        const game = await this.context.getGame();
        this.setState({
            scores: game.scores,
            isWordGuessed: game.isWordGuessed,
            isTimeOver: game.isTimeOver,
            winner: game.winner,
            wordToGuess: game.wordToGuess,
        });
    };

    startOver = () => {
        this.props.history.push(getDomRoutes().main);
    };

    goToLeaderboard = () => {
        this.props.history.push(getDomRoutes().leaderboard);
    };

    render() {
        const {scores, isWordGuessed, isTimeOver, winner, wordToGuess} = this.state;
        const {classes} = this.props;
        return (
            <Container className={classes.outerContainer} maxWidth='sm'>
                <Typography variant='h5' paragraph>Игра окончена!</Typography>
                {isTimeOver &&
                <div>
                    <Typography variant='h6' paragraph>Время вышло!</Typography>
                    <Typography variant='h6' paragraph>Слово было: {wordToGuess}</Typography>
                </div>
                }
                {(isWordGuessed && !isTimeOver) &&
                <div>
                    <Typography variant='h6' paragraph>Игрок {winner} отгадал слово {wordToGuess}</Typography>
                    <div className={classes.innerContainer}>
                        {
                            this.state.scores.length > 0 ?
                                this.state.scores.map(item => {
                                        return (
                                            <Typography variant='subtitle1' paragraph className={classes.playerContainer}
                                                        key={item.player.name}>
                                                {item.player.avatar && <img src={item.player.avatar as string} alt="avatar" />}
                                                {item.player.name}: {item.score}
                                            </Typography>
                                        );
                                    }
                                ) : ''
                        }
                    </div>
                </div>
                }
                <Button
                    className={classes.button}
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={this.startOver}
                >Начать заново</Button>
                <Button
                    className={classes.button}
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={this.goToLeaderboard}
                >Лидерборд</Button>
            </Container>
        );
    }

}

export default (withStyles(styles)(GameOver));