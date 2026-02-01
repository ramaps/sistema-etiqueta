// qr-generator.js - VERSIÓN FINAL PARA DRIVE
let labelQR;

document.addEventListener('DOMContentLoaded', function() {
    labelQR = document.getElementById('labelQR');
});

async function generateQRCode(ordenNumero, codigo, destino) {
    if (!labelQR) labelQR = document.getElementById('labelQR');
    if (!labelQR) return null;

    // Limpiar previo
    labelQR.innerHTML = '';
    
    // Obtener código de verificación (existente o nuevo)
    const verificationCode = window.currentLabelData?.verificationCode || 
                           (window.generateVerificationCode ? window.generateVerificationCode(ordenNumero) : 'AGN-' + Date.now().toString().slice(-6));
    
    let qrText = '';
    
    // PRIORIDAD MÁXIMA: Si ya subimos a Drive, el QR es el LINK
    if (window.currentWebPageUrl) {
        qrText = window.currentWebPageUrl; 
        console.log('🔗 Generando QR con enlace a Drive:', qrText);
    } else {
        // Texto básico mientras no se suba a Drive
        qrText = `ORDEN: ${ordenNumero}\nPEDIDO: ${codigo}\nDESTINO: ${destino}\nVERIF: ${verificationCode}`;
        console.log('📝 Generando QR provisional (solo texto)');
    }
    
    // Generar la imagen del QR
    const qrUrl = createQRCodeImage(qrText, ordenNumero, codigo, !!window.currentWebPageUrl);
    
    // ACTUALIZAR EL OBJETO GLOBAL DE DATOS
    // Esto es lo que usa el PDF al imprimir
    if (window.currentLabelData) {
        window.currentLabelData.qrImageUrl = qrUrl;
        window.currentLabelData.qrText = qrText;
    }
    
    return qrUrl;
}

function createQRCodeImage(qrContent, ordenNumero, codigo, hasWebUrl = false) {
    const canvas = document.createElement('canvas');
    const size = 400; // Mayor resolución para impresión térmica
    canvas.width = size;
    canvas.height = size;
    
    try {
        if (typeof qrcode !== 'undefined') {
            // Nivel de corrección 'H' (High) es mejor para etiquetas que pueden rayarse
            const qr = qrcode(0, 'H'); 
            qr.addData(qrContent);
            qr.make();
            
            const ctx = canvas.getContext('2d');
            const qrSize = qr.getModuleCount();
            const cellSize = size / qrSize;
            
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = "#000000";
            
            for (let row = 0; row < qrSize; row++) {
                for (let col = 0; col < qrSize; col++) {
                    if (qr.isDark(row, col)) {
                        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                    }
                }
            }

            // Marca visual discreta para saber que es el QR con WEB
            if (hasWebUrl) {
                ctx.fillStyle = "#34A853"; 
                ctx.fillRect(size - 60, size - 25, 60, 25);
                ctx.fillStyle = "white";
                ctx.font = "bold 16px Arial";
                ctx.fillText("WEB", size - 50, size - 7);
            }
        }
    } catch (e) { console.error(e); }
    
    const qrUrl = canvas.toDataURL('image/png');
    displayQRImage(qrUrl);
    return qrUrl;
}

function displayQRImage(qrUrl) {
    if (!labelQR) return;
    labelQR.innerHTML = `<img src="${qrUrl}" style="width:100%; height:100%; object-fit:contain;" id="qrImage">`;
}

window.generateQRCode = generateQRCode;