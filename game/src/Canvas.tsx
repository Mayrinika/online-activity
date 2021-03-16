import React, {useState, useEffect} from 'react';
import './Canvas.css';
import {Layer, Stage, Line} from "react-konva";
import ColorPalette from "./ColorPalette";

let isDrawing = false;
const Canvas = () => {
    const [tool, setTool] = useState('pen');
    const [lines, setLines] = useState([{tool: 'pen', color: '#03161d', points: [0,0]}]);
    const [currentLine, setCurrentLine] = useState({tool: 'pen', color: '#03161d', points: [0,0]});
    const [color, setColor] = useState('#03161d');
    const [[stageWidth, stageHeight], setStageSize] = useState([550, 750]);
    //const isDrawing = React.useRef(false);
    const stageRef: any = React.useRef(null);
    useEffect(() => {
        const canvas = document.getElementsByClassName('Canvas')[0];
        setStageSize([canvas.clientWidth, canvas.clientHeight]);
    }, []);

    const handleMouseDown = (e: any) => {
        isDrawing = true;
        const pos = e.target.getStage().getPointerPosition();
        setCurrentLine({ tool, points: [pos.x, pos.y], color });
    };

    const handleMouseMove = (e: any) => {
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

    const handleMouseUp = (e: any) => {
        const pos = e.target.getStage().getPointerPosition();
        //setCurrentLine(null);
        if (isDrawing) {
            setLines([
                ...lines,
                {...currentLine, points: [...currentLine.points, pos.x, pos.y]}
            ]);
        }
        isDrawing = false;

        const uri = stageRef.current.toDataURL();
        //downloadURI(uri, 'stage.png');
        console.log(uri);
    };

    const downloadURI = (uri: string, name: string) => {
        let link = document.createElement('a');
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const changeColor = (color: string) => {setColor(color)};

    const undoLastDrawing = (e: any) => {
        if (e.keyCode === 90 && e.ctrlKey) {
            let newLines = [...lines];
            newLines.pop();
            setLines(newLines);
        }
    }

    return (
        <div className={"Canvas "+tool} tabIndex={0} onKeyDown={undoLastDrawing}>
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
                    {lines.map((line: any, i: any) => (
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
