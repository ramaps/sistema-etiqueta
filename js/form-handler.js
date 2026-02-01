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
    if (!orderForm) {
        console.error('No se encontró el formulario orderForm');
        return;
    }
    
    if (!addMaterialBtn) {
        console.error('No se encontró el botón addMaterialBtn');
        return;
    }
    
    if (!clearOrderBtn) {
        console.error('No se encontró el botón clearOrderBtn');
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
    
    const sku = skuInput ? skuInput.value.trim() : '';
    const descripcion = descripcionInput ? descripcionInput.value.trim() : '';
    const lote = loteInput ? loteInput.value.trim() : '';
    const cantidad = cantidadInput ? parseFloat(cantidadInput.value) : 0;
    const solicitante = solicitanteInput ? solicitanteInput.value.trim() : '';
    const bandera = banderaInput ? banderaInput.value.trim() : '';
    
    console.log('Datos del material:', { sku, descripcion, lote, cantidad, solicitante, bandera });
    
    // Validar
    if (!sku || !descripcion || !lote || isNaN(cantidad) || cantidad <= 0 || !solicitante) {
        alert('Por favor complete todos los campos del material con valores válidos');
        return;
    }
    
    const materialId = Date.now() + Math.random();
    orderMaterials.push({
        id: materialId,
        sku,
        descripcion,
        lote,
        cantidad,
        solicitante,
        bandera
    });
    
    updateMaterialsList();
    updateTotalBags();
    
    // Limpiar formulario
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
        materialItem.innerHTML = `
            <div class="material-info">
                <div><strong>SKU:</strong> ${item.sku}</div>
                <div><strong>Lote:</strong> ${item.lote}</div>
                <div><strong>Cantidad:</strong> ${item.cantidad} BLS</div>
                <div><strong>Solicitante:</strong> ${item.solicitante}</div>
            </div>
            <div class="material-actions">
                <button class="btn btn-small btn-secondary" onclick="editMaterial(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-small btn-secondary" onclick="removeMaterial(${item.id})">
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
        
        if (skuInput) skuInput.value = material.sku;
        if (descripcionInput) descripcionInput.value = material.descripcion;
        if (loteInput) loteInput.value = material.lote;
        if (cantidadInput) cantidadInput.value = material.cantidad;
        if (solicitanteInput) solicitanteInput.value = material.solicitante;
        if (banderaInput) banderaInput.value = material.bandera || '';
        
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

// MANEJADOR PARA LIMPIAR FORMULARIO
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
    
    // Deshabilitar botones
    const actionButtons = [
        'printSingleBtn',
        'printThermalBtn', 
        'generatePdfBtn',
        'uploadToDriveBtn',
        'saveBtn'
    ];
    
    actionButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.disabled = true;
    });
    
    console.log('Formulario limpiado');
}