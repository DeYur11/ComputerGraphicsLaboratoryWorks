import React from 'react';
import './navbar.css'
interface NavbarProps {
    setActivePage: React.Dispatch<React.SetStateAction<string>>;
}
const Navbar: React.FC<NavbarProps> = ({ setActivePage }) => {
    const handlePageChange = (page: string) => {
        setActivePage(page);
    };

    return (
        <div>
            <nav>
                <ul>
                    <li onClick={() => handlePageChange('Bezier Curve')}>Bezier Curve</li>
                    <li onClick={() => handlePageChange('Fractals')}>Fractals</li>
                </ul>
            </nav>
        </div>
    );
};

export default Navbar;
