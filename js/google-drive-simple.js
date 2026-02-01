// google-drive-simple.js - VERSIÓN FINAL CON VISOR WEB
const GOOGLE_DRIVE_WEB_APP_URL = window.googleDriveWebAppUrl || "https://script.google.com/macros/s/AKfycbz84MBSX34V2pNnWVEQAutGrfJXU5LOENtmGTYezzxFHi7bcBzmkgrylKNkjcDJCZLm/exec";

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
            codigo: window.currentLabelData.codigo,
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

        // 2. Creamos el link del VISOR (v = verificationCode)
        // Esto es lo que permite que el celular vea la web directamente
        const viewLink = `${GOOGLE_DRIVE_WEB_APP_URL}?v=${window.currentLabelData.verificationCode}`;
        
        // 3. Actualizamos las variables globales
        window.currentWebPageUrl = viewLink;
        window.currentLabelData.driveLink = viewLink;

        // 4. Regeneramos el QR con el enlace del visor
        if (typeof window.generateQRCode === 'function') {
            await window.generateQRCode(
                window.currentLabelData.ordenNumero, 
                window.currentLabelData.codigo, 
                window.currentLabelData.destino
            );
        }

        hideLoading(loading);
        alert('✅ PÁGINA LISTA\n\nEl QR se ha actualizado. Ahora, al escanearlo, se abrirá la información directamente.');

    } catch (error) {
        hideLoading(loading);
        console.error('Error:', error);
        alert('❌ Error al conectar con Drive: ' + error.message);
    }
}

function generateWebPageHTML() {
    if (!window.currentLabelData || !window.currentLabelData.materiales) return '<p>Sin datos</p>';
    
    let tabla = `
    <table style="width:100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
            <tr style="background: #2c3e50; color: white;">
                <th style="padding: 10px; text-align: left;">Descripción / Lote</th>
                <th style="padding: 10px; text-align: center;">Cant.</th>
            </tr>
        </thead>
        <tbody>`;

    window.currentLabelData.materiales.forEach(item => {
        tabla += `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>${item.descripcion}</strong><br>
                <small style="color: #666;">SKU: ${item.sku} | Lote: ${item.lote}</small>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
                ${item.cantidad} BLS
            </td>
        </tr>`;
    });

    tabla += `</tbody></table>`;
    return tabla;
}

function showLoading(msg) {
    const div = document.createElement('div');
    div.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); color:white; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:10000; font-family:Arial;";
    div.innerHTML = `<div style="border:5px solid #f3f3f3; border-top:5px solid #3498db; border-radius:50%; width:40px; height:40px; animation:spin 1s linear infinite;"></div><p style="margin-top:20px;">${msg}</p><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>`;
    document.body.appendChild(div);
    return div;
}

function hideLoading(el) { if(el) el.remove(); }

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('createWebPageBtn') || document.getElementById('uploadToDriveBtn');
    if (btn) btn.addEventListener('click', createWebPage);
});