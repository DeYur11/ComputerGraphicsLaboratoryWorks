// App.tsx

import React, { useState } from 'react';
import Navbar from "./components/Navbar/Navbar";
import {BezierCurve} from "./components/BezierCurve/BezierCurve";

const App: React.FC = () => {
    const [activePage, setActivePage] = useState<string>('Bezier Curve');

    return (
        <div>
            <Navbar setActivePage={setActivePage} />
            <div>
                {activePage === 'Bezier Curve' && <BezierCurve/>}
                {/*{activePage === 'about' && <BezierCurve/>}*/}
                {/*{activePage === 'contact' && <h1>Contact Us</h1>}*/}
                {/* Add more pages as needed */}
            </div>
        </div>
    );
};

export default App;
