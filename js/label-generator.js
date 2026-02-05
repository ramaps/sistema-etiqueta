// label-generator.js - VERSIÓN CON FORZADO DE MAYÚSCULAS

// REFERENCIAS A ELEMENTOS DE VISTA PREVIA
let previewOrdenNumero, previewCodigo, previewDestino, previewMaterials, previewTotalValue, previewLogistica;

// INICIALIZAR REFERENCIAS
document.addEventListener('DOMContentLoaded', function() {
    console.log('Label generator inicializando...');
    
    previewOrdenNumero = document.getElementById('previewOrdenNumero');
    previewCodigo = document.getElementById('previewCodigo');
    previewDestino = document.getElementById('previewDestino');
    previewMaterials = document.getElementById('previewMaterials');
    previewTotalValue = document.getElementById('previewTotalValue');
    previewLogistica = document.getElementById('previewLogistica');
    
    // Configurar evento del formulario
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateLabel();
        });
    }
    
    console.log('Label generator inicializado correctamente');
});

// FUNCIÓN PARA GENERAR LA ETIQUETA
async function generateLabel() {
    console.log('Iniciando generación de etiqueta...');
    
    // CAPTURA DE DATOS Y CONVERSIÓN A MAYÚSCULAS
    const ordenNumero = document.getElementById('ordenNumero') ? document.getElementById('ordenNumero').value.trim().toUpperCase() : '';
    const codigo = document.getElementById('codigo') ? document.getElementById('codigo').value.trim().toUpperCase() : '';
    const destino = document.getElementById('destino') ? document.getElementById('destino').value.trim().toUpperCase() : '';
    
    if (orderMaterials.length === 0) {
        alert('❌ Debe agregar al menos un material a la orden');
        return;
    }

    // Actualizar encabezados de vista previa (Todo en MAYÚSCULAS)
    if (previewOrdenNumero) previewOrdenNumero.textContent = `# ${ordenNumero}`;
    if (previewCodigo) previewCodigo.textContent = `N° PEDIDO: ${codigo}`;
    if (previewDestino) previewDestino.textContent = destino;
    
    // Calcular total
    let cantidadTotal = 0;
    orderMaterials.forEach(item => {
        cantidadTotal += parseFloat(item.cantidad);
    });
    
    if (previewTotalValue) previewTotalValue.textContent = `${cantidadTotal.toFixed(1)} BLS`;

    // Generar código QR inicial
    const qrImageUrl = await window.generateQRCode(ordenNumero, codigo, destino);
    
    // Generar HTML de materiales para la vista previa
    let materialsHTML = '';
    orderMaterials.forEach(item => {
        // Aseguramos mayúsculas en cada campo del material para la vista previa
        materialsHTML += `
            <div class="label-item">
                <div class="label-item-header">
                    <div class="label-cantidad">CANTIDADES:</div>
                    <div class="label-cantidad-total">${parseFloat(item.cantidad).toFixed(1)} BLS</div>
                </div>
                
                <div class="label-sku" style="font-weight: bold; font-family: monospace;">
                    SKU: ${item.sku.toUpperCase()} | LOTE: ${item.lote.toUpperCase()}
                </div>
                <div class="label-descripcion" style="font-size: 1.1rem; font-weight: 900; margin: 3px 0;">
                    ${item.descripcion.toUpperCase()}
                </div>
                <div class="label-sol" style="font-style: italic; color: #444;">
                    SOLICITANTE: ${item.solicitante.toUpperCase()}
                </div>
            </div>
        `;
    });
    
    previewMaterials.innerHTML = materialsHTML;
    
    // Generar código de verificación
    const verificationCode = window.generateVerificationCode ? window.generateVerificationCode(ordenNumero) : 'AGN-000000';
    
    // Pie de la etiqueta
    if (previewLogistica) {
        previewLogistica.innerHTML = `
            <strong>AGROQUIMICOS DEL NORTE S.A.</strong><br>
            <small style="font-size: 10px;">ID: ${verificationCode} | FECHA: ${new Date().toLocaleDateString()}</small>
        `;
    }
    
    // Guardar datos en el objeto global para impresión
    // Procesamos la lista de materiales para que los datos guardados también estén en MAYÚSCULAS
    const materialesMayusculas = orderMaterials.map(m => ({
        ...m,
        solicitante: m.solicitante.toUpperCase(),
        sku: m.sku.toUpperCase(),
        descripcion: m.descripcion.toUpperCase(),
        lote: m.lote.toUpperCase()
    }));

    window.currentLabelData = {
        ordenNumero,
        codigo,
        destino,
        materiales: materialesMayusculas,
        cantidadTotal,
        fecha: new Date().toISOString(),
        verificationCode,
        qrImageUrl: qrImageUrl
    };
    
    // Habilitar botones de acción
    if (window.enableActionButtons) {
        window.enableActionButtons();
    }
    
    console.log('✅ Etiqueta generada con éxito');
    
    // Scroll suave a la vista previa
    document.querySelector('.preview-section').scrollIntoView({ behavior: 'smooth' });
}