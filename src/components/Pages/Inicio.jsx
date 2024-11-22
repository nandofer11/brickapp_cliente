const Inicio = ()=>{
   // Obtener la información del usuario del local storage
   const user = JSON.parse(localStorage.getItem('user')) || {};

   return (
       <div>
           <h1>Inicio</h1>
           <div>
                   <h3 className="my-5">Bienvenido</h3>
                   <p className="mb-0"><strong>Nombre completo:</strong>{user.nombreCompleto}</p>
                   <p className="mb-0"><strong>Rol:</strong> {user.rol.nombre}</p>
                   <p><strong>Empresa:</strong> {user.empresa.razonSocial}</p> {/* Cambia esto por la información de la empresa si es necesario */}
               </div>
       </div>
   );
}

export default Inicio;