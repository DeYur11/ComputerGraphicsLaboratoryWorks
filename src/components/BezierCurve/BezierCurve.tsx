import './bezier-curve.css'
import {type} from "os";
import React, {CanvasHTMLAttributes, DetailedHTMLProps, MouseEventHandler, useEffect, useRef, useState} from "react";
import {log} from "util";

type Point = {
    x: number,
    y: number
}
type Interval = {
    start: number,
    amount: number,
    end: number;
}

function sumOfDiagonals(matrix: number[][]): number | undefined {
    // Перевірка на квадратність матриці
    if (!matrix.every(row => row.length === matrix.length)) {
        console.error('Матриця повинна бути квадратною.');
        return;
    }

    let mainDiagonalSum = 0;
    let secondaryDiagonalSum = 0;
    const n = matrix.length;

    for (let i = 0; i < n; i++) {
        mainDiagonalSum += matrix[i][i];
        secondaryDiagonalSum += matrix[i][n - 1 - i];
    }

    console.log('Сума головної діагоналі:', mainDiagonalSum);
    console.log('Сума побічної діагоналі:', secondaryDiagonalSum);

    return mainDiagonalSum + secondaryDiagonalSum;
}

export const BezierCurve = () => {
    const [points, setPoints] = useState<Point[]>([]);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [polinomBernsteine, setPolinomBernstein] = useState<[number[]]>([[]]);
    const [matrixOfGlobalKoef, setMatrixOfGlobalKoef] = useState<number[][]>([])
    const [isLastPointFixed, setIsLastPointFixed] = useState(false);
    const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
    const [curveColor, setCurveColor] = useState<string>("");
    const [tangentColor, setTangentColor] = useState<string>("");
    const [parametric, setParametric] = useState<boolean>(true);
    const [interval, setInterval] = useState<Interval>({start: 0, end: 0, amount: 0});
    const [curvesPoints, setCurvesPoints] = useState<Point[]>([]);
    const [finePoints, setFinePoints] = useState<Point[]>([]);
    const [selectedRow, setSelectedRow] = useState<number>(1);
    const [suma, setSuma] = useState<number>(0);

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
        ctx.beginPath();
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
    const drawCoordinateSystem = (context: CanvasRenderingContext2D) => {
        // @ts-ignore
        context = canvasRef.current?.getContext("2d");
        const width = context.canvas.width;
        const height = context.canvas.height;
        context.strokeStyle = "#000";
        context.lineWidth = 2;

        context.beginPath();
        context.moveTo(0, height / 2);
        context.lineTo(width, height / 2);
        context.lineTo(width - 10, height / 2 - 5);
        context.moveTo(width, height / 2);
        context.lineTo(width - 10, height / 2 + 5);
        context.stroke();
        context.closePath();

        context.strokeStyle = "#000";
        context.beginPath();
        context.moveTo(width / 2, 0);
        context.lineTo(width / 2, height);
        context.moveTo(width / 2 - 5, 10);
        context.lineTo(width / 2, 0);
        context.strokeStyle = "#000";
        context.moveTo(width / 2, 0);
        context.lineTo(width / 2 + 5, 10);
        context.stroke();
        context.closePath();

        context.strokeStyle = "#000";
        context.font = "12px Arial";
        context.fillStyle = "#000";
        context.textAlign = "center";
        context.textBaseline = "middle";

        context.fillText("X", width - 10, height / 2 + 20);

        context.strokeStyle = "#000";
        context.fillText("Y", width / 2 + 10, 10);

        context.moveTo(0, height / 2);
        for (let i = 0; i < width / 20; i++) {
            context.moveTo(0 + i * 20, height / 2 + 5);
            context.lineTo(0 + i * 20, height / 2 - 5);
        }
        context.stroke();

        context.moveTo(width / 2, height);
        for (let i = 0; i < height / 20; i++) {
            context.moveTo(width / 2 - 5, height - i * 20);
            context.lineTo(width / 2 + 5, height - i * 20);
        }
        context.stroke();
        //Намалюємо одиниці

        context.fillText('1', calculateTrueValue(1, 0, width, height).x, calculateTrueValue(1, 0, width, height).y+20);
        context.fillText('1', calculateTrueValue(0, 1, width, height).x - 20, calculateTrueValue(0, 1, width, height).y);
        context.fillText('0', calculateTrueValue(0, 0, width, height).x - 10, calculateTrueValue(0, 0, width, height).y+10);
    };
    const calculateTrueValue = (x: number, y: number, width: number, height: number) => {
        return {
            x: width/2 + x*20,
            y: height/2 - y*20
        }
    }
    const calculateCoordValue = (x: number, y: number) => {
        const width = canvasRef.current?.width;
        const height = canvasRef.current?.height;


        return {
            // @ts-ignore
            x: (x - width/2)/20,
            // @ts-ignore
            y: (y - height/2)/(-20)
        }
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
        console.log(polinomBernsteine)
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
        setCurvesPoints(pointsCurve);


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
        ctx.strokeStyle = curveColor;
        ctx.lineWidth = 2; // Set the line width
        ctx.stroke();
        ctx.closePath();
    }

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d");

        let canvas = canvasRef.current;
        if (!canvas || !ctx) return;
        ctx.strokeStyle="000";

        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.scale(1, -1);



        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight*0.8;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCoordinateSystem(ctx);
        if(points.length != 0){
            if(parametric){
                drawBezierCurveParametrically(800);
                drawDerivative(400);
            }else{
                drawBezierCurveMatrixMethod(800);
                drawDerivative(400);
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
    }, [points, isLastPointFixed, selectedPointIndex, curveColor, tangentColor, parametric, finePoints, selectedRow]);

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
            console.log(polinome);
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
        setCurvesPoints(pointsCurve);
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
        ctx.strokeStyle = curveColor;
        ctx.lineWidth = 2;
        ctx.closePath();
        ctx.stroke();
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

    function displayPointsInInterval(){
        const width = canvasRef.current?.width;
        const height = canvasRef.current?.height;
        if(!width || !height) return;
        const intervalStart = calculateTrueValue(interval.start, 0, width, height).x;
        const intervalEnd = calculateTrueValue(interval.end, 0, width, height).x;
        console.log(interval);
        let counter = interval.amount;
        const returnArr: Point[] = [];
        for(let i of curvesPoints){
            if(counter <= 0){
                break;
            }
            if(i.x > intervalStart && i.x < intervalEnd){
                console.log(i);
                counter--;
                returnArr.push(i);
            }
        }
        if(returnArr.length === 0){
            alert("There is no points in this range");
        }else{
            setFinePoints(returnArr);
        }
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

            <input
                type={"checkbox"}
                value={"Parametric"}
                id={"parametric"}
                onChange={(e) => {
                    setParametric(!parametric);
                }}
            ></input>
            <label htmlFor={"parametric"}>Matrix method</label>
            <p>Dsds</p>


            <label htmlFor={"start-position"}>Start-position</label>
            <input id={"start-position"}
                   step={"0.1"}

                   type={"number"} onChange={(e)=>{
                // @ts-ignore
                const {name, value} = e.target;
                setInterval((prevInterval) => {
                    const newInterval = prevInterval;
                    newInterval.start = Number(value);
                    console.log(newInterval);
                    return newInterval;
                });
            }}/>
            <label htmlFor={"end-position"} >End-position</label>
            <input id="end-position"
                   step={"0.1"}
                   type={"number"} onChange={(e)=>{
                const {name, value} = e.target;
                setInterval((prevInterval) => {
                    const newInterval = prevInterval;
                    newInterval.end = Number(value);
                    console.log(newInterval);
                    return newInterval;
                });
            }}/>
            <label htmlFor={"dots-amount"}>Points-amount</label>
            <input min={0} id={"dots-amount"} type={"number"} onChange={(e)=>{
                const {name, value} = e.target;
                setInterval((prevInterval) => {
                    const newInterval = prevInterval;
                    newInterval.amount = Number(value);
                    console.log(newInterval);
                    return newInterval;
                });
            }}/>
            <button onClick={displayPointsInInterval}>Calculate points</button>
                <table>
                    <thead>
                    <tr>
                        <th>Point</th>
                        <th>Coordinates</th>
                    </tr>
                    </thead>
                    <tbody>
                {finePoints.map((finePoint) => (
                        <tr>
                            <td>{`${calculateCoordValue(finePoint.x, finePoint.y).x}, ${calculateCoordValue(finePoint.x, finePoint.y).y}`}</td>
                        </tr>
                ))}
                    </tbody>
                </table>
            <input type={"number"} min={1} max={points.length} onChange={(e)=>{
                const {name, value} = e.target;
                setSelectedRow(Number(value));
                console.log(matrixOfGlobalKoef[Number(value)-1]);
                console.log(matrixOfGlobalKoef);
            }}/>
            <div>
                {matrixOfGlobalKoef[selectedRow-1]? matrixOfGlobalKoef[selectedRow-1].join(" "): ""}
            </div>
            <div>
                {sumOfDiagonals(matrixOfGlobalKoef)}
            </div>
        </>
    );
};
