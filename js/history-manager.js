// history-manager.js - VERSIÓN CORREGIDA

// Referencias a elementos del historial
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const exportHistoryBtn = document.getElementById('exportHistoryBtn');
const saveBtn = document.getElementById('saveBtn');

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('History manager inicializando...');
    
    // Verificar que los elementos existen
    if (!historyList || !saveBtn || !clearHistoryBtn || !exportHistoryBtn) {
        console.error('❌ Faltan elementos del historial');
        return;
    }
    
    console.log('✅ Elementos del historial encontrados');
    
    // Configurar eventos
    saveBtn.addEventListener('click', saveToHistory);
    clearHistoryBtn.addEventListener('click', clearHistory);
    exportHistoryBtn.addEventListener('click', exportHistory);
    
    // Cargar historial desde localStorage
    loadHistoryFromLocalStorage();
    
    console.log('✅ History manager inicializado correctamente');
});

// Guardar en historial
function saveToHistory() {
    if (!currentLabelData) {
        alert('Primero debe generar una etiqueta');
        return;
    }
    
    const ordenNumero = document.getElementById('previewOrdenNumero')?.textContent || 'N/A';
    const cantidadTotal = document.getElementById('previewTotalValue')?.textContent || '0.0 BLS';
    const materialsCount = orderMaterials.length;
    const timestamp = new Date().toLocaleString('es-ES');
    const verificationCode = currentLabelData?.verificationCode || 'N/A';
    
    // CORRECCIÓN: Usar currentWebPageUrl en lugar de currentPdfDriveUrl
    const hasDriveLink = currentWebPageUrl ? 'Sí' : 'No';
    const destino = document.getElementById('previewDestino')?.textContent || 'N/A';
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <div class="history-info">
            <div><strong>Orden:</strong> ${ordenNumero}</div>
            <div><strong>Materiales:</strong> ${materialsCount} | <strong>Total Bolsas:</strong> ${cantidadTotal}</div>
            <div><strong>Destino:</strong> ${destino}</div>
            <div><strong>Código:</strong> ${verificationCode}</div>
            <div><strong>Página Web:</strong> ${hasDriveLink}</div>
            <div><small>Guardado: ${timestamp}</small></div>
        </div>
        <div class="history-actions">
            <button class="btn btn-small" onclick="loadFromHistory(this)">
                <i class="fas fa-redo"></i> Cargar
            </button>
            <button class="btn btn-small btn-secondary" onclick="removeFromHistory(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    if (historyList.querySelector('.empty-history')) {
        historyList.innerHTML = '';
    }
    
    historyList.prepend(historyItem);
    
    saveHistoryToLocalStorage();
    
    alert('Etiqueta guardada en el historial correctamente');
}

// Cargar desde historial
window.loadFromHistory = function(button) {
    const historyItem = button.closest('.history-item');
    const historyInfo = historyItem.querySelector('.history-info');
    
    // Usar operador de encadenamiento opcional para evitar errores
    const orden = historyInfo?.children[0]?.textContent?.replace('Orden:', '')?.trim() || 'N/A';
    const destino = historyInfo?.children[2]?.textContent?.replace('Destino:', '')?.trim() || 'N/A';
    const materialesText = historyInfo?.children[1]?.textContent || '';
    const totalBolsas = materialesText.split('|')[1]?.replace('Total Bolsas:', '')?.trim() || '0.0 BLS';
    const codigoVerificacion = historyInfo?.children[3]?.textContent?.replace('Código:', '')?.trim() || 'N/A';
    const hasDriveLink = historyInfo?.children[4]?.textContent?.replace('Página Web:', '')?.trim() || 'No';
    
    let mensaje = `Orden "${orden}" cargada.\nTotal de bolsas: ${totalBolsas}\nCódigo: ${codigoVerificacion}`;
    if (hasDriveLink === 'Sí') {
        mensaje += '\n\nEsta etiqueta tiene una página web en Google Drive.';
    }
    
    alert(mensaje);
    
    // Cambiar a la pestaña de creación
    const tab1 = document.querySelector('[data-tab="tab-1"]');
    if (tab1) tab1.click();
};

// Eliminar del historial
window.removeFromHistory = function(button) {
    if (confirm('¿Está seguro de que desea eliminar esta etiqueta del historial?')) {
        const historyItem = button.closest('.history-item');
        if (historyItem) {
            historyItem.remove();
        }
        
        if (historyList.children.length === 0) {
            historyList.innerHTML = '<div class="empty-history">No hay etiquetas en el historial. Genera una etiqueta para verla aquí.</div>';
        }
        
        saveHistoryToLocalStorage();
    }
};

// Limpiar historial
function clearHistory() {
    if (confirm('¿Está seguro de que desea eliminar todo el historial?')) {
        historyList.innerHTML = '<div class="empty-history">No hay etiquetas en el historial. Genera una etiqueta para verla aquí.</div>';
        localStorage.removeItem('labelHistory');
    }
}

// Exportar historial
function exportHistory() {
    const historyItems = historyList.querySelectorAll('.history-item');
    if (historyItems.length === 0) {
        alert('No hay datos en el historial para exportar');
        return;
    }
    
    const data = [['Orden', 'Destino', 'Materiales', 'Total Bolsas', 'Código Verificación', 'Página Web', 'Fecha Guardado']];
    
    historyItems.forEach(item => {
        const info = item.querySelector('.history-info');
        const orden = info?.children[0]?.textContent?.replace('Orden:', '')?.trim() || 'N/A';
        const destino = info?.children[2]?.textContent?.replace('Destino:', '')?.trim() || 'N/A';
        const materialesText = info?.children[1]?.textContent || '';
        const materiales = materialesText.split('|')[0]?.replace('Materiales:', '')?.trim() || '0';
        const totalBolsas = materialesText.split('|')[1]?.replace('Total Bolsas:', '')?.trim() || '0.0';
        const codigo = info?.children[3]?.textContent?.replace('Código:', '')?.trim() || 'N/A';
        const driveLink = info?.children[4]?.textContent?.replace('Página Web:', '')?.trim() || 'No';
        const fecha = info?.children[5]?.textContent?.replace('Guardado:', '')?.trim() || 'N/A';
        
        data.push([orden, destino, materiales, totalBolsas, codigo, driveLink, fecha]);
    });
    
    let csvContent = "data:text/csv;charset=utf-8,";
    data.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(",") + "\r\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historial_etiquetas_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
}

// Guardar historial en localStorage
function saveHistoryToLocalStorage() {
    const historyItems = historyList.querySelectorAll('.history-item');
    const historyData = [];
    
    historyItems.forEach(item => {
        const info = item.querySelector('.history-info');
        const orden = info?.children[0]?.textContent?.replace('Orden:', '')?.trim() || 'N/A';
        const destino = info?.children[2]?.textContent?.replace('Destino:', '')?.trim() || 'N/A';
        const materialesText = info?.children[1]?.textContent || '';
        const materiales = materialesText.split('|')[0]?.replace('Materiales:', '')?.trim() || '0';
        const totalBolsas = materialesText.split('|')[1]?.replace('Total Bolsas:', '')?.trim() || '0.0';
        const codigo = info?.children[3]?.textContent?.replace('Código:', '')?.trim() || 'N/A';
        const driveLink = info?.children[4]?.textContent?.replace('Página Web:', '')?.trim() || 'No';
        const fecha = info?.children[5]?.textContent?.replace('Guardado:', '')?.trim() || 'N/A';
        
        historyData.push({
            orden, 
            destino, 
            materiales, 
            totalBolsas, 
            codigo, 
            driveLink,
            fecha
        });
    });
    
    localStorage.setItem('labelHistory', JSON.stringify(historyData));
}

// Cargar historial desde localStorage al iniciar
function loadHistoryFromLocalStorage() {
    const savedHistory = localStorage.getItem('labelHistory');
    if (savedHistory) {
        try {
            const historyData = JSON.parse(savedHistory);
            
            if (historyData.length > 0) {
                historyList.innerHTML = '';
                
                historyData.forEach(item => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    historyItem.innerHTML = `
                        <div class="history-info">
                            <div><strong>Orden:</strong> ${item.orden}</div>
                            <div><strong>Materiales:</strong> ${item.materiales} | <strong>Total Bolsas:</strong> ${item.totalBolsas}</div>
                            <div><strong>Destino:</strong> ${item.destino}</div>
                            <div><strong>Código:</strong> ${item.codigo}</div>
                            <div><strong>Página Web:</strong> ${item.driveLink}</div>
                            <div><small>Guardado: ${item.fecha}</small></div>
                        </div>
                        <div class="history-actions">
                            <button class="btn btn-small" onclick="loadFromHistory(this)">
                                <i class="fas fa-redo"></i> Cargar
                            </button>
                            <button class="btn btn-small btn-secondary" onclick="removeFromHistory(this)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    historyList.appendChild(historyItem);
                });
            }
        } catch (error) {
            console.error('❌ Error cargando historial:', error);
            localStorage.removeItem('labelHistory');
        }
    }
}