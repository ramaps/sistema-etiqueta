// qr-generator.js - VERSIÓN SIMPLIFICADA PARA PÁGINAS WEB
let labelQR;

// INICIALIZAR REFERENCIAS
document.addEventListener('DOMContentLoaded', function() {
    console.log('QR Generator inicializando...');
    
    labelQR = document.getElementById('labelQR');
    
    if (!labelQR) {
        console.error('No se encontró el elemento labelQR');
    }
    
    console.log('QR Generator inicializado correctamente');
});

// Generar código QR inteligente
async function generateQRCode(ordenNumero, codigo, destino) {
    console.log('Generando QR inteligente...');
    
    // Verificar que tenemos el contenedor
    if (!labelQR) {
        labelQR = document.getElementById('labelQR');
        if (!labelQR) {
            console.error('No se puede generar QR: labelQR no encontrado');
            return null;
        }
    }
    
    // Limpiar QR anterior
    labelQR.innerHTML = '<div style="text-align: center; padding: 10px;">Generando QR...</div>';
    
    // Generar código de verificación
    const verificationCode = window.generateVerificationCode ? 
        window.generateVerificationCode(ordenNumero) : 
        'AGN-' + Date.now().toString().slice(-6);
    
    // Crear texto estructurado para el QR
    let qrText = '';
    
    // VERIFICAR SI YA TENEMOS ENLACE WEB
    if (currentWebPageUrl) {
        // Si ya tenemos página web, el QR debe apuntar DIRECTAMENTE allí
        qrText = `${currentWebPageUrl}\n\n` +
                `AGRONORTE - PÁGINA WEB DE ETIQUETA\n` +
                `===================================\n` +
                `ORDEN: ${ordenNumero}\n` +
                `PEDIDO: ${codigo}\n` +
                `DESTINO: ${destino}\n` +
                `CÓDIGO: ${verificationCode}\n` +
                `===================================\n` +
                `Escanea para ver la página web completa`;
    } else {
        // Si no hay página web, mostrar datos básicos
        const totalBolsas = orderMaterials.reduce((sum, item) => sum + item.cantidad, 0).toFixed(1);
        
        qrText = `AGRONORTE - ETIQUETA\n` +
                `===================================\n` +
                `ORDEN: ${ordenNumero}\n` +
                `PEDIDO: ${codigo}\n` +
                `DESTINO: ${destino}\n` +
                `FECHA: ${new Date().toLocaleDateString('es-ES')}\n` +
                `CÓDIGO: ${verificationCode}\n` +
                `MATERIALES: ${orderMaterials.length}\n` +
                `TOTAL BOLSAS: ${totalBolsas}\n` +
                `===================================\n` +
                `Sube a Drive para obtener enlace web`;
    }
    
    // GUARDAR TEXTO BASE
    if (currentLabelData) {
        currentLabelData.qrText = qrText;
        currentLabelData.verificationCode = verificationCode;
    }
    
    // Generar y retornar la URL del QR
    const qrUrl = createQRCodeImage(qrText, ordenNumero, codigo, !!currentWebPageUrl);
    
    // Actualizar currentLabelData con el QR
    if (currentLabelData) {
        currentLabelData.qrImageUrl = qrUrl;
        console.log('QR actualizado en currentLabelData');
    }
    
    return qrUrl;
}

// Nueva función para crear la imagen del QR
function createQRCodeImage(qrContent, ordenNumero, codigo, hasWebUrl = false) {
    console.log('Creando imagen QR...');
    
    // Crear un canvas más grande para mejor calidad
    const canvas = document.createElement('canvas');
    const size = 250; // Tamaño aumentado para mejor calidad
    canvas.width = size;
    canvas.height = size;
    
    try {
        // Usar qrcode-generator si está disponible
        if (typeof qrcode !== 'undefined') {
            console.log('Generando QR con qrcode-generator...');
            
            const typeNumber = 0; // Auto-detect
            const errorCorrectionLevel = hasWebUrl ? 'L' : 'M';
            
            const qr = qrcode(typeNumber, errorCorrectionLevel);
            qr.addData(qrContent);
            qr.make();
            
            const ctx = canvas.getContext('2d');
            const qrSize = qr.getModuleCount();
            const cellSize = size / qrSize;
            
            console.log('QR generado (módulos:', qrSize, ')');
            
            // Fondo blanco
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Dibujar QR
            ctx.fillStyle = "#000000";
            for (let row = 0; row < qrSize; row++) {
                for (let col = 0; col < qrSize; col++) {
                    if (qr.isDark(row, col)) {
                        ctx.fillRect(
                            col * cellSize,
                            row * cellSize,
                            cellSize,
                            cellSize
                        );
                    }
                }
            }
            
            console.log('QR dibujado en canvas');
            
        } else {
            console.warn('qrcode-generator no disponible, usando fallback');
            drawSimpleQR(canvas, ordenNumero, codigo, hasWebUrl);
        }
        
    } catch (error) {
        console.error('Error generando QR:', error);
        drawSimpleQR(canvas, ordenNumero, codigo, hasWebUrl);
    }
    
    // Convertir canvas a imagen de alta calidad
    const qrUrl = canvas.toDataURL('image/png', 1.0);
    qrImageUrl = qrUrl; // Guardar en variable global
    
    // IMPORTANTE: Guardar en datos actuales INMEDIATAMENTE
    if (currentLabelData) {
        currentLabelData.qrImageUrl = qrUrl;
        console.log('QR guardado en currentLabelData');
    }
    
    // Mostrar imagen del QR
    displayQRImage(qrUrl, hasWebUrl);
    
    return qrUrl;
}

// Función para mostrar la imagen del QR
function displayQRImage(qrUrl, hasWebUrl = false) {
    if (!qrUrl) {
        console.error('No hay URL de QR para mostrar');
        return;
    }
    
    if (!labelQR) {
        labelQR = document.getElementById('labelQR');
        if (!labelQR) {
            console.error('No se puede mostrar QR: labelQR no encontrado');
            return;
        }
    }
    
    labelQR.innerHTML = '';
    
    const container = document.createElement('div');
    container.style.cssText = `
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        cursor: pointer;
        position: relative;
        border: 1px solid #ddd;
        padding: 2px;
        background: white;
    `;
    
    const img = document.createElement('img');
    img.src = qrUrl;
    img.width = 80;
    img.height = 80;
    img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
        image-rendering: crisp-edges;
    `;
    img.alt = 'Código QR de la etiqueta';
    img.title = hasWebUrl ? 
        'Escanea para ver la página web completa' : 
        'Escanea para ver detalles de la etiqueta';
    img.id = 'qrImage';
    
    container.appendChild(img);
    labelQR.appendChild(container);
    
    console.log('QR mostrado en pantalla');
}

// Función para dibujar un QR simple (fallback)
function drawSimpleQR(canvas, ordenNumero, codigo, hasWebUrl = false) {
    const ctx = canvas.getContext('2d');
    
    // Fondo blanco
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Patrón cuadrado en las esquinas
    ctx.fillStyle = "#000000";
    ctx.fillRect(10, 10, 40, 40);
    ctx.fillRect(200, 10, 40, 40);
    ctx.fillRect(10, 200, 40, 40);
    
    // Si tiene enlace web, agregar indicador
    if (hasWebUrl) {
        ctx.fillStyle = "#34A853";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText("WEB", 125, 60);
    }
    
    // Texto en el centro
    ctx.fillStyle = "#000000";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText("ORD", 125, 130);
    ctx.fillText(ordenNumero.substring(0, 8), 125, 145);
    ctx.fillText("COD", 125, 165);
    ctx.fillText(codigo.substring(0, 8), 125, 180);
    
    console.log('QR simple generado como fallback');
}

// Hacer la función disponible globalmente
window.generateQRCode = generateQRCode;