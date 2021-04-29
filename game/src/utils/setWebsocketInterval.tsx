export default function setInterval(ws: WebSocket) {
    const send = function (message: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
        waitForConnection(function () {
            return ws.send(message);
        }, 100);
    };

    const waitForConnection = function (callback: () => void, interval: number) {
        if (ws.readyState === 1) {
            callback();
        } else {
            setTimeout(function () {
                waitForConnection(callback, interval);
            }, interval);
        }
    };

    return send;
}