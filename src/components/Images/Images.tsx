import React, { useState, useRef } from 'react';

interface ImageProps {
    // No props needed for this component
}

export const Images: React.FC<ImageProps> = () => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [hsbImage, setHsbImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const convertToHsb = () => {
        const image = new Image();
        image.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) return;

            canvas.width = image.width;
            canvas.height = image.height;

            ctx.drawImage(image, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i] / 255; // Normalize red value (0-1)
                const g = data[i + 1] / 255; // Normalize green value (0-1)
                const b = data[i + 2] / 255; // Normalize blue value (0-1)

                const cmax = Math.max(r, g, b);
                const cmin = Math.min(r, g, b);
                const diff = cmax - cmin;

                let h = 0;
                if (cmax === cmin) {
                    h = 0;
                } else if (cmax === r) {
                    h = (60 * ((g - b) / diff) + 360) % 360;
                } else if (cmax === g) {
                    h = (60 * ((b - r) / diff) + 120) % 360;
                } else {
                    h = (60 * ((r - g) / diff) + 240) % 360;
                }

                const s = cmax === 0 ? 0 : (diff / cmax) * 100;
                const v = cmax * 100;

                data[i] = h; // Hue
                data[i + 1] = s; // Saturation (0-100)
                data[i + 2] = v; // Brightness (0-100)
            }

            ctx.putImageData(imageData, 0, 0);
            setHsbImage(canvas.toDataURL());
        };
        image.src = originalImage || ''; // Use default empty string if no image uploaded
    };

    const convertToRgb = () => {
        const image = new Image();
        image.onload = () => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) return;

            canvas.width = image.width;
            canvas.height = image.height;

            ctx.drawImage(image, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const h = data[i]; // Hue
                const s = data[i + 1]; // Saturation (0-100)
                const v = data[i + 2]; // Brightness (0-100)

                const c = (s / 100) * v;
                const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
                const m = v - c;

                let r = 0, g = 0, b = 0;

                if (h < 60) {
                    r = c;
                    g = x;
                } else if (h < 120) {
                    r = x;
                    g = c;
                } else if (h < 180) {
                    g = c;
                    b = x;
                } else if (h < 240) {
                    g = x;
                    b = c;
                } else if (h < 300) {
                    r = x;
                    b = c;
                } else {
                    r = c;
                    b = x;
                }

                data[i] = (r + m) * 255;
                data[i + 1] = (g + m) * 255;
                data[i + 2] = (b + m) * 255;
            }

            ctx.putImageData(imageData, 0, 0);
            setOriginalImage(canvas.toDataURL());
        };
        image.src = hsbImage || ''; // Use default empty string if no HSB image
    };

    const downloadImage = () => {
        if (hsbImage) {
            const link = document.createElement('a');
            link.href = hsbImage;
            link.download = 'hsb_image.png';
            link.click();
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setOriginalImage(e.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} />
            <button onClick={convertToHsb}>Convert to HSB</button>
            <button onClick={convertToRgb} disabled={!hsbImage}>
                Convert to RGB
            </button>
            <button onClick={downloadImage} disabled={!hsbImage}>
                Download HSB Image
            </button>
            <br />
            {originalImage && <img src={originalImage} alt="Original Image" />}
            {hsbImage && <img src={hsbImage} alt="HSB Image" />}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};
