export default function getDomRoutes(currentGameId?: string | null) {
    return {
        leaderboard: `/leaderboard`,
        game: `/${currentGameId}/game`,
        gameOver: `/${currentGameId}/game-over`,
        startGame: `/${currentGameId}`,
        login: `/`,
        suggestWord: '/suggestWord'
    };
}