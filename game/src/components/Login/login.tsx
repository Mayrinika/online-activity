import React, {Component} from "react";
import {RouteComponentProps} from "react-router-dom";
import getRoutes from "../../utils/routes";

interface Login2Props extends RouteComponentProps{

}

interface Login2State {
    name: string;
    password: string;
    possibleNames: string[];
    nameIsTaken: boolean;
}

class Login2 extends Component<Login2Props, Login2State> {
    constructor(props: Login2Props) {
        super(props);
        this.state = {
            name: '',
            password: '',
            possibleNames: [],
            nameIsTaken: false,
        }
    }
    async componentDidMount() {
        await this.getAllNames();
    }

    getAllNames = async () => {
        const res = await fetch(getRoutes().names);
        const data = await res.text();
        this.setState({possibleNames: JSON.parse(data)});
    }

    handleChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
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
    handleLogin = (evt: React.ChangeEvent<HTMLFormElement>) => {
        evt.preventDefault();
    }
    render() {
        return (
            <form onSubmit={this.handleLogin}>
                <label htmlFor="name">Введите ваше имя</label>
                <input
                    type="text"
                    id="name"
                    placeholder="Имя"
                    name="name"
                    value={this.state.name}
                    onChange={this.handleChange}
                />
                <label htmlFor="password">Введите ваш пароль</label>
                <input
                    type="password"
                    id="password"
                    placeholder="Пароль"
                    name="password"
                    value={this.state.password}
                    onChange={this.handleChange}
                />
                {this.state.nameIsTaken && <p>Извините, имя {this.state.name} уже занято</p>}
                <input type="submit"/>
            </form>
        )
    }
}

export default Login2;