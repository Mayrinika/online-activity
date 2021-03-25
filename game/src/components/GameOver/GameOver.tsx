import {Component} from "react";
import {RouteComponentProps} from 'react-router-dom';
//components
//utils
import getRoutes from "../../utils/routes";
//styles
import './GameOver.css'

interface gameOverProps extends RouteComponentProps {
}

interface gameOverState {
    isTimeOver: boolean;
    isWordGuessed: boolean;
    wordToGuess: string;
    winner: string;
}

class GameOver extends Component<gameOverProps, gameOverState> {
    constructor(props: gameOverProps) {
        super(props);
        this.state = {
            wordToGuess: '',
            isTimeOver: false,
            isWordGuessed: false,
            winner: ''
        }
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
            winner: game.winner
        });
    }

    gameOver = () => {
        this.props.history.push(`/`);
    }

    goToLeaderboard = () => {
        this.props.history.push(`/leaderboard`);
    }

    render() {
        const {isTimeOver, isWordGuessed, winner, wordToGuess} = this.state;
        return (
            <div className="GameOver">
                <h5>Игра окончена!</h5>
                {isTimeOver && <p>Время вышло!</p>}
                {isWordGuessed && <p>Игрок {winner} отгадал слово {wordToGuess}</p>}
                {!isWordGuessed && <p>Слово было: {wordToGuess}</p>}

                <button onClick={this.gameOver}>Начать заново</button>
                <button onClick={this.goToLeaderboard}>Лидерборд</button>
            </div>
        );
    }
}

export default GameOver