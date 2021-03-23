import {Component} from "react";
import './GameOver.css'
import getRoutes from "../../utils/routes";
import {log} from "util";

interface gameOverProps {
    timeIsOver: boolean;
    //wordIsGuessed: boolean;
    wordToGuess: string
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
        console.log(game);
        this.setState({winner: game.winner});
    }
    render() {
        return <div className="GameOver">
            <h5>Игра окончена!</h5>
            {this.props.timeIsOver && <p>Время вышло!</p>}
            <p>Игрок {this.state.winner} отгадал слово {this.props.wordToGuess}</p>
            <p>Слово было : {this.props.wordToGuess}</p>
        </div>
    }
}

export default GameOver