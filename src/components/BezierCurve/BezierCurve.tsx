import './bezier-curve.css'
import {type} from "os";
import React, {CanvasHTMLAttributes, DetailedHTMLProps, MouseEventHandler, useEffect, useRef, useState} from "react";
import {log} from "util";

type Point = {
    x: number,
    y: number
}
export const BezierCurve = () => {
    const [points, setPoints] = useState<Point[]>([]);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [polinomBernsteine, setPolinomBernstein] = useState<[number[]]>([[]]);
    const isParametrical = true;
    const [matrixOfGlobalKoef, setMatrixOfGlobalKoef] = useState<number[][]>([])
    const [isLastPointFixed, setIsLastPointFixed] = useState(false);
    const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
    const [curveColor, setCurveColor] = useState<string>("");
    const [tangentColor, setTangentColor] = useState<string>("");

    function getMatrixOfKoef(): number[][]{
        const returnMatrix: number[][] = [];
        returnMatrix.pop();
        const n = points.length-1;

        for(let i = 0; i < n+1; i++){
            const arrayToAdd: number[] = [];
            for(let j = 0; j < n+1; j++){
                let element =  getCombinations(n, j) * getCombinations(n-j, n-j-i) * Math.pow(-1, n-j-i);
                arrayToAdd.push(element);
            }
            returnMatrix[i] = arrayToAdd;
        }
        for(let i = 0; i < returnMatrix.length; i++){
            for(let j = 0; j < returnMatrix[i].length; j++){
                if(returnMatrix[i][j] === -0){
                    returnMatrix[i][j] = 0;
                }
            }
        }
        return returnMatrix;
    }
    function drawDerivative(numberOfDots: number){
        if(points.length < 2){
            return;
        }
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        let start = points[0];
        // @ts-ignore
        ctx.strokeStyle = tangentColor;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo((points[1].x+start.x)/2, (points[1].y+start.y)/2);
        ctx.closePath();
        ctx.stroke();

        const end = points[points.length-1];
        ctx.moveTo(end.x, end.y);

        ctx.lineTo((points[points.length-2].x+end.x)/2, (points[points.length-2].y+end.y)/2);
        ctx.stroke();
        ctx.closePath();
        ctx.strokeStyle = "000";
        console.log(tangentColor);
    }

    type Matrix = number[][];
    function multiplyMatrices(matrixA: Matrix, matrixB: Matrix): Matrix | null {
        const rowsA = matrixA.length;
        const colsA = matrixA[0].length;
        const rowsB = matrixB.length;
        const colsB = matrixB[0].length;

        // Check if the matrices can be multiplied
        if (colsA !== rowsB) {
            console.log(colsA, rowsB)
            console.error("Number of columns in the first matrix must be equal to the number of rows in the second matrix.");
            return null;
        }

        // Initialize the result matrix with zeros
        const result: Matrix = Array.from({ length: rowsA }, () => Array(colsB).fill(0));

        // Perform matrix multiplication
        for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsB; j++) {
                for (let k = 0; k < colsA; k++) {
                    result[i][j] += matrixA[i][k] * matrixB[k][j];
                }
            }
        }
        return result;
    }


    function drawBezierCurveMatrixMethod(numberOfDots: number){
        if(points.length <= 1){
            return;
        }

        const step = 1/numberOfDots;
        let t = 0;
        const n = points.length - 1;


        let matrixOfCoef: number[][];
        if(matrixOfGlobalKoef.length != points.length){
            matrixOfCoef = getMatrixOfKoef();
            setMatrixOfGlobalKoef(matrixOfCoef);
        }else{
           matrixOfCoef= matrixOfGlobalKoef;
        }
        let pointsCurve: Point[] = [];

        while(t <= 1){
            let arrayOfT: number[][] = [];
            arrayOfT.push([]);
            for(let i = 0; i < n+1; i++){
                arrayOfT[0].push(Math.pow(t, n-i));
            }

            let pointsMatrixX: number[][] = [];
            for(let i = 0; i < n+1; i++){
                pointsMatrixX.push([points[i].x]);
            }
            let pointsMatrixY: number[][] = [];
            for(let i = 0; i < n+1; i++){
                pointsMatrixY.push([points[i].y]);
            }


            let multiplieMatrix = multiplyMatrices(arrayOfT, matrixOfCoef);
            if(!multiplieMatrix) return;
            let pointX: number | null;

            // @ts-ignore
            pointX = multiplyMatrices(multiplieMatrix, pointsMatrixX)[0][0];
            // @ts-ignore
            let pointY: number = multiplyMatrices(multiplieMatrix, pointsMatrixY)[0][0];
            pointsCurve.push({
                x: pointX,
                y: pointY
            })
            t += step;
        }


        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        let start = points[0];
        ctx.moveTo(start.x, start.y);
        pointsCurve.forEach((point) => {
            ctx.lineTo(point.x, point.y);
            ctx.moveTo(point.x, point.y);
        });
        ctx.lineTo(points[points.length-1].x, points[points.length-1].y)
        // @ts-ignore
        ctx.strokeStyle = curveColor;
        ctx.lineWidth = 2; // Set the line width
        ctx.stroke();
        ctx.closePath();
        console.log(curveColor);
    }

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");
        let canvas = canvasRef.current;
        if (!canvas || !ctx) return;

        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(1, -1);



        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight*0.8;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if(points.length != 0){
            if(isParametrical){
                drawBezierCurveParametrically(400);
                drawDerivative(400);
            }else{
                drawBezierCurveMatrixMethod(400);
            }
        }


        points.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = (isLastPointFixed && index === points.length - 1) || index === selectedPointIndex ? '#2ecc71' : '#e74c3c';

            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();


            ctx.fillStyle = '#000';
            ctx.fillText(index.toString(), point.x - 3, point.y - 8);

        });
    });

    function factorialize(num: number): number {
        if (num === 0 || num === 1)
            return 1;
        for (var i = num - 1; i >= 1; i--) {
            num *= i;
        }
        return num;
    }

    function getCombinations(n: number, k: number): number{
        if(n >= k){
            if(k < 0){
                return 0;
            }
            return factorialize(n)/(factorialize(k)*factorialize(n-k));
        }else{
            throw new Error(`N must be greater than K: ${n} > ${k}`);
        }
    }

    function drawBezierCurveParametrically(numberOfDots: number){
        let t = 0;
        if(points.length <= 1){
            return;
        }
        const step = 1/numberOfDots;
        let polinome: [number[]];
        if(polinomBernsteine[0].length != points.length){
            polinome = getPolinomBernshtein(step);
            setPolinomBernstein(polinome);
        }else{
            polinome = polinomBernsteine;
        }
        let pointsCurve: Point[] = [];
        for(let i = 0; i < polinome.length; i++){
            let newPointX = 0;
            let newPointY = 0;
            for(let j = 0; j < points.length; j++){
                newPointX += polinome[i][j] * points[j].x;
                newPointY += polinome[i][j] * points[j].y;
            }
            pointsCurve.push({
                x: newPointX,
                y: newPointY
            })
        }
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        let start = points[0];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        pointsCurve.forEach((point) => {
            ctx.lineTo(point.x, point.y);
            ctx.moveTo(point.x, point.y);
        });
        ctx.lineTo(points[points.length-1].x, points[points.length-1].y)
        // @ts-ignore
        ctx.strokeStyle = curveColor; // Set the stroke color
        ctx.lineWidth = 2; // Set the line width
        ctx.closePath();
        ctx.stroke();

        // ctx.strokeStyle ="black";
        // ctx.stroke();
        console.log(curveColor);
    }

    function getPolinomBernshtein(step: number): [number[]]{

        const returnPolinom: [number[]] = [[]]
        returnPolinom.pop();
        let t = 0;
        const n = points.length;

        while(t <= 1){
            let tmpPolinome = [];
            for(let i = 0; i < n; i++){
                let tmp = getCombinations(n-1, i) * Math.pow(t, i) * Math.pow(1-t, n-i-1);
                tmpPolinome.push(tmp);
            }
            returnPolinom.push(tmpPolinome);
            t += step;
        }
        return returnPolinom;
    }


    function handleCanvasClick(e:  React.MouseEvent<HTMLElement>){
        const canvas: HTMLCanvasElement | null  = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const newPointX = e.clientX - rect.x;
        const newPointY = e.clientY - rect.y;



        if(selectedPointIndex != null){
            setPoints((prevPoints) => {
                const updatedPoints = [...prevPoints];
                updatedPoints[selectedPointIndex] = {
                    x: newPointX,
                    y: newPointY
                }
                setSelectedPointIndex(null);
                return updatedPoints;
            });
        }else{
            setPoints((points)=> {
                if(isLastPointFixed){
                    points = [];
                    setIsLastPointFixed(false);

                }
                let newPoints: Point[] = [...points];
                newPoints.push({
                    x: newPointX,
                    y: newPointY
                })
                return newPoints;
            });
        }


    }

    function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>){
        if(isLastPointFixed && selectedPointIndex === null){
            return;
        }
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('wheel', (event)=>{
            if (event.ctrlKey) {

            }
        }, { passive: false });

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;


        if(selectedPointIndex != null && isLastPointFixed){
            setPoints((prevPoints) => {
                const updatedPoints = [...prevPoints];
                updatedPoints[selectedPointIndex] = { x, y };
                return updatedPoints;
            });
        }else{
            setPoints((prevPoints) => {
                const updatedPoints = [...prevPoints];
                if (updatedPoints.length > 0 && !isLastPointFixed) {
                    updatedPoints[updatedPoints.length - 1] = { x, y };
                }else{
                    updatedPoints[0] = { x, y };
                }
                return updatedPoints;
            });
        }

    }

    const handleFixLastPoint = () => {
        if(points.length < 2){
            return;
        }
        let newPoints = points;
        newPoints.pop();
        console.log(newPoints);
        setPoints(newPoints);
        setIsLastPointFixed(true);
    };

    const handleSelectPoint = (index: number) => {
        // Select a control point for movement
        setSelectedPointIndex(index);
        console.log(index);
    };

    function handleCurveColorChange(value: string) {
        setCurveColor(value);
    }


    function handleTangentColorChange(value: string) {
        setTangentColor(value);
    }

    return (
        <>
            <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                width={600}
                height={400}
                style={{ border: '1px solid #ddd', cursor: 'crosshair' }}
                className={"bezier-curve-canvas"}
            ></canvas>
            <button onClick={handleFixLastPoint} disabled={isLastPointFixed}>
                Fix Last Point
            </button>
            <p>Select point to move it</p>
            <ul className={"bezier-edit-points-list"}>
                {points.map((_, index) => (
                    <li key={index} onClick={() => handleSelectPoint(index)}>
                        Point {index}
                    </li>
                ))}
            </ul>
            <p>Choose color of curve</p>
            <input
                type="color"
                value={curveColor}
                onChange={(e) => handleCurveColorChange(e.target.value)}
            />
            <p>Choose color of tangent</p>
            <input
                type="color"
                value={tangentColor}
                onChange={(e) => handleTangentColorChange(e.target.value)}
            />

        </>
    );
};
