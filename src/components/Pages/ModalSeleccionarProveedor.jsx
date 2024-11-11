// import React, { useEffect, useState } from "react";

// import { obtenerProveedores } from "./Inventario";

// const ModalSeleccionarProveedor = ({ show, onHide, onSelectProveedor }) => {
//   const [proveedoresData, setProveedoresData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     const fetchProveedoresData = async () => {
//       const data = await obtenerProveedores(searchTerm);
//       setProveedoresData(data);
//     };

//     if (show) {
//       fetchProveedoresData();
//     }
//   }, [show, searchTerm]);

//   const handleSelectProveedor = (proveedor) => {
//     onSelectProveedor(proveedor); // Paso el proveedor seleccionado
//     onHide(); // Cierro el modal
//   };

//   return (
//     <div className={`modal fade ${show ? "show" : ""}`} tabIndex="-1" aria-hidden={!show}>
//       <div className="modal-dialog">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title">Seleccionar Proveedor</h5>
//             <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={onHide}></button>
//           </div>
//           <div className="modal-body">
//             <input
//               type="text"
//               className="form-control mb-3"
//               placeholder="Buscar proveedor"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <ul className="list-group">
//               {proveedoresData.map((proveedor) => (
//                 <li
//                   key={proveedor.id}
//                   className="list-group-item list-group-item-action"
//                   style={{ cursor: "pointer" }}
//                   onClick={() => handleSelectProveedor(proveedor)}
//                 >
//                   {proveedor.nombre} - {proveedor.tipo_documento}: {proveedor.nro_documento}
//                 </li>
//               ))}
//             </ul>
//           </div>
//           <div className="modal-footer">
//             <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={onHide}>
//               Cerrar
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ModalSeleccionarProveedor;
