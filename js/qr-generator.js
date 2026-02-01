// qr-generator.js - VERSIÓN ACTUALIZADA PARA ENLACES DINÁMICOS
let labelQR;

document.addEventListener('DOMContentLoaded', function() {
    console.log('QR Generator inicializando...');
    labelQR = document.getElementById('labelQR');
    if (!labelQR) console.error('No se encontró el elemento labelQR');
});

// Generar código QR inteligente
async function generateQRCode(ordenNumero, codigo, destino) {
    console.log('Generando QR inteligente...');
    
    if (!labelQR) labelQR = document.getElementById('labelQR');
    if (!labelQR) return null;

    labelQR.innerHTML = '<div style="text-align: center; padding: 10px;">Generando QR...</div>';
    
    const verificationCode = window.generateVerificationCode ? 
        window.generateVerificationCode(ordenNumero) : 
        'AGN-' + Date.now().toString().slice(-6);
    
    let qrText = '';
    
    // USAR LA URL DE DRIVE SI EXISTE (window.currentWebPageUrl se define en google-drive-simple.js)
    if (window.currentWebPageUrl) {
        // Ponemos la URL al principio para que el celular la detecte como link
        qrText = `${window.currentWebPageUrl}\n\n` +
                 `AGRONORTE - DETALLES ORDEN ${ordenNumero}\n` +
                 `Código Verificación: ${verificationCode}`;
        console.log('✅ QR generado con enlace web');
    } else {
        // Texto normal si no se ha subido a Drive aún
        const totalBolsas = orderMaterials.reduce((sum, item) => sum + item.cantidad, 0).toFixed(1);
        qrText = `AGRONORTE\nORDEN: ${ordenNumero}\nPEDIDO: ${codigo}\nDESTINO: ${destino}\nTOTAL: ${totalBolsas} BLS\nCOD: ${verificationCode}`;
        console.log('ℹ️ QR generado con texto plano (sin link)');
    }
    
    if (currentLabelData) {
        currentLabelData.qrText = qrText;
        currentLabelData.verificationCode = verificationCode;
    }
    
    // Generar la imagen (detecta si tiene URL para poner el indicador visual)
    const qrUrl = createQRCodeImage(qrText, ordenNumero, codigo, !!window.currentWebPageUrl);
    
    if (currentLabelData) {
        currentLabelData.qrImageUrl = qrUrl;
    }
    
    return qrUrl;
}

function createQRCodeImage(qrContent, ordenNumero, codigo, hasWebUrl = false) {
    const canvas = document.createElement('canvas');
    const size = 300; // Un poco más de resolución
    canvas.width = size;
    canvas.height = size;
    
    try {
        if (typeof qrcode !== 'undefined') {
            const qr = qrcode(0, 'M');
            qr.addData(qrContent);
            qr.make();
            
            const ctx = canvas.getContext('2d');
            const qrSize = qr.getModuleCount();
            const cellSize = size / qrSize;
            
            // Fondo blanco
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Dibujar QR
            ctx.fillStyle = "#000000";
            for (let row = 0; row < qrSize; row++) {
                for (let col = 0; col < qrSize; col++) {
                    if (qr.isDark(row, col)) {
                        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                    }
                }
            }

            // MARCA VISUAL: Si tiene link, dibujamos un pequeño icono o color distintivo
            if (hasWebUrl) {
                ctx.fillStyle = "#34A853"; // Verde Google
                ctx.fillRect(size - 40, size - 40, 40, 40);
                ctx.fillStyle = "white";
                ctx.font = "bold 12px Arial";
                ctx.fillText("WEB", size - 35, size - 15);
            }
            
        } else {
            drawSimpleQR(canvas, ordenNumero, codigo, hasWebUrl);
        }
    } catch (error) {
        console.error('Error generando QR:', error);
        drawSimpleQR(canvas, ordenNumero, codigo, hasWebUrl);
    }
    
    const qrUrl = canvas.toDataURL('image/png', 1.0);
    displayQRImage(qrUrl, hasWebUrl);
    return qrUrl;
}

function displayQRImage(qrUrl, hasWebUrl = false) {
    labelQR.innerHTML = '';
    const container = document.createElement('div');
    container.style.cssText = "width:80px; height:80px; display:flex; align-items:center; justify-content:center; border:1px solid #ddd; background:white; position:relative;";
    
    const img = document.createElement('img');
    img.src = qrUrl;
    img.style.width = "100%";
    img.id = 'qrImage';
    
    container.appendChild(img);
    labelQR.appendChild(container);
}

function drawSimpleQR(canvas, ordenNumero, codigo, hasWebUrl = false) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(10, 10, 50, 50);
    ctx.fillRect(canvas.width - 60, 10, 50, 50);
    ctx.fillRect(10, canvas.height - 60, 50, 50);
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("ORD: " + ordenNumero, canvas.width/2, canvas.height/2);
    if(hasWebUrl) ctx.fillText("CON ENLACE WEB", canvas.width/2, canvas.height/2 + 20);
}

window.generateQRCode = generateQRCode;