import React, {Component} from 'react';
import './Login.css';
import crocoImg from './img/cocodrilo.png'

type loginProps = {
    possibleGames:string[];
}
type loginState = {
    name: string,
    code: string
}

class Login extends Component<any, any>{
    constructor(props: loginProps) {
        super(props);
        this.state = {
            name: '',
            code: '',
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(evt: any): void {
        this.setState({
            [evt.target.name]: evt.target.value
        })
    }
    handleSubmit(evt: any) {
        evt.preventDefault();
        if (this.state.code === '') {
            const newCode = makeRandomStr()
            alert(`code is: ${newCode}`)
            this.props.joinGame(this.state.name, newCode);
        } else if (this.props.possibleGames.includes(this.state.code)) {
            this.props.joinGame(this.state.name, this.state.code);
        } else {
            alert('no such play');
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

function makeRandomStr(): string {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

export default Login;
