import React, {useState} from 'react';
import './Canvas.css';
import {Layer, Stage, Line} from "react-konva";
import ColorPalette from "./ColorPalette";

const Canvas = () => {
    const [tool, setTool]: [any, any] = React.useState('pen');
    const [lines, setLines]: [any, any] = React.useState([]);
    const [currentLine, setCurrentLine]: [any, any] = React.useState(null);
    const [color, setColor]: [any, any] = React.useState('#03161d');
    const isDrawing = React.useRef(false);

    const handleMouseDown = (e: any) => {
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        setCurrentLine({ tool, points: [pos.x, pos.y], color });
    };

    const handleMouseMove = (e: any) => {
        // no drawing - skipping
        if (!isDrawing.current) {
            return;
        }
        const pos = e.target.getStage().getPointerPosition();
        setCurrentLine({
            ...currentLine,
            points: [...currentLine.points, pos.x, pos.y]
        });

    };

    const handleMouseUp = (e: any) => { //todo: if start to draw line outside Canvas and mouse up inside Canvas => error
        isDrawing.current = false;
        const pos = e.target.getStage().getPointerPosition();
        setCurrentLine(null);
        setLines([
            ...lines,
            { ...currentLine, points: [...currentLine.points, pos.x, pos.y] }
        ]);
    };

    const changeColor = (color: any) => {
        setColor(color)
    };

    return (
        <div className="Canvas">
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
                className="Canvas-Stage"
                width={550} //todo make responsive
                height={700}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
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
                                line.tool === 'eraser' ? 20 : 2
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
