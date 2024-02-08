import React, {useEffect, useRef, useState} from "react";
import "./App.css";
import {initImageCanvas, onClick, onLoadImage, onMouseMove, onMouseOut} from "./functions";
import {CircularProgress} from '@mui/material';


const zoom = 1;
const pixelSize = 6;

const App = () => {
    const [loading, setLoading] = useState<Boolean>(false);
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
    }, []);

    const onSelectHandler = () => {
        setSelected(!selected)
    }

    const onMouseMoveHandler = (e: React.MouseEvent<HTMLCanvasElement>) => {
        pImg && img && canvas && ctx && selected && onMouseMove(e, zoom, pixelSize, pImg, img, selected, canvas, ctx)
    }

    const onMouseOutHandler = () => {
        img && canvas && ctx && selected && onMouseOut(img, selected, canvas, ctx)
    }

    const onClickHandler = (e: React.MouseEvent<HTMLCanvasElement>) => {
        img && canvas && ctx && selected && onClick(e, selected, canvas, ctx).then(setColor);
    }

    const onLoadImageHandler = async (e: React.FormEvent<HTMLInputElement>) => {
        if (!canvas || !ctx) return;


        setLoading(true);

        const imageSRC = await onLoadImage(e);
        initImageCanvas(canvas, ctx, imageSRC, pixelSize).then(({img, pimg}) => {
            setImg(img);
            setPImg(pimg);
            setLoading(false);
        });



    }


    return (
        <div className={`container${selected ? " selected" : ""}`}>

            <div className={"picker-container"} onClick={onSelectHandler}>
                <div className={"picker"}/>
            </div>

            <div className={"image-input"}>
                {!loading
                    ? (<input type="file" onInput={onLoadImageHandler}/>)
                    : (<div><div>Loading...</div><CircularProgress/></div>)
                }
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
