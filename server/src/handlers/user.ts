import fs from "fs-extra";
import {v4 as uuidv4} from "uuid";
import bcrypt from "bcrypt";

interface User {
    id: string;
    name: string;
    password: string;
    avatar: string | ArrayBuffer | null;
}

export const getAllUsers = (req: any, res: any) => {
    const users = fs.readJsonSync('./src/utils/users.json');
    res.status(200).send(users);
};

export const signup = async (req: any, res: any) => {
    const users = fs.readJsonSync('./src/utils/users.json');
    const {name, password, avatar} = req.body;
    const hash = await hashPassword(password);
    const user = {id: uuidv4(), name, password: hash, avatar};
    users.push(user);
    fs.outputJsonSync('./src/utils/users.json', users);
    req.session.user = user;
    res.status(200).send(users);
};

export const getUser = (req: any, res: any) => {
    const {user} = req.session; //TODO убрать игнор
    if (!user) {
        res.send({loggedIn: false});
    } else {
        res.send({loggedIn: true, user: user});
    }
};

export const login = async (req: any, res: any) => {
    const users = fs.readJsonSync('./src/utils/users.json');
    const {name, password} = req.body;
    const user = users.find((user: User) => user.name === name);
    if (!user) {
        res.status(501).send('Некорректное имя пользователя или пароль');
    } else {
        const valid = await bcrypt.compare(password, user.password);
        if (valid) {
            req.session.user = user;
            res.status(200).send('ок');
        } else {
            res.status(501).send('Некорректное имя пользователя или пароль');
        }
    }
};

const hashPassword = async (password: string): Promise<string> => {
    const hash = await bcrypt.hash(password, 12);
    return hash;
};