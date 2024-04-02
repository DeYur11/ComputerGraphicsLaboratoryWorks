import React, {useEffect, useState} from 'react';
import {Vector} from "vecti";

type Point = {
    x: number;
    y: number;
}
const CesaroCanvas: React.FC = () => {
    const [angle, setAngle] = useState<number>(60);
    const handleAngleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAngle(Number(event.target.value));
    };
    const drawLine = (ctx: CanvasRenderingContext2D, from: Point, to: Point) => {
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.moveTo(to.x, to.y);
        ctx.strokeStyle = "black";
        ctx.stroke();
    }
    const rotatePoint = (fromRotate: Point, toRotate: Point, degree: number): Point =>{
        const dx = toRotate.x - fromRotate.x;
        const dy = toRotate.y - fromRotate.y;
        const radianDegree: number = degree * Math.PI / 180;
        let pointToReturn = {x: 0, y: 0};
        pointToReturn.x = dx*Math.cos(radianDegree) - dy*Math.sin(radianDegree);
        pointToReturn.y =  dy*Math.cos(radianDegree) + dx*Math.sin(radianDegree);

        pointToReturn.x += fromRotate.x;
        pointToReturn.y += fromRotate.y;

        return pointToReturn;
    }
    const drawKochLine = (ctx: CanvasRenderingContext2D, from: Point, to: Point, iterations: number, degree: number): void =>{
        if(iterations < 0) return;

        let firstVector: Vector = new Vector(to.x - from.x, to.y - from.y);
        let normFirstVector = firstVector.normalize();


        const cosinDegree = Math.cos(degree*Math.PI/180);
        const side = firstVector.length()/(2*(cosinDegree+1));

        let secondPoint: Point = {x: from.x+normFirstVector.x*side, y: from.y+normFirstVector.y*side };

        let fourthVector = firstVector.multiply(-1);
        fourthVector = fourthVector.normalize();
        let fourthPoint: Point = {x: to.x+fourthVector.x*side, y: to.y+fourthVector.y*side};

        let thirdPoint: Point = rotatePoint(secondPoint, fourthPoint, degree);

        let secondVector: Vector = new Vector(thirdPoint.x - secondPoint.x, thirdPoint.y - secondPoint.y);

        secondVector = secondVector.normalize();

        thirdPoint.x = secondPoint.x + secondVector.x*side;
        thirdPoint.y = secondPoint.y + secondVector.y*side;

        const points: Point[] = [];
        points.push(from, secondPoint, thirdPoint, fourthPoint, to);

        if(iterations == 1){
            drawLine(ctx, points[0], points[1]);
            drawLine(ctx, points[1], points[2]);
            drawLine(ctx, points[2], points[3]);
            drawLine(ctx, points[3], points[4]);
        }else if(iterations == 0){
            drawLine(ctx, from, to);
        }

        else{
            drawKochLine(ctx, from, points[1], iterations-1, degree);
            drawKochLine(ctx, points[1], points[2], iterations-1, degree);
            drawKochLine(ctx, points[2], points[3], iterations-1, degree);
            drawKochLine(ctx, points[3], to, iterations-1, degree);
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
        drawCesaroFractal(ctx, 0, 100, 100);
    });
    const drawCesaroFractal = (ctx: CanvasRenderingContext2D, x: number, y: number, len: number) => {
        const firstPoint: Point = {x: 50,y: 400};
        const secondPoint: Point = {x: 400, y: 400};

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


        </div>
    );
};

export default CesaroCanvas;
