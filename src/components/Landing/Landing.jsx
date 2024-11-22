import React from 'react'
import './Landing.css'
import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo.png';

const Landing = () => {
    return (
        <div className="">
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container">
                <img src={logo} alt="brickapp logo" style={{ width: '120px' }}/>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-4 me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="#">Inicio</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Contacto</a>
                            </li>
                        </ul>
                        <form className="d-flex">
                            {/* <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search"/> */}
                            <Link className='btn btn-outline-success' to={'/login'}>Iniciar sesión</Link>
                            <Link className='ms-3 btn btn-warning' to={'/registro'}>Registrar</Link>
                            {/* <button class="btn btn-outline-success" type="submit">Search</button> */}
                        </form>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Landing  