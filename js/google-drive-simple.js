// google-drive-simple.js - VERSIÓN FINAL AGROQUIMICOS DEL NORTE
const GOOGLE_DRIVE_WEB_APP_URL = window.googleDriveWebAppUrl || "https://script.google.com/macros/s/AKfycbxUz4J-3wL1x9MknyZQiuyFHUTo1jw8C12zQ-w5dmcy57076dkYY9_MYIWQATY0dtMU/exec";

async function createWebPage() {
    console.log('🌐 Iniciando subida a Drive...');
    
    if (!window.currentLabelData) {
        alert('❌ Primero debe generar una etiqueta');
        return;
    }

    const loading = showLoading('Sincronizando con la nube...');
    
    try {
        const payload = {
            action: "createWebPage",
            ordenNumero: window.currentLabelData.ordenNumero,
            codigo: window.currentLabelData.codigo, // N° de pedido
            destino: window.currentLabelData.destino,
            totalBolsas: window.currentLabelData.cantidadTotal,
            verificationCode: window.currentLabelData.verificationCode,
            htmlContent: generateWebPageHTML() 
        };

        // 1. Enviamos los datos al Script
        await fetch(GOOGLE_DRIVE_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });

        // 2. Creamos el link del VISOR
        const viewLink = `${GOOGLE_DRIVE_WEB_APP_URL}?v=${window.currentLabelData.verificationCode}`;
        
        window.currentWebPageUrl = viewLink;
        window.currentLabelData.driveLink = viewLink;

        // 3. Regeneramos el QR con el enlace del visor
        if (typeof window.generateQRCode === 'function') {
            await window.generateQRCode(
                window.currentLabelData.ordenNumero, 
                window.currentLabelData.codigo, 
                window.currentLabelData.destino
            );
        }

        hideLoading(loading);
        alert('✅ WEB VINCULADA\n\nEl QR se ha actualizado. Ahora mostrará el diseño profesional en el celular.');

    } catch (error) {
        hideLoading(loading);
        alert('❌ Error al conectar con Drive: ' + error.message);
    }
}

function generateWebPageHTML() {
    if (!window.currentLabelData || !window.currentLabelData.materiales) return '';
    
    let html = '';
    window.currentLabelData.materiales.forEach(item => {
        // Formateamos cada fila para que coincida con el CSS del Script
        html += `
        <tr>
            <td>
                <strong>${item.descripcion}</strong>
                <span class="sku-lote">SKU: ${item.sku} | Lote: ${item.lote}</span>
            </td>
            <td class="cant-cell">${parseFloat(item.cantidad).toFixed(1)} BLS</td>
        </tr>`;
    });
    return html;
}

function showLoading(msg) {
    const div = document.createElement('div');
    div.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); color:white; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:10000; font-family:Arial;";
    div.innerHTML = `<div style="border:5px solid #f3f3f3; border-top:5px solid #3498db; border-radius:50%; width:45px; height:45px; animation:spin 1s linear infinite;"></div><p style="margin-top:20px; font-weight:bold;">${msg}</p><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>`;
    document.body.appendChild(div);
    return div;
}

function hideLoading(el) { if(el) el.remove(); }

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('createWebPageBtn') || document.getElementById('uploadToDriveBtn');
    if (btn) btn.addEventListener('click', createWebPage);
});