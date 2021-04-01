const ws = new WebSocket('ws://localhost:8080');

const useWebSocket = {
    register: ws.send(JSON.stringify({'gameId':localStorage.getItem('gameId'),'messageType':'register'})),
}

export default useWebSocket;