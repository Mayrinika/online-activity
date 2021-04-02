import React, {useEffect} from 'react';
//components
//utils
import getRoutes from "../../utils/routes";
//styles
import './Timer.css';

function Timer(props: {time: number}) {
    const min: number = Math.floor(props.time/60);
    const sec: string = (props.time%60).toString(10).padStart(2,'0');
    return (
        <div className="Timer">
            <div>
                {min}:{sec}
            </div>
        </div>
    );
}

export default Timer;
