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

export function Images(): JSX.Element {
    const [imageSrc, setImageSrc] = useState<string>('');
    const [originalCanvas, setOriginalCanvas] = useState<HTMLCanvasElement | null>(null);
    const [convertedCanvas, setConvertedCanvas] = useState<HTMLCanvasElement | null>(null);
    const [hsv, setHSV] = useState<HSV[]>([]);

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

    const convertImageToHSV = () => {
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
            const hsvData: HSV[] = [];

            for (let i = 0; i < imageData.data.length; i += 4) {
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                const { h, s, v } = rgbToHsv(r, g, b);
                hsvData.push({ h, s, v });
            }

            setHSV(hsvData);

            convertedCanvas.width = img.width;
            convertedCanvas.height = img.height;

            for (let i = 0; i < hsvData.length; i++) {
                const { h, s, v } = hsvData[i];
                convertedContext.fillStyle = `hsl(${h}, ${s}%, ${v}%)`;
                convertedContext.fillRect(i % img.width, Math.floor(i / img.width), 1, 1);
            }
        };

        img.src = imageSrc;
    };

    return (
        <div>
            <h2>Image RGB to HSV Converter</h2>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button onClick={convertImageToHSV}>Convert</button>
            <div style={{ display: 'flex', marginTop: '20px' }}>
                <canvas ref={originalCanvasRef} style={{ marginRight: '20px' }} />
                <canvas ref={convertedCanvasRef} />
            </div>
            <div>
                <h3>Result:</h3>
                {hsv.map((pixel, index) => (
                    <p key={index}>
                        Pixel {index + 1}: H: {pixel.h.toFixed(2)}, S: {pixel.s.toFixed(2)}, V: {pixel.v.toFixed(2)}
                    </p>
                ))}
            </div>
        </div>
    );
}

export default Images;
