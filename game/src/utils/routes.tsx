export default function getRoutes(currentGameId?: string | null) {
    const api = '/api';
    return {
        games: `${api}/games`,
        gameId: `${api}/${currentGameId}`,
        restartGame: `${api}/${currentGameId}/restartGame`,
        chatMessages: `${api}/${currentGameId}/chatMessages`,
        addMark:`${api}/${currentGameId}/addMark`,
        addPlayer: `${api}/${currentGameId}/addPlayer`,
        addImg: `${api}/${currentGameId}/addImg`,
        deleteLine: `${api}/${currentGameId}/deleteLine`,
        addWordAndPainter: `${api}/${currentGameId}/addWordAndPainter`,
        clearCountdown: `${api}/${currentGameId}/clearCountdown`,
        setWinner: `${api}/${currentGameId}/setWinner`,
        setTimeIsOver: `${api}/${currentGameId}/setTimeIsOver`,
        addLine: `${api}/${currentGameId}/addLine`,
        leaderboard: `${api}/leaderboard`,
        suggestedWords: `${api}/suggestedWords`,
        possibleGames:`${api}/possibleGames`,
        signup: `${api}/signup`,
        login: `${api}/login`,
        logout: `${api}/logout`,
        changePassword: `${api}/changePassword`,
        changeAvatar: `${api}/changeAvatar`,
    }
}