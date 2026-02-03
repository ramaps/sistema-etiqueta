/**
 * google-drive-simple.js - VERSIÓN OPTIMIZADA PARA API
 */

const GOOGLE_DRIVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwmeHuBdcC-DaEHyoEXkATGi-6nze0v22v9S6hvVe8K2GgmZY7icFCdtHq6h4YXWkfd/exec";

async function createWebPage() {
    if (!window.currentLabelData) {
        alert('❌ Primero debe generar una etiqueta');
        return;
    }

    const loading = showLoading('Sincronizando con base de datos...');
    
    try {
        const payload = {
            action: "createWebPage",
            empresa: "AGROQUIMICOS DEL NORTE S.A.",
            ordenNumero: window.currentLabelData.ordenNumero,
            codigo: window.currentLabelData.codigo,
            destino: window.currentLabelData.destino,
            totalBolsas: window.currentLabelData.cantidadTotal,
            verificationCode: window.currentLabelData.verificationCode,
            // Solo enviamos las FILAS de la tabla, no la página entera
            htmlContent: generateWebPageRowsHTML() 
        };

        await fetch(GOOGLE_DRIVE_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', 
            body: JSON.stringify(payload)
        });

        const viewLink = `${GOOGLE_DRIVE_WEB_APP_URL}?v=${window.currentLabelData.verificationCode}`;
        window.currentWebPageUrl = viewLink;
        window.currentLabelData.driveLink = viewLink;

        if (typeof window.generateQRCode === 'function') {
            await window.generateQRCode(
                window.currentLabelData.ordenNumero, 
                window.currentLabelData.codigo, 
                window.currentLabelData.destino
            );
        }

        hideLoading(loading);
        alert('✅ VINCULACIÓN EXITOSA\n\nEl QR ahora apunta a la web de AGROQUIMICOS DEL NORTE S.A.');

    } catch (error) {
        hideLoading(loading);
        console.error("Error:", error);
        alert('❌ Error: ' + error.message);
    }
}

/**
 * Genera ÚNICAMENTE las filas de materiales para insertar en la tabla de la API
 * Se eliminó la sección de BANDERA para simplificar la visualización.
 */
function generateWebPageRowsHTML() {
    const data = window.currentLabelData;
    let html = '';
    
    data.materiales.forEach(item => {
        html += `
        <tr>
            <td style="padding: 15px 12px; border-bottom: 1px solid #eee; line-height: 1.4;">
                <div style="color: #7f8c8d; font-size: 0.8rem; font-weight: bold; font-family: monospace;">
                    SKU: ${item.sku}
                </div>
                
                <div style="font-weight: 800; font-size: 1.1rem; color: #000; margin: 2px 0; text-transform: uppercase;">
                    ${item.descripcion}
                </div>
                
                <div style="font-size: 0.9rem; color: #444;">
                    LOTE: ${item.lote} -
                </div>
                
                <div style="font-size: 0.85rem; color: #555; font-weight: bold; margin-top: 4px;">
                    SOL.: ${item.solicitante || '---'}
                </div>
            </td>
            
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 900; width: 90px; background: #f8f9fa; border-left: 1px solid #ddd; color: #000; font-size: 1.4rem; vertical-align: middle;">
                ${parseFloat(item.cantidad).toFixed(1)}
                <div style="font-size: 0.6rem; font-weight: bold; color: #666;">BLS</div>
            </td>
        </tr>`;
    });

    return html;
}

function showLoading(msg) {
    const div = document.createElement('div');
    div.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); color:white; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:10000; font-family:Arial;";
    div.innerHTML = `<div class="spinner"></div><p style="margin-top:20px;">${msg}</p><style>.spinner{border:4px solid #f3f3f3; border-top:4px solid #3498db; border-radius:50%; width:30px; height:30px; animation:spin 1s linear infinite;} @keyframes spin{0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)}}</style>`;
    document.body.appendChild(div);
    return div;
}

function hideLoading(el) { if(el) el.remove(); }

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('createWebPageBtn') || document.getElementById('uploadToDriveBtn');
    if (btn) btn.onclick = createWebPage;
});