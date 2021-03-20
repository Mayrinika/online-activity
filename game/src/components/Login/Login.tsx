import React, {Component} from 'react';
import {v4 as uuidv4} from 'uuid';
import crocoImg from '../../img/cocodrilo.png';
//components
//utils
import getRoutes from "../../utils/routes";
//styles
import './Login.css';


interface gameType {
    id: string;
    players: string [];
}

interface loginProps {
    possibleGames: gameType[];
    joinGame: (player: string, gameId: string) => void;
    getAllGames: () => void;
}

interface loginState {
    name: string;
    code: string;
}

class Login extends Component<loginProps, loginState> {
    constructor(props: loginProps) {
        super(props);
        this.state = {
            name: '',
            code: '',
        }
    }

    handleChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState((state) => ({
            ...state,
            [evt.target.name]: evt.target.value
        }))
    }

    handleSubmit = async (evt: React.ChangeEvent<HTMLFormElement>) => {
        const {name, code} = this.state;
        const {possibleGames, getAllGames} = this.props;
        evt.preventDefault();
        await getAllGames();
        if (code === '') {
            const newCode = uuidv4();
            alert(`code is: ${newCode}`); //TODO использовать библиотеку TOAST вместо alarm
            this.props.joinGame(name, newCode);
        } else if (possibleGames.some(game => game.id === code)) {
            const currentGameId = possibleGames.find(game => game.id === code);
            if (currentGameId?.players.includes(name)) {
                alert(`name ${name} already exist`); //TODO использовать библиотеку TOAST вместо alarm
            } else {
                this.props.joinGame(name, code);
            }
        } else {
            alert('no such play'); //TODO использовать библиотеку TOAST вместо alarm
        }
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
                        <input type="submit"/>
                    </form>
                </div>
            </div>
        );
    }
}

export default Login;
