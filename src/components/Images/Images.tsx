import React, { useState, useEffect, useRef } from 'react';
import "./image.css"
interface HSV {
    h: number;
    s: number;
    v: number;
}

function rgbToHsv(r: number, g: number, b: number): HSV {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
            default:
                break;
        }
        // @ts-ignore
        h /= 6;
    }

    // @ts-ignore
    return { h: h * 360, s: s * 100, v: v * 100 };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
    let r, g, b;
    const i = Math.floor(h / 60) % 6;
    const f = h / 60 - Math.floor(h / 60);
    const p = v * (1 - s / 100);
    const q = v * (1 - f * (s / 100));
    const t = v * (1 - (1 - f) * (s / 100));

    switch (i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        case 5:
            r = v;
            g = p;
            b = q;
            break;
        default:
            break;
    }

    // @ts-ignore
    return { r: r * 255, g: g * 255, b: b * 255 };
}

function hsvToHsl(h: number, s: number, v: number): {h: number, s: number, l: number} {
    s /= 100;
    v /= 100;

    let l = (2 - s) * v / 2;

    if (l !== 0) {
        if (l === 1) {
            s = 0;
        } else if (l < 0.5) {
            s = s * v / (l * 2);
        } else {
            s = s * v / (2 - l * 2);
        }
    }
    s *= 100;
    l *= 100;
    return {h, s, l};
}

export function Images(): JSX.Element {
    const [imageSrc, setImageSrc] = useState<string>('');
    const [originalCanvas, setOriginalCanvas] = useState<HTMLCanvasElement | null>(null);
    const [convertedCanvas, setConvertedCanvas] = useState<HTMLCanvasElement | null>(null);
    const [hsv, setHSV] = useState<HSV[]>([]);
    const [convertFromRGBToHSV, setConvertFromRGBToHSV] = useState<boolean>(true); // Checkbox state
    const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
    const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
    const [brightnessPercentage, setBrightnessPercentage] = useState<number>(100); // State to store brightness percentage
    const [selectedPixelRGB, setSelectedPixelRGB] = useState<{ r: number; g: number; b: number } | null>(null);
    const [selectedPixelHSV, setSelectedPixelHSV] = useState<HSV | null>(null);

    const originalCanvasRef = useRef<HTMLCanvasElement>(null);
    const convertedCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (originalCanvasRef.current && convertedCanvasRef.current) {
            setOriginalCanvas(originalCanvasRef.current);
            setConvertedCanvas(convertedCanvasRef.current);
        }
    }, []);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const convertImage = () => {
        if (!originalCanvas || !convertedCanvas) return;

        const originalContext = originalCanvas.getContext('2d');
        const convertedContext = convertedCanvas.getContext('2d');
        if (!originalContext || !convertedContext) return;

        const img = new Image();
        img.onload = () => {
            originalCanvas.width = img.width;
            originalCanvas.height = img.height;
            originalContext.drawImage(img, 0, 0);

            const imageData = originalContext.getImageData(0, 0, img.width, img.height);
            if(convertFromRGBToHSV){
                const convertedData: { h: number; s: number; v: number }[] = []; // Convert to HSV

                for (let i = 0; i < imageData.data.length; i += 4) {
                    const r = imageData.data[i];
                    const g = imageData.data[i + 1];
                    const b = imageData.data[i + 2];

                    const { h, s, v } = rgbToHsv(r, g, b);

                    convertedData.push({ h,  s,  v });
                }

                setHSV(convertedData);

                convertedCanvas.width = img.width;
                convertedCanvas.height = img.height;

                for (let i = 0; i < convertedData.length; i++) {
                    const { h, s, v } = convertedData[i];
                    const {h: hl,s: sl, l} = hsvToHsl(h, s, v);

                    convertedContext.fillStyle = `hsl(${hl}, ${sl}%, ${l}%)`;
                    convertedContext.fillRect(i % img.width, Math.floor(i / img.width), 1, 1);
                }
            }else{
                const convertedData: { r: number; g: number; b: number }[] = [];

                for (let i = 0; i < imageData.data.length; i += 4) {
                    const h = imageData.data[i];
                    const s = imageData.data[i + 1];
                    const v = imageData.data[i + 2];

                    const { r, g, b } = hsvToRgb(h, s, v);

                    convertedData.push({ r,  g,  b });
                }

                convertedCanvas.width = img.width;
                convertedCanvas.height = img.height;

                for (let i = 0; i < convertedData.length; i++) {
                    const { r, g, b } = convertedData[i];
                    convertedContext.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    convertedContext.fillRect(i % img.width, Math.floor(i / img.width), 1, 1);
                }
            }
        };
        img.src = imageSrc;
    };

    const downloadConvertedImage = (format: 'jpg' | 'png') => {
        if (!convertedCanvas) return;

        const canvasDataUrl = convertedCanvas.toDataURL(`image/${format}`);
        const link = document.createElement('a');
        link.href = canvasDataUrl;
        link.download = `converted_image.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        console.log("Clicked ")
        if (!convertedCanvas) return;
        const rect = convertedCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (!selectionStart) {
            setSelectionStart({ x, y });
        } else if (!selectionEnd) {
            setSelectionEnd({ x, y });
        } else {
            setSelectionStart(null);
            setSelectionEnd(null);
        }
    };

    const drawSelection = (context: CanvasRenderingContext2D) => {
        if (!selectionStart || !selectionEnd) return;
        const { x: startX, y: startY } = selectionStart;
        const { x: endX, y: endY } = selectionEnd;
        const width = endX - startX;
        const height = endY - startY;
        context.strokeStyle = 'red';
        context.lineWidth = 2;
        context.strokeRect(startX, startY, width, height);
    };

    // const performActionWithinSelection = () => {
    //     if (!convertedCanvas || !selectionStart || !selectionEnd) return;
    //     const context = convertedCanvas.getContext('2d');
    //     if (!context) return;
    //     const { x: startX, y: startY } = selectionStart;
    //     const { x: endX, y: endY } = selectionEnd;
    //     console.log(selectionStart)
    //     console.log(selectionEnd)
    //
    //     const width = endX - startX;
    //     const height = endY - startY;
    //     const imageData = context.getImageData(startX, startY, width, height);
    //     const data = imageData.data;
    //
    //     // for (let i = 0; i < data.length; i += 4) {
    //     //     // Modify pixel data here
    //     //     //
    //     //     data[i] = 255 - data[i]; // Red channel
    //     //     data[i + 1] = 255 - data[i + 1];
    //     //     data[i + 2] = 255 - data[i + 2];
    //     //
    //     // }
    //
    //
    //     for(let i = 0; i < data.length; i+=4){
    //
    //     }
    //
    //     context.putImageData(imageData, startX, startY);
    // };

    const performActionWithinSelection = () => {
        if (!convertedCanvas || !selectionStart || !selectionEnd) return;
        const context = convertedCanvas.getContext('2d');
        if (!context) return;
        const { x: startX, y: startY } = selectionStart;
        const { x: endX, y: endY } = selectionEnd;

        const width = endX - startX;
        const height = endY - startY;

        // Get the image data of the selected area
        const imageData = context.getImageData(startX, startY, width, height);
        const data = imageData.data;

        // Calculate the brightness factor based on user input percentage
        const brightnessFactor = brightnessPercentage / 100;

        // Loop through each pixel in the selected area
        for (let i = 0; i < data.length; i += 4) {
            // Apply brightness adjustment to each color channel

            const r =  data[i]; // Red channel
            const g = data[i + 1]; // Green channel
            const b = data[i + 2]; // Blue channel

            let {h, s, v} = rgbToHsv(r, g, b);

            if(h >= 60 && h <= 180 && s > 30){
                console.log(h);
                v *= brightnessFactor;
                v /= 100;
                console.log(v)
            }else{
                continue;
            }

            const {r: newR, g: newG, b: newB} = hsvToRgb(h, s, v);
            data[i] = newR;
            data[i+1] = newG;
            data[i+2] = newB;
        }

        context.putImageData(imageData, startX, startY);
    };

    const handleOriginalCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!originalCanvas) return;
        const rect = originalCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const originalContext = originalCanvas.getContext('2d');
        if (!originalContext) return;

        const pixelData = originalContext.getImageData(x, y, 1, 1).data;
        const r = pixelData[0];
        const g = pixelData[1];
        const b = pixelData[2];

        setSelectedPixelRGB({ r, g, b });

        const { h, s, v } = rgbToHsv(r, g, b);
        setSelectedPixelHSV({ h, s, v });
    };

    return (
        <div className="container">
            <h2 className="header">Image Converter</h2>
            <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />

            <div className="button-group">
                <button onClick={convertImage}>Convert</button>
                <button onClick={() => downloadConvertedImage('jpg')}>Download JPG</button>
                <button onClick={() => downloadConvertedImage('png')}>Download PNG</button>
            </div>

            <div className="canvas-container">
                <canvas
                    ref={originalCanvasRef}
                    className="canvas"
                    onClick={handleOriginalCanvasClick}
                />
                <canvas
                    ref={convertedCanvasRef}
                    className="canvas"
                    onClick={handleCanvasClick}
                />
            </div>

            <div className="checkbox-container">
                <input
                    type="checkbox"
                    checked={convertFromRGBToHSV}
                    onChange={(e) => setConvertFromRGBToHSV(e.target.checked)}
                />
                <label className="checkbox-label">Convert to HSV</label>
            </div>
            {selectedPixelRGB && (
                <div>
                    <p>Selected Pixel (RGB): {`(${selectedPixelRGB.r}, ${selectedPixelRGB.g}, ${selectedPixelRGB.b})`}</p>
                </div>
            )}
            {selectedPixelHSV && (
                <div>
                    <p>Selected Pixel (HSV): {`(${selectedPixelHSV.h}, ${selectedPixelHSV.s}, ${selectedPixelHSV.v})`}</p>
                </div>
            )}
            <button onClick={performActionWithinSelection} className="action-button">
                Perform Action within Selection
            </button>
            <input
                type="range"
                min="0"
                max="200"
                value={brightnessPercentage}
                onChange={(e) => setBrightnessPercentage(Number(e.target.value))}
                className="range-input"
            />
        </div>
    );

}

export default Images;
