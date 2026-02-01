// google-drive-simple.js - SIN QR EN LA WEB
const GOOGLE_DRIVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwxnOAdFQhIzQqHcj5SJ2YZv54miHzHpas0NoUVoE-QgGHhgTgSSIG3VeKQh8LMSeq9/exec";

async function createWebPage() {
    if (!window.currentLabelData) {
        alert('❌ Primero debe generar una etiqueta');
        return;
    }

    const loading = showLoading('Generando página de consulta...');
    
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
        alert('✅ VINCULACIÓN EXITOSA\n\nEl QR físico ahora apunta a la web de consulta.');

    } catch (error) {
        hideLoading(loading);
        alert('❌ Error: ' + error.message);
    }
}

function generateWebPageHTML() {
    if (!window.currentLabelData || !window.currentLabelData.materiales) return '';
    let html = '';
    window.currentLabelData.materiales.forEach(item => {
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
    div.innerHTML = `<div style="border:5px solid #f3f3f3; border-top:5px solid #3498db; border-radius:50%; width:40px; height:40px; animation:spin 1s linear infinite;"></div><p style="margin-top:20px;">${msg}</p><style>@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>`;
    document.body.appendChild(div);
    return div;
}

function hideLoading(el) { if(el) el.remove(); }

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('createWebPageBtn') || document.getElementById('uploadToDriveBtn');
    if (btn) btn.addEventListener('click', createWebPage);
});