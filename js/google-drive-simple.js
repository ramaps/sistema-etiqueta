// google-drive-simple.js - VERSIÓN CORREGIDA PARA ACTUALIZAR QR TRAS SUBIDA
const GOOGLE_DRIVE_WEB_APP_URL = window.googleDriveWebAppUrl || "https://script.google.com/macros/s/AKfycbwEcYcKJ1c7l6YJM90XJ1Nfkqeo0whIbNZyJ0NdRod4k65LBbGuuOI0854nWdDpHfE/exec";

async function createWebPage() {
    console.log('🌐 INICIANDO SUBIDA A GOOGLE DRIVE...');
    
    if (!window.currentLabelData) {
        alert('❌ Primero debe generar una etiqueta');
        return;
    }

    const loading = showLoading('Subiendo a Google Drive y vinculando QR...');
    
    try {
        const payload = {
            action: "createWebPage",
            ordenNumero: window.currentLabelData.ordenNumero,
            codigo: window.currentLabelData.codigo,
            destino: window.currentLabelData.destino,
            totalBolsas: window.currentLabelData.cantidadTotal,
            verificationCode: window.currentLabelData.verificationCode,
            htmlContent: generateWebPageHTML() 
        };

        await fetch(GOOGLE_DRIVE_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });

        // 1. CONSTRUIR EL ENLACE (Ajustado a la lógica de búsqueda de Drive)
        // Como usamos no-cors no recibimos la URL, pero sabemos que se indexa por N° de Orden
        const driveSearchLink = `https://drive.google.com/drive/search?q=${window.currentLabelData.ordenNumero}`;
        
        // 2. ACTUALIZAR ESTADO GLOBAL
        window.currentWebPageUrl = driveSearchLink;
        window.currentLabelData.driveLink = driveSearchLink;

        // 3. RE-GENERAR EL QR AUTOMÁTICAMENTE
        // Esto hace que el QR en pantalla y para impresión cambie de texto a URL
        if (typeof window.generateQRCode === 'function') {
            console.log('🔗 Actualizando QR con enlace web...');
            await window.generateQRCode(
                window.currentLabelData.ordenNumero, 
                window.currentLabelData.codigo, 
                window.currentLabelData.destino
            );
        }

        hideLoading(loading);
        alert('✅ WEB VINCULADA\n\nEl QR ahora apunta a la página web en Drive. Ya puede imprimir la etiqueta.');

    } catch (error) {
        hideLoading(loading);
        console.error('❌ Error en createWebPage:', error);
        alert('❌ ERROR AL CONECTAR:\n' + error.message);
    }
}

function generateWebPageHTML() {
    if (!window.currentLabelData || !window.currentLabelData.materiales) return '<p>Sin datos</p>';
    
    // Diseño simple y limpio para que se vea bien en celulares al escanear
    let tabla = `
    <div style="font-family: Arial; padding: 20px;">
        <h1 style="color: #2c3e50;">Detalles de Orden: ${window.currentLabelData.ordenNumero}</h1>
        <p><strong>Destino:</strong> ${window.currentLabelData.destino}</p>
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

    window.currentLabelData.materiales.forEach(item => {
        tabla += `
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.sku}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.descripcion}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${item.lote}</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.cantidad} BLS</td>
        </tr>`;
    });

    tabla += `</tbody></table>
        <p style="margin-top:20px; font-size: 12px; color: #7f8c8d;">Verificación: ${window.currentLabelData.verificationCode}</p>
    </div>`;
    return tabla;
}

// Funciones de UI
function showLoading(message) {
    const div = document.createElement('div');
    div.id = 'drive-upload-loading';
    div.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; justify-content:center; align-items:center; z-index:9999; color:white; flex-direction:column; font-family:Arial;";
    div.innerHTML = `
        <div style="border:5px solid #f3f3f3; border-top:5px solid #3498db; border-radius:50%; width:50px; height:50px; animation:spin 1s linear infinite;"></div>
        <p style="margin-top:20px;">${message}</p>
        <style>@keyframes spin {0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)}}</style>
    `;
    document.body.appendChild(div);
    return div;
}

function hideLoading(loadingDiv) {
    if (loadingDiv) loadingDiv.remove();
}

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('createWebPageBtn') || document.getElementById('uploadToDriveBtn');
    if (btn) {
        btn.addEventListener('click', createWebPage);
    }
});