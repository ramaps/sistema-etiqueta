// google-drive-simple.js - VERSIÓN PARA ETIQUETAS ÚNICAS
const GOOGLE_DRIVE_WEB_APP_URL = window.googleDriveWebAppUrl || "https://script.google.com/macros/s/AKfycbwEcYcKJ1c7l6YJM90XJ1Nfkqeo0whIbNZyJ0NdRod4k65LBbGuuOI0854nWdDpHfE/exec";

async function createWebPage() {
    console.log('🌐 INICIANDO SUBIDA ÚNICA A DRIVE...');
    
    if (!window.currentLabelData) {
        alert('❌ Primero debe generar una etiqueta');
        return;
    }

    const loading = showLoading('Subiendo y generando QR irrepetible...');
    
    try {
        const payload = {
            action: "createWebPage",
            ordenNumero: window.currentLabelData.ordenNumero,
            codigo: window.currentLabelData.codigo,
            destino: window.currentLabelData.destino,
            totalBolsas: window.currentLabelData.cantidadTotal,
            verificationCode: window.currentLabelData.verificationCode, // ID Único
            htmlContent: generateWebPageHTML() 
        };

        // Enviamos a Drive
        await fetch(GOOGLE_DRIVE_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });

        // IMPORTANTE: El link de búsqueda ahora usa el Verification Code 
        // Esto evita que si hay etiquetas repetidas, el QR abra la equivocada.
        const searchToken = window.currentLabelData.verificationCode;
        const driveLink = `https://drive.google.com/drive/search?q=${searchToken}`;
        
        // Actualizamos estado global
        window.currentWebPageUrl = driveLink;
        window.currentLabelData.driveLink = driveLink;

        // Forzamos al QR a redibujarse con el nuevo Link
        if (typeof window.generateQRCode === 'function') {
            await window.generateQRCode(
                window.currentLabelData.ordenNumero, 
                window.currentLabelData.codigo, 
                window.currentLabelData.destino
            );
        }

        hideLoading(loading);
        alert(`✅ VINCULACIÓN EXITOSA\n\nID Único: ${searchToken}\nEl QR ha sido actualizado.`);

    } catch (error) {
        hideLoading(loading);
        console.error('❌ Error:', error);
        alert('❌ Error al subir: ' + error.message);
    }
}

function generateWebPageHTML() {
    if (!window.currentLabelData) return '';
    const data = window.currentLabelData;
    
    let html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #2e7d32;">AGRONORTE - Detalle de Carga</h2>
        <hr>
        <p><strong>Orden:</strong> ${data.ordenNumero}</p>
        <p><strong>Destino:</strong> ${data.destino}</p>
        <p><strong>ID Verificación:</strong> ${data.verificationCode}</p>
        <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f4f4f4;">
                <th style="padding: 10px; border: 1px solid #ddd;">Descripción</th>
                <th style="padding: 10px; border: 1px solid #ddd;">Cant.</th>
            </tr>`;
    
    data.materiales.forEach(m => {
        html += `<tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${m.descripcion} (Lote: ${m.lote})</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align:center;">${m.cantidad}</td>
        </tr>`;
    });

    html += `</table></div>`;
    return html;
}

// UI Helpers
function showLoading(msg) {
    const loader = document.createElement('div');
    loader.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); color:white; display:flex; align-items:center; justify-content:center; z-index:10000; font-family:Arial;";
    loader.innerHTML = `<div><div class="spinner"></div><p>${msg}</p></div><style>.spinner{border:4px solid #f3f3f3; border-top:4px solid #3498db; border-radius:50%; width:40px; height:40px; animation:spin 1s linear infinite; margin:auto;} @keyframes spin{0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)}}</style>`;
    document.body.appendChild(loader);
    return loader;
}

function hideLoading(el) { if(el) el.remove(); }

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('createWebPageBtn');
    if (btn) btn.addEventListener('click', createWebPage);
});