import './App.css';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/Login';
// Pages
import Monitor from './components/Pages/Monitor';
import Inicio from './components/Pages/Inicio';
import Coccion from './components/Pages/Coccion';
import Trabajadores from './components/Pages/Trabajadores';
import Inventario from './components/Pages/Inventario';
import Reportes from './components/Pages/Reportes';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
<<<<<<< HEAD
import Sidebar from './components/Sidebar/Sidebar';



=======
import Sidebar from './layouts/Sidebar/Sidebar';
import FullLayout from './layouts/FullLayout';



// const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <Login />,
//   },
//   {
//     path: '/admin/dashboard',
//     element: <Dashboard />,
//   },
//   {
//     path: '/admin/monitor',
//     element: <Monitor/>
//   },
//   {
//     path: '/admin/coccion',
//     element: <Coccion/>
//   },
//   {
//     path: '/admin/trabajadores',
//     element: <Trabajadores/>
//   },
//   {
//     path: '/admin/inventario',
//     element: <Inventario/>
//   },
//   {
//     path: '/admin/reportes',
//     element: <Reportes/>
//   }
// ]
// )

>>>>>>> 8f9b63e (actualizacion del sidebar responsive)
const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
<<<<<<< HEAD
    path: '/admin/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/admin/monitor',
    element: <Monitor/>
  },
  {
    path: '/admin/coccion',
    element: <Coccion/>
  },
  {
    path: '/admin/trabajadores',
    element: <Trabajadores/>
  },
  {
    path: '/admin/inventario',
    element: <Inventario/>
  },
  {
    path: '/admin/reportes',
    element: <Reportes/>
  }
]
)
=======
    path: '/admin',
    element: <FullLayout />,
    children: [
      {
        path: 'dashboard',
        exact: true,
        element: <Dashboard />,
      },
      {
        path: 'monitor',
        exact: true,
        element: <Monitor />
      },
      {
        path: 'coccion',
        exact: true,
        element: <Coccion />
      },
      {
        path: 'trabajadores',
        exact: true,
        element: <Trabajadores />
      },
      {
        path: 'inventario',
        exact: true,
        element: <Inventario />
      },
      {
        path: 'reportes',
        exact: true,
        element: <Reportes />
      }
    ]
  }
])
>>>>>>> 8f9b63e (actualizacion del sidebar responsive)

function App() {
  return (
    <div>
<<<<<<< HEAD
        <RouterProvider router={router}/>
      
=======
      <RouterProvider router={router} />

>>>>>>> 8f9b63e (actualizacion del sidebar responsive)
      {/* <div className=''>
        <Sidebar/>
        <div>
        </div>
      </div> */}
    </div>
  )

}

export default App
