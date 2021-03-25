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
    }, []);

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

    const addImage = async (gameId: string | null, img: string) => {
        await fetch(getRoutes(gameId).addImg, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({img})
        });
    }

    const handleMouseUp = async (e: any) => { //TODO поправить тип
        const pos = e.target.getStage().getPointerPosition();
        if (isDrawing) {
            setLines([
                ...lines,
                {...currentLine, points: [...currentLine.points, pos.x, pos.y]}
            ]);
        }
        setCurrentLine(null);
        isDrawing = false;

        let uri = stageRef.current.toDataURL();
        //downloadURI(uri, 'stage.png');

        await addImage(localStorage.getItem('gameId'), uri);
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

    const undoLastDrawing = (e: any) => { //TODO поправить тип
        if (e.keyCode === 90 && e.ctrlKey) {
            let newLines = [...lines];
            newLines.pop();
            setLines(newLines);
        }
    }

    return (
        <div className={"Canvas " + tool} tabIndex={0} onKeyDown={undoLastDrawing}>
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
