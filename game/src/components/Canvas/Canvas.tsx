import React, {useState, useEffect} from 'react';
import {Layer, Stage, Line} from "react-konva";
//components
import ColorPalette from "../ColorPalette/ColorPalette";
//utils
import getRoutes from '../../utils/routes';
//styles
import './Canvas.css';

interface canvasProps {
}

let isDrawing = false; // TODO вообще-то это лучше сделать useRef, а не глобальной переменной. Но у меня не получилось создать два useRef в компоненте
const Canvas = (props: canvasProps) => {
    const [tool, setTool] = useState('pen');
    const [lines, setLines]: [any, any] = useState([]); //TODO поправить тип
    const [currentLine, setCurrentLine]: [any, any] = useState(null); //TODO поправить тип
    const [color, setColor] = useState('#03161d');
    const [[stageWidth, stageHeight], setStageSize] = useState([550, 750]);

    //const isDrawing = React.useRef(false);
    const stageRef: any = React.useRef(null); //TODO поправить тип
    useEffect(() => {
        const canvas = document.getElementsByClassName('Canvas')[0];
        setStageSize([canvas.clientWidth, canvas.clientHeight]);
        getLinesFromServer();
    }, []);

    const getLinesFromServer = async () => {
        const res = await fetch(getRoutes(localStorage.getItem('gameId')).gameId);
        const data = await res.text();
        const game = JSON.parse(data);
        setLines(game.lines)
    }

    const handleMouseDown = (e: any) => { //TODO поправить тип
        isDrawing = true;
        const pos = e.target.getStage().getPointerPosition();
        setCurrentLine({tool, points: [pos.x, pos.y], color});
    };

    const handleMouseMove = (e: any) => { //TODO поправить тип
        // no drawing - skipping
        if (!isDrawing) {
            return;
        }
        const pos = e.target.getStage().getPointerPosition();
        setCurrentLine({
            ...currentLine,
            points: [...currentLine.points, pos.x, pos.y]
        });
    };

    const addImage = async (img: string) => {
        await fetch(getRoutes(localStorage.getItem('gameId')).addImg, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({img})
        });
    }

    const sendLineToServer = async (line: any) => {
        await fetch(getRoutes(localStorage.getItem('gameId')).addLine, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({line})
        });
    }

    const stopDrawing = async (e: any) => { //TODO поправить тип
        const pos = e.target.getStage().getPointerPosition();
        if (isDrawing) {
            setCurrentLine({...currentLine, points: [...currentLine.points, pos.x, pos.y]});
            isDrawing = false;
            await sendLineToServer(currentLine);
            let uri = stageRef.current.toDataURL();
            await getLinesFromServer();
            await addImage(uri);
        }
        isDrawing = false;
        setCurrentLine(null);
        //downloadURI(uri, 'stage.png');
    }

    const handleMouseUp = async (e: any) => { //TODO поправить тип
        await stopDrawing(e);
    };

    const handleMouseLeave = async (e: any) => { //TODO поправить тип
        await stopDrawing(e)
    };

    //TODO удалить потом. Нужно только для визуализации
    // const downloadURI = (uri: string, name: string) => {
    //     let link = document.createElement('a');
    //     link.download = name;
    //     link.href = uri;
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    // }

    const changeColor = (color: string) => {
        setColor(color)
    };

    // const undoLastDrawing = (e: any) => { //TODO поправить тип //TODO решить будем ли отменять последнюю линию с сервера с помощью пост запроса. Минусы: если при нажатии ctrZ будет задержка, художник может еще пару раз нажать и отменит больше линий чем нужно
    //     if (e.keyCode === 90 && e.ctrlKey) {
    //         let newLines = [...lines];
    //         newLines.pop();
    //         setLines(newLines);
    //     }
    // }

    return (
        //onKeyDown={undoLastDrawing} TODO добавить в следующую строчку если будем отменять последнее действие с сервера
        <div className={"Canvas " + tool} tabIndex={0} >
            <div className="Canvas-ControlPanel">
                <ColorPalette currentColor={color} onChangeColor={changeColor}/>
                <select
                    className="Canvas-Selector"
                    value={tool}
                    onChange={(e) => {
                        setTool(e.target.value);
                    }}
                >
                    <option value="pen">Pen</option>
                    <option value="eraser">Eraser</option>
                </select>
            </div>
            <Stage
                ref={stageRef}
                className="Canvas-Stage"
                width={stageWidth}
                height={stageHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <Layer className="Canvas-Layer">
                    {tool === 'pen' &&
                    <Line
                        {...currentLine}
                        strokeWidth={2}
                        stroke={color}
                    />
                    }
                    {lines.map((line: { tool: string, points: number[], color: string }, i: number) => (
                        <Line
                            key={i}
                            points={line.points}
                            stroke={line.color}
                            strokeWidth={
                                line.tool === 'eraser' ? 100 : 2
                            }
                            tension={0.5}
                            lineCap="round"
                            globalCompositeOperation={
                                line.tool === 'eraser' ? 'destination-out' : 'source-over'
                            }
                        />
                    ))}
                </Layer>
            </Stage>
        </div>
    );
};


export default Canvas;
