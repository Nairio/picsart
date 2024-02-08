import React from "react";

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
export const getImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
    });
};
export const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
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
export const getHex = (ctx: CanvasRenderingContext2D, mx: number, my: number): string => {
    const data = ctx.getImageData(mx, my, 1, 1).data;
    const r = data[0];
    const g = data[1];
    const b = data[2];
    const toHex = (c: number) => ((h: string) => h.length === 1 ? "0" + h : h)(c.toString(16));
    return "#" + (toHex(r) + toHex(g) + toHex(b)).toUpperCase();
};
export const pixelateImage = (image: HTMLImageElement, pixelSize: number): Promise<HTMLImageElement> => {
    return new Promise((resolve => {
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        const ctx = canvas.getContext("2d", {willReadFrequently: true}) as CanvasRenderingContext2D;
        canvas.width = image.width;
        canvas.height = image.height;

        const numPixelsWide = Math.ceil(image.width / pixelSize);
        const numPixelsHigh = Math.ceil(image.height / pixelSize);

        ctx.strokeStyle = "white";
        ctx.lineWidth = pixelSize / 100;

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const cw = canvas.width;
        const ch = canvas.width;
        const lw = ctx.lineWidth;
        const lw2 = lw / 2;
        const plw = pixelSize - lw;

        for (let y = 0; y < ch; y += pixelSize) {
            for (let x = 0; x < cw; x += pixelSize) {
                const index = (y * cw + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, y, pixelSize, pixelSize);
               // ctx.strokeRect(x + lw2, y  + lw2, plw, plw);
            }
        }

        resolve(getImage(canvas.toDataURL()))
    }))
};
export const drawPixelateImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, mx: number, my: number, cw: number, ch: number, w: number, h: number, r: number, z: number, p: number): void => {
    const sx: number = mx / cw * w - r / z;
    const sy: number = my / ch * h - r / z;
    const sw: number = (r * 2) / z;
    const sh: number = (r * 2) / z;
    ctx.drawImage(img, sx, sy, sw, sh, mx - r, my - r, r * 2, r * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#d9d9d9";
    const pz: number = p * z;
    ctx.strokeRect(mx - pz / 2, my - pz / 2, pz, pz);
};
export const drawLabel: (ctx: CanvasRenderingContext2D, hex: string, mx: number, my: number, r: number) => void = (ctx, hex, mx, my, r) => {
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
export const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>, z: number, p: number, pImg: HTMLImageElement, img: HTMLImageElement, selected: Boolean, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
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

    drawPixelateImage(ctx, pImg, mx, my, cw, ch, w, h, r, z, p);
    drawLabel(ctx, hex, mx, my, r);

    ctx.restore();

    ctx.beginPath();
    ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.lineWidth = r / 10;
    ctx.strokeStyle = hex;
    ctx.stroke();
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
export const initImageCanvas = async (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, imageSRC: string, p: number) => {
    ctx.imageSmoothingEnabled = false;
    const img = await getImage(imageSRC);
    canvas.width = document.body.offsetWidth * 0.7;
    canvas.height = canvas.width * img.height / img.width;

    //console.time("pix");
    const pimg = await pixelateImage(img, p);
    //console.timeEnd("pix");

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return {img, pimg}
}
