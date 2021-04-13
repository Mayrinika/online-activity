import React, {Component} from "react";
import {RouteComponentProps} from "react-router-dom";
//components
//utils
import getRoutes from "../../utils/routes";
import getDomRoutes from "../../utils/domRoutes";
import checkLogin from "../../utils/checkLogin";
//styles

interface LoginProps extends RouteComponentProps{
    setAuthorized: () => void;
}

interface LoginState {
    name: string;
    password: string;
    isIncorrect: boolean;
}

class Login extends Component<LoginProps, LoginState> {
    private _isMounted: boolean;
    constructor(props: LoginProps) {
        super(props);
        this.state = {
            name: '',
            password: '',
            isIncorrect: false,
        }
        this._isMounted = false
    }
    async componentDidMount() {
        checkLogin(this.props.setAuthorized)
        this._isMounted = true;
    }
    componentWillUnmount() {
        this._isMounted = false;
    }

    handleChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState((state) => ({
            ...state,
            [evt.target.name]: evt.target.value
        }));
    };
    handleLogin = async (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
        await this.login();
        if (!this.state.isIncorrect) {
            localStorage.setItem('playerName', this.state.name);
            this.props.setAuthorized();
            this.props.history.push(getDomRoutes().main);
        }
        if (this._isMounted) {
            this.setState({name: '', password: ''});
        }
    }
    login = async () => {
        await fetch('/cookie-auth-protected-route',{ credentials: 'include' });
        const response = await fetch(getRoutes().login, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({name: this.state.name, password: this.state.password})
        });
        if (response.status === 501) {
            this.setState({isIncorrect:true});
        } else {
            this.setState({isIncorrect:false});
        }
    }
    render() {
        return (
            <form onSubmit={this.handleLogin}>
                {this.state.isIncorrect && <p>Неправильный логин или пароль, попробуйте еще раз</p>}
                <label htmlFor="name">Введите ваше имя</label>
                <input
                    type="text"
                    id="name"
                    placeholder="Имя"
                    name="name"
                    value={this.state.name}
                    onChange={this.handleChange}
                    required={true}
                />
                <label htmlFor="password">Введите ваш пароль</label>
                <input
                    type="password"
                    id="password"
                    placeholder="Пароль"
                    name="password"
                    value={this.state.password}
                    onChange={this.handleChange}
                    required={true}
                />
                <input type="submit"/>
            </form>
        )
    }
}

export default Login;