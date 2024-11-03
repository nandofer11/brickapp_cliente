const Inicio = ()=>{
   // Obtener la información del usuario del local storage
   const user = JSON.parse(localStorage.getItem('user')) || {};

   return (
       <div>
           <h1>Inicio</h1>
           {user.nombreCompleto && (
               <div>
                   <h2>Bienvenido, {user.nombreCompleto}</h2>
                   <p>Rol: {user.rol.nombre}</p>
                   <p>Empresa: {user.empresa.razonSocial}</p> {/* Cambia esto por la información de la empresa si es necesario */}
               </div>
           )}
       </div>
   );
}

export default Inicio;