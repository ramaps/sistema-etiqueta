// form-handler.js - VERSIÓN CORREGIDA CON FORZADO DE MAYÚSCULAS

// REFERENCIAS A ELEMENTOS DEL DOM
const orderForm = document.getElementById('orderForm');
const skuInput = document.getElementById('sku');
const descripcionInput = document.getElementById('descripcion');
const loteInput = document.getElementById('lote');
const cantidadInput = document.getElementById('cantidad');
const solicitanteInput = document.getElementById('solicitante');
const banderaInput = document.getElementById('bandera');
const addMaterialBtn = document.getElementById('addMaterialBtn');
const materialsList = document.getElementById('materialsList');
const clearOrderBtn = document.getElementById('clearOrderBtn');

// INICIALIZAR EVENTOS DEL FORMULARIO
document.addEventListener('DOMContentLoaded', function() {
    console.log('Form handler inicializando...');
    
    // Verificar que todos los elementos existen
    if (!orderForm || !addMaterialBtn || !clearOrderBtn) {
        console.error('Faltan elementos críticos en el DOM para form-handler.js');
        return;
    }
    
    // Configurar eventos
    addMaterialBtn.addEventListener('click', addMaterial);
    clearOrderBtn.addEventListener('click', clearFormHandler);
    
    console.log('Form handler inicializado correctamente');
});

// AGREGAR MATERIAL AL FORMULARIO
function addMaterial() {
    console.log('Intentando agregar material...');
    
    // CAPTURA DE DATOS Y CONVERSIÓN A MAYÚSCULAS
    const sku = skuInput ? skuInput.value.trim().toUpperCase() : '';
    const descripcion = descripcionInput ? descripcionInput.value.trim().toUpperCase() : '';
    const lote = loteInput ? loteInput.value.trim().toUpperCase() : '';
    const cantidad = cantidadInput ? parseFloat(cantidadInput.value) : 0;
    const solicitante = solicitanteInput ? solicitanteInput.value.trim().toUpperCase() : '';
    const bandera = banderaInput ? banderaInput.value.trim().toUpperCase() : '';
    
    console.log('Datos del material procesados:', { sku, descripcion, lote, cantidad, solicitante });
    
    // Validar (Nota: quitamos bandera de la validación obligatoria por si es opcional)
    if (!sku || !descripcion || !lote || isNaN(cantidad) || cantidad <= 0 || !solicitante) {
        alert('❌ Por favor complete todos los campos del material con valores válidos');
        return;
    }
    
    const materialId = Date.now() + Math.random();
    
    // Guardar en el array global (siempre en Mayúsculas)
    orderMaterials.push({
        id: materialId,
        sku: sku,
        descripcion: descripcion,
        lote: lote,
        cantidad: cantidad,
        solicitante: solicitante,
        bandera: bandera
    });
    
    updateMaterialsList();
    updateTotalBags();
    
    // Limpiar campos de entrada de material
    if (skuInput) skuInput.value = '';
    if (descripcionInput) descripcionInput.value = '';
    if (loteInput) loteInput.value = '';
    if (cantidadInput) cantidadInput.value = '';
    if (solicitanteInput) solicitanteInput.value = '';
    if (banderaInput) banderaInput.value = '';
    
    if (skuInput) skuInput.focus();
    
    console.log('Material agregado correctamente. Total materiales:', orderMaterials.length);
}

// ACTUALIZAR LISTA VISUAL DE MATERIALES
function updateMaterialsList() {
    if (!materialsList) return;
    
    materialsList.innerHTML = '';
    
    if (orderMaterials.length === 0) {
        materialsList.innerHTML = '<div class="empty-materials">No hay materiales agregados. Agrega materiales usando el formulario superior.</div>';
        return;
    }
    
    orderMaterials.forEach(item => {
        const materialItem = document.createElement('div');
        materialItem.className = 'material-item';
        // Mostramos todo en Mayúsculas en la lista visual también
        materialItem.innerHTML = `
            <div class="material-info">
                <div style="text-transform: uppercase;"><strong>SKU:</strong> ${item.sku}</div>
                <div style="text-transform: uppercase;"><strong>DESC:</strong> ${item.descripcion}</div>
                <div style="text-transform: uppercase;"><strong>LOTE:</strong> ${item.lote}</div>
                <div><strong>CANTIDAD:</strong> ${item.cantidad} BLS</div>
                <div style="text-transform: uppercase;"><strong>SOLICITANTE:</strong> ${item.solicitante}</div>
            </div>
            <div class="material-actions">
                <button class="btn btn-small btn-secondary" onclick="editMaterial(${item.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-small btn-secondary" onclick="removeMaterial(${item.id})" title="Eliminar" style="background: #e74c3c; color: white; border: none;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        materialsList.appendChild(materialItem);
    });
}

// ACTUALIZAR TOTAL DE BOLSAS
function updateTotalBags() {
    const total = orderMaterials.reduce((sum, item) => sum + item.cantidad, 0);
    const formTotalContainer = document.getElementById('formTotalContainer');
    const formTotalValue = document.getElementById('formTotalValue');
    
    if (formTotalContainer && formTotalValue) {
        if (orderMaterials.length > 0) {
            formTotalContainer.style.display = 'block';
            formTotalValue.textContent = `${total.toFixed(1)} BLS`;
        } else {
            formTotalContainer.style.display = 'none';
        }
    }
}

// FUNCIÓN PARA EDITAR UN MATERIAL (GLOBAL)
window.editMaterial = function(materialId) {
    const materialIndex = orderMaterials.findIndex(item => item.id === materialId);
    if (materialIndex !== -1) {
        const material = orderMaterials[materialIndex];
        
        // Cargar datos de vuelta al formulario
        if (skuInput) skuInput.value = material.sku;
        if (descripcionInput) descripcionInput.value = material.descripcion;
        if (loteInput) loteInput.value = material.lote;
        if (cantidadInput) cantidadInput.value = material.cantidad;
        if (solicitanteInput) solicitanteInput.value = material.solicitante;
        if (banderaInput) banderaInput.value = material.bandera || '';
        
        // Eliminar del array actual (se volverá a agregar al dar clic en "Agregar")
        orderMaterials.splice(materialIndex, 1);
        
        updateMaterialsList();
        updateTotalBags();
        
        if (skuInput) skuInput.focus();
    }
};

// FUNCIÓN PARA ELIMINAR UN MATERIAL (GLOBAL)
window.removeMaterial = function(materialId) {
    if (confirm('¿Está seguro de que desea eliminar este material de la orden?')) {
        const materialIndex = orderMaterials.findIndex(item => item.id === materialId);
        if (materialIndex !== -1) {
            orderMaterials.splice(materialIndex, 1);
            updateMaterialsList();
            updateTotalBags();
        }
    }
};

// MANEJADOR PARA LIMPIAR FORMULARIO COMPLETO
function clearFormHandler() {
    if (orderMaterials.length > 0 && !confirm('¿Está seguro de que desea limpiar toda la orden? Se perderán todos los materiales agregados.')) {
        return;
    }
    clearForm();
}

// FUNCIÓN PARA LIMPIAR EL FORMULARIO
function clearForm() {
    orderMaterials = [];
    updateMaterialsList();
    updateTotalBags();
    
    if (orderForm) {
        orderForm.reset();
    }
    
    // Deshabilitar botones de acción hasta que se genere una nueva etiqueta
    const actionButtons = [
        'printSingleBtn',
        'printThermalBtn', 
        'createWebPageBtn',
        'saveBtn'
    ];
    
    actionButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.disabled = true;
    });
    
    console.log('Formulario y lista de materiales vaciados');
}