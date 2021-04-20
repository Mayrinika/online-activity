import React, {Component} from "react";
import {RouteComponentProps} from "react-router-dom";
//components
import {ApiContext} from "../Api/ApiProvider";
//utils
import getDomRoutes from "../../utils/domRoutes";
//styles
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
    avatar: string | ArrayBuffer | null;
    possibleNames: string[];
    isNameExist: boolean;
    avatarIsLoading: boolean;
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
            localStorage.setItem('playerName', name);
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
            avatar = this.generateAvatar(name);
        }
        await this.context.checkAuthorization();
        await this.context.signup(name, password, avatar);
    };

    generateAvatar(name: string): string {
        const width = 50;
        const height = 50;
        const elem = document.createElement('canvas');
        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#517413'
            ctx.fillRect(0, 0, 50, 50);
            ctx.fillStyle = '#fff'
            ctx.font = "48px serif";
            ctx.fillText(name[0].toUpperCase(), 10, 40);

        }
        const url = elem.toDataURL();
        return url;
    }

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

    handleLoadAvatar = (evt: any): void => {
        this.setState({avatarIsLoading: true});
        const width = 50;
        const height = 50;
        let file = evt.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result as string;
            img.onload = () => {
                const elem = document.createElement('canvas');
                elem.width = width;
                elem.height = height;
                const ctx = elem.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                const url = elem.toDataURL();
                this.setState({avatar: url, avatarIsLoading: false});
            };
            reader.onerror = error => console.log(error);
        };
    };

    render() {
        const {classes} = this.props;
        const {isNameExist, name, password, avatarIsLoading} = this.state;
        return (
            <Container className={classes.outerContainer + " Signup"} maxWidth='lg'>
                <Grid container spacing={2} justify="center">
                    <Grid item xs={5}>
                        <div className={classes.imgContainer}>
                            <img className="Main-Img" src={crocoImg} alt="Крокодил"/>
                        </div>
                    </Grid>
                    <Grid item xs={5} className={classes.loginFormContainer}>
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
                            <input type="file" onChange={this.handleLoadAvatar}/>
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