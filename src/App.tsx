// App.tsx

import React, {useEffect, useRef, useState} from 'react';
import Navbar from "./components/Navbar/Navbar";
import {BezierCurve} from "./components/BezierCurve/BezierCurve";
import FractalCanvas from "./components/Fractals/Fractal";
import CesaroFractal from "./components/Cesaro/CesaroCanvas";
import {FractalContainer} from "./components/FractalsContainer/FractalContainer";


interface Props {
    imageUrl: string;
}
const App: React.FC = () => {
    const [activePage, setActivePage] = useState<string>('Fractals');

    return (
        <div>
            <Navbar setActivePage={setActivePage} />
            <div>
                {activePage === 'Bezier Curve' && <BezierCurve/>}
                {activePage === 'Fractals' && <FractalContainer/>}
                {/*{activePage === 'contact' && <h1>Contact Us</h1>}*/}
                {/* Add more pages as needed */}
            </div>
        </div>
    );
};

export default App;
