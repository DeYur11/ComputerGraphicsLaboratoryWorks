import React, { useEffect, useState } from 'react';
import { Vector } from "vecti";
import "./cesaro.css"

type Point = {
    x: number;
    y: number;
}
const CesaroCanvas: React.FC = () => {
    const [angle, setAngle] = useState<number>(60);
    const [startX, setStartX] = useState<number>(50); // Initial starting x-coordinate
    const [startY, setStartY] = useState<number>(400); // Initial starting y-coordinate
    const [endX, setEndX] = useState<number>(400); // Initial ending x-coordinate
    const [endY, setEndY] = useState<number>(400); // Initial ending y-coordinate

    const handleAngleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAngle(Number(event.target.value));
    };

    const handleStartXChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartX(Number(event.target.value));
    };

    const handleStartYChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartY(Number(event.target.value));
    };

    const handleEndXChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEndX(Number(event.target.value));
    };

    const handleEndYChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEndY(Number(event.target.value));
    };

    const drawLine = (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = "black";
        ctx.stroke();
    }

    const rotatePoint = (fromRotate: Point, toRotate: Point, degree: number): Point => {
        const dx = toRotate.x - fromRotate.x;
        const dy = toRotate.y - fromRotate.y;
        const radianDegree: number = degree * Math.PI / 180;
        let pointToReturn = { x: 0, y: 0 };
        pointToReturn.x = dx * Math.cos(radianDegree) - dy * Math.sin(radianDegree);
        pointToReturn.y = dy * Math.cos(radianDegree) + dx * Math.sin(radianDegree);

        pointToReturn.x += fromRotate.x;
        pointToReturn.y += fromRotate.y;

        return pointToReturn;
    }

    const drawKochLine = (ctx: CanvasRenderingContext2D, from: Point, to: Point, iterations: number, degree: number): void => {
        if (iterations < 0) return;

        let firstVector: Vector = new Vector(to.x - from.x, to.y - from.y);
        let normFirstVector = firstVector.normalize();

        const cosinDegree = Math.cos(degree * Math.PI / 180);
        const side = firstVector.length() / (2 * (cosinDegree + 1));

        let secondPoint: Point = { x: from.x + normFirstVector.x * side, y: from.y + normFirstVector.y * side };

        let fourthVector = firstVector.multiply(-1);
        fourthVector = fourthVector.normalize();
        let fourthPoint: Point = { x: to.x + fourthVector.x * side, y: to.y + fourthVector.y * side };

        let thirdPoint: Point = rotatePoint(secondPoint, fourthPoint, degree);

        let secondVector: Vector = new Vector(thirdPoint.x - secondPoint.x, thirdPoint.y - secondPoint.y);

        secondVector = secondVector.normalize();

        thirdPoint.x = secondPoint.x + secondVector.x * side;
        thirdPoint.y = secondPoint.y + secondVector.y * side;

        const points: Point[] = [];
        points.push(from, secondPoint, thirdPoint, fourthPoint, to);

        if (iterations === 1) {
            drawLine(ctx, points[0], points[1]);
            drawLine(ctx, points[1], points[2]);
            drawLine(ctx, points[2], points[3]);
            drawLine(ctx, points[3], points[4]);
        } else if (iterations === 0) {
            drawLine(ctx, from, to);
        } else {
            drawKochLine(ctx, from, points[1], iterations - 1, degree);
            drawKochLine(ctx, points[1], points[2], iterations - 1, degree);
            drawKochLine(ctx, points[2], points[3], iterations - 1, degree);
            drawKochLine(ctx, points[3], to, iterations - 1, degree);
        }

        ctx.strokeStyle = "black";
        ctx.stroke();
        return;
    }

    useEffect(() => {
        const canvas = document.getElementById('cesaroCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        drawCesaroFractal(ctx, startX, startY, endX, endY);
    }, [angle, startX, startY, endX, endY]);

    const drawCesaroFractal = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) => {
        const firstPoint: Point = { x: startX, y: startY };
        const secondPoint: Point = { x: endX, y: endY };

        const iterations = 3;
        const degree = angle;

        drawKochLine(ctx, firstPoint, secondPoint, iterations, degree);
    };

    return (
        <div className={"cesaro-canvas"}>
            <canvas id="cesaroCanvas" width={600} height={600}></canvas>
            <label htmlFor="angleInput">Angle of Turn:</label>
            <input
                type="number"
                id="angleInput"
                value={angle}
                onChange={handleAngleChange}
            />
            <label htmlFor="startXInput">Starting X:</label>
            <input
                type="number"
                id="startXInput"
                value={startX}
                onChange={handleStartXChange}
            />
            <label htmlFor="startYInput">Starting Y:</label>
            <input
                type="number"
                id="startYInput"
                value={startY}
                onChange={handleStartYChange}
            />
            <label htmlFor="endXInput">Ending X:</label>
            <input
                type="number"
                id="endXInput"
                value={endX}
                onChange={handleEndXChange}
            />
            <label htmlFor="endYInput">Ending Y:</label>
            <input
                type="number"
                id="endYInput"
                value={endY}
                onChange={handleEndYChange}
            />
        </div>
    );
};

export default CesaroCanvas;
