import { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
//components
//utils
import getRoutes from '../../utils/routes';
//styles
import './GameOver.css';

interface GameOverProps extends RouteComponentProps {
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
        const { isTimeOver, players, painter, winner } = this.state;

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localLeaderboard)
        })
            //.then(res => console.log(res));
    };

    startOver = () => {
        this.props.history.push(`/`);
    };

    goToLeaderboard = () => {
        this.props.history.push(`/leaderboard`);
    };

    render() {
        const { isTimeOver, isWordGuessed, winner, wordToGuess } = this.state;
        return (
            <div className='GameOver'>
                <h5>Игра окончена!</h5>
                {isTimeOver &&
                <div>
                    <p>Время вышло!</p>
                    <p>Слово было: {wordToGuess}</p>
                </div>
                }
                {(isWordGuessed && !isTimeOver) &&
                <div>
                    <p>Игрок {winner} отгадал слово {wordToGuess}</p>
                    <div>
                        {
                            this.state.localLeaderboard.length > 0 ?
                                this.state.localLeaderboard.map(item => {
                                        return (
                                            <p key={item.playerName}>{item.playerName}: {item.score}</p>
                                        );
                                    }
                                ) : ''
                        }
                    </div>
                </div>
                }

                <button onClick={this.startOver}>Начать заново</button>
                <button onClick={this.goToLeaderboard}>Лидерборд</button>
            </div>
        );
    }

}

export default GameOver;