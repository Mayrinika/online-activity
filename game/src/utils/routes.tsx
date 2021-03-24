const serverURL = 'http://localhost:9000/';

export default function getRoutes(currentGameId?: string | null) {
    return {
        root: `${serverURL}`,
        gameId: `${serverURL}${currentGameId}`,
        chatMessages: `${serverURL}${currentGameId}/chatMessages`,
        addPlayer: `${serverURL}${currentGameId}/addPlayer`,
        addImg: `${serverURL}${currentGameId}/addImg`,
        addWordAndPainter: `${serverURL}${currentGameId}/addWordAndPainter`,
        clearCountdown: `${serverURL}${currentGameId}/clearCountdown`,
        setWinner: `${serverURL}${currentGameId}/setWinner`,
        setTimeIsOver: `${serverURL}${currentGameId}/setTimeIsOver`,
    }
}