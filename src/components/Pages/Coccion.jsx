import DataTable from 'react-data-table-component';
import axios from 'axios';
//Icons
import * as FaIcons from 'react-icons/fa';
import { useState, useEffect } from 'react';

import config from '../../config';

import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';

const Coccion = () => {

    const token = localStorage.getItem('token'); //obtener token de localstorage

    // Configuración de los headers con el token
    const configToken = {
        headers: {
            'Authorization': `Bearer ${token}`, // Envía el token en el encabezado
        }
    };

    const [loading, setLoading] = useState(true);
    // Estados para manejar el modal de confirmar eliminar
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
    const [entidadAEliminar, setEntidadAEliminar] = useState({ tipo: '', id: null });
    const [idAEliminar, setIdAEliminar] = useState(null);

    //COCCION
    const [coccionData, setCoccionlData] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [trabajadoresData, setTrabajadoresData] = useState([]);  // Estado para los datos de trabajadores
    const [idCoccionSeleccionada, setIdCoccionSeleccionada] = useState(null); // cocción seleccionada para editar
    const [fechaEncendido, setFechaEncendido] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [fechaApagado, setFechaApagado] = useState('');
    const [horaFin, setHoraFin] = useState('');
    const [humedadInicial, setHumedadInicial] = useState('');
    const [estado, setEstado] = useState('');

    // HORNOS
    const [hornosData, setHornosData] = useState([]);
    const [hornoSeleccionado, setHornoSeleccionado] = useState(null); //para manejar la cantidad de operadores en un horno seleccionado
    const [isEditingHorno, setIsEditingHorno] = useState(false);
    const [idHornoSeleccionado, setIdHornoSeleccionado] = useState(null);
    const [prefijo, setPrefijo] = useState('');
    const [nombre, setNombreHorno] = useState('');
    const [cantidad_humeadores, setCantidadHumeadores] = useState(0);
    const [cantidad_quemadores, setCantidadQuemadores] = useState(0);

    // CARGOS COCCION
    const [cargoCoccionData, setCargoCoccionData] = useState([]);
    const [cargosSeleccionados, setCargosSeleccionados] = useState([]); // para manejar los  cargos seleccionados 
    const [idCargoSeleccionado, setIdCargoSeleccionado] = useState(null);
    const [isEditingCargo, setIsEditingCargo] = useState(false);
    const [nombre_cargo, setNombreCargo] = useState('');
    const [costo_cargo, setCostoCargo] = useState('');

    // Estados para las alertas
    const [alertMessage, setAlertMessage] = useState(''); // Mensaje a mostrar
    const [showAlert, setShowAlert] = useState(false);   // Controlar visibilidad del Snackbar
    const [alertSeverity, setAlertSeverity] = useState('error'); // Severidad del Alert (success o error)


    const [mostrarModalHumeador, setMostrarModalHumeador] = useState(false);
    const [trabajadoresSeleccionadosHumeador, setTrabajadoresSeleccionadosHumeador] = useState([]);
    const [monstrarModalQuemadores, setMostrarModalQuemadores] = useState(false);
    const [trabajadoresSeleccionadosQuemadores, setTrabajadoresSeleccionadosQuemadores] = useState([]);

    const [showModalCoccionDetalles, setShowModalCoccionDetalles] = useState(false);
    const [coccionDetalles, setCoccionDetalles] = useState(null);

    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    const [materialesData, setMaterialesData] = useState([]);

    // Configurar columnas para la tabla cocciones
    const columns = [
        {
            name: 'Cod. Horno',
            selector: row => row.prefijo,
            maxWidth: '50px'

        },
        {
            name: 'Horno',
            selector: row => row.nombre_horno,
        },
        {
            name: 'Fecha de encendido',
            selector: row => new Date(row.fecha_encendido).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }),
            sortable: true,
        },
        {
            name: 'Hora de inicio',
            selector: row => row.hora_inicio,
            sortable: true,
        },
        {
            name: 'Fecha de apagado',
            selector: row => row.fecha_apagado ? new Date(row.fecha_apagado).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }) : '', // O cualquier texto que desees mostrar
            sortable: true,
            // maxWidth: '30px'
        },
        {
            name: 'Hora de fin',
            selector: row => row.hora_fin,
            sortable: true,
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
                    {/* Botón de ver detalle */}
                    <button className="btn btn-light btn-sm me-2" onClick={() => fetchDetallesCoccion(row.id_coccion)}>
                        <FaIcons.FaEye /> {/* Icono de editar */}
                    </button>

                    {/* Botón de Editar */}
                    <button className="btn btn-warning btn-sm me-2">
                        <FaIcons.FaEdit /> {/* Icono de editar */}
                    </button>

                    {/* Botón de Eliminar */}
                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar('coccion', row.id_coccion)}>
                        <FaIcons.FaTrashAlt /> {/* Icono de eliminar */}
                    </button>
                </div>
            ),
            ignoreRowClick: true, // Ignorar el click de la fila en esta columna
            // allowOverflow: true,
            button: true, // Indicar que es un botón
        }
    ];

    // Configurar columnas para la tabla hornos
    const columnsHornos = [
        {
            name: 'Prefijo',
            selector: row => row.prefijo,
            maxWidth: '10px'
        },
        {
            name: 'Nombre horno',
            selector: row => row.nombre,
            sortable: true,
        },
        {
            name: 'Humeadores',
            selector: row => row.cantidad_humeadores,
            maxWidth: '20px'
        },
        {
            name: 'Quemadores',
            selector: row => row.cantidad_quemadores,
            maxWidth: '20px'
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <div className="d-flex">
                    {/* Botón de Editar */}
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditHorno(row)}>
                        <FaIcons.FaEdit /> {/* Icono de editar */}
                    </button>

                    {/* Botón de Eliminar */}
                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar('horno', row.id_horno)}>
                        <FaIcons.FaTrashAlt /> {/* Icono de eliminar */}
                    </button>
                </div>
            ),
            ignoreRowClick: true, // Ignorar el click de la fila en esta columna
            // allowOverflow: true,
            button: true, // Indicar que es un botón
        }
    ];

    // Configurar columnas para la tabla cargos cocciones
    const columnsCargosCoccion = [
        {
            name: 'Nombre',
            selector: row => row.nombre_cargo,
        },
        {
            name: 'Costo S/.',
            selector: row => row.costo_cargo,
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <div className="d-flex">
                    {/* Botón de Editar */}
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditCargo(row)}>
                        <FaIcons.FaEdit /> {/* Icono de editar */}
                    </button>

                    {/* Botón de Eliminar */}
                    <button className="btn btn-danger btn-sm" onClick={() => handleEliminar('cargo', row.id_cargo_coccion)}>
                        <FaIcons.FaTrashAlt /> {/* Icono de eliminar */}
                    </button>
                </div>
            ),
            ignoreRowClick: true, // Ignorar el click de la fila en esta columna
            // allowOverflow: true,
            button: true, // Indicar que es un botón
        }
    ];


    // Función para mostrar el badge según el estado de la coccion
    const renderEstadoCoccionBadge = (estado) => {
        if (estado === 'En curso') {
            return <span className="badge bg-warning">En curso</span>;
        } else {
            return <span className="badge bg-success">Finalizado</span>;
        }
    };

    //Obtener cocciones
    const fetchCoccionData = async () => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}coccion/`, configToken);
            setCoccionlData(response.data);
            setLoading(false); //Cambia el estado de loading a false
        } catch (error) {
            console.error("Error al obtener los datos de cocciones: ", error);
            setLoading(false);
        }
    }

    // Función para abrir el modal
    const abrirModalHumeador = () => {
        // Verificar si existe el cargo "Humeador"
        const humeadorCargo = cargoCoccionData.find(cargo => cargo.nombre_cargo === "Humeador");
        if (!humeadorCargo) {
            setAlertMessage('Debes registrar un cargo de cocción "Humeador" antes de continuar.');
            setAlertSeverity('error');
            setShowAlert(true);
            return; // No abrir el modal si no existe el cargo
        }

        setMostrarModalHumeador(true);
    };

    // Función para cerrar el modal
    const cerrarModal = () => {
        setMostrarModalHumeador(false);
    };

    // Manejar la selección de humeador y agregarlo a la lista de humeador
    const manejarSeleccionHumeador = (trabajador) => {
        if (trabajadoresSeleccionadosHumeador.length >= cantidad_humeadores) {
            setAlertMessage(`Ya se ha alcanzado el límite de ${cantidad_humeadores} humeadores.`);
            setAlertSeverity(error);
            setShowAlert(true);

            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        } else {
            // Agregar el trabajador seleccionado a la lista
            setTrabajadoresSeleccionadosHumeador((prevSeleccionados) => [
                ...prevSeleccionados,
                trabajador
            ]);

            // Cerrar el modal si se alcanza la cantidad máxima permitida
            if (trabajadoresSeleccionadosHumeador.length + 1 >= cantidad_humeadores) {
                setMostrarModalHumeador(false);
            }
        }
    };

    // Función para eliminar un humeador de la lista
    const manejarEliminarHumeador = (id) => {
        setTrabajadoresSeleccionadosHumeador((prev) => prev.filter(trabajador => trabajador.id_personal !== id));
    };

    // Función para eliminar un quemador de la lista
    const manejarEliminarQuemador = (id) => {
        setTrabajadoresSeleccionadosQuemadores((prev) => prev.filter(trabajador => trabajador.id_personal !== id));
    };

    // Función para abrir el modal
    const abrirModalQuemadores = () => {
        // Verificar si existe el cargo "Quemador"
        const quemadorCargo = cargoCoccionData.find(cargo => cargo.nombre_cargo === "Quemador");
        if (!quemadorCargo) {
            setAlertMessage('Debes registrar un cargo de cocción "Quemador" antes de continuar.');
            setAlertSeverity('error');
            setShowAlert(true);
            return; // No abrir el modal si no existe el cargo
        }

        setMostrarModalQuemadores(true);
    };

    // Función para cerrar el modal
    const cerrarModalQuemadores = () => {
        setMostrarModalQuemadores(false);
    };

    const manejarSeleccionQuemadores = (trabajador) => {
        // Verificar si el trabajador ya está en la lista
        const existe = trabajadoresSeleccionadosQuemadores.some(trabajadorSeleccionado => trabajadorSeleccionado.id_personal === trabajador.id_personal);

        if (existe) {
            // Si el trabajador ya está en la lista, mostrar un mensaje
            setAlertMessage(`El operador ${trabajador.nombre_completo} ya ha sido seleccionado.`);
            setAlertSeverity(warning);
            setShowAlert(true);

            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
            return; // Salir de la función si ya existe
        }

        // Verificar si se alcanzó el límite de quemadores
        if (trabajadoresSeleccionadosQuemadores.length >= cantidad_quemadores) {
            setAlertMessage(`Ya se ha alcanzado el límite de ${cantidad_quemadores} quemadores.`);
            setAlertSeverity(warning);
            setShowAlert(true);

            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
            return; // Salir de la función si se alcanzó el límite
        }

        // Agregar el trabajador seleccionado a la lista
        setTrabajadoresSeleccionadosQuemadores((prevSeleccionados) => [
            ...prevSeleccionados,
            trabajador
        ]);

        // Cerrar el modal si se alcanza la cantidad máxima permitida
        if (trabajadoresSeleccionadosQuemadores.length + 1 >= cantidad_quemadores) {
            setMostrarModalQuemadores(false);
        }
    };

    // Función para manejar el guardar/editar una cocción
    const handleSubmitCoccion = async (event) => {
        event.preventDefault();
        setLoading(true);

        // Validar campos obligatorios
        if (!hornoSeleccionado) {
            setAlertMessage('Selecciona un horno para la cocción.');
            setAlertSeverity('error');
            setShowAlert(true);
            setLoading(false);
            return;
        }

        if (!fechaEncendido) {
            setAlertMessage('Ingresa la fecha de encendido.');
            setAlertSeverity('error');
            setShowAlert(true);
            setLoading(false);
            return;
        }

        if (!selectedMaterial) {
            setAlertMessage('Selecciona un material para la cocción.');
            setAlertSeverity('error');
            setShowAlert(true);
            setLoading(false);
            return;
        }

        // Validar cantidad de humeadores seleccionados
        if (trabajadoresSeleccionadosHumeador.length !== cantidad_humeadores) {
            setAlertMessage(`Debes seleccionar exactamente ${cantidad_humeadores} humeadores.`);
            setAlertSeverity('error');
            setShowAlert(true);
            setLoading(false);
            return;
        }
        // Validar cantidad de quemadores seleccionados
        if (trabajadoresSeleccionadosQuemadores.length !== Number(cantidad_quemadores)) {
            setAlertMessage(`Debes seleccionar exactamente ${cantidad_quemadores} quemadores.`);
            setAlertSeverity('error');
            setShowAlert(true);
            setLoading(false);
            return;
        }

        // Construir objeto de cocción
        const operadoresCoccion = [
            ...trabajadoresSeleccionadosQuemadores.map(trabajador => ({
                cargo_coccion_id_cargo_coccion: cargoCoccionData.find(c => c.nombre_cargo === "Quemador")?.id_cargo_coccion,
                personal_id_personal: trabajador.id_personal,
            })),
            ...trabajadoresSeleccionadosHumeador.map(trabajador => ({
                cargo_coccion_id_cargo_coccion: cargoCoccionData.find(c => c.nombre_cargo === "Humeador")?.id_cargo_coccion,
                personal_id_personal: trabajador.id_personal,
            })),
        ];

        const consumosMateriales = trabajadoresSeleccionadosHumeador.map(trabajador => ({
            personal_id_personal: trabajador.id_personal,
            material_id_material: selectedMaterial.id_material,
            cantidad_consumida: trabajador.cantidad_usada || null,
        }));

        const coccionData = {
            fecha_encendido: fechaEncendido,
            hora_inicio: horaInicio || null,
            estado: estado || 'En curso', // Si no se proporciona un estado, asignar 'En curso'
            horno_id_horno: hornoSeleccionado.id_horno,
            operadoresCoccion,
            consumosMateriales,
        };

        try {
            let response;
            if (isEditing) {
                response = await axios.put(`${config.apiBaseUrl}coccion/${idCoccionSeleccionada}`, coccionData, configToken);
            } else {
                response = await axios.post(`${config.apiBaseUrl}coccion/`, coccionData, configToken);
            }

            // Manejar la respuesta según el mensaje del servidor
            const message = response.data.message || (isEditing ? 'Cocción actualizada con éxito.' : 'Cocción registrada con éxito.');

            // Mensaje de éxito
            setAlertMessage(message);
            setAlertSeverity('success');
            setShowAlert(true);

            // Limpiar formulario
            setFechaEncendido('');
            setHornoSeleccionado(null);
            setCargosSeleccionados([]);
            setEstado('En curso');
            setTrabajadoresSeleccionadosHumeador([]);
            setTrabajadoresSeleccionadosQuemadores([]);

            if (isEditing) {
                setIsEditing(false);
                setIdCoccionSeleccionada(null);
            }

            // Actualizar lista de cocciones
            const updatedCoccionData = await axios.get(`${config.apiBaseUrl}coccion/`, configToken);
            setCoccionlData(updatedCoccionData.data);

        } catch (error) {
            // Manejar error
            setAlertMessage(error.response?.data?.error || 'Hubo un problema al registrar la cocción. Inténtalo nuevamente.');
            setAlertSeverity('error');
            setShowAlert(true);
        } finally {
            setLoading(false);
        }
    };

    // Función para limpiar el formulario de cocción
    const resetFormCoccion = () => {
        setIdHornoSeleccionado('');
        setFechaEncendido(''); // Limpiar la fecha de encendido
        setHoraInicio('');     // Limpiar la hora de inicio
        setFechaApagado('');   // Limpiar la fecha de apagado
        setHoraFin('');        // Limpiar la hora de fin
        setEstado('');         // Limpiar el estado de cocción
        setIsEditing(false);   // Desactivar modo edición
    };

    const fetchDetallesCoccion = async (idCoccion) => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}coccion/${idCoccion}/detalles`, configToken);
            setCoccionDetalles(response.data);
            setShowModalCoccionDetalles(true);
        } catch (error) {
            console.error("Error al obtener los detalles de la cocción:", error);
        }
    };


    /*** INICIO DE FUNCIONES PARA HORNOS ***/
    //Obtener todos hornos
    const fetchHornosnData = async () => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}horno/`, configToken);
            setHornosData(response.data);
            setLoading(false); //Cambia el estado de loading a false
        } catch (error) {
            console.error("Error al obtener los datos de hornos: ", error);
            setLoading(false);
        }
    }

    // Función para manejar el guardar/Editar un horno
    const handleSubmitHorno = async (e) => {
        e.preventDefault(); // Prevenir el envío del formulario

        // Validaciones
        if (cantidad_humeadores <= 0) {
            setAlertMessage('Error: La cantidad de humeadores debe ser mayor que 0.');
            setAlertSeverity('error');
            setShowAlert(true);
            return; // Salir de la función si hay un error
        }

        if (cantidad_quemadores <= 0) {
            setAlertMessage('Error: La cantidad de quemadores debe ser mayor que 0.');
            setAlertSeverity('error');
            setShowAlert(true);
            return; // Salir de la función si hay un error
        }

        const hornoData = {
            prefijo,
            nombre,
            cantidad_humeadores,
            cantidad_quemadores,
        };

        try {
            let response;

            // Verifica si se está editando o creando un nuevo horno
            if (isEditingHorno) {
                response = await axios.put(`${config.apiBaseUrl}horno/${idHornoSeleccionado}`, hornoData, configToken);
            } else {
                response = await axios.post(`${config.apiBaseUrl}horno/`, hornoData, configToken);
            }

            // Verifica si hay un mensaje en la respuesta
            if (response.data && response.data.message) {
                // Mostrar mensaje de éxito
                setAlertMessage(isEditingHorno ? 'Horno actualizado correctamente.' : 'Horno registrado correctamente.');
                setAlertSeverity('success'); // Tipo de alerta
                setShowAlert(true); // Mostrar la alerta
            }

            // Actualiza tabla después de la operación
            await fetchHornosnData();

            // Limpiar los campos después de la operación
            resetFormHorno();

        } catch (error) {
            console.error('Error al registrar el horno: ', error);

            // Mostrar alerta de error
            setAlertMessage('Error: No se ha podido registrar el horno. ' + error.message); // Mensaje de error
            setAlertSeverity('error'); // Tipo de alerta
            setShowAlert(true); // Mostrar la alerta
        }
    };

    const handleEditHorno = (row) => {
        setIsEditingHorno(true); //Activar modo editar
        // console.log(row);

        // Cargar datos en los inputs
        setIdHornoSeleccionado(row.id_horno);
        setPrefijo(row.prefijo);
        setNombreHorno(row.nombre);
        setCantidadHumeadores(row.cantidad_humeadores);
        setCantidadQuemadores(row.cantidad_quemadores);
    }

    const resetFormHorno = () => {
        setIdHornoSeleccionado('');
        setPrefijo('');
        setNombreHorno('');
        setCantidadHumeadores('');
        setCantidadQuemadores('');
        setIsEditingHorno(false);
    }

    /*** FIN DE FUNCIONES PARA HORNOS ***/

    /* FUNCIONES PARA CARGO COCCION */
    //Obtener cargo coccion
    const fetchCargoCoccionData = async () => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}cargoCoccion/`, configToken);
            setCargoCoccionData(response.data);
            setLoading(false); //Cambia el estado de loading a false
        } catch (error) {
            console.error("Error al obtener los datos de cargos de cocción: ", error);
            setLoading(false);
        }
    }

    // Funcion para manejar registro/actualizacion de cargos de coccion
    const handleSubmitCargo = async (e) => {
        e.preventDefault(); // Prevenir el envío del formulario

        const cargoData = {
            nombre_cargo,
            costo_cargo
        };
        console.log(cargoData);

        try {
            let response;

            // Enviar datos a la API según si se está editando o creando un nuevo cargo
            if (isEditingCargo) {
                response = await axios.put(`${config.apiBaseUrl}cargoCoccion/${idCargoSeleccionado}`, cargoData, configToken);
            } else {
                response = await axios.post(`${config.apiBaseUrl}cargoCoccion/`, cargoData, configToken);
            }

            // Mostrar mensaje de éxito si se recibe una respuesta con mensaje
            if (response.data && response.data.message) {
                setAlertMessage(isEditingCargo ? 'Cargo actualizado con éxito.' : 'Cargo registrado exitosamente.');
                setAlertSeverity('success'); // Asegúrate de que 'success' sea una cadena válida
                setShowAlert(true); // Mostrar la alerta
            }

            // Actualiza tabla después de la operación
            await fetchCargoCoccionData();

            // Limpiar los campos después de la operación
            resetFormCargo();

        } catch (error) {
            // Mostrar alerta de error
            setAlertMessage('Error: No se ha podido agregar o actualizar el cargo. ' + error.message); // Utiliza error.message para mostrar un mensaje más claro
            setAlertSeverity('error'); // Asegúrate de que 'error' sea una cadena válida
            setShowAlert(true);
        }
    };

    const resetFormCargo = () => {
        setIdCargoSeleccionado('');
        setNombreCargo('');
        setCostoCargo('');
        setIsEditingCargo(false);
    }

    // Editar cargo coccion
    const handleEditCargo = (row) => {
        setIsEditingCargo(true); //Activar modo editar
        console.log(row);

        // Cargar datos en los inputs
        setIdCargoSeleccionado(row.id_cargo_coccion);
        setNombreCargo(row.nombre_cargo);
        setCostoCargo(row.costo_cargo);
    }

    /* FUNCIONES PARA EL PERSONAL */
    // Función para obtener los trabajadores
    const fetchTrabajadoresData = async () => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}personal/`, configToken);
            //Filtrar trabajadores "activos" (estado 1)
            const trabajadoresActivos = response.data.filter(trabajador => trabajador.estado === 1)
            setTrabajadoresData(trabajadoresActivos); // Guardar los datos en el estado
        } catch (error) {
            console.error("Error al obtener los datos de trabajadores: ", error);
        }
    }

    //useEffect para cargar los datos al montar el componente
    useEffect(() => {
        fetchCoccionData();
        fetchHornosnData();
        fetchCargoCoccionData();
        fetchTrabajadoresData();
        fetchMaterialData();

        // Obtener la fecha actual cuando se carga el componente
        const today = new Date();
        const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
        const formattedDate = localDate.toISOString().split('T')[0]; // Formato yyyy-mm-dd
        setFechaEncendido(formattedDate);

        // // Obtener la hora actual y formatearla en formato HH:mm
        // const hours = String(today.getHours()).padStart(2, '0');
        // const minutes = String(today.getMinutes()).padStart(2, '0');
        // const formattedTime = `${hours}:${minutes}`;
        // setHoraInicio(formattedTime);

    }, [cargosSeleccionados, hornoSeleccionado]);

    //Obtener todos los materiales
    const fetchMaterialData = async () => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}material/`, configToken);
            setMaterialesData(response.data);
            // setLoading(false); //Cambia el estado de loading a false
            // console.log(response.data);
        } catch (error) {
            console.error("Error al obtener los datos de materiales: ", error);
            // setLoading(false);
        }
    }

    // Función para manejar el cambio del select de tipo de horno
    const handleHornoChange = (e) => {
        const idHorno = e.target.value;

        if (idHorno == "") {
            setHornoSeleccionado(null); // no hay seleccionado, deshabilitar los selectores de cargo
            setCantidadHumeadores(0);
            setCantidadQuemadores(0);
            setCargosSeleccionados([]); //Limpiar seleccion de cargos
        } else {
            const hornoSeleccionado = hornosData.find(horno => horno.id_horno === parseInt(idHorno)); // Buscar el horno seleccionado
            // console.log(hornoSeleccionado);
            if (hornoSeleccionado) {
                setHornoSeleccionado(hornoSeleccionado); // Actualizar el horno seleccionado
                setCantidadHumeadores(hornoSeleccionado.cantidad_humeadores);
                setCantidadQuemadores(hornoSeleccionado.cantidad_quemadores);
            }
        }
    };

    // Abre el modal y establece la entidad y el ID que se va a eliminar
    const handleEliminar = (entidad, id) => {
        setEntidadAEliminar(entidad); // Puede ser 'horno', 'cargo', 'coccion', etc.
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
            if (entidadAEliminar === 'horno') {
                url = `${config.apiBaseUrl}horno/${idAEliminar}`;
            } else if (entidadAEliminar === 'cargo') {
                url = `${config.apiBaseUrl}cargococcion/${idAEliminar}`;
            } else if (entidadAEliminar === 'coccion') {
                url = `${config.apiBaseUrl}coccion/${idAEliminar}`;
            }

            // Llamar a la API para eliminar el registro
            await axios.delete(url, configToken);

            // Actualizar los datos después de la eliminación
            if (entidadAEliminar === 'horno') {
                fetchHornosnData(); // Recargar datos de hornos
            } else if (entidadAEliminar === 'cargo') {
                fetchCargoCoccionData(); // Recargar datos de cargos
            } else if (entidadAEliminar === 'coccion') {
                fetchCoccionData(); // Recargar datos de cocciones
            }

            resetFormHorno();

            // Mostrar mensaje de éxito
            setAlertMessage('Registro eliminado correctamente.');
            setAlertSeverity('success'); // Tipo de alerta
            setShowAlert(true); // Mostrar la alerta

            // Cerrar modal
            handleCloseModal();
        } catch (error) {
            console.error(`Error al eliminar ${entidadAEliminar}: `, error);

            // Mostrar alerta de error
            setAlertMessage('Error: No se ha podido eliminar el registro. ' + error.message); // Mensaje de error
            setAlertSeverity('error'); // Tipo de alerta
            setShowAlert(true); // Mostrar la alerta
        }
    };

    const formatFecha = (fecha) => {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-ES', options);
    };

    const formatHora = (hora) => {
        const [hours, minutes] = hora.split(':');
        const hoursIn12 = hours % 12 || 12; // Convertir a formato 12 horas
        const ampm = hours < 12 ? 'AM' : 'PM';
        return `${hoursIn12}:${minutes} ${ampm}`;
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

            {/* <Sidebar /> */}
            <div className='content'>
                <div className="">
                    {/* Inicio Header cocción */}
                    <div className="d-flex p-2 justify-content-between">
                        <h3 className="">Gestionar cocción</h3>
                        <div className="d-flex">
                            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalCoccion"><FaIcons.FaFire /> Registrar cocción</button>
                        </div>
                    </div>
                    <div className='d-flex'>
                        <button className='btn btn-warning me-2' data-bs-toggle="modal" data-bs-target="#modalHornos"><FaIcons.FaIndustry /> Hornos</button>
                        <button className='btn btn-warning' data-bs-toggle="modal" data-bs-target="#modalCargoCoccion"><FaIcons.FaUserCog /> Cargos de cocción</button>
                    </div>
                    {/* Fin Header cocción */}

                    {/* Inicio modal de Hornos */}
                    <div className="modal fade" id="modalHornos" aria-labelledby="tituloModalHorno" aria-hidden="true">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h1 className="modal-title fs-5" id="tituloModalHorno">Gestionar Hornos</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <div className="container">
                                        <div className="row">
                                            <div className="col-12 col-md-4">
                                                <form onSubmit={handleSubmitHorno}>
                                                    <div className="mb-3">
                                                        <label htmlFor="InputIdHorno" className="form-label">Id.</label>
                                                        <input type="text" className="form-control" id="InputIdHorno" value={idHornoSeleccionado} onChange={(e) => setIdHornoSeleccionado(e.target.value)} disabled />
                                                    </div>
                                                    <div className="mb-3">
                                                        <div className="row">

                                                            <label htmlFor="InputCodHorno" className="form-label">Cod. Horno</label>
                                                            <input type="text" className="form-control" id="InputCodHorno" aria-describedby="codHelp"
                                                                value={prefijo}
                                                                onChange={(e) => setPrefijo(e.target.value.toUpperCase())} required
                                                            />
                                                            <div id="codHelp" className="form-text">Prefijo para identificar un horno.</div>

                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="InputNombreHorno" className="form-label">Nombre de horno</label>
                                                        <input type="text" className="form-control" id="InputNombreHorno"
                                                            value={nombre}
                                                            onChange={(e) => setNombreHorno(e.target.value)} required
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <div className="row">
                                                            <div className="col-6">
                                                                <label htmlFor="InputCantHumeadores" className="form-label">Humeadores</label>
                                                                <input type="number" className="form-control" id="InputCantHumeadores"
                                                                    value={cantidad_humeadores}
                                                                    onChange={(e) => setCantidadHumeadores(e.target.value)} required
                                                                />
                                                            </div>
                                                            <div className="col-6">
                                                                <label htmlFor="InputCantQuemadores" className="form-label">Quemadores</label>
                                                                <input type="number" className="form-control" id="InputCantQuemadores"
                                                                    value={cantidad_quemadores}
                                                                    onChange={(e) => setCantidadQuemadores(e.target.value)} required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button type="submit" className="btn btn-primary">{isEditingHorno ? 'Actualizar' : 'Registrar'}</button>


                                                </form>
                                            </div>
                                            <div className="col-12 col-md-8">
                                                <DataTable
                                                    title="Lista de hornos"
                                                    columns={columnsHornos}
                                                    data={hornosData}
                                                    pagination={false}
                                                    progressPending={loading}
                                                    highlightOnHover={true}
                                                    responsive={true}
                                                    noDataComponent={
                                                        <div style={{ color: '#ff6347', padding: '20px' }}>
                                                            No hay registros de hornos disponibles.
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
                    {/* Fin modal de Hornos */}

                    {/* Inicio modal de cargo cocción */}
                    <div className="modal fade" id="modalCargoCoccion" aria-labelledby="tituloModalCargoCoccion" aria-hidden="true">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h1 className="modal-title fs-5" id="tituloModalCargoCoccion">Gestionar Cargos de cocción</h1>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <div className="container">
                                        <div className="row">
                                            <div className="col-12 col-md-4">
                                                <form onSubmit={handleSubmitCargo}>
                                                    <div className="mb-3">
                                                        <label htmlFor="InputIdCargoCoccion" className="form-label">Id.</label>
                                                        <input type="text" className="form-control" id="InputIdCargoCoccion" disabled />
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="Nombre" className="form-label">Nombre</label>
                                                        <input type="text" className="form-control" value={nombre_cargo} onChange={(e) => setNombreCargo(e.target.value)} required />
                                                        <div id="" className="form-text">Nombre para el cargo en cocción.</div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="InputCostoCargoCoccion" className="form-label">Costo S/.</label>
                                                        <input type="number" className="form-control" value={costo_cargo} onChange={(e) => setCostoCargo(e.target.value)} id="InputCostoCargoCoccion" required />
                                                    </div>
                                                    <button type="submit" className="btn btn-primary">{isEditingCargo ? 'Actualizar' : 'Registrar'}</button>
                                                </form>
                                            </div>
                                            <div className="col-12 col-md-8">
                                                <DataTable
                                                    title="Listado de cargos de cocción"
                                                    columns={columnsCargosCoccion}
                                                    data={cargoCoccionData}
                                                    pagination={false}
                                                    progressPending={loading}
                                                    highlightOnHover={true}
                                                    responsive={true}
                                                    noDataComponent={
                                                        <div style={{ color: '#ff6347', padding: '20px' }}>
                                                            No hay registros de cargos de cocción.
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
                    {/* Fin modal de cargo cocción */}

                    {showModalCoccionDetalles && coccionDetalles && (
                        <div className="modal modal-sm show fade" style={{ display: 'block' }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header bg-primary text-white">
                                        <h5 className="modal-title">Detalles de la Cocción</h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setShowModalCoccionDetalles(false)}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <p className='mb-0'><strong>Horno:</strong> {coccionDetalles.prefijo} {coccionDetalles.nombre_horno}</p>
                                        <p className='mb-0'><strong>Fecha Encendido:</strong> {new Date(coccionDetalles.fecha_encendido).toLocaleDateString()}</p>
                                        <p className='mb-0'><strong>Hora Inicio:</strong> {coccionDetalles.hora_inicio}</p>
                                        <p className='mb-0'><strong>Estado:</strong> {coccionDetalles.estado}</p>

                                        <h6 className='mt-4 mb-2'>Operadores:</h6>
                                        <div className=''>
                                            <h6>Humeador:</h6>
                                            <ul>
                                                {coccionDetalles.operadores
                                                    .filter(operador => operador.nombre_cargo === 'Humeador')
                                                    .map((operador, index) => (
                                                        <li key={index}>
                                                            {operador.nombre_operador}
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h6>Quemadores:</h6>
                                            <ul>
                                                {coccionDetalles.operadores
                                                    .filter(operador => operador.nombre_cargo === 'Quemador')
                                                    .map((operador, index) => (
                                                        <li key={index}>
                                                            {operador.nombre_operador}
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        {/* <button className="btn btn-secondary" onClick={() => setShowDetallesModal(false)}>
                                            Cerrar
                                        </button> */}
                                        <button className="btn btn-primary" onClick={() => window.print()}>
                                            <FaIcons.FaPrint /> Imprimir
                                        </button>
                                        <button className="btn btn-success" onClick={() => alert('Compartir funcionalidad no implementada')}>
                                            <FaIcons.FaShareAlt /> Compartir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inicio modal de cocción */}
                    <div className="modal fade" id="modalCoccion" aria-labelledby="tituloModalCoccion" aria-hidden="true">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header bg-primary text-white">
                                    <h5 className="modal-title w-100 text-center" id="tituloModalCoccion">Registrar cocción</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-12 col-md-6">
                                            <div className="row align-items-end">
                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label htmlFor="inputHorno" className="form-label">Horno</label>
                                                        <select className="form-select" onChange={handleHornoChange}>
                                                            <option value="">Sel. un horno</option>
                                                            {hornosData.map((horno) => (
                                                                <option key={horno.id_horno} value={horno.id_horno}>
                                                                    {horno.prefijo} - {horno.nombre}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className='text-center'>
                                                        <p className='text-body-secondary mb-0'><small>Humeadores: {cantidad_humeadores} </small></p>
                                                        <p className='text-body-secondary'><small>Quemadores: {cantidad_quemadores} </small></p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='row'>

                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label htmlFor="inputFechaEncendido" className="form-label">Fecha de encendido</label>
                                                        <input type="date" className="form-control" id="inputFechaEncendido" value={fechaEncendido} onChange={(e) => setFechaEncendido(e.target.value)} required />
                                                    </div>
                                                </div>

                                                <div className="col-6">
                                                    <div className="mb-3">
                                                        <label htmlFor="inputHumedadInicial" className="form-label">Humedad<span className='form-text'> (Opcional)</span></label>
                                                        <input type="number" className="form-control" id="inputHumedadInicial" placeholder='% inicial' />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className='d-flex justify-content-between align-items-center my-2'>

                                                    <p className='mb-0'>Seleccionar material</p>
                                                    <button className='btn btn-primary' id='btnSeleccionarMaterial' onClick={() => setShowMaterialModal(true)} ><FaIcons.FaPlus /></button>
                                                </div>
                                                {selectedMaterial ? (
                                                    <span className='d-flex border border-light-subtle p-2 justify-content-center text-success'>
                                                        Material seleccionado: <span><strong> {selectedMaterial.nombre}</strong></span>
                                                    </span>
                                                ) : (
                                                    <span className='d-flex border border-light-subtle p-2 justify-content-center text-danger'>
                                                        No se ha seleccionado material.
                                                    </span>
                                                )}
                                            </div>
                                            <div>

                                            </div>


                                        </div>
                                        <div className="col-12 col-md-6">


                                            <p className='text-center'> <strong>Seleccionar personal a operar</strong></p>
                                            <div className='wrapper_humeador'>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <p className='mb-0'>Humeador</p>
                                                    <button
                                                        id='btnSeleccionarHumeador'
                                                        className='btn btn-primary'
                                                        onClick={abrirModalHumeador}  // Abrir el modal al presionar el botón
                                                        disabled={!hornoSeleccionado}
                                                    >
                                                        <FaIcons.FaPlus />
                                                    </button>
                                                </div>
                                                <div className="card my-2">
                                                    {/* Mostrar los trabajadores seleccionados */}
                                                    <ul className='list-group'>
                                                        {trabajadoresSeleccionadosHumeador.length > 0 ? (
                                                            trabajadoresSeleccionadosHumeador.map((trabajador) => (
                                                                <li className='list-group-item' key={trabajador.id_personal}>
                                                                    {trabajador.nombre_completo}
                                                                    <button
                                                                        className='btn btn-danger btn-sm float-end'
                                                                        onClick={() => manejarEliminarHumeador(trabajador.id_personal)}
                                                                        aria-label="Eliminar"
                                                                    >
                                                                        <FaIcons.FaMinus />
                                                                    </button>

                                                                </li>
                                                            ))
                                                        ) : (
                                                            <span
                                                                className='d-flex border border-light-subtle justify-content-center text-danger'
                                                            >
                                                                No se han seleccionado operadores.
                                                            </span>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className='wrapper_quemadores'>
                                                <div className="d-flex justify-content-between align-items-center">

                                                    <p className='mb-0'>Quemadores</p>
                                                    <button disabled={!hornoSeleccionado} id='btnSeleccionarQuemador' className='btn btn-primary' onClick={abrirModalQuemadores}><FaIcons.FaPlus /></button>
                                                </div>
                                                <div className="card my-2">
                                                    {/* Mostrar los trabajadores seleccionados */}
                                                    <ul className='list-group'>
                                                        {trabajadoresSeleccionadosQuemadores.length > 0 ? (
                                                            trabajadoresSeleccionadosQuemadores.map((trabajador) => (
                                                                <li className='list-group-item' key={trabajador.id_personal}>
                                                                    {trabajador.nombre_completo}
                                                                    <button
                                                                        className='btn btn-danger btn-sm float-end'
                                                                        onClick={() => manejarEliminarQuemador(trabajador.id_personal)}
                                                                        aria-label="Eliminar"
                                                                    >
                                                                        <FaIcons.FaMinus />
                                                                    </button>
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <span
                                                                className='d-flex border border-light-subtle justify-content-center text-danger'
                                                            >
                                                                No se han seleccionado operadores.
                                                            </span>
                                                        )
                                                        }
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="modal-footer mt-3">
                                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                            <button type="button" onClick={handleSubmitCoccion} className="btn btn-primary">{isEditing ? 'Actualizar' : 'Guardar'}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* Fin modal de coccion */}

                    {showMaterialModal && (
                        <div className="modal show fade" style={{ display: 'block' }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header bg-primary text-white">
                                        <h5 className="modal-title w-100 text-center">Seleccionar Material</h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setShowMaterialModal(false)}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        {materialesData.length > 0 ? (
                                            materialesData.map(material => (
                                                <div key={material.id_material}>
                                                    <input
                                                        type="radio"
                                                        name="material"
                                                        onChange={() => setSelectedMaterial(material)}
                                                    />
                                                    {material.nombre} - {material.presentacion}
                                                </div>
                                            ))
                                        ) : (
                                            <p className='mb-0 text-center' style={{ color: '#ff6347', padding: '20px' }}>No hay materiales disponibles.</p>
                                        )}
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setShowMaterialModal(false)}
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inicio Modal de selección de humeador */}
                    {mostrarModalHumeador && (
                        <div className="modal" style={{ display: 'block' }}>
                            <div className="modal-dialog modal-dialog-centered">

                                <div className="modal-content modal-sm">
                                    <div className="modal-header bg-primary text-white">
                                        <h5 className="modal-title">Seleccionar Humeador</h5>
                                    </div>
                                    <div className="modal-body">
                                        <div className='list-group'>
                                            {trabajadoresData.map((trabajador) => (

                                                <button key={trabajador.id_personal} className='list-group-item' onClick={() => manejarSeleccionHumeador(trabajador)}>
                                                    {trabajador.nombre_completo}
                                                </button>

                                            ))}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={cerrarModal}>Cerrar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Fin Modal de selección de humeador */}

                    {/* Inicio Modal de selección de quemadores */}
                    {monstrarModalQuemadores && (
                        <div className="modal" style={{ display: 'block' }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header bg-primary text-white">
                                        <h5 className="modal-title">Seleccionar Quemadores</h5>
                                    </div>
                                    <div className="modal-body">
                                        <div>
                                            {trabajadoresData.map((trabajador) => (
                                                <div key={trabajador.id_personal}>
                                                    <button onClick={() => manejarSeleccionQuemadores(trabajador)}>
                                                        {trabajador.nombre_completo}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={cerrarModalQuemadores}>Cerrar</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Fin Modal de selección de quemadores */}


                    {/* Inicio tabla cocciones */}
                    <section className="mt-3">
                        {/* <h1>Lista de personal</h1> */}
                        <DataTable
                            title="Listado de cocciones"
                            columns={columns}
                            data={coccionData}
                            pagination={true}
                            progressPending={loading}
                            highlightOnHover={true}
                            responsive={true}
                            noDataComponent={
                                <div style={{ color: '#ff6347', padding: '20px' }}>
                                    No hay registros de cocciones disponibles
                                </div>
                            }
                            persistTableHead={true}
                        />
                    </section>
                    {/* Fin tabla cocciones */}

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
        </div>
    )
}

export default Coccion;