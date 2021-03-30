import { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
//components
//utils
import getRoutes from '../../utils/routes';
//styles
import './GameOver.css';

interface gameOverProps extends RouteComponentProps {
}

interface localLeaderboardType {
    playerName: string;
    score: number;
}

interface message {
    id: string;
    name: string;
    text: string;
    marks: {
        hot: boolean;
        cold: boolean;
    };
}

interface gameOverState {
    isTimeOver: boolean;
    isWordGuessed: boolean;
    wordToGuess: string;
    winner: string;
    painter: string;
    chatMessages: message[];
    players: [];
    //localLeaderboard: localLeaderboardType[];
}

class GameOver extends Component<gameOverProps, gameOverState> {
    private localLeaderboard: localLeaderboardType[] = [];

    constructor(props: gameOverProps) {
        super(props);
        this.state = {
            wordToGuess: '',
            isTimeOver: false,
            isWordGuessed: false,
            winner: '',
            painter: '',
            chatMessages: [],
            players: []
            //localLeaderboard: []
        };
    }

    async componentDidMount() {
        await this.getDataFromServer();
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
        }, () => this.calculateScores());
    };

    calculateScores = () => {
        const results = [];
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

        // this.setState({
        //     localLeaderboard: results
        // });

        this.localLeaderboard = results;
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

    gameOver = () => {
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
                {isWordGuessed &&
                <div>
                    <p>Игрок {winner} отгадал слово {wordToGuess}</p>
                    <div>
                        {
                            this.localLeaderboard.length > 0 ?
                                this.localLeaderboard.map(item => {
                                        return (
                                            <p key={item.playerName}>{item.playerName}: {item.score}</p>
                                        );
                                    }
                                ) : 'длина < 0'
                        }
                    </div>
                </div>
                }

                <button onClick={this.gameOver}>Начать заново</button>
                <button onClick={this.goToLeaderboard}>Лидерборд</button>
            </div>
        );
    }

}

export default GameOver;