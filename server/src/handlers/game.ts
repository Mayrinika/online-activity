import fs from "fs-extra";

export const GAME_TIME: number = 1 * 60; //TODO 1 минута для тестирования, на продакшн изменить время (напрмиер 3 минуты)
export const timerIds: any = {}; //TODO разобраться с типом TimerIds

interface Player {
    name: string,
    avatar: string | ArrayBuffer | null;
}

interface GameType {
    id: string;
    players: Player[];
    wordToGuess: string;
    painter: Player;
    img: string;
    chatMessages: Message[];
    time: number;
    winner: string;
    scores: {player: Player, score: number}[];
    isWordGuessed: boolean;
    isTimeOver: boolean;
    isGameOver: boolean;
    lines: any[]; //TODO разобраться с типом
}

interface Message {
    id: string;
    name: string;
    avatar: string | ArrayBuffer | null;
    text: string;
    marks: {
        hot: boolean;
        cold: boolean;
    };
}

interface SuggestedWord {
    id: string;
    word: string;
    likes: string[];
    dislikes: string[];
    isApproved: boolean;
    isDeclined: boolean;
    isInDictionary: boolean;
}

export const suggestedWords: SuggestedWord[] = [];

export const games: GameType[] = [];

export const getAllGames = (req:any, res:any) => {
    res.status(200).send(games);
};

export const getSuggestedWords = (req:any, res:any) => {
    res.status(200).send(suggestedWords);
};

export const getLeaderboard = (req:any, res:any) => {
    const leaderboard = fs.readJsonSync('./src/utils/leaderboard.json');
    res.status(200).send(leaderboard.players);
};

// export const updateLeaderboard = (req:any, res:any) => {
//     const leaderboard = fs.readJsonSync('./src/utils/leaderboard.json');
//     for (const {playerName, score, avatar} of req.body) {
//         if (playerName in leaderboard.players)
//             leaderboard.players[playerName] += score;
//         else
//             leaderboard.players[playerName] = score;
//     }
//     fs.outputJsonSync('./src/utils/leaderboard.json', leaderboard);
//     res.status(200).send(leaderboard);
// };

export const getCurrentGame = (req:any, res:any) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    res.status(200).send(currentGame);
};

export const addGame = (req:any, res:any) => {
    games.push({
        id: req.params.gameId,
        players: [],
        wordToGuess: '',
        painter: {name:'', avatar: null},
        img: '',
        chatMessages: [],
        time: GAME_TIME,
        winner: '',
        scores: [],
        isWordGuessed: false,
        isTimeOver: false,
        isGameOver: false,
        lines: [],
    });
    res.status(200).send(games);
};

export const addLine = (req:any, res:any) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.lines.push(req.body.line);
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
};

export const deleteLine = (req: any, res: any) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.lines.pop();
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
};

export const clearCountdown = (req:any, res:any) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        clearTimeout(timerIds[currentGame.id]);
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
};

export const setTimeIsOver = (req:any, res:any) => {
    const currentGame = games.find(game => game.id === req.params.gameId);
    if (currentGame) {
        currentGame.isTimeOver = true;
        currentGame.isGameOver = true;
        res.status(200).send(games);
    } else {
        res.status(500).send('Game not found');
    }
};


