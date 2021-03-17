import React from 'react';
import './Timer.css';

type TimerProps = {
    time: number;
    timeIsOver: () => void;
}

function Timer(props: TimerProps) {
    const [seconds, setSeconds] = React.useState(props.time);
    let timerId: ReturnType<typeof setTimeout>; //TODO убрать let. Кооментарий от Антона: Почитай как useEffect работает, из него можно вернуть функцию, которая отменит подписку на событие, это можно использовать!
    React.useEffect(() => {
        if (seconds > 0) {
            timerId = setTimeout(() => setSeconds(seconds - 1), 1000);
        } else {
            clearInterval(timerId);
            props.timeIsOver();
        }
    }, [seconds]);

    const min: number = Math.floor(seconds/60);
    const sec: string = (seconds%60).toString(10).padStart(2,'0');
    return (
        <div className="Timer">
            <div>
                {min}:{sec}
            </div>
        </div>
    );
}

export default Timer;
