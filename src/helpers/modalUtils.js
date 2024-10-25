// Función para manejar eventos de modales
export const handleModalEvents = (modalId, onShow, onHide) => {
    const modal = document.getElementById(modalId);
  
    if (!modal) {
      console.warn(`Modal con id ${modalId} no encontrado.`);
      return;
    }
  
    if (onShow) {
      modal.addEventListener('shown.bs.modal', onShow);
    }
  
    if (onHide) {
      modal.addEventListener('hidden.bs.modal', onHide);
    }
  
    // Cleanup
    return () => {
      if (onShow) {
        modal.removeEventListener('shown.bs.modal', onShow);
      }
      if (onHide) {
        modal.removeEventListener('hidden.bs.modal', onHide);
      }
    };
  };
  