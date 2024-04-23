import React, { useState, useEffect, useRef } from 'react';

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
        h = 0; // achromatic
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
    /**
     * Convert HSV to HSL.
     * @param {number} h - Hue component in range [0, 360].
     * @param {number} s - Saturation component in range [0, 100].
     * @param {number} v - Value component in range [0, 100].
     * @returns {Array} HSL representation (hue in degrees [0, 360], saturation and lightness in range [0, 1]).
     */

    s /= 100; // Convert saturation from [0, 100] to [0, 1]
    v /= 100; // Convert value from [0, 100] to [0, 1]

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

    const originalCanvasRef = useRef<HTMLCanvasElement>(null);
    const convertedCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        console.log(hsvToHsl(0, 100, 100))
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
                const convertedData: { h: number; s: number; v: number }[] = []; // Конвертуємо в HSV

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
                console.log("Transfering to HSV")

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

    return (
        <div>
            <h2>Image Converter</h2>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button onClick={convertImage}>Convert</button>
            <button onClick={() => downloadConvertedImage('jpg')}>Download JPG</button>
            <button onClick={() => downloadConvertedImage('png')}>Download PNG</button>
            <div style={{ display: 'flex', marginTop: '20px' }}>
                <canvas ref={originalCanvasRef} style={{ marginRight: '20px' }} />
                <canvas ref={convertedCanvasRef} />
            </div>
            <div>
                <input
                    type="checkbox"
                    checked={convertFromRGBToHSV}
                    onChange={(e) => setConvertFromRGBToHSV(e.target.checked)}
                />
                <label>Convert to HSV</label>
            </div>
        </div>
    );
}

export default Images;
