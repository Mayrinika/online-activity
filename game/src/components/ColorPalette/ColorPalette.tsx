import React from "react";
import colors from "../../utils/colors";
import './ColorPalette.css'

function ColorPalette(props: any) {
    return (
        <div className="ColorPalette">
            {colors.map(color => (
                <div
                    key={color}
                    className={`color-item ${(props.currentColor === color) ? "active" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                        props.onChangeColor(color);
                    }}
                />
            ))}
        </div>
    );
}

export default ColorPalette;