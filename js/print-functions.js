// print-functions.js - VERSIÓN CORREGIDA
// Esperar a que el DOM esté completamente cargado

document.addEventListener('DOMContentLoaded', function() {
    console.log('Print functions inicializando...');
    
    // Referencias a botones de impresión
    const printSingleBtn = document.getElementById('printSingleBtn');
    const printThermalBtn = document.getElementById('printThermalBtn');
    
    // Verificar que los elementos existen antes de agregar event listeners
    if (!printSingleBtn) {
        console.error('❌ No se encontró el botón printSingleBtn');
        return;
    }
    
    if (!printThermalBtn) {
        console.error('❌ No se encontró el botón printThermalBtn');
        return;
    }
    
    console.log('✅ Botones de impresión encontrados');
    
    // Imprimir etiqueta individual (normal)
    printSingleBtn.addEventListener('click', function() {
        if (!currentLabelData) {
            alert('Primero debe generar una etiqueta');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Imprimir Etiqueta</title>
                <style>
                    body { 
                        margin: 0; 
                        padding: 10px; 
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        line-height: 1.2;
                    }
                    .label-print {
                        width: 100%;
                        max-width: 400px;
                        margin: 0 auto;
                        position: relative;
                    }
                    .label-header {
                        text-align: center;
                        margin-bottom: 10px;
                        padding-bottom: 8px;
                        border-bottom: 2px solid #000;
                        position: relative;
                    }
                    .label-header-top {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 8px;
                    }
                    .label-qr-container {
                        width: 70px;
                        height: 70px;
                        border: 1px solid #ddd;
                        padding: 2px;
                        background: white;
                        flex-shrink: 0;
                    }
                    .label-header-info {
                        flex: 1;
                        text-align: center;
                    }
                    .label-orden {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 3px;
                        letter-spacing: 1px;
                    }
                    .label-orden-numero {
                        font-size: 28px;
                        font-weight: bold;
                        margin-bottom: 10px;
                        letter-spacing: 2px;
                        color: #000;
                        text-transform: uppercase;
                    }
                    .label-codigo {
                        font-size: 28px;
                        font-weight: bold;
                        margin-bottom: 10px;
                        letter-spacing: 2px;
                        color: #000;
                    }
                    .label-destino {
                        font-size: 14px;
                        font-weight: bold;
                        margin-top: 15px;
                        margin-bottom: 3px;
                    }
                    .label-destino-nombre {
                        font-size: 15px;
                        font-weight: bold;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                    }
                    .label-separator {
                        border-top: 2px solid #000;
                        margin: 10px 0;
                    }
                    .label-item {
                        margin-bottom: 15px;
                        padding-bottom: 12px;
                        border-bottom: 1px dashed #999;
                    }
                    .label-item:last-child {
                        border-bottom: none;
                        margin-bottom: 0;
                        padding-bottom: 0;
                    }
                    .label-item-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 4px;
                    }
                    .label-cantidad {
                        font-weight: bold;
                        font-size: 12px;
                    }
                    .label-sku {
                        font-weight: bold;
                        margin-bottom: 2px;
                        font-size: 11px;
                    }
                    .label-descripcion {
                        margin-bottom: 4px;
                        font-weight: bold;
                        font-size: 11px;
                    }
                    .label-lote {
                        margin-bottom: 4px;
                        font-size: 11px;
                    }
                    .label-sol {
                        margin-bottom: 4px;
                        font-size: 11px;
                    }
                    .label-bandera {
                        font-weight: bold;
                        margin-top: 4px;
                        font-size: 11px;
                    }
                    .label-total {
                        margin-top: 12px;
                        padding: 8px;
                        background-color: #f5f5f5;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-weight: bold;
                        text-align: center;
                        font-size: 12px;
                    }
                    .label-total-title {
                        font-size: 14px;
                        color: #000;
                        margin-bottom: 4px;
                    }
                    .label-total-value {
                        font-size: 16px;
                        color: #2c3e50;
                    }
                    .label-footer {
                        margin-top: 15px;
                        text-align: center;
                        font-weight: bold;
                        font-size: 14px;
                        padding-top: 8px;
                        border-top: 2px solid #000;
                    }
                    @media print {
                        body { margin: 0; padding: 0; }
                        .label-print { width: 100%; }
                        .label-qr-container { display: block !important; }
                    }
                </style>
            </head>
            <body>
                <div class="label-print">
                    ${document.querySelector('.label-preview-container')?.innerHTML || 'No hay contenido para imprimir'}
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    };
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    });
    
    // Imprimir etiqueta térmica (80mm × 50mm)
    printThermalBtn.addEventListener('click', function() {
        if (!currentLabelData) {
            alert('Primero debe generar una etiqueta');
            return;
        }
        
        const { ordenNumero, codigo, destino, materiales, cantidadTotal, qrImageUrl, verificationCode } = currentLabelData;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Imprimir Etiqueta Térmica - ${ordenNumero}</title>
                <style>
                    @page {
                        size: 80mm 50mm;
                        margin: 2mm;
                    }
                    
                    body { 
                        margin: 0; 
                        padding: 2mm; 
                        width: 76mm;
                        height: 46mm;
                        font-family: 'Courier New', monospace;
                        font-size: 9px;
                        line-height: 1.1;
                    }
                    
                    .thermal-label {
                        width: 100%;
                        height: 100%;
                        border: 1px solid #000;
                        padding: 2mm;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .thermal-header {
                        text-align: center;
                        margin-bottom: 2mm;
                        padding-bottom: 1mm;
                        border-bottom: 1px solid #000;
                    }
                    
                    .thermal-header-top {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 1mm;
                    }
                    
                    .thermal-qr {
                        width: 25mm;
                        height: 25mm;
                        flex-shrink: 0;
                    }
                    
                    .thermal-header-info {
                        flex: 1;
                        text-align: center;
                        padding-left: 2mm;
                    }
                    
                    .thermal-orden {
                        font-size: 10px;
                        font-weight: bold;
                        margin-bottom: 1px;
                    }
                    
                    .thermal-orden-numero {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 2mm;
                        color: #000;
                        text-transform: uppercase;
                    }
                    
                    .thermal-codigo {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 2mm;
                        letter-spacing: 1px;
                        color: #000;
                    }
                    
                    .thermal-destino {
                        font-size: 9px;
                        font-weight: bold;
                        margin-top: 1mm;
                        margin-bottom: 1px;
                    }
                    
                    .thermal-destino-nombre {
                        font-size: 10px;
                        font-weight: bold;
                        margin-bottom: 2mm;
                        text-transform: uppercase;
                    }
                    
                    .thermal-separator {
                        border-top: 1px solid #000;
                        margin: 1mm 0;
                    }
                    
                    .thermal-content {
                        margin-top: 2mm;
                        max-height: 15mm;
                        overflow: hidden;
                    }
                    
                    .thermal-item {
                        margin-bottom: 1mm;
                    }
                    
                    .thermal-item-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 1px;
                    }
                    
                    .thermal-cantidad {
                        font-weight: bold;
                        font-size: 8px;
                    }
                    
                    .thermal-sku {
                        font-weight: bold;
                        margin-bottom: 1px;
                        font-size: 8px;
                    }
                    
                    .thermal-descripcion {
                        margin-bottom: 1px;
                        font-weight: bold;
                        font-size: 8px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    
                    .thermal-lote {
                        margin-bottom: 1px;
                        font-size: 8px;
                    }
                    
                    .thermal-sol {
                        margin-bottom: 1px;
                        font-size: 8px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    
                    .thermal-bandera {
                        font-weight: bold;
                        margin-top: 1px;
                        font-size: 8px;
                    }
                    
                    .thermal-total {
                        margin-top: 1mm;
                        padding: 1mm;
                        background-color: #f0f0f0;
                        border: 1px solid #ddd;
                        font-weight: bold;
                        text-align: center;
                        font-size: 9px;
                    }
                    
                    .thermal-footer {
                        margin-top: 1mm;
                        text-align: center;
                        font-weight: bold;
                        font-size: 9px;
                        padding-top: 1mm;
                        border-top: 1px solid #000;
                    }
                    
                    @media print {
                        body { 
                            margin: 0; 
                            padding: 0; 
                            width: 80mm;
                            height: 50mm;
                        }
                        
                        .thermal-label {
                            width: 76mm;
                            height: 46mm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="thermal-label">
                    <div class="thermal-header">
                        <div class="thermal-header-top">
                            ${qrImageUrl ? 
                                `<div class="thermal-qr">
                                    <img src="${qrImageUrl}" style="width: 25mm; height: 25mm;" alt="QR">
                                </div>` : 
                                '<div class="thermal-qr"></div>'
                            }
                            
                            <div class="thermal-header-info">
                                <div class="thermal-orden">ORDEN:</div>
                                <div class="thermal-orden-numero">${ordenNumero}</div>
                                <div class="thermal-codigo">N° Pedido: ${codigo}</div>
                                <div class="thermal-destino">DESTINO:</div>
                                <div class="thermal-destino-nombre">${destino.substring(0, 20)}${destino.length > 20 ? '...' : ''}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="thermal-separator"></div>
                    
                    <div class="thermal-content">
                        ${materiales.slice(0, 2).map(item => `
                            <div class="thermal-item">
                                <div class="thermal-item-header">
                                    <div class="thermal-cantidad">CANTIDADES:</div>
                                    <div class="thermal-cantidad">${item.cantidad.toFixed(1)} BLS</div>
                                </div>
                                
                                <div class="thermal-sku">SKU: ${item.sku}</div>
                                <div class="thermal-descripcion" title="${item.descripcion}">${item.descripcion.substring(0, 25)}${item.descripcion.length > 25 ? '...' : ''}</div>
                                <div class="thermal-lote">LOTE: ${item.lote}</div>
                                <div class="thermal-sol" title="${item.solicitante}">SOL: ${item.solicitante.substring(0, 20)}${item.solicitante.length > 20 ? '...' : ''}</div>
                                <div class="thermal-bandera">BANDERA: ${item.bandera || '---'}</div>
                            </div>
                        `).join('')}
                        
                        ${materiales.length > 2 ? `<div style="text-align: center; font-style: italic; font-size: 8px;">+${materiales.length - 2} materiales más</div>` : ''}
                    </div>
                    
                    <div class="thermal-total">
                        <div>TOTAL: ${cantidadTotal.toFixed(1)} BLS</div>
                        <div style="font-size: 7px; margin-top: 1px;">Código: ${verificationCode}</div>
                    </div>
                    
                    <div class="thermal-footer">AGROQUIMICOS DEL NORTE S.A.</div>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    };
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    });
    
    console.log('✅ Print functions inicializados correctamente');
});