import logo from '../../assets/images/logo2.png';
import './Sidebar.css';
import { Link, NavLink, useLocation } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';

const navigation = [
    // {
    //     titulo: "Monitor",
    //     href: "/admin/monitor",
    //     icono: ""
    // },
    {
        titulo: "Inicio",
        href: "/admin/dashboard",
        icono: ""
    },
    {
        titulo: "Cocción",
        href: "/admin/coccion",
        icono: ""
    },
    {
        titulo: "Personal",
        href: "/admin/trabajadores",
        icono: ""
    },
    {
        titulo: "Inventario",
        href: "/admin/inventario",
        icono: ""
    },
    {
        titulo: "Reportes",
        href: "/admin/reportes",
        icono: ""
    },
]

const Sidebar = () => {

    const mostrarMenuMovil = () => {
        document.getElementById('sidebar_area').classList.toggle('mostrarSidebar');
    };

    let location = useLocation();

    return (
        <div className="sidebar">
            <div className="d-flex flex-column p-4 text-white bg-primary h-100">
                <button className="ms-auto text-black d-lg-none" onClick={() => mostrarMenuMovil()}> X </button>
                <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                    <img className="mb-4" src={logo} alt="brickapp logo" />
                </a>
                <hr />
                <NavLink to='/admin/monitor' className='btnMonitor'>
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
                <nav className='sidebar_nav'>
                    <ul>
                        {
                            navigation.map((item, index) => (
                                <li key={index} className='sidenav_bg'>
                                    <Link to={item.href}
                                        className={location.pathname === item.href
                                            ? "active"
                                            : "nav-link"
                                        }>
                                        <i className={item.icono}></i>
                                        <span className='ms-3 d-inline-block'>{item.titulo}</span>
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </nav>

                <Link to='/' className="btn btn-outline-light">Cerrar Sesión</Link>
                <hr />
                <div className="footer_sidebar">
                    <p className="fw-lighter">© Brickapp 2024 - Versión 1.0</p>
                </div>
            </div>
        </div>
    )
}

export default Sidebar