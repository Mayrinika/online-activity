import {Component} from "react";
import './GameOver.css'
import getRoutes from "../../utils/routes";

interface gameOverProps {
    isTimeOver: boolean;
    wordToGuess: string;
    isWordGuessed: boolean;
}
interface gameOverState {
    winner: string;
}
class GameOver extends Component<gameOverProps, gameOverState> {
    constructor(props: gameOverProps) {
        super(props);
        this.state = {
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
        this.setState({winner: game.winner});
    }
    render() {
        return <div className="GameOver">
            <h5>Игра окончена!</h5>
            {this.props.isTimeOver && <p>Время вышло!</p>}
            {this.props.isWordGuessed && <p>Игрок {this.state.winner} отгадал слово {this.props.wordToGuess}</p>}
            {!this.props.isWordGuessed && <p>Слово было: {this.props.wordToGuess}</p>}

            <button>Начать заново</button>
            <button>Лидерборд</button>
        </div>
    }
}

export default GameOver