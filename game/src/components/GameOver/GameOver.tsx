import {Component} from "react";
import {RouteComponentProps} from 'react-router-dom';
import './GameOver.css'
import getRoutes from "../../utils/routes";

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
        const res = await fetch(getRoutes(localStorage.getItem('id')).gameId);
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

    render() {
        const {isTimeOver, isWordGuessed, winner, wordToGuess} = this.state;
        return (
            <div className="GameOver">
                <h5>Игра окончена!</h5>
                {isTimeOver && <p>Время вышло!</p>}
                {isWordGuessed && <p>Игрок {winner} отгадал слово {wordToGuess}</p>}
                {!isWordGuessed && <p>Слово было: {wordToGuess}</p>}

                <button onClick={this.gameOver}>Начать заново</button>
                <button>Лидерборд</button>
            </div>
        );
    }
}

export default GameOver