// google-drive-simple.js - VERSIÓN CORREGIDA CON NUEVO NOMBRE Y SOLICITANTES

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
    
    // Calcular la fecha actual
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });
    
    let tabla = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">AGROQUIMICOS DEL NORTE S.A.</h1>
            <p style="color: #7f8c8d; font-size: 14px;">Sistema de seguimiento de órdenes</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                <div>
                    <p style="margin: 5px 0; font-size: 16px;"><strong>Orden:</strong> ${window.currentLabelData.ordenNumero}</p>
                    <p style="margin: 5px 0; font-size: 16px;"><strong>N° de Pedido:</strong> ${window.currentLabelData.codigo}</p>
                </div>
                <div>
                    <p style="margin: 5px 0; font-size: 16px;"><strong>Destino:</strong> ${window.currentLabelData.destino}</p>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Fecha:</strong> ${fechaFormateada}</p>
                </div>
            </div>
        </div>
        
        <table style="width:100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #dee2e6;">
            <thead>
                <tr style="background: #2c3e50; color: white;">
                    <th style="padding: 12px; text-align: left; font-size: 14px;">Descripción / Lote</th>
                    <th style="padding: 12px; text-align: center; font-size: 14px; width: 100px;">Cant.</th>
                </tr>
            </thead>
            <tbody>`;

    window.currentLabelData.materiales.forEach(item => {
        tabla += `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">
                        <div style="margin-bottom: 5px;">
                            <strong style="font-size: 15px;">${item.descripcion}</strong>
                        </div>
                        <div style="color: #666; font-size: 13px;">
                            <span style="margin-right: 15px;"><strong>SKU:</strong> ${item.sku}</span>
                            <span style="margin-right: 15px;"><strong>Lote:</strong> ${item.lote}</span>
                            <span><strong>Solicitante:</strong> ${item.solicitante}</span>
                        </div>
                        ${item.bandera ? `<div style="margin-top: 5px; font-size: 13px;"><strong>Bandera:</strong> ${item.bandera}</div>` : ''}
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #dee2e6; text-align: center; vertical-align: top;">
                        <div style="font-size: 16px; font-weight: bold; color: #2c3e50;">
                            ${item.cantidad} BLS
                        </div>
                    </td>
                </tr>`;
    });

    tabla += `
            </tbody>
        </table>
        
        <div style="margin-top: 25px; padding: 15px; background: #e8f4fd; border-radius: 8px; border-left: 4px solid #3498db;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin: 0; color: #2c3e50;">TOTAL GENERAL</h3>
                    <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 14px;">
                        Código de verificación: ${window.currentLabelData.verificationCode}
                    </p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 24px; font-weight: bold; color: #2c3e50;">
                        ${window.currentLabelData.cantidadTotal} BLS
                    </div>
                </div>
            </div>
        </div>
        
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #7f8c8d; font-size: 12px;">
                © ${new Date().getFullYear()} AGROQUIMICOS DEL NORTE S.A.<br>
                Este documento fue generado automáticamente por el sistema de etiquetas
            </p>
        </div>
    </div>`;
    
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