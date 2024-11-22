import { useState, useEffect, useRef } from "react";
import DataTable from "react-data-table-component";
//Icons
import * as FaIcons from 'react-icons/fa';
import config from "../../config";
import axios from "axios";

import '../../App.css'

import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';


const Inventario = () => {
  // const [loading, setLoading] = useState(true);
  // Estados para manejar el modal de confirmar eliminar
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [entidadAEliminar, setEntidadAEliminar] = useState({ tipo: '', id: null });
  const [idAEliminar, setIdAEliminar] = useState(null);

  //ESTADOS PARA INVENTARIO
  const [comprasData, setInventariolData] = useState([]);

  // ESTADOS PARA ALMACENES
  const [isEditingAlmacen, setIsEditingAlmacen] = useState(false);
  const [almacenesData, setAlmacenesData] = useState([]);
  const [codigoAlmacen, setCodigoAlmacen] = useState('');
  const [nombreAlmacen, setNombreAlmacen] = useState('');
  const [idAlmacen, setIdAlmacen] = useState(null);

  // ESTADOS PARA MATERIALES
  const [isEditingMaterial, setIsEditingMaterial] = useState(false);
  const [materialesData, setMaterialesData] = useState([]);
  const [nombreMaterial, setNombreMaterial] = useState('');
  const [presentacion, setPresentacion] = useState('');
  const [idMaterial, setIdMaterial] = useState(null);

  // ESTADOS PARA COMPRAS DE MATERIAL
  const [fechaCompra, setFechaCompra] = useState('');
  const [estadoPago, setEstadoPago] = useState('');
  const [detalleComprasData, setDetalleComprasData] = useState([]);
  const [destino, setDestino] = useState(false);


  // ESTADOS PARA MANEJAR LA BUSQUEDA Y SELECCION EN EL REGISTRO DE COMPRA
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);


  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null); // Material seleccionado

  const [inputNombreMaterial, setInputNombreMaterial] = useState(''); // Valor del input de búsqueda de materiales
  const [cantidadMaterial, setCantidadMaterial] = useState(""); // Para la cantidad
  const [precioCompra, setPrecioCompra] = useState(""); // Para el precio de compra

  // Estados para las alertas
  const [alertMessage, setAlertMessage] = useState(''); // Mensaje a mostrar
  const [showAlert, setShowAlert] = useState(false);   // Controlar visibilidad del Snackbar
  const [alertSeverity, setAlertSeverity] = useState('error'); // Severidad del Alert (success o error)

  const token = localStorage.getItem('token'); //obtener token de localstorage

  // Configuración de los headers con el token
  const configToken = {
    headers: {
      'Authorization': `Bearer ${token}`, // Envía el token en el encabezado
    }
  };


  // Configurar columnas para la tabla de compras de material
  const columnasTablaCompras = [
    {
      name: 'Cod. Horno',
      selector: row => row.prefijo,
      maxWidth: '50px'

    },
    {
      name: 'Estado',
      selector: row => row.estado,
      cell: row => renderEstadoCoccionBadge(row.estado),
      sortable: true,
    },
    {
      name: 'Acciones',
      cell: (row) => (
        <div className="d-flex">
          {/* Botón de Editar */}
          <button className="btn btn-light btn-sm me-2" onClick={() => handleViewDetalles(row)}>
            <FaIcons.FaEye /> {/* Icono de editar */}
          </button>

          {/* Botón de Editar */}
          <button className="btn btn-warning btn-sm me-2">
            <FaIcons.FaEdit /> {/* Icono de editar */}
          </button>

          {/* Botón de Eliminar */}
          <button className="btn btn-danger btn-sm">
            <FaIcons.FaTrashAlt /> {/* Icono de eliminar */}
          </button>
        </div>
      ),
      ignoreRowClick: true, // Ignorar el click de la fila en esta columna
      // allowOverflow: true,
      button: true, // Indicar que es un botón
    }
  ];

  // Configurar columnas para la tabla de almacenes
  const columnasTablaAlmacenes = [
    {
      name: 'Cod. Almacén',
      selector: row => row.codigo_almacen,
      maxWidth: '50px'

    },
    {
      name: 'Nombre Almacén',
      selector: row => row.nombre_almacen,
    },
    {
      name: 'Acciones',
      cell: (row) => (
        <div className="d-flex">
          {/* Botón de Editar */}
          <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditAlmacen(row)}>
            <FaIcons.FaEdit /> {/* Icono de editar */}
          </button>

          {/* Botón de Eliminar */}
          <button className="btn btn-danger btn-sm" onClick={() => handleEliminar('almacen', row.id_almacen)}>
            <FaIcons.FaTrashAlt /> {/* Icono de eliminar */}
          </button>
        </div>
      ),
      ignoreRowClick: true, // Ignorar el click de la fila en esta columna
      // allowOverflow: true,
      button: true, // Indicar que es un botón
    }
  ];

  // Configurar columnas para la tabla de compras de material
  const columnasTablaMateriales = [
    {
      name: 'Nombre de material',
      selector: row => row.nombre,
      maxWidth: '50px'

    },
    {
      name: 'Presentación',
      selector: row => row.presentacion,
    },
    {
      name: 'Acciones',
      cell: (row) => (
        <div className="d-flex">
          {/* Botón de Editar */}
          <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditMaterial(row)}>
            <FaIcons.FaEdit /> {/* Icono de editar */}
          </button>

          {/* Botón de Eliminar */}
          <button className="btn btn-danger btn-sm" onClick={() => handleEliminar('material', row.id_material)}>
            <FaIcons.FaTrashAlt /> {/* Icono de eliminar */}
          </button>
        </div>
      ),
      ignoreRowClick: true, // Ignorar el click de la fila en esta columna
      // allowOverflow: true,
      button: true, // Indicar que es un botón
    }
  ];

  /*** INICIO DE FUNCIONES PARA BÚSQUEDA Y SELECCIÓN ***/
  // Función para buscar proveedores
  const obtenerProveedores = async () => {
    const response = await fetch(`${config.apiBaseUrl}proveedores/`, configToken);
    const data = await response.json();
    return data.map((proveedor) => ({
      id: proveedor.id_proveedor,
      nombre: proveedor.nombre,
      tipo_documento: proveedor.tipo_documento,
      nro_documento: proveedor.nro_documento,
    }));
  };

  const handleSelectProveedor = (proveedor) => {
    setSelectedProveedor(proveedor);
  };

  const handleSelectMaterial = (material) => {
    setSelectedMaterial(material);
  };

  const ModalSeleccionarProveedor = ({ show, onHide, onSelectProveedor }) => {
    const [proveedores, setProveedores] = useState([]);

    useEffect(() => {
      const fetchProveedores = async () => {
        try {
          const data = await obtenerProveedores(); // Asegúrate de que esta función retorne los datos correctamente
          setProveedores(data);
        } catch (error) {
          console.error("Error al obtener proveedores:", error);
        }
      };

      if (show) {
        fetchProveedores();
      }
    }, [show]);

    return (
      <div className={`modal ${show ? 'show' : ''}`} tabIndex="-1" style={{ display: show ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Seleccionar Proveedor</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              <ul className="list-group">
                {proveedores.map((proveedor) => (
                  <li
                    key={proveedor.id_proveedor}
                    className="list-group-item"
                    onClick={() => {
                      onSelectProveedor(proveedor);
                      onHide();
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {proveedor.nombre} - {proveedor.tipo_documento}: {proveedor.nro_documento}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ModalSeleccionarMaterial = ({ show, onHide, onSelectMaterial }) => {
    const [materiales, setMateriales] = useState([]);

    useEffect(() => {
      const fetchMateriales = async () => {
        try {
          const data = await obtenerMateriales(); // Asegúrate de que esta función retorne los datos correctamente
          console.log("Materiales obtenidos:", data); // Verifica que los datos se obtienen correctamente
          setMateriales(data);
        } catch (error) {
          console.error("Error al obtener materiales:", error);
        }
      };

      // Solo llamar a fetchMateriales si el modal está visible
      if (show) {
        fetchMateriales();
      }
    }, [show]); // Solo dependemos de `show`

    return (
      <div className={`modal ${show ? 'show' : ''}`} tabIndex="-1" style={{ display: show ? 'block' : 'none' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Seleccionar Material</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              {materiales.length === 0 ? (
                <p>No hay materiales disponibles.</p> // Mensaje si no hay materiales
              ) : (
                <ul className="list-group">
                  {materiales.map((material) => (
                    <li
                      key={material.id_material} // Asegúrate de usar el id_material
                      className="list-group-item"
                      onClick={() => {
                        onSelectMaterial(material);
                        onHide();
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {material.nombre} - {material.presentacion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };



  const resentFormCompra = () => {
    setFechaCompra('');
    setEstadoPago('');
    setSelectedProveedor(null);
    setNombreMaterial('');
    setCantidadMaterial('');
    setPrecioCompra('');
  }

  const handleRadioChange = (e) => {
    setDestino(e.target.value === "almacen");
  }


  // función que se encargue de agregar los datos de la compra al estado detalleComprasData
  const handleAgregarMaterial = (e) => {
    e.preventDefault();

    if (!selectedMaterial) {
      setAlertMessage('Por favor, selecciona un material.');
      setAlertSeverity('error');
      setShowAlert(true);
      return;
    }

    if (!cantidadMaterial || cantidadMaterial <= 0) {
      setAlertMessage('Por favor, ingresa una cantidad válida.');
      setAlertSeverity('error');
      setShowAlert(true);
      return;
    }

    if (!precioCompra || precioCompra <= 0) {
      setAlertMessage('Por favor, ingresa un precio de compra válido.');
      setAlertSeverity('error');
      setShowAlert(true);
      return;
    }

    const nuevoItem = {
      id_material: selectedMaterial.id_material,
      nombre: selectedMaterial.nombre,
      cantidad: parseFloat(cantidadMaterial),
      precioCompra: parseFloat(precioCompra),
      subtotal: parseFloat(cantidadMaterial) * parseFloat(precioCompra),
    };

    setDetalleComprasData([...detalleComprasData, nuevoItem]);

    // Limpiar campos después de agregar
    setCantidadMaterial('');
    setPrecioCompra('');
    setSelectedMaterial(null);
  };

  // Calcular el total de la compra
  const totalCompra = detalleComprasData.reduce((total, item) => total + item.subtotal, 0);

  /*** FIN DE FUNCIONES PARA BÚSQUEDA Y SELECCIÓN ***/


  /*** INICIO DE FUNCIONES PARA MANEJAR ALMACEN ***/
  //Obtener todos los almacenes
  const fetchAlmacenesData = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}almacen/`, configToken);
      setAlmacenesData(response.data);
      // setLoading(false); //Cambia el estado de loading a false
      // console.log(response.data);
    } catch (error) {
      console.error("Error al obtener los datos de cargos de cocción: ", error);
      // setLoading(false);
    }
  }

  // Registrar almacén
  const handleSubmitAlmacen = async (e) => {
    e.preventDefault();

    const almacenData = {
      codigoAlmacen,
      nombreAlmacen
    }

    try {
      let response;

      if (isEditingAlmacen) {
        response = await axios.put(`${config.apiBaseUrl}almacen/${idAlmacen}`, almacenData, configToken);
      } else {
        response = await axios.post(`${config.apiBaseUrl}almacen/`, almacenData, configToken);
      }
      if (response.data && response.data.message) {
        // Mostrar mensaje de éxito
        setAlertMessage(isEditingAlmacen ? 'Almacén actualizado con éxito.' : 'Almacén registrado exitosamente.');
        setAlertSeverity('success')
        setShowAlert(true);
      }

      // Actualiza la tabla
      await fetchAlmacenesData();

      //limpiar campos
      setCodigoAlmacen("");
      setNombreAlmacen("");

    } catch (error) {
      setAlertMessage('Error: No se ha podido agregar o actualizar el almacén. ' + error);
      setAlertSeverity('error');
      setShowAlert(true);

    }
  }

  // Editar almacén
  const handleEditAlmacen = (row) => {
    setIsEditingAlmacen(true); //Activar modo editar
    // console.log(row);
    setIdAlmacen(row.id_almacen);
    // Cargar datos en los inputs
    setCodigoAlmacen(row.codigo_almacen);
    setNombreAlmacen(row.nombre_almacen);
  }

  // Función para resetear los campos del formulario de almacen
  const resetFormAlmacen = () => {
    setCodigoAlmacen('');   // Resetear el select de presentación del material
    setNombreAlmacen(''); // Resetear el campo de nombre del material
    setIdAlmacen(null);   // Limpiar el ID del material si existe
    setIsEditingAlmacen(false); // Cambiar el estado para salir del modo edición
  };
  /*** FIN DE FUNCIONES PARA MANEJAR ALMACEN ***/

  /*** INICIO DE FUNCIONES PARA MATERIAL ***/
  //Obtener todos los materiales
  const obtenerMateriales = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}material/`, configToken);
      return response.data; // Retorna los datos obtenidos
    } catch (error) {
      console.error("Error al obtener materiales:", error);
      throw error; // Lanza el error para que pueda ser manejado por el llamador
    }
  }

  // Registrar material
  const handleSubmitMaterial = async (e) => {
    e.preventDefault();

    const materialData = {
      nombreMaterial,
      presentacion
    }

    try {
      let response;

      if (isEditingMaterial) {
        response = await axios.put(`${config.apiBaseUrl}material/${idMaterial}`, materialData, configToken);
      } else {
        response = await axios.post(`${config.apiBaseUrl}material/`, materialData, configToken);
      }
      if (response.data && response.data.message) {
        // Mostrar alerta 
        setAlertMessage('Material registrado correctamente.');
        setAlertSeverity('success'); // Tipo de alerta
        setShowAlert(true); // Mostrar la alerta
      }

      // Actualiza la tabla
      obtenerMateriales();

      //limpiar campos
      resetFormMaterial();
    } catch (error) {
      // Mostrar alerta de error
      setAlertMessage('No se registró el material. ' + error.message); // Mensaje de error
      setAlertSeverity('error'); // Tipo de alerta
      setShowAlert(true); // Mostrar la alerta
    }
  }

  // Función para editar el material
  const handleEditMaterial = (material) => {
    // Establecer los valores del material en los estados
    setNombreMaterial(material.nombre); // Asignar el nombre del material
    setPresentacion(material.presentacion); // Asignar el valor de presentación en el select

    // Opcional: Si tienes un estado que determina si estás en modo edición
    setIsEditingMaterial(true); // Establece el estado para saber que estamos editando
    setIdMaterial(material.id_material); // Asignar el ID del material para la actualización
  };

  // Función para resetear los campos del formulario de material
  const resetFormMaterial = () => {
    setNombreMaterial(''); // Resetear el campo de nombre del material
    setPresentacion('');   // Resetear el select de presentación del material
    setIdMaterial(null);   // Limpiar el ID del material si existe
    setIsEditingMaterial(false); // Cambiar el estado para salir del modo edición
  };

  /*** FIN  DE FUNCIONES PARA MATERIAL ***/

  /*** INICIO DE FUNCIONES PARA MANEJAR EL MODAL DE ELIMINAR ***/
  // Abre el modal y establece la entidad y el ID que se va a eliminar
  const handleEliminar = (entidad, id) => {
    setEntidadAEliminar(entidad); // Puede ser 'almacen', 'material', 'compra', etc.
    setIdAEliminar(id); // ID del registro que se va a eliminar
    setMostrarModalEliminar(true); // Mostrar el modal de confirmación
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setMostrarModalEliminar(false);
    setEntidadAEliminar(null);
    setIdAEliminar(null);
  };

  // Confirmar la eliminación
  const handleConfirmEliminar = async () => {
    try {
      let url = '';
      if (entidadAEliminar === 'almacen') {
        url = `${config.apiBaseUrl}almacen/${idAEliminar}`;
      } else if (entidadAEliminar === 'material') {
        url = `${config.apiBaseUrl}material/${idAEliminar}`;
      } else if (entidadAEliminar === 'compra') {
        url = `${config.apiBaseUrl}compraMaterial/${idAEliminar}`;
      }
      // Llamar a la API para eliminar el registro
      await axios.delete(url, configToken);

      // Actualizar los datos después de la eliminación
      if (entidadAEliminar === 'almacen') {
        fetchAlmacenesData(); // Recargar datos
        resetFormAlmacen();
      } else if (entidadAEliminar === 'material') {
        obtenerMateriales();
        resetFormMaterial();
      } else if (entidadAEliminar === 'compra') {
        fetchCoccionData();
      }


      // Cerrar modal
      handleCloseModal();

    } catch (error) {
      console.error(`Error al eliminar ${entidadAEliminar}: `, error);
    }
  };
  /*** FIN DE FUNCIONES PARA MANEJAR EL MODAL DE ELIMINAR ***/


  // activar el evento cuando el modal es mostrado
  useEffect(() => {
    fetchAlmacenesData();
    obtenerMateriales();

    // Obtener la fecha actual cuando se carga el componente
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
    const formattedDate = localDate.toISOString().split('T')[0]; // Formato yyyy-mm-dd
    setFechaCompra(formattedDate);

  }, []);

  const handleSubmitCompra = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!fechaCompra) {
      setAlertMessage('Por favor, selecciona una fecha de compra.');
      setAlertSeverity('error');
      setShowAlert(true);
      return;
    }

    if (!estadoPago) {
      setAlertMessage('Por favor, selecciona un estado de pago.');
      setAlertSeverity('error');
      setShowAlert(true);
      return;
    }

    if (!destino) {
      setAlertMessage('Por favor, selecciona un destino (Quema directa o Para almacén).');
      setAlertSeverity('error');
      setShowAlert(true);
      return;
    }

    if (destino === "almacen" && !idAlmacen) {
      setAlertMessage('Por favor, selecciona un almacén si el destino es Para almacén.');
      setAlertSeverity('error');
      setShowAlert(true);
      return;
    }

    if (!selectedProveedor) {
      setAlertMessage('Por favor, selecciona un proveedor.');
      setAlertSeverity('error');
      setShowAlert(true);
      return;
    }

    if (!detalleComprasData || detalleComprasData.length === 0) {
      setAlertMessage('Por favor, agrega al menos un ítem en el detalle de compras.');
      setAlertSeverity('error');
      setShowAlert(true);
      return;
    }

    // Preparar los datos para la compra
    const compraData = {
      fecha_compra: fechaCompra,
      estado_pago: estadoPago,
      destino_quema: destino === "quema" ? 0 : 1, // 1 para quema directa, 0 para almacén
      almacen_id_almacen: destino === "almacen" ? idAlmacen : null, // Almacén solo si el destino es para almacén
      proveedor_id_proveedor: selectedProveedor.id,
      detalles: detalleComprasData.map((item) => ({
          id_material: item.id_material,
          cantidad: item.cantidad,
          precio_unitario_compra: item.precioCompra,
          subtotal: item.subtotal,
      })),
  };

  console.log(compraData);

    try {
      const response = await axios.post(`${config.apiBaseUrl}comprasmateriales/`, compraData, configToken);
      if(response.data && response.data.message){

        setAlertMessage('Compra registrada con éxito.');
        setAlertSeverity('success');
        setShowAlert(true);
      }

      // Reiniciar los campos del formulario
      resetFormularioCompra();
    
    } catch (error) {
      setAlertMessage('Ocurrió un error al registrar la compra.');
      setAlertSeverity('error');
      setShowAlert(true);
    }
  };

  const resetFormularioCompra = () => {
    setFechaCompra('');
    setEstadoPago('');
    setDestino(false);
    setSelectedProveedor(null);
    setDetalleComprasData([]);
  };

  return (
    <div className='d-flex'>

      {/* Snackbar para alerts */}
      <Snackbar
        open={showAlert}
        autoHideDuration={3000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={alertSeverity} onClose={() => setShowAlert(false)}>
          {alertMessage}
        </Alert>
      </Snackbar>

      {/* <Sidebar/> */}
      <div className='content'>
        {/* Inicio Header cocción */}
        <div className="d-flex p-2 justify-content-between">
          <h3 className="">Inventario material de cocción</h3>
          <div className="d-flex">
            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalComprasMaterial"><FaIcons.FaFire /> Registrar compra</button>
          </div>
        </div>
        <div className='d-flex'>
          <button className='btn btn-warning me-2' data-bs-toggle="modal" data-bs-target="#modalAlmacenes"><FaIcons.FaIndustry /> Almacenes</button>
          <button className='btn btn-warning' data-bs-toggle="modal" data-bs-target="#modalMateriales"><FaIcons.FaUserCog /> Materiales</button>
        </div>
        {/* Fin Header cocción */}

        {/* Inicio modal de almacenes */}
        <div className="modal fade" id="modalAlmacenes" aria-labelledby="tituloModalAlmacenes" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h1 className="modal-title fs-5" id="tituloModalAlmacenes">Almacenes de material</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="container">
                  <div className="row">
                    <div className="col-12 col-md-5">
                      <form onSubmit={handleSubmitAlmacen}>
                        <div className="mb-3">
                          <div className="row">
                            <div className="col-12 mb-3">
                              <label htmlFor="InputCodAlmacen" className="form-label">Cod. Almacén</label>
                              <input type="text" className="form-control" id="InputCodAlmacen"
                                value={codigoAlmacen}
                                onChange={(e) => setCodigoAlmacen(e.target.value)} required
                              />
                              <div className="form-text">Prefijo para identificar un almacén.</div>
                            </div>
                            <div className="col-12">
                              <label htmlFor="InputNombreAlmacen" className="form-label">Nombre de Almacén</label>
                              <input type="text" className="form-control" id="InputNombreAlmacen"
                                value={nombreAlmacen}
                                onChange={(e) => setNombreAlmacen(e.target.value)} required
                              />
                            </div>
                          </div>
                        </div>
                        <button type="submit" className="btn btn-primary">{isEditingAlmacen ? 'Actualizar' : 'Registrar'}</button>


                      </form>
                    </div>
                    <div className="col-12 col-md-7">
                      <DataTable
                        title="Listado de almacenes"
                        columns={columnasTablaAlmacenes}
                        data={almacenesData}
                        pagination={false}
                        // progressPending={loading}
                        highlightOnHover={true}
                        responsive={true}
                        noDataComponent={
                          <div style={{ color: '#ff6347', padding: '20px' }}>
                            No hay registros de almacenes.
                          </div>
                        }
                        persistTableHead={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                {/* <button type="submit" className="btn btn-primary">Guardar</button> */}
              </div>
            </div>
          </div>
        </div>
        {/* Fin modal de almacenes */}

        {/* Inicio modal de materiales */}
        <div className="modal fade" id="modalMateriales" aria-labelledby="tituloModalMateriales" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h1 className="modal-title fs-5" id="tituloModalMateriales">Materiales de cocción</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="container">
                  <div className="row">
                    <div className="col-12 col-md-5">
                      <form onSubmit={handleSubmitMaterial}>
                        <div className="mb-3">
                          <div className="row">
                            <div className="col-12 mb-3">
                              <label htmlFor="InputNombreMaterial" className="form-label">Nombre de material</label>
                              <input type="text" className="form-control" id="InputNombreMaterial"
                                value={nombreMaterial}
                                onChange={(e) => setNombreMaterial(e.target.value)} required
                              />
                            </div>
                            <div className="col-12">
                              <label htmlFor="presentacion" className="form-label">Presentación</label>
                              <select
                                className="form-select"
                                id="presentacion"
                                value={presentacion} // Vincula el valor del select al estado
                                onChange={(e) => setPresentacion(e.target.value)} // Actualiza el estado al seleccionar una opción
                                required
                              >
                                <option value="">Seleccionar tipo</option> {/* Opción por defecto */}
                                <option value="Sacos normales">Sacos normales</option>
                                <option value="Sacos compactados">Sacos compactados</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <button type="submit" className="btn btn-primary">{isEditingMaterial ? 'Actualizar' : 'Registrar'}</button>


                      </form>
                    </div>
                    <div className="col-12 col-md-7">
                      <DataTable
                        title="Listado de materiales"
                        columns={columnasTablaMateriales}
                        data={materialesData}
                        pagination={false}
                        // progressPending={loading}
                        highlightOnHover={true}
                        responsive={true}
                        noDataComponent={
                          <div style={{ color: '#ff6347', padding: '20px' }}>
                            No hay registros de materiales.
                          </div>
                        }
                        persistTableHead={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                {/* <button type="submit" className="btn btn-primary">Guardar</button> */}
              </div>
            </div>
          </div>
        </div>
        {/* Fin modal de materiales  */}

        {/* Inicio modal de compras */}
        <div className="modal fade" id="modalComprasMaterial" aria-labelledby="tituloModalComprasMaterial" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h1 className="modal-title fs-5" id="tituloModalComprasMaterial">Registro de compra</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="container">
                  <div className="row">
                    <div className="col-12">
                      <form onSubmit={handleSubmitCompra}>
                        <fieldset>
                          <legend>Datos de compra</legend>
                          <div className="row mb-3">
                            <div className="col-md-3">
                              <label htmlFor="fechaCompra" className="form-label">Fecha de Compra:</label>
                              <input
                              required
                                className="form-control"
                                type="date"
                                id="fechaCompra"
                                name="fechaCompra"
                                value={fechaCompra}
                                onChange={(e) => setFechaCompra(e.target.value)}
                              />
                            </div>
                            <div className="col-md-3">
                              <label htmlFor="estadoPago" className="form-label">Estado de pago</label>
                              <select
                                className="form-select"
                                id="estadoPago"
                                value={estadoPago}
                                onChange={(e) => setEstadoPago(e.target.value)}
                                required
                              >
                                <option value="">Seleccionar estado</option> {/* Opción por defecto */}
                                <option value="Cancelado">Cancelado</option>
                                <option value="Pendiente">Pendiente</option>
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label className="form-label">Destino</label>
                              <div class="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="destino"
                                  value="quema"
                                  id="flexRadioQuemaDirecta"
                                  checked={destino === "quema"} // Verifica si el estado coincide
                                  onChange={(e) => {
                                    setDestino(e.target.value);
                                    setIdAlmacen(null); // Limpiar almacén si el destino es quema
                                  }}
                                />
                                <label class="form-check-label" for="flexRadioQuemaDirecta">
                                  Quema directa
                                </label>
                              </div>
                              <div class="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="destino"
                                  value="almacen"
                                  id="flexRadioParaAlmacen"
                                  checked={destino === "almacen"} // Verifica si el estado coincide
                                  onChange={(e) => setDestino(e.target.value)} // Actualiza el estado
                                />
                                <label class="form-check-label" for="flexRadioParaAlmacen">
                                  Para almacén
                                </label>
                              </div>
                            </div>
                            <div className="col-md-3">
                              <label htmlFor="selectAlmacen" className="form-label">Almacén</label>
                              <select
                                className="form-select"
                                id="selectAlmacen"
                                value={idAlmacen}
                                disabled={destino !== "almacen"}
                                onChange={(e) => setIdAlmacen(e.target.value)}
                              >
                                <option value="">Seleccionar destino</option> {/* Opción por defecto */}

                                {/* Mapea los almacenes obtenidos */}
                                {almacenesData.map((almacen) => (
                                  <option key={almacen.id_almacen} value={almacen.id_almacen}>
                                    {almacen.nombre_almacen}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-12 col-md-3">
                              <label for="" className="form-label">Tipo documento</label>
                              <input
                                disabled
                                className="form-control"
                                type="text"
                                name="inputTipoDocumentoProveedor"
                                id="inputTipoDocumentoProveedor"
                                value={selectedProveedor?.tipo_documento || ""}
                              />
                            </div>
                            <div className="col-12 col-md-3">
                              <label for="" className="form-label">Nro. documento</label>
                              <input
                                disabled
                                className="form-control"
                                type="number"
                                name="inputNroDocumentoProveedor"
                                id="inputNroDocumentoProveedor"
                                value={selectedProveedor?.nro_documento || ""}
                              />

                            </div>
                            <div className="col-12 col-md-6">
                              <label for="" className="form-label">Proveedor</label>
                              <div className="d-flex w-100 gap-2">
                                <div style={{ flex: 1 }}>
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="proveedor"
                                    value={selectedProveedor ? selectedProveedor.nombre : ""}
                                    readOnly
                                    onClick={() => setShowProveedorModal(true)}
                                  />
                                </div>

                                <a className="btn btn-primary">
                                  <FaIcons.FaUserPlus />
                                </a>

                              </div>
                            </div>
                          </div>
                          <div className="row mb-3">

                            <div className="col-md-6">
                              <label htmlFor="nombreMaterial" className="form-label">Material</label>

                              <div className="d-flex w-100 gap-2">
                                <div style={{ flex: 1 }}>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nombre del material"
                                    value={selectedMaterial ? selectedMaterial.nombre : ""}
                                    onClick={() => setShowMaterialModal(true)}
                                  />
                                </div>

                                <a className="btn btn-primary">
                                  <FaIcons.FaPlus />
                                </a>

                              </div>
                            </div>
                            <div className="col-md-2">
                              <label htmlFor="cantidadMaterial" className="form-label">Cantidad</label>
                              <input className="form-control" type="number" name="inputCantidadMaterial" id="inputCantidadMaterial" value={cantidadMaterial} onChange={(e) => setCantidadMaterial(e.target.value)} />
                            </div>
                            <div className="col-md-2">
                              <label htmlFor="precioCompra" className="form-label">P. compra S/.</label>
                              <input className="form-control" type="number" name="inputPrecioCompra" id="inputPrecioCompra" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} />
                            </div>
                            <div className="col-md-2 align-content-end">

                              <button className="btn btn-primary" onClick={handleAgregarMaterial}><FaIcons.FaPlusSquare /> Añadir</button>
                            </div>
                          </div>
                        </fieldset>

                        <table className="table table-striped" id="tablaDetalleCompra">
                          <thead className="table-primary">
                            <tr>
                              <th scope="col">Id.</th>
                              <th scope="col">Material</th>
                              <th scope="col">Cantidad</th>
                              <th scope="col">Precio compra</th>
                              <th scope="col">Subtotal S/</th>
                            </tr>
                          </thead>
                          <tbody className="table-group-divider">
                            {detalleComprasData.map((item, index) => (
                              <tr key={index}>
                                <td>{item.id_material}</td>
                                <td>{item.nombre}</td>
                                <td>{item.cantidad}</td>
                                <td>{item.precioCompra.toFixed(2)}</td>
                                <td>{item.subtotal.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan="4" className="text-end"><strong>Total S/:</strong></td>
                              <td><strong>{totalCompra.toFixed(2)}</strong></td>
                            </tr>
                          </tfoot>
                        </table>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                          <button type="submit" className="btn btn-success">Guardar</button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        {/* Fin modal de compras  */}

        {/* Modales de selección */}
        <ModalSeleccionarProveedor
          show={showProveedorModal}
          onHide={() => setShowProveedorModal(false)}
          onSelectProveedor={handleSelectProveedor}
        />

        <ModalSeleccionarMaterial
          show={showMaterialModal}
          onHide={() => setShowMaterialModal(false)}
          onSelectMaterial={handleSelectMaterial}
        />


        {/* Inicio tabla compras */}
        <section className="mt-3">
          {/* <h1>Lista de personal</h1> */}
          <DataTable
            title="Listado de ingresos de material"
            columns={columnasTablaCompras}
            data={comprasData}
            pagination={true}
            // progressPending={loading}
            highlightOnHover={true}
            responsive={true}
            noDataComponent={
              <div style={{ color: '#ff6347', padding: '20px' }}>
                No hay registros de ingresos de material.
              </div>
            }
            persistTableHead={true}

          />
        </section>
        {/* Fin tabla compras */}

        {/* Inicio modal confirmación eliminar reutilizable */}
        <div className={`modal ${mostrarModalEliminar ? 'show' : ''}`} tabIndex="-1" style={{ display: mostrarModalEliminar ? 'block' : 'none' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirmar Eliminación</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas eliminar este registro?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cerrar</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmEliminar}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
        {mostrarModalEliminar && <div className="modal-backdrop fade show"></div>} {/* Fondo del modal */}
        {/* Fin modal confirmación eliminar */}
      </div>
    </div>
  )
}

export default Inventario;