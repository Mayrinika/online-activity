import React from 'react';
import './Timer.css';
import {Box, CircularProgress, Typography} from "@material-ui/core";
export const GAME_TIME: number = 3 * 60;

function Timer(props: {time: number}) {
    const min: number = Math.floor(props.time/60);
    const sec: string = (props.time%60).toString(10).padStart(2,'0');
    const timeProgress = Math.round(props.time * 100 / GAME_TIME);
    return (
        <Box position="relative" display="inline-flex" className="Timer">
            <CircularProgress variant="determinate" value={timeProgress} size={60}/>
            <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Typography
                    variant="subtitle1"
                    component="div"
                    color={timeProgress < 25 ? 'error' : 'primary'}
                >
                    {min}:{sec}
                </Typography>
            </Box>
        </Box>
    );
}
export default Timer;
