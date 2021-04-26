enum WebsocketMessage {
    sendSuggestedWordToServer = 'sendSuggestedWordToServer',
    sendPossibleGamesToServer = 'sendPossibleGamesToServer',
    likeWord = 'likeWord',
    dislikeWord = 'dislikeWord',
    register = 'register',
    refresh = 'refresh',
    addWordAndPainter = 'addWordAndPainter',
    sendMessage = 'sendMessage',
    postMarks = 'postMarks',
    setWinner = 'setWinner',
    sendImg = 'sendImg'
}

export default WebsocketMessage;