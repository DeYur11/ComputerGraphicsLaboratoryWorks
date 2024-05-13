import React, { useState, useRef, useEffect } from 'react';

const Animations: React.FC = () => {
    const [x1, setX1] = useState<number>(100);
    const [y1, setY1] = useState<number>(100);
    const [x2, setX2] = useState<number>(200);
    const [y2, setY2] = useState<number>(200);
    const [rotationAngle, setRotationAngle] = useState<number>(0);
    const [isRotating, setIsRotating] = useState<boolean>(false);
    const [targetX, setTargetX] = useState<number|null>(null);
    const [targetY, setTargetY] = useState<number|null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoom, setZoom] = useState<number>(1);
    const [targetZoom, setTargetZoom] = useState<number>(1);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const animate = () => {
            if (isRotating) {
                setRotationAngle((prevAngle) => prevAngle + 1);
                console.log("ROTATING");
            }
            draw(ctx);
            if(isRotating) animationFrameId = requestAnimationFrame(animate);
        };

        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw coordinate grid
        const gridSize = 50;
        ctx.beginPath();
        ctx.strokeStyle = '#ccc';
        for (let x = gridSize; x < ctx.canvas.width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ctx.canvas.height);
            // Draw X-axis ticks

            ctx.fillText(`${((x - ctx.canvas.width / 2) / (gridSize*zoom)).toFixed(2)}`, x, ctx.canvas.height / 2 + 10);
        }
        for (let y = gridSize; y < ctx.canvas.height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(ctx.canvas.width, y);
            // Draw Y-axis ticks
            ctx.fillText(`${((ctx.canvas.height / 2 - y) / (gridSize*zoom)).toFixed(2)}`, ctx.canvas.width / 2 - 20, y);
        }

        const arrowLength = 10;
        const arrowWidth = 10;
        const arrowY = 20;

        // Draw arrow near Y-axis
        ctx.moveTo(ctx.canvas.width / 2 - arrowWidth / 2, arrowY);
        ctx.lineTo(ctx.canvas.width / 2 + arrowWidth / 2, arrowY);
        ctx.lineTo(ctx.canvas.width / 2, 0);
        ctx.lineTo(ctx.canvas.width / 2 - arrowWidth / 2, arrowY);
        ctx.moveTo(ctx.canvas.width / 2 + arrowWidth / 2, arrowY);
        ctx.lineTo(ctx.canvas.width / 2, arrowY - arrowLength);


        ctx.moveTo(ctx.canvas.width - 2*arrowLength, ctx.canvas.height / 2 - arrowWidth/2);
        ctx.lineTo(ctx.canvas.width, ctx.canvas.height / 2);
        ctx.lineTo(ctx.canvas.width - 2*arrowLength, ctx.canvas.height / 2 + arrowWidth/2);
        ctx.lineTo(ctx.canvas.width - 2*arrowLength, ctx.canvas.height / 2 - arrowWidth/2 );
        ctx.moveTo(ctx.canvas.width, ctx.canvas.height / 2 + arrowWidth/2);
        ctx.lineTo(ctx.canvas.width + 2*arrowLength, ctx.canvas.height / 2);


        ctx.stroke();

        animationFrameId = requestAnimationFrame(animate);


        return () => cancelAnimationFrame(animationFrameId);
    });  // Added isRotating to dependency array

    interface Point {
        x: number;
        y: number;
    }
    function findSquarePoints(diagPoint1: Point, diagPoint2: Point): [Point, Point] {
        // Step 1: Calculate the midpoint of the diagonal
        const midpoint: Point = {
            x: (diagPoint1.x + diagPoint2.x) / 2,
            y: (diagPoint1.y + diagPoint2.y) / 2
        };

        // Step 2: Calculate the vector from one diagonal point to the midpoint
        const vector: Point = {
            x: midpoint.x - diagPoint1.x,
            y: midpoint.y - diagPoint1.y
        };

        // Step 3: Rotate the vector by 90 degrees to get a perpendicular vector
        const perpendicularVector: Point = {
            x: -vector.y,
            y: vector.x
        };

        // Step 4: Add the perpendicular vector to both the midpoint and the other diagonal point
        const squarePoint1: Point = {
            x: midpoint.x + perpendicularVector.x,
            y: midpoint.y + perpendicularVector.y
        };

        const squarePoint2: Point = {
            x: midpoint.x - perpendicularVector.x,
            y: midpoint.y - perpendicularVector.y
        };

        return [squarePoint1, squarePoint2];
    }

    const draw = (ctx: CanvasRenderingContext2D) => {
        if (!ctx) return;

        const size = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1));
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;

        const [squarePoint1, squarePoint2] = findSquarePoints({x: x1, y: y1}, {x: x2, y: y2});
            let squareVertices = [
                [x1-centerX, y1-centerY, 1],
                [squarePoint1.x-centerX,squarePoint1.y-centerY, 1],
                [x2-centerX, y2-centerY, 1],
                [squarePoint2.x-centerX, squarePoint2.y-centerY, 1]
            ];

        let rotationAngle = 2;
        // Combined transformation matrix
        let transformedVertices: number[][] = squareVertices;
        if(isRotating){
            const transformationMatrix = [
                [Math.cos(rotationAngle * Math.PI / 180), -Math.sin(rotationAngle * Math.PI / 180), 0],
                [Math.sin(rotationAngle * Math.PI / 180), Math.cos(rotationAngle * Math.PI / 180), 0],
                [0, 0, 1]
            ];
            transformedVertices = multiplyMatrices(transformedVertices, transformationMatrix);
        }







        if(targetX != null && targetY != null && Math.abs(centerX - targetX) > 1 && Math.abs(centerY - targetY) > 1){
            console.log(targetX, targetY)
            console.log(transformedVertices);
            const translationMatrix = [
                [1, 0, 0],
                [0, 1, 0],
                [(targetX - centerX)/10, (targetY - centerY)/10, 1]
            ]
            transformedVertices = multiplyMatrices(transformedVertices, translationMatrix);
            console.log(transformedVertices);
        }
        console.log(transformedVertices);
        ctx.beginPath();
        ctx.moveTo(transformedVertices[0][0]+centerX, transformedVertices[0][1]+centerY);
        ctx.lineTo(transformedVertices[1][0]+centerX, transformedVertices[1][1]+centerY);
        ctx.lineTo(transformedVertices[2][0]+centerX, transformedVertices[2][1]+centerY);
        ctx.lineTo(transformedVertices[3][0]+centerX, transformedVertices[3][1]+centerY);

        ctx.closePath();
        ctx.fillStyle = 'blue';
        ctx.fill();
       setX1(transformedVertices[0][0]+centerX);
       setY1(transformedVertices[0][1]+centerY);

       setX2(transformedVertices[2][0]+centerX);
       setY2(transformedVertices[2][1]+centerY);
    };

    const multiplyMatrices = (a: number[][], b: number[][]) => {
        const result: number[][] = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = [];
            for (let j = 0; j < b[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < a[0].length; k++) {
                    sum += a[i][k] * b[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
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
        console.log("Clicked")
        setTargetX(mouseX);
        setTargetY(mouseY);
    };

    const startRotation = () => {
        setIsRotating(true);
    };

    const stopRotation = () => {
        setIsRotating(false);
    };

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<number>>) => {
        const value = parseFloat(e.target.value);
        setter(value || 1);
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
            <label>
                Zoom X:
                <input type="number" value={zoom} step="0.1" onChange={(e) => handleZoomChange(e, setZoom)} />
            </label>
            <button onClick={startRotation}>Start Rotation</button>
            <button onClick={stopRotation}>Stop Rotation</button>

            <canvas ref={canvasRef} width={500} height={500} style={{ border: '1px solid black' }} onClick={handleClick}></canvas>
        </div>
    );
};

export default Animations;
