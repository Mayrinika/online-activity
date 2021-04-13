import React, {Component} from "react";
import {RouteComponentProps} from "react-router-dom";
//components
//utils
import getRoutes from "../../utils/routes";
import getDomRoutes from "../../utils/domRoutes";
import checkLogin from "../../utils/checkLogin";

//styles

interface SignupProps extends RouteComponentProps {
    setAuthorized: () => void;
}

interface SignupState {
    name: string;
    password: string;
    possibleNames: string[];
    nameIsTaken: boolean;
}

class Signup extends Component<SignupProps, SignupState> {
    constructor(props: SignupProps) {
        super(props);
        this.state = {
            name: '',
            password: '',
            possibleNames: [],
            nameIsTaken: false,
        };
    }

    async componentDidMount() {
        await this.getAllNames();
        checkLogin(this.props.setAuthorized);
    }

    handleSignup = async (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
        if (!this.state.nameIsTaken) {
            await this.addName();
            localStorage.setItem('playerName', this.state.name);
            this.setState({name: '', password: ''});
            await this.getAllNames();
            this.props.setAuthorized();
            this.props.history.push(getDomRoutes().main);
        }
    };

    getAllNames = async () => {
        const res = await fetch(getRoutes().signup);
        const data = await res.text();
        this.setState({possibleNames: JSON.parse(data).map((name: { name: string, password: string }) => name.name)});
    };

    addName = async () => {
        await fetch('/cookie-auth-protected-route', {credentials: 'include'});
        await fetch(getRoutes().signup, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({name: this.state.name, password: this.state.password})
        });
    };

    handleChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState((state) => ({
            ...state,
            [evt.target.name]: evt.target.value
        }));
    };

    handleNameChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState((state) => ({
            ...state,
            [evt.target.name]: evt.target.value
        }));
        if (this.state.possibleNames.includes(evt.target.value)) {
            this.setState({nameIsTaken: true});
        } else {
            this.setState({nameIsTaken: false});
        }
    };

    render() {
        return (
            <form onSubmit={this.handleSignup}>
                <label htmlFor="name">Введите ваше имя</label>
                <input
                    type="text"
                    id="name"
                    placeholder="Имя"
                    name="name"
                    value={this.state.name}
                    onChange={this.handleNameChange}
                    required={true}
                    autoFocus
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
                {this.state.nameIsTaken && <p>Извините, имя {this.state.name} уже занято</p>}
                <input type="submit"/>
            </form>
        );
    }
}

export default Signup;