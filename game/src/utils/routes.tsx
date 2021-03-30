export default function getRoutes(currentGameId?: string | null) {
    return {
        app: `/app`,
        gameId: `/${currentGameId}`,
        chatMessages: `/${currentGameId}/chatMessages`,
        addMark:`/${currentGameId}/addMark`,
        addPlayer: `/${currentGameId}/addPlayer`,
        addImg: `/${currentGameId}/addImg`,
        addWordAndPainter: `/${currentGameId}/addWordAndPainter`,
        clearCountdown: `/${currentGameId}/clearCountdown`,
        setWinner: `/${currentGameId}/setWinner`,
        setTimeIsOver: `/${currentGameId}/setTimeIsOver`,
        addLine: `/${currentGameId}/addLine`,
        leaderboard: `/leaderboard`
    }
}