import React, {useEffect, useRef, useState} from "react";
import "./App.css";
import imageSRC from "./image.jpg";
import {initImageCanvas, onClick, onMouseMove, onMouseOut} from "./functions";

const radius = 70;
const zoom = 1;
const pixelSize = 6;

const App = () => {
    const [selected, setSelected] = useState<Boolean>(false);
    const [color, setColor] = useState<string>("");
    const [img, setImg] = useState<HTMLImageElement | null>(null);
    const [pImg, setPImg] = useState<HTMLImageElement | null>(null);
    const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
    const [ctx, setCTX] = useState<CanvasRenderingContext2D | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current as HTMLCanvasElement;
        const ctx = canvas.getContext("2d", {willReadFrequently: true}) as CanvasRenderingContext2D;
        setCanvas(canvas);
        setCTX(ctx);
        initImageCanvas(canvas, ctx, imageSRC, pixelSize).then(({img, pimg}) => {
            setImg(img)
            setPImg(pimg)
        });
    }, []);

    const onSelectHandler = () => {
        setSelected(!selected)
    }

    const onMouseMoveHandler = (e: React.MouseEvent<HTMLCanvasElement>) => {
        pImg && img && canvas && ctx && selected && onMouseMove(e, radius, zoom, pixelSize, pImg, img, selected, canvas, ctx)
    }

    const onMouseOutHandler = () => {
        img && canvas && ctx && selected && onMouseOut(img, selected, canvas, ctx)
    }

    const onClickHandler = (e: React.MouseEvent<HTMLCanvasElement>) => {
        img && canvas && ctx && selected && onClick(e, selected, canvas, ctx).then(setColor);
    }


    return (
        <div className={`container${selected ? " selected" : ""}`}>
            <div className={"picker-container"} onClick={onSelectHandler}>
                <div className={"picker"}/>
            </div>
            <div className={"canvas-container"}>
                <div className={"color"}>
                    <div className={"bg"} style={{background: color}}/>
                    <div>{color}</div>
                </div>
                <canvas
                    ref={canvasRef}
                    onMouseMove={onMouseMoveHandler}
                    onMouseOut={onMouseOutHandler}
                    onClick={onClickHandler}
                />
            </div>
        </div>
    );
}

export default App;
