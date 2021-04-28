export enum WebsocketMessage {
    sendSuggestedWordToServer = 'sendSuggestedWordToServer',
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

export class WS extends WebSocket{
    constructor(url:string = 'ws://localhost:9000') {
        super(url);
    }

    addPlayer = async (gameId: string, player: string | null): Promise<void> => {
        //ws = new WebSocket('ws://localhost:9000');
        const send = (message: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) => {
            waitForConnection(() => {
                return this.send(message);
            }, 100);
        };

        const waitForConnection = (callback: () => void, interval: number) => {
            if (this.readyState === 1) {
                callback();
            } else {
                setTimeout(function () {
                    waitForConnection(callback, interval);
                }, interval);
            }
        };
        send(JSON.stringify({'gameId': gameId, 'messageType': WebsocketMessage.register, 'player': player}));
    };

    refreshConnection = (): void => {
        //newWS = new WebSocket('ws://localhost:9000');
        const send = (message: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) => {
            waitForConnection(() => {
                return this.send(message);
            }, 100);
        };

        const waitForConnection = (callback: () => void, interval: number) => {
            if (this.readyState === 1) {
                callback();
            } else {
                setTimeout(function () {
                    waitForConnection(callback, interval);
                }, interval);
            }
        };
        send(JSON.stringify({'messageType': WebsocketMessage.refresh, 'gameId': localStorage.getItem('gameId')}));
    };
}


