import React from 'react'
import './Landing.css'
import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo.png';
import icon from '../../assets/images/icon.png';
import video1 from '../../assets/video1.mp4';

const Landing = () => {
    return (
        <div className="">
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container">
                    <img src={logo} alt="brickapp logo" style={{ width: '120px' }} />
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
                            <Link className='ms-3 btn btn-primary' to={'/registro'}>Registrar</Link>
                            {/* <button class="btn btn-outline-success" type="submit">Search</button> */}
                        </form>
                    </div>
                </div>
            </nav>

            <main>
                <div className="container">
                    <div className="row pt-4">

                        <div className="col-6">
                            <div className="card rounded-4 overflow-hidden">

                                <video src={video1} autoPlay muted loop></video>
                            </div>
                        </div>
                        <div className="col-6 align-self-end" >
                            <h1 className="display-6">Apoya las operaciones en industrias ladrilleras.</h1>
                            <p>Gestión del proceso de cocción en tiempo real.</p>
                            <button className='btn btn-primary'>Contacto</button>
                        </div>
                    </div>
                </div>
            </main>

            <footer class=" container d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
                <p class="col-md-4 mb-0 text-body-secondary">© 2024 Brickapp</p>

               

                <ul class="nav col-md-4 justify-content-end">
                    <li class="nav-item"><a href="#" class="nav-link px-2 text-body-secondary">Inicio</a></li>
                    <li class="nav-item"><a href="#" class="nav-link px-2 text-body-secondary">Contacto</a></li>
                   
                </ul>
            </footer>
        </div>
    )
}

export default Landing  