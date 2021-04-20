import React from "react";
//utils
import colors from "../../utils/colors";
//styles
import './ColorPalette.css'

interface ColorPalletteProps {
    currentColor: string;
    onChangeColor(color: string): void;
}

function ColorPalette(props: ColorPalletteProps) {
    return (
        <div className="ColorPalette">
            {colors.map(color => (
                <div
                    key={color}
                    className={`color-item ${(props.currentColor === color) ? "active" : ""}`}
                    style={{backgroundColor: color}}
                    onClick={() => {
                        props.onChangeColor(color);
                    }}
                />
            ))}
        </div>
    );
}

export default ColorPalette;