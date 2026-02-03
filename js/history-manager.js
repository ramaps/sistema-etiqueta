// history-manager.js - VERSIÓN FINAL CORREGIDA

document.addEventListener('DOMContentLoaded', function() {
    console.log('History manager inicializando...');
    
    // Cargar historial al iniciar
    updateHistoryList();

    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const saveBtn = document.getElementById('saveBtn');

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que deseas borrar todo el historial?')) {
                localStorage.removeItem('labelHistory');
                updateHistoryList();
            }
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveToHistory);
    }
});

// FUNCIÓN PARA GUARDAR EN EL HISTORIAL
function saveToHistory() {
    if (!window.currentLabelData) {
        alert('❌ No hay datos para guardar. Primero genera una etiqueta.');
        return;
    }

    let history = JSON.parse(localStorage.getItem('labelHistory') || '[]');
    
    // Verificar si ya existe para actualizar o agregar nuevo
    const existsIndex = history.findIndex(item => item.verificationCode === window.currentLabelData.verificationCode);
    
    if (existsIndex !== -1) {
        history[existsIndex] = { ...window.currentLabelData };
    } else {
        history.unshift({ ...window.currentLabelData });
    }

    // Mantener solo los últimos 50 registros
    if (history.length > 50) history.pop();

    localStorage.setItem('labelHistory', JSON.stringify(history));
    updateHistoryList();
    alert('✅ Etiqueta guardada con éxito en el historial');
}

// FUNCIÓN CLAVE: CARGAR DATOS DEL HISTORIAL AL FORMULARIO
window.loadFromHistory = function(verificationCode) {
    const history = JSON.parse(localStorage.getItem('labelHistory') || '[]');
    const data = history.find(item => item.verificationCode === verificationCode);

    if (!data) {
        alert('❌ No se encontraron los datos de esta etiqueta.');
        return;
    }

    if (confirm(`¿Deseas cargar la Orden #${data.ordenNumero} en el formulario?`)) {
        // 1. Llenar campos de cabecera
        document.getElementById('ordenNumero').value = data.ordenNumero;
        document.getElementById('codigo').value = data.codigo;
        document.getElementById('destino').value = data.destino;

        // 2. Restaurar el array global de materiales (IMPORTANTE)
        // Usamos JSON.parse/stringify para crear una copia limpia
        window.orderMaterials = JSON.parse(JSON.stringify(data.materiales));

        // 3. Actualizar la lista visual de materiales en el formulario
        if (typeof window.updateMaterialsList === 'function') {
            window.updateMaterialsList();
        }

        // 4. Actualizar el contador de bolsas del formulario
        if (typeof window.updateTotalBags === 'function') {
            window.updateTotalBags();
        }

        // 5. Generar la vista previa automáticamente para que se vea en la derecha
        if (typeof window.generateLabel === 'function') {
            window.generateLabel();
        }

        // 6. Cambiar automáticamente a la pestaña de "Crear Etiqueta"
        const tabCrear = document.querySelector('[data-tab="tab-1"]');
        if (tabCrear) {
            tabCrear.click();
        }

        // 7. Subir al inicio de la página para ver los datos
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// FUNCIÓN PARA ELIMINAR UN ITEM ESPECÍFICO DEL HISTORIAL
window.removeFromHistory = function(verificationCode, event) {
    if (event) event.stopPropagation(); // Evita que se dispare el loadFromHistory
    
    if (confirm('¿Eliminar esta etiqueta del historial?')) {
        let history = JSON.parse(localStorage.getItem('labelHistory') || '[]');
        history = history.filter(item => item.verificationCode !== verificationCode);
        localStorage.setItem('labelHistory', JSON.stringify(history));
        updateHistoryList();
    }
};

// FUNCIÓN PARA RENDERIZAR LA LISTA DEL HISTORIAL
function updateHistoryList() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    const history = JSON.parse(localStorage.getItem('labelHistory') || '[]');

    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-history">No hay etiquetas en el historial.</div>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item" onclick="loadFromHistory('${item.verificationCode}')" 
             style="cursor:pointer; background:white; border:1px solid #ddd; padding:15px; margin-bottom:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; transition: transform 0.2s;">
            <div class="history-info">
                <div style="font-weight:bold; color:#2c3e50; font-size:1.1rem;"># ${item.ordenNumero} - ${item.destino}</div>
                <div style="font-size:0.9rem; color:#666; margin-top:4px;">
                    <i class="fas fa-box"></i> ${item.materiales.length} productos | 
                    <i class="fas fa-barcode"></i> Pedido: ${item.codigo}
                </div>
                <div style="font-size:0.8rem; color:#999; margin-top:4px;">ID: ${item.verificationCode}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:1.4rem; font-weight:bold; color:#000;">${parseFloat(item.cantidadTotal).toFixed(1)} <small style="font-size:0.8rem;">BLS</small></div>
                <button class="btn btn-secondary" onclick="removeFromHistory('${item.verificationCode}', event)" 
                        style="padding:4px 8px; font-size:12px; margin-top:5px; background:#e74c3c; color:white; border:none; border-radius:4px;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}