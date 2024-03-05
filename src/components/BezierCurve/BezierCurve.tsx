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
    const [zoom, setZoom] = useState(1);
    const isParametrical = true;
    const [matrixOfGlobalKoef, setMatrixOfGlobalKoef] = useState<number[][]>([])


    function getMatrixOfKoef(): number[][]{
        const returnMatrix: number[][] = [];
        returnMatrix.pop();
        const n = points.length-1;
        console.log("Called");

        for(let i = 0; i < n+1; i++){
            const arrayToAdd: number[] = [];
            for(let j = 0; j < n+1; j++){
                let element =  getCombinations(n, j) * getCombinations(n-j, n-j-i) * Math.pow(-1, n-j-i);
                arrayToAdd.push(element);
            }
            returnMatrix[i] = arrayToAdd;
        }
        console.log("Matrix of coefficients:");
        for(let i = 0; i < returnMatrix.length; i++){
            for(let j = 0; j < returnMatrix[i].length; j++){
                if(returnMatrix[i][j] === -0){
                    returnMatrix[i][j] = 0;
                }
            }
        }
        console.log(returnMatrix);
        return returnMatrix;

    }

    type Matrix = number[][];
    function multiplyMatrices(matrixA: Matrix, matrixB: Matrix): Matrix | null {
        const rowsA = matrixA.length;
        const colsA = matrixA[0].length;
        const rowsB = matrixB.length;
        const colsB = matrixB[0].length;

        // Check if the matrices can be multiplied
        if (colsA !== rowsB) {
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
        ctx.strokeStyle = '#3498db'; // Set the stroke color
        ctx.lineWidth = 2; // Set the line width
        ctx.stroke();
    }

    useEffect(() => {

        const ctx = canvasRef.current?.getContext("2d");
        let canvas = canvasRef.current;
        if (!canvas || !ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight*0.8;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if(points.length != 0){
            if(isParametrical){
                drawBezierCurveParametrically(400);
            }else{
                drawBezierCurveMatrixMethod(400);
            }
        }


        points.forEach((point, index) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#e74c3c';

            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();


            ctx.fillStyle = '#000';
            ctx.fillText(index.toString(), point.x - 3, point.y - 8);

        });
    }, [points]);

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
        ctx.moveTo(start.x, start.y);
        pointsCurve.forEach((point) => {
            ctx.lineTo(point.x, point.y);
            ctx.moveTo(point.x, point.y);
        });
        ctx.lineTo(points[points.length-1].x, points[points.length-1].y)
        ctx.strokeStyle = '#3498db'; // Set the stroke color
        ctx.lineWidth = 2; // Set the line width
        ctx.stroke();
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
        console.log("Bernstein Polinom: ");
        console.log(returnPolinom);
        return returnPolinom;
    }


    function handleCanvasClick(e:  React.MouseEvent<HTMLElement>){
        console.log("Clicked");
        const canvas: HTMLCanvasElement | null  = canvasRef.current;
        console.log(e);
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const newPointX = e.clientX - rect.x;
        const newPointY = e.clientY - rect.y;

        setPoints((points)=> {
            let newPoints: Point[] = [...points];
            newPoints.push({
                x: newPointX,
                y: newPointY
            })
            return newPoints;
        });

    }

    function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>){
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('wheel', (event)=>{
            if (event.ctrlKey) {

            }
        }, { passive: false });

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        setPoints((prevPoints) => {
            const updatedPoints = [...prevPoints];
            if (updatedPoints.length > 0) {
                updatedPoints[updatedPoints.length - 1] = { x, y };
            }else{
                updatedPoints[0] = { x, y };
            }
            return updatedPoints;
        });

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
        </>
    );
};
