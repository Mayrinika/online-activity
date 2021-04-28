import React, {Component} from "react";
import {RouteComponentProps} from "react-router-dom";
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getDomRoutes from "../../utils/domRoutes";
//styles
import './Login.css';
import crocoImg from "../../img/cocodrilo.png";
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Grid, Typography, TextField} from '@material-ui/core';

const styles = (theme: { content: any; }) => (
    theme.content
);

interface LoginProps extends RouteComponentProps, WithStyles<typeof styles> {
}

interface LoginState {
    name: string;
    password: string;
    isIncorrect: boolean;
}

class Login extends Component<LoginProps, LoginState> {
    static contextType = ApiContext;
    private _isMounted: boolean;

    constructor(props: LoginProps) {
        super(props);
        this.state = {
            name: '',
            password: '',
            isIncorrect: false,
        };
        this._isMounted = false;
    }

    async componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState((state) => ({
            ...state,
            isIncorrect: false,
            [evt.target.name]: evt.target.value
        }));
    };
    handleLogin = async (evt: React.ChangeEvent<HTMLFormElement>): Promise<void> => {
        evt.preventDefault();
        await this.login();
        if (!this.state.isIncorrect) {
            this.props.history.push(getDomRoutes().main);
        }
        if (this._isMounted) {
            this.setState({name: '', password: ''});
        }
    };
    login = async (): Promise<void> => {
        const {name, password} = this.state;
        const user = await this.context.login(name, password);
        if (user.error) {
            this.setState({isIncorrect: true});
        } else {
            this.setState({isIncorrect: false});
        }
    };

    render() {
        const {classes} = this.props;
        const {isIncorrect, name, password} = this.state;
        return (
            <Container className={classes.outerContainer + " Login"} maxWidth='md'>
                <Grid container spacing={10} justify="center">
                    <Grid item md={5} xs={1} className="Img-Container">
                        <div className={classes.imgContainer}>
                            <img className="Main-Img" src={crocoImg} alt="Крокодил"/>
                        </div>
                    </Grid>
                    <Grid item md={5} xs={12} className={classes.loginFormContainer}>
                        <Typography variant='h4' paragraph>
                            Вход
                        </Typography>
                        <form onSubmit={this.handleLogin} className={classes.innerContainer + " Login-Form"}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                type="text"
                                label="Введите ваше имя"
                                name="name"
                                autoFocus
                                onChange={this.handleChange}
                                value={name}
                                error={isIncorrect}
                                helperText={isIncorrect ? 'Неверный логин или пароль' : ''}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="password"
                                type="password"
                                label="Введите пароль"
                                name="password"
                                onChange={this.handleChange}
                                value={password}
                                error={isIncorrect}
                                helperText={isIncorrect ? 'Неверный логин или пароль' : ''}
                            />
                            <Button
                                className={classes.button}
                                variant="contained"
                                color="primary"
                                type="submit"
                                size="large"
                            >
                                Войти
                            </Button>
                        </form>
                    </Grid>
                </Grid>
            </Container>
        );
    }
}

export default (withStyles(styles)(Login));