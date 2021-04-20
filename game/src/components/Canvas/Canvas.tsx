import React, {useState, useEffect, useContext} from 'react';
import {Layer, Stage, Line} from "react-konva";
//components
import ColorPalette from "../ColorPalette/ColorPalette";
import {ApiContext} from "../Api/ApiProvider";
//utils
//styles
import './Canvas.css';

interface canvasProps {
    sendImg: (img: string) => void;
}

let isDrawing = false; // TODO вообще-то это лучше сделать useRef, а не глобальной переменной. Но у меня не получилось создать два useRef в компоненте
const Canvas = (props: canvasProps) => {
    const [tool, setTool] = useState('pen');
    const [lines, setLines]: [any, any] = useState([]); //TODO поправить тип
    const [currentLine, setCurrentLine]: [any, any] = useState(null); //TODO поправить тип
    const [color, setColor] = useState('#03161d');
    const [[stageWidth, stageHeight], setStageSize] = useState([550, 750]);
    const context = useContext(ApiContext);

    //const isDrawing = React.useRef(false);
    const stageRef: any = React.useRef(null); //TODO поправить тип
    useEffect(() => {
        const canvas = document.getElementsByClassName('Canvas')[0];
        setStageSize([canvas.clientWidth, canvas.clientHeight]);
        getLinesFromServer();
    }, []);

    const getLinesFromServer = async (): Promise<void> => {
        const game = await context.getGame();
        setLines(game.lines);
    };

    const handleMouseDown = (e: any): void => { //TODO поправить тип
        isDrawing = true;
        const pos = e.target.getStage().getPointerPosition();
        setCurrentLine({tool, points: [pos.x, pos.y], color});
    };

    const handleMouseMove = (e: any): void => { //TODO поправить тип
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

    const addImage = async (img: string): Promise<void> => {
        props.sendImg(img);
    };

    const stopDrawing = async (e: any): Promise<void> => { //TODO поправить тип
        const pos = e.target.getStage().getPointerPosition();
        if (isDrawing) {
            setCurrentLine({...currentLine, points: [...currentLine.points, pos.x, pos.y]});
            setLines([
                ...lines,
                {...currentLine, points: [...currentLine.points, pos.x, pos.y]}
            ]);
            isDrawing = false;
            context.sendLineToServer(currentLine);
            let uri = stageRef.current.toDataURL();
            addImage(uri);
        }
        isDrawing = false;
        setCurrentLine(null);
    };

    const handleMouseUp = async (e: any): Promise<void> => { //TODO поправить тип
        await stopDrawing(e);
    };

    const handleMouseLeave = async (e: any): Promise<void> => { //TODO поправить тип
        await stopDrawing(e);
    };

    const changeColor = (color: string): void => {
        setColor(color);
    };
    const undoLastDrawing = (e: any): void => { //TODO поправить тип
        if (e.keyCode === 90 && e.ctrlKey) {
            let newLines = [...lines];
            newLines.pop();
            setLines(newLines);
        }
        let uri = stageRef.current.toDataURL();
        addImage(uri);
        context.deleteLine();
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
