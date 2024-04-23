import React, { useEffect, useRef, useState } from 'react';
import Complex from "complex.js";
import './fractals.css';

const FractalCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoom, setZoom] = useState<number>(1);
    const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [dragging, setDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [selectedTheme, setSelectedTheme] = useState<string>("default"); // Add state for selected theme
    const [resolution, setResolution] = useState<number>(100); // State for resolution
    const [maxIter, setMaxIter] = useState<number>(100); // State for max iterations
    const [startConst, setStartConst] = useState<Complex | null>(new Complex(0, 0));

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        canvas.height = resolution;
        canvas.width = resolution;

        const fractal = (z: Complex, c: Complex | null): number => {
            if(!c) return 0;
            for (let i = 0; i < maxIter; i++) {
                z = c.add(z.mul(z.cos()));

                const multiplier = 10;
                if (Math.abs(z.re) > multiplier || Math.abs(z.im) > multiplier) return i;
            }
            return maxIter;
        };

        const plotFractal = () => {
            for (let px = 0; px < resolution; px++) {
                for (let py = 0; py < resolution; py++) {
                    const x = (px - canvas.width / 2) / (resolution / 4 * zoom) + offset.x;
                    const y = (py - canvas.height / 2) / (resolution / 4 * zoom) + offset.y;
                    const z = new Complex(x, y);
                    const iterations = fractal(z, startConst);

                    const brightness = iterations === maxIter ? 255 : (3 * iterations / maxIter) * 255;

                    // Apply the selected theme
                    applyTheme(ctx, brightness, selectedTheme);

                    ctx.fillRect(px, py, 1, 1);
                }
            }
        };

        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            const delta = event.deltaY > 0 ? 0.9 : 1.1;
            setZoom((prevZoom) => prevZoom * delta);
        };

        const handleMouseDown = (event: MouseEvent) => {
            setDragging(true);
            setDragStart({ x: event.clientX, y: event.clientY });
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (dragging) {
                console.log(zoom);
                const dx = -(event.clientX - dragStart.x) / (32 * Math.pow(zoom, 1.5));
                const dy = -(event.clientY - dragStart.y) / (32 * Math.pow(zoom, 1.5));
                setOffset((prevOffset) => ({ x: prevOffset.x + dx, y: prevOffset.y + dy }));
                setDragStart({ x: event.clientX, y: event.clientY });
            }
        };

        const handleMouseUp = () => {
            setDragging(false);
        };

        canvas.addEventListener('wheel', handleWheel);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        plotFractal();

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    });

    // Function to apply theme
    const applyTheme = (ctx: CanvasRenderingContext2D, brightness: number, theme: string) => {
        switch (theme) {
            case "Plankton":
                // Theme logic for Plankton
                if (brightness > 192) {
                    ctx.fillStyle = `rgba(${0},${12 * brightness / 24},${brightness * 12 / 24}, 1)`;
                } else if (brightness > 192 - 64) {
                    ctx.fillStyle = `rgba(${9 * brightness / 24},${7 * brightness / 24},${6 * brightness / 24}, 1)`;
                } else if (brightness > 192 - 128) {
                    ctx.fillStyle = `rgba(${2 * brightness / 24},${19 * brightness / 24},${3 * brightness / 24}, 1)`;
                } else {
                    ctx.fillStyle = `rgba(${brightness / 24},${brightness / 24},${22 * brightness / 24}, 1)`;
                }
                break;
            case "Santa Claus":
                // Theme logic for Santa Claus
                if (brightness > 192) {
                    ctx.fillStyle = `rgba(${brightness * 22 / 24},${brightness * 4 / 24},${0}, 1)`;
                } else if (brightness > 192 - 64) {
                    ctx.fillStyle = `rgba(${6 * brightness / 24},${7 * brightness / 24},${9 * brightness / 24}, 1)`;
                } else if (brightness > 192 - 128) {
                    ctx.fillStyle = `rgba(${3 * brightness / 24},${15 * brightness / 24},${2 * brightness / 24}, 1)`;
                } else {
                    ctx.fillStyle = `rgba(${22 * brightness / 24},${brightness / 24},${brightness / 24}, 1)`;
                }
                break;
            case "Malinivka":
                // Theme logic for Malinivka
                if (brightness > 192) {
                    ctx.fillStyle = `rgba(${brightness * 12 / 24},${0},${brightness * 12 / 24}, 1)`;
                } else if (brightness > 192 - 64) {
                    ctx.fillStyle = `rgba(${7 * brightness / 24},${9 * brightness / 24},${6 * brightness / 24}, 1)`;
                } else if (brightness > 192 - 128) {
                    ctx.fillStyle = `rgba(${19 * brightness / 24},${2 * brightness / 24},${3 * brightness / 24}, 1)`;
                } else {
                    ctx.fillStyle = `rgba(${22 * brightness / 24},${brightness / 24},${brightness / 24}, 1)`;
                }
                break;
            case "Dune":
                // Theme logic for Dune
                if (brightness > 192 + 30) {
                    ctx.fillStyle = `rgba(${brightness * 12 / 24},${9 * brightness / 24},${3 * brightness / 24}, 1)`;
                } else if (brightness > 192) {
                    ctx.fillStyle = `rgba(${19 * brightness / 24},${2 * brightness / 24},${3 * brightness / 24}, 1)`;
                } else if (brightness > 192 - 64) {
                    ctx.fillStyle = `rgba(${10 * brightness / 24},${9 * brightness / 24},${6 * brightness / 24}, 1)`;
                } else if (brightness > 192 - 128) {
                    ctx.fillStyle = `rgba(${8 * brightness / 24},${4 * brightness / 24},${2 * brightness / 24}, 1)`;
                } else if (brightness > 192 - 192) {
                    ctx.fillStyle = `rgba(${6 * brightness / 24},${4 * brightness / 24},${3 * brightness / 24}, 1)`;
                } else {
                    ctx.fillStyle = `rgba(${4 * brightness / 24},${2 * brightness / 24},${1 * brightness / 24}, 1)`;
                }
                break;
            default:
                // Default theme logic
                ctx.fillStyle = `rgba(${brightness},${brightness},${brightness}, 1)`;
                break;
        }
    };

    const handleResolutionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setResolution(Number(event.target.value));
    };

    const handleMaxIterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMaxIter(Number(event.target.value));
    };
    const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTheme(event.target.value); // Update selected theme
    };

    const handleDownloadImage = () => {
        const canvas = canvasRef.current!;
        const link = document.createElement('a');
        link.download = 'fractal.png';
        link.href = canvas.toDataURL();
        link.click();
    };
    return (
        <div className={"algo_fract"}>
            <canvas className="fractals__canvas" ref={canvasRef} />
            <select value={selectedTheme} onChange={handleThemeChange}>
                <option value="default">Default</option>
                <option value="Plankton">Plankton</option>
                <option value="Santa Claus">Santa Claus</option>
                <option value="Malinivka">Malinivka</option>
                <option value="Dune">Dune</option>
            </select>

            <label>Resolution:</label>
            <input type="number" value={resolution} onChange={handleResolutionChange} />
            <label>Max Iterations:</label>
            <input type="number" value={maxIter} onChange={handleMaxIterChange} />

            <label>Const real part:</label>
            <input type={"number"} onChange={(e) => {
                setStartConst(new Complex(Number.parseInt(e.target.value), startConst?.im));
            }}/>

            <label>Const imaginary part:</label>
            <input type={"number"} onChange={(e)=> {
                setStartConst(new Complex(startConst?.re, Number.parseInt(e.target.value)));
            }}/>

            <button onClick={handleDownloadImage}>Download Image</button>
        </div>
    );
};

export default FractalCanvas;
