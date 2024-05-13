import React, { useState, useRef, useEffect } from 'react';

const Animations: React.FC = () => {
    const [x1, setX1] = useState<number>(100);
    const [y1, setY1] = useState<number>(100);
    const [x2, setX2] = useState<number>(200);
    const [y2, setY2] = useState<number>(200);
    const [rotationAngle, setRotationAngle] = useState<number>(0);
    const [isRotating, setIsRotating] = useState<boolean>(false);
    const [targetX, setTargetX] = useState<number>(100);
    const [targetY, setTargetY] = useState<number>(100);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const animate = () => {
            if (isRotating) {
                setRotationAngle((prevAngle) => prevAngle + 1);
            }
            drawRotatedSquare(ctx);
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;

        if(centerX != targetX || centerY != targetY){
            drawMovedSquare(ctx);
        }
    });

    const drawMovedSquare = (ctx: CanvasRenderingContext2D) => {
        if(!ctx) return;


    }
    const drawRotatedSquare= (ctx: CanvasRenderingContext2D) => {
        if (!ctx) return;

        const size = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1));
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const halfSize = size / 2;

        const topLeftX = centerX - halfSize;
        const topLeftY = centerY - halfSize;

        const topRightX = centerX + halfSize;
        const topRightY = centerY - halfSize;

        const bottomLeftX = centerX - halfSize;
        const bottomLeftY = centerY + halfSize;

        const bottomRightX = centerX + halfSize;
        const bottomRightY = centerY + halfSize;

        const rotatedTopLeft = rotatePoint(centerX, centerY, topLeftX, topLeftY, rotationAngle);
        const rotatedTopRight = rotatePoint(centerX, centerY, topRightX, topRightY, rotationAngle);
        const rotatedBottomLeft = rotatePoint(centerX, centerY, bottomLeftX, bottomLeftY, rotationAngle);
        const rotatedBottomRight = rotatePoint(centerX, centerY, bottomRightX, bottomRightY, rotationAngle);

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.beginPath();
        ctx.moveTo(rotatedTopLeft.x, rotatedTopLeft.y);
        ctx.lineTo(rotatedTopRight.x, rotatedTopRight.y);
        ctx.lineTo(rotatedBottomRight.x, rotatedBottomRight.y);
        ctx.lineTo(rotatedBottomLeft.x, rotatedBottomLeft.y);
        ctx.closePath();
        ctx.fillStyle = 'blue';
        ctx.fill();
    };

    const rotatePoint = (cx: number, cy: number, x: number, y: number, angle: number) => {
        const radians = (Math.PI / 180) * angle;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const nx = cos * (x - cx) - sin * (y - cy) + cx;
        const ny = sin * (x - cx) + cos * (y - cy) + cy;
        return { x: nx, y: ny };
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<number>>) => {
        const value = parseInt(e.target.value);
        setter(value || 0);
    };

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setTargetX(mouseX);
        setTargetY(mouseY);
    };

    const startRotation = () => {
        setIsRotating(true);
    };

    const stopRotation = () => {
        setIsRotating(false);
    };

    return (
        <div>
            <label>
                X1:
                <input type="number" value={x1} onChange={(e) => handleInputChange(e, setX1)} />
            </label>
            <label>
                Y1:
                <input type="number" value={y1} onChange={(e) => handleInputChange(e, setY1)} />
            </label>
            <label>
                X2:
                <input type="number" value={x2} onChange={(e) => handleInputChange(e, setX2)} />
            </label>
            <label>
                Y2:
                <input type="number" value={y2} onChange={(e) => handleInputChange(e, setY2)} />
            </label>
            <button onClick={startRotation}>Start Rotation</button>
            <button onClick={stopRotation}>Stop Rotation</button>
            <canvas ref={canvasRef} width={500} height={500} style={{ border: '1px solid black' }} onClick={handleClick}></canvas>
        </div>
    );
};

export default Animations;
