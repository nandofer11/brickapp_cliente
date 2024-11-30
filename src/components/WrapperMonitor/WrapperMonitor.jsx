import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import "../../App.css";
//Icons
import * as FaIcons from 'react-icons/fa';

import { LineChart } from '@mui/x-charts/LineChart';



const WrapperMonitor = ({ idCoccion, personalId, materialId, historialConsumos }) => {
    const [operadores, setOperadores] = useState([]);
    const [materialConsumido, setMaterialConsumido] = useState(0); // Estado para manejar el consumo de material
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [cantidadIngreso, setCantidadIngreso] = useState(0);
    const [estadoCoccion, setEstadoCoccion] = useState({ humeada: 0, quema: 0 });
    const [showModal, setShowModal] = useState(false);
    const [operadorSeleccionado, setOperadorSeleccionado] = useState(null);
    // const [historialConsumos, setHistorialConsumos] = useState([]);


    const [data, setData] = useState([]);


    const token = localStorage.getItem('token');
    const configToken = {
        headers: { Authorization: `Bearer ${token}` },
    };

    useEffect(() => {
        calcularConsumoTotalPorOperador();


        // Obtener operadores y cocciones
        axios.get(`${config.apiBaseUrl}coccion/${idCoccion}/operadores`, configToken)
            .then(response => {
                setOperadores(response.data.operadores);
            })
            .catch(error => {
                console.error('Error al cargar operadores:', error);
                setOperadores([]);
            });

        // Obtener estado de la cocción
        axios.post(`${config.apiBaseUrl}coccion/encurso`, {}, configToken)
            .then(response => {
                const coccion = response.data.find(c => c.id_coccion === idCoccion);
                if (coccion) {
                    setEstadoCoccion({ humeada: coccion.humeada, quema: coccion.quema });
                    if (coccion.materiales.length > 0) {
                        setSelectedMaterial(coccion.materiales[0].id_material);
                    }
                }
            })
            .catch(error => {
                console.error('Error al cargar las cocciones en curso:', error);
            });

             // Obtener regsitros de temperatura
            const fetchData = async () => {
                try {
                  const response = await axios.get(
                    `${config.apiBaseUrl}coccion/${idCoccion}/registros`, configToken
                  );
                  // Transformar datos para el gráfico
                  const transformedData = response.data.map((item, index) => ({
                    x: item.hora, // Hora como eje X
                    y: item.temperatura, // Temperatura como eje Y
                  }));
                  setData(transformedData);
                } catch (error) {
                  console.error('Error fetching data:', error);
                }
              };
          
              fetchData();

        // Si operador y material están seleccionados, obtener consumos
        if (operadorSeleccionado && selectedMaterial) {
            const personalId = operadorSeleccionado.id_personal;
            const materialId = selectedMaterial;

            console.log("Solicitando consumos para:", personalId, materialId);

            axios
                .get(
                    `${config.apiBaseUrl}coccion/${idCoccion}/${personalId}/${materialId}/consumosdematerial`,
                    configToken
                )
                .then(response => {
                    console.log("Respuesta de consumos:", response.data);
                    setHistorialConsumos(response.data); // Guardamos los consumos en el estado
                    // Calcular el total consumido directamente después de obtener los datos
                    const totalConsumido = response.data.reduce((acc, consumo) => acc + (consumo.cantidad_consumida || 0), 0);
                    setMaterialConsumido(totalConsumido); // Actualizamos el total consumido
                })
                .catch(error => {
                    console.error('Error al cargar historial de consumos:', error);
                    setHistorialConsumos([]); // Si hay error, vaciamos el historial
                });
        }
    }, [idCoccion, operadorSeleccionado, selectedMaterial, historialConsumos]); // Asegúrate de que este useEffect dependa de los elementos correctos



    const handleConfirmarIngreso = () => {
        if (operadorSeleccionado && selectedMaterial) {
            const consumoData = {
                coccionId: idCoccion,
                personalId: operadorSeleccionado.id_personal,
                materiales: [{
                    materialId: selectedMaterial,
                    cantidadConsumida: cantidadIngreso,
                }],
            };

            axios.post(`${config.apiBaseUrl}coccion/consumomaterial`, consumoData, configToken)
                .then(response => {
                    alert('Consumo de material registrado exitosamente.');
                    setMaterialConsumido(prev => prev + cantidadIngreso);
                    setHistorialConsumos(prev => [...prev, response.data.consumo]);
                    setCantidadIngreso(0);
                    setOperadorSeleccionado(null);
                    setSelectedMaterial(null);
                    setShowModal(false);
                })
                .catch(error => {
                    console.error('Error al registrar el consumo de material:', error);
                    alert('Ocurrió un error al registrar el consumo de material.');
                });
        }
    };

    const handleEliminarConsumo = (idConsumo) => {
    if (window.confirm('¿Seguro que deseas eliminar este consumo?')) {
        const consumoEliminado = historialConsumos.find(consumo => consumo.id_consumo === idConsumo);

        if (!consumoEliminado) {
            alert('Consumo no encontrado.');
            return;
        }

        axios.delete(`${config.apiBaseUrl}coccion/consumo/${idConsumo}`, configToken)
            .then(() => {
                alert('Consumo eliminado exitosamente.');
                
                // Actualizar estados de manera sincronizada
                setHistorialConsumos(prev => prev.filter(consumo => consumo.id_consumo !== idConsumo));
                setMaterialConsumido(prev => prev - consumoEliminado.cantidad_consumida);
            })
            .catch(error => {
                console.error('Error al eliminar el consumo:', error);
                alert('Ocurrió un error al eliminar el consumo.');
            });
    }
};


    // Filtrar operadores según el estado de la cocción
    const filteredOperadores = operadores.filter(op => {
        if (estadoCoccion.humeada === 1 && op.nombre_cargo === "Humeador") {
            return true; // Mostrar solo los Humeadores si humeada es 1
        }
        if (estadoCoccion.quema === 1 && op.nombre_cargo === "Quemador") {
            return true; // Mostrar solo los Quemadores si quema es 1
        }
        // Si ninguno de los dos estados está activo, no mostrar al operador
        return false;
    });

    const calcularConsumoTotalPorOperador = () => {
        console.log("=== Iniciando cálculo de consumo total ===");
        console.log("Personal ID:", personalId);
        console.log("Material ID:", materialId);
        console.log("Historial de consumos:", historialConsumos);

        // Aquí puedes realizar el cálculo basado en `historialConsumos`
        const consumosFiltrados = historialConsumos.filter(consumo => {
            // Lógica de filtrado según personalId y materialId
        });

        console.log("Consumos filtrados para operador y material:", consumosFiltrados);
        const totalConsumido = consumosFiltrados.reduce((total, consumo) => total + (consumo.cantidad_consumida || 0), 0);
        console.log("Total consumido calculado:", totalConsumido);
    };



    return (
        <div className="wrapper-monitor">


            {showModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Ingresar Consumo de {operadorSeleccionado?.nombre_completo}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className='d-flex flex-column text-center'>
                                    <p className='mb-0'>Cantidad Ingresada:</p>
                                    <span style={{ fontSize: '2rem' }}><strong> {cantidadIngreso}</strong></span>
                                </div>

                                <div className="numeric-">
                                    <div className="d-flex justify-content-center">
                                        {[1, 2, 3].map((num) => (
                                            <button key={num} className="btn btn-outline-primary m-1" onClick={() => setCantidadIngreso(cantidadIngreso * 10 + num)}>
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        {[4, 5, 6].map((num) => (
                                            <button key={num} className="btn btn-outline-primary m-1" onClick={() => setCantidadIngreso(cantidadIngreso * 10 + num)}>
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="d-flex justify-content-center ">
                                        {[7, 8, 9].map((num) => (
                                            <button key={num} className="btn btn-outline-primary m-1" onClick={() => setCantidadIngreso(cantidadIngreso * 10 + num)}>
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="d-flex justify-content-center">
                                        <button className="btn btn-outline-primary m-1" onClick={() => setCantidadIngreso(cantidadIngreso * 10)}>
                                            0
                                        </button>
                                        <button className="btn btn-outline-primary m-1" onClick={() => setCantidadIngreso(0)}>
                                            <span>Borrar</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="historial-consumos my-2 card p-1">
                                    <label className='mb-2'>Historial de registros de consumo</label>
                                    {historialConsumos
                                        .filter(consumo => consumo.cantidad_consumida !== null) // Filtrar los consumos con cantidad_consumida no nulo
                                        .map(consumo => {
                                            // Convertir el timestamp a un objeto Date
                                            const fecha = new Date(consumo.timestamp);
                                            // Formatear la fecha y la hora
                                            const fechaFormateada = `Fecha: ${fecha.toISOString().split('T')[0]} Hora: ${fecha.toTimeString().split(' ')[0]}`;

                                            return (
                                                <div key={consumo.id_consumo_material} className="historial-item d-flex justify-content-between my-1">
                                                    <div>

                                                        <span>{fechaFormateada}</span>
                                                    </div>
                                                    <div>
                                                        <span>{consumo.cantidad_consumida} sacos </span>
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleEliminarConsumo(consumo.id_consumo_material)}>
                                                            <FaIcons.FaEraser/>
                                                        </button>
                                                    </div>

                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
                                <button type="button" className="btn btn-primary" onClick={handleConfirmarIngreso}>Confirmar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* <button className="btn btn-secondary my-1" onClick={onClose}>Ocultar</button> */}


            <div className="d-flex gap-2">
                <div className="border p-2">
                    <h4>Operadores</h4>

                    {filteredOperadores.length === 0 ? (
                        <p className="text-danger">No hay operadores asignados para este estado de cocción.</p>
                    ) : (
                        filteredOperadores.map(op => (
                            <div key={op.id_coccion_operador} className="card mb-3">
                                <div className="card-body">
                                    <h5 className="card-title">{op.nombre_completo}</h5>
                                    <p className="mb-0">
                                        <strong>Cargo:</strong> {op.nombre_cargo}
                                    </p>
                                    {/* <p className="mb-0">
                                        <strong>ID de Personal:</strong> {op.id_personal}
                                    </p> */}
                                    <p className="mb-0">
                                        <span>
                                            Total utilizado: {calcularConsumoTotalPorOperador(op.id_personal, selectedMaterial)}
                                        </span>
                                    </p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => { setOperadorSeleccionado(op); setShowModal(true); }}>
                                        <FaIcons.FaPlus /> Ingresar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>


                <div className="border p-2">
                    <div>
                    <div>
                    <LineChart
        dataset={data}
        xAxis={[
        {
          dataKey: 'x',
          label: { value: 'Hora', position: 'insideBottom', offset: -10 }, // Posiciona el label del eje X
          type: 'category', // Eje categórico para las horas
          tickFormatter: (val) => val.slice(0, 5), // Mostrar formato HH:MM
        },
      ]}
        yAxis={[
          {
            dataKey: 'y',
            label: 'Temperatura (°C)',
            type: 'linear',
            domain: [0, 900], // Rango entre 0 y 900
            tickInterval: 50, // Incrementos de 50
          },
        ]}
        series={[{ dataKey: 'y', label: 'Temperatura (°C)' }]}
        width={800} // Ampliar ancho para el eje horizontal
        height={300}
        margin={{ left: 50, right: 50, top: 50, bottom: 50 }}
        grid={{ vertical: true, horizontal: true }}
      />
    </div>
                    </div>
                    <div>
                        <h4>Resumen</h4>
                        <p><strong>Material Consumido:</strong> {materialConsumido} kg</p>

                    </div>
                </div>
            </div>

        </div>
    );
};

export default WrapperMonitor;
