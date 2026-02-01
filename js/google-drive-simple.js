// google-drive-simple.js - VERSIÓN CORREGIDA PARA ENVÍO POR POST
const GOOGLE_DRIVE_WEB_APP_URL = window.googleDriveWebAppUrl || "https://script.google.com/macros/s/AKfycbwEcYcKJ1c7l6YJM90XJ1Nfkqeo0whIbNZyJ0NdRod4k65LBbGuuOI0854nWdDpHfE/exec";

// Función principal para crear página web
async function createWebPage() {
    console.log('🌐 INICIANDO SUBIDA A GOOGLE DRIVE...');
    
    if (!currentLabelData) {
        alert('❌ Primero debe generar una etiqueta');
        return;
    }

    const loading = showLoading('Subiendo a Google Drive...');
    
    try {
        // 1. Preparamos el objeto con los datos
        const payload = {
            action: "createWebPage",
            ordenNumero: currentLabelData.ordenNumero,
            codigo: currentLabelData.codigo,
            destino: currentLabelData.destino,
            totalBolsas: currentLabelData.cantidadTotal,
            verificationCode: currentLabelData.verificationCode,
            htmlContent: generateWebPageHTML() 
        };

        // 2. Enviamos los datos mediante POST (text/plain evita bloqueos CORS)
        const response = await fetch(GOOGLE_DRIVE_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // Fundamental para Google Apps Script
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        // 3. ÉXITO (Con no-cors no podemos leer el JSON, pero asumimos éxito si no hay error de red)
        hideLoading(loading);
        
        alert('✅ SOLICITUD ENVIADA\n\nLos datos se están procesando. En unos segundos el archivo aparecerá en tu carpeta "Etiquetas Web Agronorte" de Google Drive.');
        
        // Actualizar visualmente la interfaz si es necesario
        if (typeof updateQRWithWebLink === 'function') {
            updateQRWithWebLink();
        }

    } catch (error) {
        hideLoading(loading);
        console.error('❌ Error en createWebPage:', error);
        alert('❌ ERROR AL CONECTAR:\n' + error.message);
    }
}

// Función para generar el HTML interno de la etiqueta
function generateWebPageHTML() {
    if (!currentLabelData || !currentLabelData.materiales) return '<p>Sin datos</p>';
    
    let tabla = `
    <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
            <tr style="background-color: #2c3e50; color: white;">
                <th style="padding: 10px; border: 1px solid #ddd;">SKU</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Descripción</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Lote</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Cant.</th>
            </tr>
        </thead>
        <tbody>`;

    currentLabelData.materiales.forEach(item => {
        tabla += `
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.sku}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.descripcion}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.lote}</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.cantidad} BLS</td>
        </tr>`;
    });

    tabla += `</tbody></table>`;
    return tabla;
}

// Funciones de UI (Loading)
function showLoading(message) {
    const div = document.createElement('div');
    div.id = 'drive-upload-loading';
    div.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:9999; color:white; flex-direction:column; font-family:Arial;";
    div.innerHTML = `<div style="border:5px solid #f3f3f3; border-top:5px solid #3498db; border-radius:50%; width:50px; height:50px; animation:spin 1s linear infinite;"></div>
                     <p style="margin-top:20px;">${message}</p>
                     <style>@keyframes spin {0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)}}</style>`;
    document.body.appendChild(div);
    return div;
}

function hideLoading(loadingDiv) {
    if (loadingDiv) loadingDiv.remove();
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    // Escuchamos AMBOS posibles IDs de botón por seguridad
    const btn = document.getElementById('createWebPageBtn') || document.getElementById('uploadToDriveBtn');
    if (btn) {
        btn.addEventListener('click', createWebPage);
        console.log('✅ Botón de Drive vinculado');
    }
});