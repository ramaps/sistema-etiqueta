// google-drive-simple.js - SUBIR PÁGINAS WEB A GOOGLE DRIVE (VERSIÓN CORREGIDA)

const GOOGLE_DRIVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwEcYcKJ1c7l6YJM90XJ1Nfkqeo0whIbNZyJ0NdRod4k65LBbGuuOI0854nWdDpHfE/exec";

// Función principal para crear página web - VERSIÓN MEJORADA
async function createWebPage() {
    console.log('🌐 CREANDO PÁGINA WEB EN GOOGLE DRIVE');
    console.log('🔗 URL API:', GOOGLE_DRIVE_WEB_APP_URL);
    
    if (!currentLabelData) {
        alert('❌ Primero debe generar una etiqueta');
        return;
    }
    
    // Verificar que tenemos datos mínimos
    if (!currentLabelData.ordenNumero || !currentLabelData.codigo || !currentLabelData.destino) {
        alert('❌ Faltan datos de la orden (número, código o destino)');
        return;
    }
    
    const loading = showLoading('Creando página web...');
    
    try {
        // 1. Generar el HTML de la página web
        const htmlContent = generateWebPageHTML();
        console.log('📄 HTML generado:', htmlContent.length, 'caracteres');
        
        // 2. Preparar datos para enviar
        const payload = {
            action: 'createWebPage',
            ordenNumero: currentLabelData.ordenNumero,
            codigo: currentLabelData.codigo,
            destino: currentLabelData.destino,
            fileName: `etiqueta_${currentLabelData.ordenNumero}.html`,
            htmlContent: htmlContent,
            timestamp: new Date().toISOString(),
            verificationCode: currentLabelData.verificationCode,
            totalBolsas: currentLabelData.cantidadTotal,
            materiales: currentLabelData.materiales
        };
        
        console.log('📦 Payload preparado:', JSON.stringify(payload, null, 2));
        
        // 3. Enviar a Google Drive usando XMLHttpRequest (más compatible)
        updateLoading(loading, 'Subiendo a Google Drive...');
        
        const result = await sendToGoogleDrive(payload);
        console.log('✅ Respuesta recibida:', result);
        
        if (!result.success) {
            throw new Error(result.error || 'Error del servidor');
        }
        
        // 4. ÉXITO - Procesar respuesta
        hideLoading(loading);
        
        // Guardar URL
        currentWebPageUrl = result.webUrl;
        currentLabelData.webUrl = result.webUrl;
        
        // Actualizar QR
        updateQRWithWebLink();
        
        // Mostrar éxito
        const successMessage = 
            `✅ PÁGINA WEB CREADA EXITOSAMENTE\n\n` +
            `📁 Archivo: ${result.fileName}\n` +
            `🌐 URL: ${currentWebPageUrl}\n` +
            `📦 Materiales: ${result.materialsCount || currentLabelData.materiales.length}\n` +
            `📊 Total: ${result.totalBolsas || currentLabelData.cantidadTotal} BLS\n\n` +
            `El código QR ha sido actualizado para apuntar a esta página web.`;
        
        const userChoice = confirm(successMessage + '\n\n¿Deseas abrir la página ahora?');
        
        if (userChoice) {
            window.open(currentWebPageUrl, '_blank', 'noopener,noreferrer');
        }
        
        // Copiar enlace al portapapeles
        if (window.copyToClipboard) {
            window.copyToClipboard(currentWebPageUrl);
            alert('🔗 Enlace copiado al portapapeles');
        }
        
        return result;
        
    } catch (error) {
        hideLoading(loading);
        console.error('❌ Error en createWebPage:', error);
        
        // Mostrar error detallado
        let errorMessage = `❌ ERROR AL CREAR PÁGINA WEB\n\n${error.message}`;
        
        if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
            errorMessage += '\n\n🔍 Posibles causas:\n' +
                          '1. Problemas de red/conexión\n' +
                          '2. CORS bloqueado por el navegador\n' +
                          '3. Apps Script no configurado correctamente\n' +
                          '4. Timeout de la solicitud';
        }
        
        errorMessage += '\n\nPuedes configurar el enlace manualmente.';
        
        alert(errorMessage);
        
        // Ofrecer configuración manual
        showManualConfig();
        
        return { success: false, error: error.message };
    }
}

// Función mejorada para enviar datos a Google Drive usando XMLHttpRequest
async function sendToGoogleDrive(payload) {
  console.log('🚀 Enviando datos via GET (para evitar CORS)...');
  
  try {
    // Convertir payload a parámetros GET
    const params = new URLSearchParams({
      action: 'createWebPage',
      data: JSON.stringify(payload),
      timestamp: Date.now().toString(),
      format: 'json'
    });
    
    const url = GOOGLE_DRIVE_WEB_APP_URL + '?' + params.toString();
    console.log('🔗 URL GET:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Respuesta recibida:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error en sendToGoogleDrive:', error);
    throw error;
  }
}

// Función para probar la conexión con el API
async function testDriveConnection() {
    console.log('🔍 Probando conexión con Google Drive API...');
    
    try {
        const testUrl = GOOGLE_DRIVE_WEB_APP_URL + '?ping=true&test=' + Date.now();
        console.log('🔗 Test URL:', testUrl);
        
        const response = await fetch(testUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Test exitoso:', data);
        
        return {
            success: true,
            message: `✅ API funcionando\nVersión: ${data.version}\nEstado: ${data.status}\nCapacidades: ${data.capabilities?.join(', ') || 'N/A'}`,
            data: data
        };
        
    } catch (error) {
        console.error('❌ Test fallido:', error);
        return {
            success: false,
            message: `❌ Error en la conexión:\n${error.message}`,
            error: error
        };
    }
}

// Generar HTML de la página web (optimizado)
function generateWebPageHTML() {
    if (!currentLabelData) return '';
    
    const { ordenNumero, codigo, destino, materiales, cantidadTotal, verificationCode } = currentLabelData;
    
    const fecha = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let materialesHTML = '';
    if (materiales && materiales.length > 0) {
        materiales.forEach((item, index) => {
            materialesHTML += `
                <div class="material-item">
                    <div class="material-row">
                        <strong>SKU:</strong> ${item.sku || 'N/A'}
                    </div>
                    <div class="material-row">
                        <strong>Descripción:</strong> ${item.descripcion || 'N/A'}
                    </div>
                    <div class="material-row">
                        <strong>Lote:</strong> ${item.lote || 'N/A'}
                    </div>
                    <div class="material-row">
                        <strong>Cantidad:</strong> ${(item.cantidad || 0).toFixed(1)} BLS
                    </div>
                    <div class="material-row">
                        <strong>Solicitante:</strong> ${item.solicitante || 'N/A'}
                    </div>
                    ${item.bandera ? `<div class="material-row"><strong>Bandera:</strong> ${item.bandera}</div>` : ''}
                    ${index < materiales.length - 1 ? '<hr>' : ''}
                </div>
            `;
        });
    } else {
        materialesHTML = '<p>No hay materiales registrados.</p>';
    }
    
    return `
        <div class="materials-container">
            <h2>📦 Materiales de la Orden</h2>
            ${materialesHTML}
        </div>
    `;
}

// Actualizar QR con enlace web (mejorado)
function updateQRWithWebLink() {
    if (!currentWebPageUrl || !currentLabelData) {
        console.warn('⚠️ No hay datos para actualizar QR');
        return;
    }
    
    console.log('🔄 Actualizando QR con enlace web:', currentWebPageUrl);
    
    // Crear texto para QR (enlace web + datos básicos)
    const qrContent = `${currentWebPageUrl}\n\n` +
        `AGRONORTE - ORDEN ${currentLabelData.ordenNumero}\n` +
        `Pedido: ${currentLabelData.codigo}\n` +
        `Destino: ${currentLabelData.destino}\n` +
        `Total: ${currentLabelData.cantidadTotal} BLS\n` +
        `Código: ${currentLabelData.verificationCode}`;
    
    // Regenerar QR si la función está disponible
    if (typeof window.generateQRCode === 'function') {
        console.log('🔀 Regenerando QR con nuevo enlace');
        window.generateQRCode(
            currentLabelData.ordenNumero,
            currentLabelData.codigo,
            currentLabelData.destino
        );
    }
    
    // Agregar indicador visual de que tiene enlace web
    const qrContainer = document.getElementById('labelQR');
    if (qrContainer) {
        // Limpiar indicadores anteriores
        const oldIndicators = qrContainer.querySelectorAll('.web-indicator');
        oldIndicators.forEach(ind => ind.remove());
        
        // Agregar nuevo indicador
        const indicator = document.createElement('div');
        indicator.className = 'web-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            background: #34A853;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            z-index: 10;
            cursor: help;
        `;
        indicator.innerHTML = '<i class="fas fa-globe"></i>';
        indicator.title = 'Página web disponible\nClic para abrir';
        
        // Hacer clicable
        indicator.onclick = function(e) {
            e.stopPropagation();
            window.open(currentWebPageUrl, '_blank', 'noopener,noreferrer');
        };
        
        qrContainer.style.position = 'relative';
        qrContainer.appendChild(indicator);
        
        console.log('✅ Indicador web agregado al QR');
    }
}

// Configuración manual (fallback mejorado)
function showManualConfig() {
    const defaultUrl = currentWebPageUrl || 
                     `https://drive.google.com/file/d/EXAMPLE_ID/view?usp=sharing`;
    
    const url = prompt(
        '🔧 CONFIGURAR ENLACE MANUALMENTE\n\n' +
        'Pega aquí la URL de la página web:\n' +
        '(Puede ser de Google Drive o cualquier hosting)\n\n' +
        'Ejemplo: https://drive.google.com/file/d/ID_DEL_ARCHIVO/view',
        defaultUrl
    );
    
    if (!url || !url.trim()) {
        console.log('⚠️ Configuración manual cancelada');
        return;
    }
    
    // Validar URL básica
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('⚠️ La URL debe comenzar con http:// o https://');
        return;
    }
    
    currentWebPageUrl = url.trim();
    
    if (currentLabelData) {
        currentLabelData.webUrl = url.trim();
    }
    
    updateQRWithWebLink();
    
    alert('✅ Enlace configurado manualmente\n\nEl QR ahora apunta a esta URL.\nPuedes escanearlo para acceder a la página web.');
    
    // Preguntar si quiere abrirla
    if (confirm('¿Deseas abrir la página web ahora?')) {
        window.open(currentWebPageUrl, '_blank', 'noopener,noreferrer');
    }
}

// ========== FUNCIONES AUXILIARES ==========

function showLoading(message) {
    const div = document.createElement('div');
    div.id = 'drive-upload-loading';
    div.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(3px);
    `;
    
    div.innerHTML = `
        <div style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); padding: 30px; border-radius: 15px; text-align: center; min-width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid #e0e0e0;">
            <div style="width: 60px; height: 60px; border: 5px solid #f3f3f3; border-top: 5px solid #4285F4; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
            <p id="drive-loading-text" style="color: #2c3e50; font-weight: bold; margin: 0 0 10px 0; font-size: 18px;">
                ${message}
            </p>
            <p style="color: #666; font-size: 14px; margin: 0;">
                Esto puede tomar unos segundos...
            </p>
            <div style="margin-top: 15px; padding: 8px; background: #f0f7ff; border-radius: 6px; border: 1px solid #d0e3ff;">
                <small style="color: #4285F4;">
                    <i class="fas fa-info-circle"></i> Conectando con Google Drive
                </small>
            </div>
        </div>
    `;
    
    document.body.appendChild(div);
    return div;
}

function updateLoading(loadingDiv, newText) {
    const textElement = loadingDiv.querySelector('#drive-loading-text');
    if (textElement) textElement.textContent = newText;
}

function hideLoading(loadingDiv) {
    if (loadingDiv && loadingDiv.parentNode) {
        loadingDiv.remove();
    }
}

// ========== INICIALIZACIÓN MEJORADA ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Google Drive Web Page module loaded');
    console.log('🔗 API URL:', GOOGLE_DRIVE_WEB_APP_URL);
    
    const createWebPageBtn = document.getElementById('createWebPageBtn');
    if (createWebPageBtn) {
        // Agregar evento al botón principal
        createWebPageBtn.addEventListener('click', createWebPage);
        
        // Agregar botón de prueba (opcional, para debug)
        addTestButton();
        
        console.log('✅ Botón "Crear Página Web" configurado');
    } else {
        console.error('❌ No se encontró el botón createWebPageBtn');
    }
});

// Función para agregar botón de prueba (debug)
function addTestButton() {
    // Solo agregar en desarrollo
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const testBtn = document.createElement('button');
        testBtn.className = 'btn btn-small';
        testBtn.innerHTML = '<i class="fas fa-vial"></i> Probar Conexión';
        testBtn.style.marginLeft = '10px';
        testBtn.style.marginTop = '5px';
        testBtn.style.fontSize = '12px';
        testBtn.onclick = async function() {
            const result = await testDriveConnection();
            alert(result.message);
        };
        
        const createWebPageBtn = document.getElementById('createWebPageBtn');
        if (createWebPageBtn && createWebPageBtn.parentNode) {
            createWebPageBtn.parentNode.appendChild(testBtn);
        }
    }
}

// Hacer funciones disponibles globalmente
window.createWebPage = createWebPage;
window.testDriveConnection = testDriveConnection;
window.showManualConfig = showManualConfig;