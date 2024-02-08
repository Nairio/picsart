import React from "react";

const drawSquareTarget = (ctx: CanvasRenderingContext2D, cub: number, mx: number, my: number) => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#d9d9d9";
    ctx.strokeRect(mx - cub / 2, my - cub / 2, cub, cub);
}
const drawRoundFrame = (ctx: CanvasRenderingContext2D, mx: number, my: number, r: number, hex: string) => {
    ctx.beginPath();
    ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.lineWidth = r / 10;
    ctx.strokeStyle = hex;
    ctx.stroke();
}
const drawTable = (ctx: CanvasRenderingContext2D, cw: number, ch: number, cub: number) => {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 0.22;
    const lw = ctx.lineWidth;
    const lw2 = lw / 2;
    const plw = cub - lw;
    for (let x = 0; x < cw; x += cub) {
        for (let y = 0; y < ch; y += cub) {
            ctx.strokeRect(x + lw2, y + lw2, plw, plw);
        }
    }
}
const drawCubes = (image: HTMLImageElement, ctx: CanvasRenderingContext2D, cw: number, ch: number, cub: number) => {
    const data = getImageData(image, cw, ch);

    for (let x = 0; x < cw; x += cub) {
        for (let y = 0; y < ch; y += cub) {
            ctx.fillStyle = data[x][y];
            ctx.fillRect(x, y, cub, cub);
        }
    }
}
const getImageData = (image: HTMLImageElement, w: number, h: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", {willReadFrequently: true}) as CanvasRenderingContext2D;
    ctx.drawImage(image, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    const d: Record<number, Record<number, any>> = {};

    for (let x = 0; x < w; x += 1) {
        d[x] = {};
        for (let y = 0; y < h; y += 1) {
            const index = (y * w + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            d[x][y] = `rgb(${r},${g},${b})`
        }
    }

    return d;
}
const getImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });
};
const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
};
const getHex = (ctx: CanvasRenderingContext2D, mx: number, my: number): string => {
    const data = ctx.getImageData(mx, my, 1, 1).data;
    const r = data[0];
    const g = data[1];
    const b = data[2];
    const toHex = (c: number) => ((h: string) => h.length === 1 ? "0" + h : h)(c.toString(16));
    return "#" + (toHex(r) + toHex(g) + toHex(b)).toUpperCase();
};
const pixelateImage = async (image: HTMLImageElement, cw: number, ch: number, cub: number): Promise<HTMLImageElement> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", {willReadFrequently: true}) as CanvasRenderingContext2D;
    canvas.width = cw;
    canvas.height = ch;

    drawCubes(image, ctx, cw, ch, cub);
    //drawTable(ctx, cw, ch, cub);

    return getImage(canvas.toDataURL())
};
const drawPixelateImage = (ctx: CanvasRenderingContext2D, pImg: HTMLImageElement, mx: number, my: number, cw: number, ch: number, w: number, h: number, r: number, z: number): void => {
    const sx: number = mx / cw * w - r / z;
    const sy: number = my / ch * h - r / z;
    const sw: number = (r * 2) / z;
    const sh: number = (r * 2) / z;
    ctx.drawImage(pImg, sx, sy, sw, sh, mx - r, my - r, r * 2, r * 2);
};
const drawLabel: (ctx: CanvasRenderingContext2D, hex: string, mx: number, my: number, r: number) => void = (ctx, hex, mx, my, r) => {
    const width = r;
    const height = r / 4;
    const top = r / 2;

    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.font = `${height}px Courier`;
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, mx - width / 2, my + top, width, height, 4);
    ctx.fillStyle = "black";

    ctx.fillText(hex, mx, my + top, width - width * 0.1);
};

export const onLoadImage = (e: React.FormEvent<HTMLInputElement>): Promise<string> => {
    return new Promise((resolve => {
        const input = e.target as HTMLInputElement;

        const file = input.files && input.files[0] as File;
        if (!file) return;

        if (file.type.match('image.*')) {
            const reader: FileReader = new FileReader();

            reader.onload = (event: ProgressEvent<FileReader>) => {
                if (!event.target) return;
                const src = event.target.result as string;
                resolve(src);
            };
            reader.readAsDataURL(file);
        }
    }))

}
export const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>, pImg: HTMLImageElement, img: HTMLImageElement, selected: Boolean, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, cub: number, zoom:number) => {
    const rect = canvas.getBoundingClientRect();
    const cw = canvas.width;
    const ch = canvas.height;
    const w = img.width;
    const h = img.height;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const r = cw / 14;

    const hex: string = getHex(ctx, mx, my);

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, cw, ch);
    ctx.save();
    ctx.beginPath();
    ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const k = img.width / pImg.width;
    drawPixelateImage(ctx, pImg, mx, my, cw * k, ch * k, w, h, r, zoom);
    drawSquareTarget(ctx, cub * zoom,  mx, my);
    drawLabel(ctx, hex, mx, my, r);
    drawRoundFrame(ctx, mx, my, r, hex);

    ctx.restore();
};
export const onMouseOut = (img: HTMLImageElement, selected: Boolean, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}
export const onClick = async (e: React.MouseEvent<HTMLCanvasElement>, selected: Boolean, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    return getHex(ctx, mx, my);
}
export const initImageCanvas = async (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, imageSRC: string, cub: number) => {
    ctx.imageSmoothingEnabled = false;
    const img = await getImage(imageSRC);
    canvas.width = document.body.offsetWidth * 0.7;
    canvas.height = canvas.width * img.height / img.width;

    const pimg = await pixelateImage(img, canvas.width, canvas.height, cub);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return {img, pimg}
}
