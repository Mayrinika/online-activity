import React, {Component} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {v4 as uuidv4} from 'uuid';
import crocoImg from '../../img/cocodrilo.png';
//components
//utils
import getRoutes from "../../utils/routes";
//styles
import './Login.css';


interface loginProps extends RouteComponentProps {
    joinGame: (player: string, gameId: string) => void;
}

type gameType = {
    id: string;
    players: string[];
    wordToGuess: string;
    painter: string;
    img: string;
    chatMessages: string[];
    time: number;
    winner: string;
}

interface loginState {
    name: string;
    code: string;
    possibleGames: gameType[]
}

class Login extends Component<loginProps, loginState> {
    constructor(props: loginProps) {
        super(props);
        this.state = {
            name: '',
            code: '',
            possibleGames: []
        }
    }

    getAllGames = async () => {
        const res = await fetch(getRoutes().root);
        const data = await res.text();
        this.setState({possibleGames: JSON.parse(data)});
    }

    handleChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState((state) => ({
            ...state,
            [evt.target.name]: evt.target.value
        }))
    }

    handleSubmit = async (evt: React.ChangeEvent<HTMLFormElement>) => {
        const {name, code} = this.state;
        evt.preventDefault();
        await this.getAllGames();
        if (code === '') {
            const newCode = uuidv4();
            alert(`code is: ${newCode}`); //TODO использовать библиотеку TOAST вместо alarm
            await this.joinGame(name, newCode);
        } else if (this.state.possibleGames.some(game => game.id === code)) {
            const currentGameId = this.state.possibleGames.find(game => game.id === code);
            if (currentGameId?.players.includes(name)) {
                alert(`name ${name} already exist`); //TODO использовать библиотеку TOAST вместо alarm
            } else {
                await this.joinGame(name, code);
            }
        } else {
            alert('no such play'); //TODO использовать библиотеку TOAST вместо alarm
        }
    }

    joinGame = async (name: string, newCode: string) => {
        const {joinGame, history} = this.props;
        localStorage.setItem('playerName', name);
        localStorage.setItem('gameId', newCode);
        await joinGame(name, newCode);
        history.push(`/${newCode}`);
    }

    render() {
        return (
            <div className="Login">
                <h1 className="Login-Header">Добро пожаловать в онлайн-игру "Крокодил"!</h1>
                <div className="Login-Container">
                    <img className="Login-Img" src={crocoImg} alt="Крокодил"/>
                    <form className="Login-Form" onSubmit={this.handleSubmit}>
                        <label htmlFor="name">Введите ваше имя: <span className="red">*</span></label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Имя"
                            value={this.state.name}
                            onChange={this.handleChange}
                        />
                        <label htmlFor="code">Введите код приглашения (необязательно):</label>
                        <input
                            id="code"
                            type="text"
                            name="code"
                            placeholder="Код"
                            value={this.state.code}
                            onChange={this.handleChange}
                        />
                        <input type="submit" value={'Войти'}/>
                    </form>
                </div>
            </div>
        );
    }
}

export default Login;
