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

interface LocalLeaderboardType {
    avatar: string | ArrayBuffer | null;
    playerName: string;
    score: number;
}

interface Message {
    id: string;
    name: string;
    avatar: string | ArrayBuffer | null;
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
    painter: Player;
    chatMessages: Message[];
    players: Player[];
    localLeaderboard: LocalLeaderboardType[];
    time: number;
}

class GameOver extends Component<GameOverProps, GameOverState> {
    static contextType = ApiContext;

    constructor(props: GameOverProps) {
        super(props);
        this.state = {
            wordToGuess: '',
            isTimeOver: false,
            isWordGuessed: false,
            winner: '',
            painter: {name: '', avatar: null},
            chatMessages: [],
            players: [],
            localLeaderboard: [],
            time: 0
        };
    }

    componentDidMount() {
        this.getDataFromServer();
        checkLogin(this.props.setAuthorized);
    }

    getDataFromServer = async () => {
        const game = await this.context.getGame();
        this.setState({
            wordToGuess: game.wordToGuess,
            isTimeOver: game.isTimeOver,
            isWordGuessed: game.isWordGuessed,
            winner: game.winner,
            painter: game.painter,
            chatMessages: game.chatMessages,
            players: game.players,
            time: game.time
        }, this.calculateScores);
    };

    calculateScores = () => {
        const results: LocalLeaderboardType[] = [];
        const {isTimeOver, players, painter, winner} = this.state;

        if (isTimeOver)
            return;

        results.push({
            playerName: painter.name,
            avatar: painter.avatar,
            score: this.state.time
        });

        for (const player of players) {
            if (player.name === painter.name)
                continue;
            let currentScore = this.calculateScoresForHotMessages(player.name);
            if (player.name === winner)
                currentScore += 50;
            results.push({
                playerName: player.name,
                avatar: player.avatar,
                score: currentScore
            });
        }
        results.sort((a, b) => b.score - a.score);
        this.setState({
            localLeaderboard: results
        });

        this.context.pushScoreToLeaderboard(results);
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

    startOver = () => {
        this.props.history.push(getDomRoutes().main);
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
                    <div className={classes.innerContainer}>
                        {
                            this.state.localLeaderboard.length > 0 ?
                                this.state.localLeaderboard.map(item => {
                                        return (
                                            <Typography variant='subtitle1' paragraph className={classes.playerContainer}
                                                        key={item.playerName}>
                                                {item.avatar && <img src={item.avatar as string} alt="avatar" />}
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