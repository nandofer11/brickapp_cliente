import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar/Sidebar'
import Header from './Header'
import './FullLayout.css'

const FullLayout = () => {
    return (
        <main>
            {/* Header */}
            <Header/>
            <div className="page_wrapper d-lg-flex">
                {/* Sidebar */}
                <aside className='sidebar_area' id='sidebar_area'>
                    <Sidebar />
                </aside>
                {/* Area de contenido */}
                <div className="contenido_area">
                    <div className="container-fluid p-4">
                        <Outlet />
                    </div>
                </div>
            </div>

        </main>
    )
}

export default FullLayout