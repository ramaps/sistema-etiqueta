// google-drive-simple.js - VERSIÓN CORREGIDA
const GOOGLE_DRIVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxE9aDhPs99lqTQ7z1_bRub-UOVZI3ITJ0te3ekKMhzEtrSuUa1p_kjH4u3GthGRNFZ/exec";

async function createWebPage() {
    if (!window.currentLabelData) {
        alert('❌ Primero debe generar una etiqueta');
        return;
    }

    const loading = showLoading('Generando página de consulta...');
    
    try {
        // Armamos el paquete de datos
        const payload = {
            action: "createWebPage",
            // Forzamos el nombre de la empresa en mayúsculas para el backend si es necesario
            empresa: "AGROQUIMICOS DEL NORTE S.A.",
            ordenNumero: window.currentLabelData.ordenNumero,
            codigo: window.currentLabelData.codigo,
            destino: window.currentLabelData.destino,
            totalBolsas: window.currentLabelData.cantidadTotal,
            verificationCode: window.currentLabelData.verificationCode,
            htmlContent: generateWebPageHTML() 
        };

        // Enviar datos al script de Google
        await fetch(GOOGLE_DRIVE_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', 
            body: JSON.stringify(payload)
        });

        // Generamos el link de visualización
        const viewLink = `${GOOGLE_DRIVE_WEB_APP_URL}?v=${window.currentLabelData.verificationCode}`;
        window.currentWebPageUrl = viewLink;
        window.currentLabelData.driveLink = viewLink;

        // Actualizamos el QR físico para que apunte a la nueva web
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
        console.error("Error en createWebPage:", error);
        alert('❌ Error: ' + error.message);
    }
}

/**
 * Genera el cuerpo de la tabla para la web
 * Se corrigió: Nombre en mayúsculas y agregado de Solicitante (SOL.)
 */
function generateWebPageHTML() {
    if (!window.currentLabelData || !window.currentLabelData.materiales) return '';
    
    // Encabezado con el nombre de la empresa corregido
    let html = `
        <tr>
            <td colspan="2" style="background-color: #2c3e50; color: white; text-align: center; padding: 15px; font-weight: bold; font-size: 1.2rem;">
                AGROQUIMICOS DEL NORTE S.A.
            </td>
        </tr>
    `;

    window.currentLabelData.materiales.forEach(item => {
        html += `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
                <div style="font-weight: bold; font-size: 1.1rem; color: #2c3e50; margin-bottom: 4px;">
                    ${item.descripcion.toUpperCase()}
                </div>
                <div style="font-size: 0.85rem; color: #666; display: flex; flex-wrap: wrap; gap: 8px;">
                    <span style="background: #f0f2f5; padding: 2px 6px; border-radius: 4px;">SKU: ${item.sku}</span>
                    <span style="background: #f0f2f5; padding: 2px 6px; border-radius: 4px;">LOTE: ${item.lote}</span>
                    <span style="background: #e3f2fd; color: #1565c0; padding: 2px 6px; border-radius: 4px; font-weight: bold; border: 1px solid #bbdefb;">
                        SOL.: ${item.solicitante || 'NO ESPECIFICADO'}
                    </span>
                </div>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #2c3e50; white-space: nowrap;">
                ${parseFloat(item.cantidad).toFixed(1)} BLS
            </td>
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