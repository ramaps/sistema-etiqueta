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
    
    const ordenNumero = document.getElementById('ordenNumero') ? document.getElementById('ordenNumero').value.trim() : '';
    const codigo = document.getElementById('codigo') ? document.getElementById('codigo').value.trim() : '';
    const destino = document.getElementById('destino') ? document.getElementById('destino').value.trim() : '';
    
    console.log('Datos obtenidos:', { ordenNumero, codigo, destino });
    
    if (!ordenNumero || !codigo || !destino) {
        alert('Por favor complete los datos de la orden');
        return;
    }
    
    if (orderMaterials.length === 0) {
        alert('Por favor agregue al menos un material a la orden');
        return;
    }
    
    // 1. Actualizar vista previa
    updateLabelPreview(ordenNumero, codigo, destino);
    
    // 2. Generar QR (si la función está disponible)
    if (typeof window.generateQRCode === 'function') {
        console.log('Generando QR...');
        window.generateQRCode(ordenNumero, codigo, destino);
    }
    
    // 3. Habilitar botones
    if (typeof window.enableActionButtons === 'function') {
        window.enableActionButtons();
    }
    
    console.log('Etiqueta generada correctamente');
}

// ACTUALIZAR VISTA PREVIA DE LA ETIQUETA
function updateLabelPreview(ordenNumero, codigo, destino) {
    console.log('Actualizando vista previa...');
    
    if (!previewOrdenNumero || !previewCodigo || !previewDestino || !previewMaterials || !previewTotalValue || !previewLogistica) {
        console.error('Faltan elementos de vista previa');
        return;
    }
    
    // Actualizar datos generales
    previewOrdenNumero.textContent = ordenNumero;
    previewCodigo.textContent = `N de Pedido: ${codigo}`;
    previewDestino.textContent = destino.toUpperCase();
    
    // Calcular cantidad total
    const cantidadTotal = orderMaterials.reduce((sum, item) => sum + item.cantidad, 0);
    
    // Actualizar total en vista previa
    const previewCantidadTotal = document.getElementById('previewCantidadTotal');
    if (previewCantidadTotal) {
        previewCantidadTotal.textContent = `${cantidadTotal.toFixed(1)} BLS`;
    }
    previewTotalValue.textContent = `${cantidadTotal.toFixed(1)} BLS`;
    
    // Generar HTML para los materiales
    let materialsHTML = '';
    
    orderMaterials.forEach((item, index) => {
        materialsHTML += `
            <div class="label-item" ${index < orderMaterials.length - 1 ? 'style="margin-bottom: 15px; padding-bottom: 12px; border-bottom: 1px dashed #999;"' : ''}>
                <div class="label-item-header">
                    <div class="label-cantidad">CANTIDADES:</div>
                    <div class="label-cantidad-total">${item.cantidad.toFixed(1)} BLS</div>
                </div>
                
                <div class="label-sku">SKU: ${item.sku}</div>
                <div class="label-descripcion">${item.descripcion}</div>
                <div class="label-lote">LOTE: ${item.lote} -</div>
                <div class="label-sol">SOL.: ${item.solicitante}</div>
                <div class="label-bandera">BANDERA - ${item.bandera || 'SIN CÓDIGO'}</div>
            </div>
        `;
    });
    
    previewMaterials.innerHTML = materialsHTML;
    
    // Generar código de verificación
    const verificationCode = window.generateVerificationCode ? window.generateVerificationCode(ordenNumero) : 'VER-00000000';
    
    // Pie de la etiqueta
    previewLogistica.innerHTML = `
        AGROQUIMICOS DEL NORTE S.A.<br>
        <small style="font-size: 10px;">Código: ${verificationCode} | ${new Date().toLocaleDateString('es-ES')}</small>
    `;
    
    // Guardar datos actuales
    currentLabelData = {
        ordenNumero,
        codigo,
        destino,
        materiales: [...orderMaterials],
        cantidadTotal,
        fecha: new Date().toISOString(),
        verificationCode,
        qrImageUrl: qrImageUrl
    };
    
    console.log('Datos de etiqueta guardados:', { 
        orden: ordenNumero, 
        materiales: orderMaterials.length,
        qrDisponible: !!qrImageUrl 
    });
}