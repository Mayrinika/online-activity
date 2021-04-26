export default function getDomRoutes(currentGameId?: string | null) {
    return {
        leaderboard: `/leaderboard`,
        possibleGames: `/possibleGames`,
        game: `/${currentGameId}/game`,
        gameOver: `/${currentGameId}/game-over`,
        startGame: `/${currentGameId}`,
        main: `/`,
        suggestWord: '/suggestWord',
        login: '/login',
        signup: '/signup',
    };
}