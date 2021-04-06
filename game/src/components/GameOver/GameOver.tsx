import React, {Component} from 'react';
import {RouteComponentProps} from 'react-router-dom';
//components
//utils
import getRoutes from '../../utils/routes';
import getDomRoutes from "../../utils/domRoutes";
//styles
import {createStyles, withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Grid, Typography, TextField, Box} from '@material-ui/core';
//import './GameOver.css';

const styles = (theme: any) => createStyles({ //TODO
    ...theme.content,
});

interface GameOverProps extends RouteComponentProps, WithStyles<typeof styles> {
}

interface LocalLeaderboardType {
    playerName: string;
    score: number;
}

interface Message {
    id: string;
    name: string;
    text: string;
    marks: {
        hot: boolean;
        cold: boolean;
    };
}

interface GameOverState {
    isTimeOver: boolean;
    isWordGuessed: boolean;
    wordToGuess: string;
    winner: string;
    painter: string;
    chatMessages: Message[];
    players: [];
    localLeaderboard: LocalLeaderboardType[];
}

class GameOver extends Component<GameOverProps, GameOverState> {
    constructor(props: GameOverProps) {
        super(props);
        this.state = {
            wordToGuess: '',
            isTimeOver: false,
            isWordGuessed: false,
            winner: '',
            painter: '',
            chatMessages: [],
            players: [],
            localLeaderboard: []
        };
    }

    componentDidMount() {
        this.getDataFromServer();
    }

    getDataFromServer = async () => {
        const res = await fetch(getRoutes(localStorage.getItem('gameId')).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        this.setState({
            wordToGuess: game.wordToGuess,
            isTimeOver: game.isTimeOver,
            isWordGuessed: game.isWordGuessed,
            winner: game.winner,
            painter: game.painter,
            chatMessages: game.chatMessages,
            players: game.players
        }, this.calculateScores);
    };

    calculateScores = () => {
        const results: LocalLeaderboardType[] = [];
        const {isTimeOver, players, painter, winner} = this.state;

        if (isTimeOver)
            return;

        results.push({
            playerName: painter,
            score: 50
        });

        for (const player of players) {
            if (player === painter)
                continue;
            let currentScore = this.calculateScoresForHotMessages(player);
            if (player === winner)
                currentScore += 50;
            results.push({
                playerName: player,
                score: currentScore
            });
        }
        results.sort((a, b) => b.score - a.score);
        this.setState({
            localLeaderboard: results
        });

        this.pushScoreToLeaderboard(results);
    };

    calculateScoresForHotMessages = (player: string) => {
        let currentScore = 0;
        this.state.chatMessages.map(message => {
            if (message.name === player && message.marks.hot) {
                currentScore += 2;
            }
            return currentScore;
        });
        return Math.min(currentScore, 50);
    };

    pushScoreToLeaderboard = (localLeaderboard: LocalLeaderboardType[]) => {
        fetch(getRoutes().leaderboard, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(localLeaderboard)
        });
        //.then(res => console.log(res));
    };

    startOver = () => {
        this.props.history.push(getDomRoutes().login);
    };

    goToLeaderboard = () => {
        this.props.history.push(getDomRoutes().leaderboard);
    };

    render() {
        const {isTimeOver, isWordGuessed, winner, wordToGuess} = this.state;
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
                    <div className={classes.innerContainer} style={{paddingBottom: 48}}>
                        {
                            this.state.localLeaderboard.length > 0 ?
                                this.state.localLeaderboard.map(item => {
                                        return (
                                            <Typography variant='subtitle1' paragraph className={classes.playerContainer}
                                                        key={item.playerName}>
                                                {item.playerName}: {item.score}
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
                    variant="outlined"
                    color="secondary"
                    size="large"
                    onClick={this.goToLeaderboard}
                >Лидерборд</Button>
            </Container>
        );
    }

}

export default (withStyles(styles)(GameOver));