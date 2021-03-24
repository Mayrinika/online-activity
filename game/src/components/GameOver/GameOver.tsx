import {Component} from "react";
import './GameOver.css'
import getRoutes from "../../utils/routes";

interface gameOverProps {
    isTimeOver: boolean;
    wordToGuess: string;
    isWordGuessed: boolean;
    winner: string;
}

class GameOver extends Component<gameOverProps, {}> {
    render() {
        return <div className="GameOver">
            <h5>Игра окончена!</h5>
            {this.props.isTimeOver && <p>Время вышло!</p>}
            {this.props.isWordGuessed && <p>Игрок {this.props.winner} отгадал слово {this.props.wordToGuess}</p>}
            {!this.props.isWordGuessed && <p>Слово было: {this.props.wordToGuess}</p>}

            <button>Начать заново</button>
            <button>Лидерборд</button>
        </div>
    }
}

export default GameOver