// BezierCanvas.tsx

import React, { useState, useEffect, useRef } from 'react';

interface Point {
    x: number;
    y: number;
}
const getBezierCurvePoints = (controlPoints: Point[]): Point[] => {
    const tValues = generateTValues(200);
    return tValues.map((t) => deCasteljau(controlPoints, t));
};

const generateTValues = (count: number): number[] => {
    return Array.from({ length: count }, (_, i) => i / (count - 1));
};

const deCasteljau = (controlPoints: Point[], t: number): Point => {
    let points = [...controlPoints];

    while (points.length > 1) {
        const nextPoints: Point[] = [];
        for (let i = 0; i < points.length - 1; i++) {
            const x = (1 - t) * points[i].x + t * points[i + 1].x;
            const y = (1 - t) * points[i].y + t * points[i + 1].y;
            nextPoints.push({ x, y });
        }
        points = nextPoints;
    }

    return points[0];
};
const BezierCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [points, setPoints] = useState<Point[]>([]);
    const [isLastPointFixed, setIsLastPointFixed] = useState(false);
    const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Bezier curve using the matrix form
            if (points.length >= 2) {
                const curvePoints = getBezierCurvePoints(points);
                ctx.beginPath();
                ctx.moveTo(curvePoints[0].x, curvePoints[0].y);

                // Draw 200 dots along the curve
                const tValues = generateTValues(200);
                tValues.forEach((t) => {
                    const curvePoint = deCasteljau(points, t);
                    ctx.lineTo(curvePoint.x, curvePoint.y);
                });

                ctx.strokeStyle = '#3498db'; // Set the stroke color
                ctx.lineWidth = 2; // Set the line width
                ctx.stroke();
            }

            // Draw control points
            points.forEach((point, index) => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle =
                    (isLastPointFixed && index === points.length - 1) || index === selectedPointIndex
                        ? '#2ecc71' // Green for the fixed last point or the selected point
                        : '#e74c3c'; // Red for other points
                ctx.fill();
                ctx.strokeStyle = '#fff'; // Set the stroke color
                ctx.lineWidth = 2; // Set the line width
                ctx.stroke();

                // Draw control point index
                ctx.fillStyle = '#fff';
                ctx.fillText(index.toString(), point.x - 3, point.y - 8);
            });
        }
    }, [points, isLastPointFixed, selectedPointIndex]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (selectedPointIndex !== null) {
            // Move the selected point
            setPoints((prevPoints) => {
                const updatedPoints = [...prevPoints];
                updatedPoints[selectedPointIndex] = { x, y };
                return updatedPoints;
            });
        } else {
            if (isLastPointFixed) {
                // If last point is fixed, start a new curve segment
                setPoints([{ x, y }]);
                setIsLastPointFixed(false);
            } else {
                // Add a new point
                setPoints((prevPoints) => [...prevPoints, { x, y }]);
            }
        }
    };

    const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Update the last point's position
        if (isLastPointFixed && selectedPointIndex !== null) {
            setPoints((prevPoints) => {
                const updatedPoints = [...prevPoints];
                updatedPoints[selectedPointIndex] = { x, y };
                return updatedPoints;
            });
        }
    };

    const handleFixLastPoint = () => {
        // Fix the last control point
        setIsLastPointFixed(true);
    };

    const handleSelectPoint = (index: number) => {
        // Select a control point for movement
        setSelectedPointIndex(index);
    };

    const handleClearCanvas = () => {
        // Clear all points
        setPoints([]);
        setIsLastPointFixed(false);
        setSelectedPointIndex(null);
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={600}
                height={400}
                style={{ border: '1px solid #ddd', cursor: 'crosshair' }}
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMouseMove}
            ></canvas>
            <button onClick={handleFixLastPoint} disabled={isLastPointFixed}>
                Fix Last Point
            </button>
            <button onClick={handleClearCanvas}>Clear Canvas</button>
            <p>Select a point to move it</p>
            <ul>
                {points.map((_, index) => (
                    <li key={index} onClick={() => handleSelectPoint(index)}>
                        Point {index}
                    </li>
                ))}
            </ul>
        </div>
    );
};


export default BezierCanvas;
