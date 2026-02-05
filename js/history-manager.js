// history-manager.js - VERSIÓN CON EXPORTACIÓN A EXCEL

document.addEventListener('DOMContentLoaded', function() {
    console.log('History manager inicializando...');
    
    updateHistoryList();

    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const saveBtn = document.getElementById('saveBtn');
    const exportBtn = document.getElementById('exportHistoryBtn'); // Asegúrate de tener este ID en tu HTML

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

    if (exportBtn) {
        exportBtn.addEventListener('click', exportToExcel);
    }
});

// --- FUNCIÓN PARA EXPORTAR A EXCEL (CSV FORMAT) ---
function exportToExcel() {
    const history = JSON.parse(localStorage.getItem('labelHistory') || '[]');
    
    if (history.length === 0) {
        alert('❌ No hay datos en el historial para exportar.');
        return;
    }

    // Definir encabezados
    const headers = ['Solicitante', 'SKU', 'Descripcion', 'Lote', 'Cantidad', 'Orden', 'N° de Pedido', 'Destino', 'ID Verificacion'];
    
    // Construir las filas (Aplanando los materiales)
    const rows = [];
    history.forEach(order => {
        order.materiales.forEach(mat => {
            rows.push([
                `"${mat.solicitante || ''}"`,
                `"${mat.sku || ''}"`,
                `"${mat.descripcion || ''}"`,
                `"${mat.lote || ''}"`,
                parseFloat(mat.cantidad).toFixed(1),
                `"${order.ordenNumero}"`,
                `"${order.codigo}"`,
                `"${order.destino}"`,
                `"${order.verificationCode}"`
            ]);
        });
    });

    // Unir encabezados y filas con punto y coma (formato regional Excel común)
    const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
    ].join('\n');

    // Crear el archivo y descargarlo con BOM para caracteres especiales (tildes/ñ)
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const fecha = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `Historial_Etiquetas_${fecha}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// FUNCIÓN PARA GUARDAR EN EL HISTORIAL
function saveToHistory() {
    if (!window.currentLabelData) {
        alert('❌ No hay datos para guardar. Primero genera una etiqueta.');
        return;
    }

    let history = JSON.parse(localStorage.getItem('labelHistory') || '[]');
    const existsIndex = history.findIndex(item => item.verificationCode === window.currentLabelData.verificationCode);
    
    if (existsIndex !== -1) {
        history[existsIndex] = { ...window.currentLabelData };
    } else {
        history.unshift({ ...window.currentLabelData });
    }

    if (history.length > 50) history.pop();

    localStorage.setItem('labelHistory', JSON.stringify(history));
    updateHistoryList();
    alert('✅ Etiqueta guardada con éxito en el historial');
}

// FUNCIÓN PARA CARGAR DATOS DEL HISTORIAL AL FORMULARIO
window.loadFromHistory = function(verificationCode) {
    const history = JSON.parse(localStorage.getItem('labelHistory') || '[]');
    const data = history.find(item => item.verificationCode === verificationCode);

    if (!data) {
        alert('❌ No se encontraron los datos de esta etiqueta.');
        return;
    }

    if (confirm(`¿Deseas cargar la Orden #${data.ordenNumero} en el formulario?`)) {
        document.getElementById('ordenNumero').value = data.ordenNumero;
        document.getElementById('codigo').value = data.codigo;
        document.getElementById('destino').value = data.destino;

        window.orderMaterials = JSON.parse(JSON.stringify(data.materiales));

        if (typeof window.updateMaterialsList === 'function') window.updateMaterialsList();
        if (typeof window.updateTotalBags === 'function') window.updateTotalBags();
        if (typeof window.generateLabel === 'function') window.generateLabel();

        const tabCrear = document.querySelector('[data-tab="tab-1"]');
        if (tabCrear) tabCrear.click();

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

window.removeFromHistory = function(verificationCode, event) {
    if (event) event.stopPropagation();
    
    if (confirm('¿Eliminar esta etiqueta del historial?')) {
        let history = JSON.parse(localStorage.getItem('labelHistory') || '[]');
        history = history.filter(item => item.verificationCode !== verificationCode);
        localStorage.setItem('labelHistory', JSON.stringify(history));
        updateHistoryList();
    }
};

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