import React, { useContext } from 'react';
import logo from '../../assets/images/logo2.png';
import './Sidebar.css';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';

import { AuthContext } from '../../contexts/AuthContext';

const navigation = [
    {
        titulo: "Inicio",
        href: "/admin/dashboard",
        icono: <FaIcons.FaHome /> 
    },
    {
        titulo: "Cocción",
        href: "/admin/coccion",
        icono: <FaIcons.FaFire /> 
    },
    {
        titulo: "Personal",
        href: "/admin/personal",
        icono: <FaIcons.FaUserCog  /> 
    },
    {
        titulo: "Inventario",
        href: "/admin/inventario",
        icono: <FaIcons.FaBoxes  /> 
    },
    {
        titulo: "Reportes",
        href: "/admin/reportes",
        icono: <FaIcons.FaPrint  /> 
    },
]


const Sidebar = () => {

    const { logout } = useContext(AuthContext); // Obtener la función logout del AuthContext
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout(); // Llama al método logout del contexto
        navigate('/login'); // Redirige a la página de login
    };

    const mostrarMenuMovil = () => {
        document.getElementById('sidebar_area').classList.toggle('mostrarSidebar');
    };

    return (
        <div className="sidebar">
            <div className="d-flex flex-column p-4 text-white bg-primary h-100 ">
                <a className="ms-auto text-white d-lg-none" onClick={() => mostrarMenuMovil()}><FaIcons.FaTimes /> </a>
                <a href="/" className="d-flex align-items-center mb-1 mb-md-0 me-md-auto text-white text-decoration-none">
                    <img className="mb-4" src={logo} alt="brickapp logo" />
                </a>
                <hr />
                <NavLink to='/admin/monitor' className='mt-4 btnMonitor'>
                    <div className='icon'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#0d6efd" className="bi bi-graph-up-arrow" viewBox="0 0 16 16">
                            <path d="M0 0h1v15h15v1H0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5" />
                        </svg>
                    </div>
                    <div>
                        <p className='tituloBtnMonitor'>Monitor</p>
                        <p className='parrafoBtnMonitor'>Cocción en tiempo real</p>
                    </div>
                </NavLink>
                <nav className=''>
                    <ul>
                        {
                            navigation.map((item, index) => (
                                <li key={index} className='sidenav_bg'>
                                    <Link to={item.href}
                                        className={location.pathname === item.href
                                            ? "active"
                                            : "nav-link"
                                        }>
                                         {item.icono}
                                        <span className='ms-3 d-inline-block'>{item.titulo}</span>
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </nav>

                <button onClick={handleLogout} className="btn btn-outline-light mt-5">Cerrar Sesión</button>

                <hr/>
                <div className="footer_sidebar">
                    <p className="fw-lighter">© Brickapp 2024 - Versión 1.0</p>
                </div>
            </div>
        </div>
    )
}

export default Sidebar