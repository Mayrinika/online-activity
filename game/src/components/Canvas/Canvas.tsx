import React, {useState, useEffect, useContext} from 'react';
import {Layer, Stage, Line} from "react-konva";
import {Stage as StageType} from "konva/types/Stage";
//components
import ColorPalette from "../ColorPalette/ColorPalette";
import {ApiContext} from "../Api/ApiProvider";
//utils
import {Line as LineInterface} from "../../utils/Types/types"
//styles
import './Canvas.css';
import Konva from "konva";
import {GetSet} from "konva/types/types";

interface canvasProps {
    sendImg: (img: string) => void;
}

let isDrawing = false;
const Canvas = (props: canvasProps) => {
    const [tool, setTool] = useState('pen');
    const [lines, setLines] = useState<LineInterface[]>([]);
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

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent> | Konva.KonvaEventObject<TouchEvent>): void => {
        isDrawing = true;
        if (e) {
            if (e.target) {
                const pos = e.target.getStage();
                if (pos) {
                    pos.getPointerPosition();
                    setLines([...lines, {tool, points: [pos.x, pos.y], color}]);
                }
            }
        }
    };

    const handleMouseMove = (e: any): void => { //TODO поправить тип
        if (!isDrawing) {
            return;
        }
        const pos = e.target.getStage().getPointerPosition();
        let lastLine = lines[lines.length - 1];
        lastLine.points = lastLine.points.concat([pos.x, pos.y]);
        lines.splice(lines.length - 1, 1, lastLine);
        setLines(lines.concat());
    };

    const addImage = async (img: string): Promise<void> => {
        props.sendImg(img);
    };

    const stopDrawing = async (e: any): Promise<void> => { //TODO поправить тип
        if (isDrawing) {
            context.sendLineToServer(lines[lines.length - 1]);
            let uri = stageRef.current.toDataURL();
            addImage(uri);
        }
        isDrawing = false;
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
            let uri = stageRef.current.toDataURL();
            addImage(uri);
            context.deleteLine();
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
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
            >
                <Layer className="Canvas-Layer">
                    {lines.map((line: { tool: string, points: GetSet<number, StageType>[], color: string }, i: number) => (
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
