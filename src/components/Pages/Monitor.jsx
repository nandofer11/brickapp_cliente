
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import icon_temp from '../../assets/images/icon_temp.png';
import icon_time from '../../assets/images/icon_time.png';
import icon_sack from '../../assets/images/icon_sack.png';
import icon_sensor from '../../assets/images/icon_sensor.png';

import { useState, useEffect } from 'react';
import axios from 'axios';

import "../../App.css"
import * as FaIcons from 'react-icons/fa';

const Monitor = () => {

      const [trabajadores, setTrabajadores] = useState([]);

      // Estado para los cards
      const [cards, setCards] = useState([
            { id: 1, asignado: false, trabajador: '', sacos: 0 },
            { id: 2, asignado: false, trabajador: '', sacos: 0 },
            { id: 3, asignado: false, trabajador: '', sacos: 0 },
            { id: 4, asignado: false, trabajador: '', sacos: 0 },
      ]);

      // Estado para el modal seleccionar trabajador
      const [showModalSeleccionarTrabajador, setShowModalSeleccionarTrabajador] = useState(false);
      const [selectedCard, setSelectedCard] = useState(null);

      // Estado para el modal ingreso de material
      const [showModalIngresoMaterial, setShowModalIngresoMaterial] = useState(false);
      const [sacosInput, setSacosInput] = useState(0);

      // Abrir modal para seleccionar trabajador
      const handleSeleccionarTrabajador = (id) => {
            setSelectedCard(id);
            setShowModalSeleccionarTrabajador(true);
      };

      // Abrir modal para registrar sacos
      const handleRegistrarSacos = (id) => {
            setSelectedCard(id);
            setShowModalIngresoMaterial(true);
      };

      // Registrar sacos y cerrar modal
      const registrarSacos = () => {
            setCards(cards.map(card =>
                  card.id === selectedCard ? { ...card, sacos: sacosInput } : card
            ));
            setShowModalIngresoMaterial(false);
      };

      // Simulación de datos de temperatura de cocción actual cada 2 horas
      const data = [
            { hour: 8, temperature: 200 },
            { hour: 10, temperature: 250 },
            { hour: 12, temperature: 300 },
            { hour: 14, temperature: 350 },
            { hour: 16, temperature: 450 },
            { hour: 18, temperature: 600 },
            { hour: 20, temperature: 700 },
            { hour: 22, temperature: 750 },
      ];

      // Simulación de datos de temperatura de cocción anterior cada 2 horas
      const previousData = [
            { hour: 8, temperature: 150 },
            { hour: 10, temperature: 180 },
            { hour: 12, temperature: 250 },
            { hour: 14, temperature: 320 },
            { hour: 16, temperature: 400 },
            { hour: 18, temperature: 500 },
            { hour: 20, temperature: 620 },
            { hour: 22, temperature: 700 },
      ];

      // Función para obtener los trabajadores del endpoint
      const fetchTrabajadores = async () => {
            try {
                  const response = await axios.get('http://localhost:3002/api/admin/personal/');
                  setTrabajadores(response.data); // Asume que el response tiene un array de trabajadores
            } catch (error) {
                  console.error('Error fetching trabajadores:', error);
            }
      };
      // Efecto para cargar trabajadores cuando el modal se abre
      useEffect(() => {
            if (showModalSeleccionarTrabajador) {
                  fetchTrabajadores();
            }
      }, [showModalSeleccionarTrabajador]);

      // Función para asignar un trabajador (puedes adaptarla según tu lógica)
      const asignarTrabajador = (nombreTrabajador) => {
    setCards(cards.map(card =>
        card.id === selectedCard ? { ...card, asignado: true, trabajador: nombreTrabajador } : card
    ));
    setShowModalSeleccionarTrabajador(false); // Cerrar el modal después de seleccionar
};
      return (
            <div className='d-flex'>
                  {/* <Sidebar /> */}
                  <div className='content container'>
                        <h3>Cocción en tiempo real - Horno H1</h3>

                        {/* Primera fila */}
                        <div className='row mb-4'>
                              {/* Primera columna (grande con gráfico y sensores) */}
                              <div className='col-12 col-md-8'>
                                    {/* Componente de Gráfico */}
                                    <div className='mb-4'>
                                          <div className='card'>
                                                <div className='card-body'>
                                                      <LineChart
                                                            xAxis={[
                                                                  {
                                                                        label: 'Horas',
                                                                        data: data.map(item => item.hour),
                                                                        min: 8,
                                                                        max: 24,
                                                                        ticks: 8, // Genera marcas en el eje X cada 2 horas desde 8am
                                                                        step: 2,
                                                                        format: (val) => {
                                                                              // Formateo para mostrar horas en formato de 12 horas AM/PM
                                                                              const hourLabels = {
                                                                                    8: '8am',
                                                                                    10: '10am',
                                                                                    12: '12m',
                                                                                    14: '2pm',
                                                                                    16: '4pm',
                                                                                    18: '6pm',
                                                                                    20: '8pm',
                                                                                    22: '10pm',
                                                                              };
                                                                              return hourLabels[val] || val;
                                                                        },
                                                                  },
                                                            ]}
                                                            series={[
                                                                  {
                                                                        data: data.map(item => item.temperature),
                                                                        label: 'Cocción Actual',
                                                                        color: '#8979FF', // Color verde para la cocción actual
                                                                  },
                                                                  {
                                                                        data: previousData.map(item => item.temperature),
                                                                        label: 'Cocción Anterior',
                                                                        color: '#FF928A', // Color rojo para la cocción anterior
                                                                  },
                                                            ]}
                                                            yAxis={[
                                                                  {
                                                                        label: 'Temperatura (°C)',
                                                                        min: 0,
                                                                        max: 1000,
                                                                        ticks: 11, // Genera marcas en el eje Y cada 100 grados
                                                                        step: 100,
                                                                  },
                                                            ]}
                                                            height={300} // Altura del gráfico
                                                            width={700}  // Ancho del gráfico
                                                      />

                                                </div>
                                          </div>
                                    </div>

                                    {/* Componente de Descripción de Sensores */}
                                    <div>
                                          <div className='card mb-4'>
                                                <div className='card-body'>
                                                      <h5 className='card-title'>Descripción de Sensores</h5>
                                                      <div className='d-flex justify-content-around'>
                                                            <div className="text-center">
                                                                  <img src={icon_sensor} />
                                                                  <div>

                                                                        <p className='mb-0 fw-bold'>Sensor 1</p>
                                                                        <p className=''>750 °C</p>
                                                                  </div>
                                                            </div>
                                                            <div className="text-center">

                                                                  <img src={icon_sensor} />
                                                                  <p className='mb-0 fw-bold'>Sensor 2</p>
                                                                  <p className=''>745 °C</p>

                                                            </div>
                                                            <div className="text-center">

                                                                  <img src={icon_sensor} />
                                                                  <p className='mb-0 fw-bold'>Sensor 3</p>
                                                                  <p className=''>748 °C</p>

                                                            </div>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                              </div>

                              {/* Columna (4 tarjetas) */}
                              <div className='col-12 col-md-4'>
                                    {/* Tarjeta 1: Temperatura actual */}
                                    <div className='card mb-4'>
                                          <div className="row align-items-center">
                                                <div className="col-4 text-center">
                                                      <img src={icon_temp} alt="" />
                                                </div>
                                                <div className="col-8">
                                                      <div className='card-body'>
                                                            <p className='card-title mb-0'>Temperatura Actual</p>
                                                            <p className='card-value mb-0'>680 °C</p>
                                                      </div>
                                                </div>
                                          </div>

                                    </div>

                                    {/* Tarjeta 2: Tiempo transcurrido */}
                                    <div className='card mb-4'>

                                          <div className="row align-items-center">
                                                <div className="col-4 text-center">
                                                      <img src={icon_time} alt="" />
                                                </div>
                                                <div className="col-8">
                                                      <div className='card-body'>
                                                            <p className='card-title mb-0'>Tiempo transcurrido</p>
                                                            <p className='card-value mb-0'>15h 23min</p>
                                                      </div>
                                                </div>
                                          </div>

                                    </div>

                                    {/* Tarjeta 3: Material utilizado */}
                                    <div className='card mb-4'>

                                          <div className="row align-items-center">
                                                <div className="col-4 text-center">
                                                      <img src={icon_sack} alt="" />
                                                </div>
                                                <div className="col-8">
                                                      <div className='card-body'>
                                                            <p className='card-title mb-0'>Material utilizado</p>
                                                            <p className='card-value mb-0'>1019 (17,3tn)</p>
                                                      </div>
                                                </div>
                                          </div>

                                    </div>

                                    {/* Tarjeta 4: Gráfico */}
                                    <div className='card'>
                                          <div className='card-body'>
                                                <p className='card-title'>Material consumido</p>
                                                {/* Agregar otro gráfico */}
                                                <BarChart
                                                      xAxis={[
                                                            {
                                                                  scaleType: 'band',
                                                                  data: ['Cocción Anterior', 'Cocción Actual'], // Dos categorías en el eje X
                                                            }
                                                      ]}
                                                      series={[
                                                            {
                                                                  data: [1000, 800],  // Datos de consumo de material para ambas categorías
                                                                  color: ['#FF928A', '#8979FF'],  // Color personalizado para cada barra
                                                            }
                                                      ]}
                                                      yAxis={[
                                                            {
                                                                  min: 0,
                                                                  max: 1200,
                                                                  ticks: 61,  // Cantidad de marcas en el eje Y
                                                                  step: 20,   // Marcas de 20 en 20 en el eje Y
                                                            }
                                                      ]}
                                                      width={350}  // Ancho ajustado
                                                      height={200}  // Alto ajustado
                                                      valueLabelDisplay="inside"  // Mostrar los valores dentro de las barras
                                                />


                                          </div>
                                    </div>
                              </div>
                        </div>

                        {/* Fila (Abastecedores) */}
                        <div className='row abastecedores'>
                              <p>Consumo de material por trabjador</p>
                              {cards.map((card) => (
                                    <div key={card.id} className="col-12 col-md-3 mb-4">
                                          <div className="card text-center">
                                                <a className='btn' onClick={() => card.asignado ? handleRegistrarSacos(card.id) : handleSeleccionarTrabajador(card.id)}>
                                                      <div className="card-box">
                                                            <FaIcons.FaRegUser />
                                                      </div>
                                                      {card.asignado ? (
                                                            <>
                                                                  <p>{card.trabajador}</p>
                                                                  <p>Sacos: {card.sacos}</p>
                                                                  <button className='btn btn-primary'>Registrar</button>
                                                            </>
                                                      ) : (
                                                            <p>Sin asignar</p>
                                                      )}
                                                </a>
                                          </div>
                                    </div>
                              ))}

                              {/* Modal Seleccionar Trabajador */}
                              {showModalSeleccionarTrabajador && (
                                    <div className="modal show fade" style={{ display: 'block' }}>
                                          <div className="modal-dialog">
                                                <div className="modal-content">
                                                      <div className="modal-header bg-primary text-white">
                                                            <h5 className="modal-title">Seleccionar Trabajador</h5>
                                                            <button
                                                                  type="button"
                                                                  className="btn-close"
                                                                  onClick={() => setShowModalSeleccionarTrabajador(false)}
                                                            ></button>
                                                      </div>
                                                      <div className="modal-body">
                                                            {/* Lista de trabajadores */}
                                                            <ul>
                                                                  {trabajadores.length > 0 ? (
                                                                        trabajadores.map((trabajador) => (
                                                                              <li key={trabajador.id_personal}>
                                                                                    <button
                                                                                          className="btn"
                                                                                          onClick={() => asignarTrabajador(trabajador.nombre_completo)}
                                                                                    >
                                                                                          {trabajador.nombre_completo}
                                                                                    </button>
                                                                              </li>
                                                                        ))
                                                                  ) : (
                                                                        <li>No hay trabajadores disponibles</li>
                                                                  )}
                                                            </ul>

                                                            <div className="modal-footer">
                                                                  <button
                                                                        type="button"
                                                                        className="btn btn-primary"
                                                                        onClick={() => setShowModalSeleccionarTrabajador(false)}
                                                                  >
                                                                        Cerrar
                                                                  </button>
                                                            </div>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                              )}
                              {/* Modal Ingreso Material */}
                              {showModalIngresoMaterial && (
                                    <div className="modal show fade" style={{ display: 'block' }}>
                                          <div className="modal-dialog">
                                                <div className="modal-content">
                                                      <div className="modal-header bg-primary text-white">
                                                            <h5 className="modal-title">Registrar Sacos</h5>
                                                            <button type="button" className="btn-close" onClick={() => setShowModalIngresoMaterial(false)}></button>
                                                      </div>
                                                      <div className="modal-body text-center">
                                                            <p>Registrar cantidad de sacos utilizados.</p>
                                                            <p className='fw-bold'>Operador: <span className='nombreOperador'></span></p>
                                                            <input
                                                                  type="number"
                                                                  className='form-control'
                                                                  value={sacosInput}
                                                                  onChange={(e) => setSacosInput(Number(e.target.value))}
                                                            />
                                                      </div>
                                                      <div className="modal-footer">
                                                            <button className='btn btn-primary' onClick={registrarSacos}>Registrar</button>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                              )}
                        </div>
                  </div>
            </div>
      )
}

export default Monitor;