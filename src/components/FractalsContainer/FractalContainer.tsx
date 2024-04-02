import {useState} from "react";
import cesaroCanvas from "../Cesaro/CesaroCanvas";
import fractal from "../Fractals/Fractal";
import CesaroCanvas from "../Cesaro/CesaroCanvas";
import Fractal from "../Fractals/Fractal";

export const FractalContainer = () => {
    const [geomFractal, setGeomFractal] = useState("");

    return (
        <>
            {geomFractal === "chesaro" ? <CesaroCanvas/>: <Fractal/>}
            <select onChange={(e)=>{
                setGeomFractal(e.target.value);
            }}>
                <option value="algo-fractal">Algebraic fractal</option>
                <option value="chesaro">Cesaro Line</option>
            </select>

        </>
    );
};