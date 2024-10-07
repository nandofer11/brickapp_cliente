import React, { useState } from 'react'
//Icons
import * as FaIcons from 'react-icons/fa';

const Header = () => {

    const [isOpen, setIsOpen] = useState(false);

    const HandleToggle = () => {
        setIsOpen(!isOpen)
    }

    const mostrarMenuMovil = () => {
        document.getElementById("sidebar_area").classList.toggle("mostrarSidebar");
    };

    return (
        <nav className='fix-header navbar-expand-md d-lg-none'>
            <div className="d-flex align-items-center bg-primary">
                <div className="d-lg-block d-none me-5 pe-3">
                    <span>Logotipo</span>
                </div>
                {/* <a href="/">
                    <span className='text-white d-lg-none'>brickapp</span>
                </a> */}
                <button className='btn d-lg-none'
                color='primary'
                    onClick={() => mostrarMenuMovil()}>
                   <FaIcons.FaAlignJustify className='text-white'/>
                </button>

                {/* <button
                    className='d-sm-block d-md-none'
                    onClick={HandleToggle}>
                    {isOpen ? (
                        <i className="bi bi-x">d</i>
                    ) : (
                        <i className="bi bi-three-dots-vertical">dd</i>
                    )}
                </button> */}



            </div>
        </nav>
    )
}

export default Header   