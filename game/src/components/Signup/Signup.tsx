import React, {Component} from "react";
import {RouteComponentProps} from "react-router-dom";
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getDomRoutes from "../../utils/domRoutes";
import {load, generate} from "../../utils/avatar";
//styles
import './Signup.css'
import crocoImg from "../../img/cocodrilo.png";
import {withStyles, WithStyles} from "@material-ui/core/styles";
import {Button, Container, Grid, Typography, TextField, CircularProgress} from '@material-ui/core';

const styles = (theme: { content: any; }) => (
    theme.content
);

interface SignupProps extends RouteComponentProps, WithStyles<typeof styles> {
}

interface SignupState {
    name: string;
    password: string;
    avatar: string | null;
    possibleNames: string[];
    isNameExist: boolean;
    avatarIsLoading: boolean;
}

interface ChangeEventHandler<HTMLInputElement> {
    target: HTMLInputElement & EventTarget;
}

class Signup extends Component<SignupProps, SignupState> {
    static contextType = ApiContext;

    constructor(props: SignupProps) {
        super(props);
        this.state = {
            name: '',
            password: '',
            possibleNames: [],
            avatar: null,
            isNameExist: false,
            avatarIsLoading: false,
        };
    }

    async componentDidMount() {
        await this.getAllUsers();
    }

    handleSignup = async (evt: React.ChangeEvent<HTMLFormElement>): Promise<void> => {
        const {possibleNames, name} = this.state;
        evt.preventDefault();
        if (possibleNames.includes(name)) {
            this.setState({isNameExist: true});
        } else {
            await this.addName();
            this.setState({name: '', password: '', avatar: null});
            await this.getAllUsers();
            this.props.history.push(getDomRoutes().main);
        }
    };

    getAllUsers = async (): Promise<void> => {
        const allUsers = await this.context.getAllUsers();
        this.setState({possibleNames: allUsers.map((name: { name: string, password: string }) => name.name)});
    };

    addName = async (): Promise<void> => {
        let {name, password, avatar} = this.state;
        if (!avatar) {
            avatar = generate(name);
        }
        await this.context.signup(name, password, avatar);
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
            isNameExist: false,
            [evt.target.name]: evt.target.value
        }));
    };

    handleLoadAvatar = (evt: ChangeEventHandler<HTMLInputElement>): void => {
        this.setState({avatarIsLoading: true});
        load(evt, (url) => this.setState({avatar: url, avatarIsLoading: false}));
    }

    render() {
        const {classes} = this.props;
        const {isNameExist, name, password, avatarIsLoading, avatar} = this.state;
        return (
            <Container className={classes.outerContainer + " Signup"} maxWidth='md'>
                <Grid container spacing={10} justify="center">
                    <Grid item md={5} xs={1} className="Img-Container">
                        <div className={classes.imgContainer}>
                            <img className="Main-Img" src={crocoImg} alt="Крокодил"/>
                        </div>
                    </Grid>
                    <Grid item md={5} xs={12} className={classes.loginFormContainer + " Signup-Right"}>
                        <Typography variant='h4' paragraph>
                            Регистрация
                        </Typography>
                        <form onSubmit={this.handleSignup} className={classes.innerContainer + " Signup-Form"}>
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
                                onChange={this.handleNameChange}
                                value={name}
                                error={isNameExist}
                                helperText={isNameExist ? `Извините, имя ${name} уже занято` : ''}
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
                            />
                            <Button
                                variant="contained"
                                component="label"
                                className="Signup-ChooseFile"
                            >
                                Загрузить аватарку
                                <input type="file" onChange={this.handleLoadAvatar}/>
                            </Button>
                            {avatar && <img src={avatar} alt='avatar' className="avatar"/>}
                            <Button
                                className={classes.button}
                                variant="contained"
                                color="primary"
                                type="submit"
                                size="large"
                                disabled={(isNameExist || avatarIsLoading) && true}
                            >
                                {avatarIsLoading ? <CircularProgress/> : 'Зарегистрироваться'}
                            </Button>
                        </form>
                    </Grid>
                </Grid>
            </Container>
        );
    }
}

export default (withStyles(styles)(Signup));
