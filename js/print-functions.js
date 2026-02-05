// print-functions.js - VERSIÓN FINAL CON FUENTES AJUSTADAS Y SIN CORTES

document.addEventListener('DOMContentLoaded', function() {
    const printSingleBtn = document.getElementById('printSingleBtn');
    const printThermalBtn = document.getElementById('printThermalBtn');

    if (printSingleBtn) {
        printSingleBtn.addEventListener('click', () => abrirVentanaImpresion('A4'));
    }
    if (printThermalBtn) {
        printThermalBtn.addEventListener('click', () => abrirVentanaImpresion('THERMAL'));
    }
});

function abrirVentanaImpresion(tipo) {
    if (!window.currentLabelData) {
        alert('❌ No hay datos para imprimir');
        return;
    }

    const data = window.currentLabelData;
    const esTermica = (tipo === 'THERMAL');
    const printWindow = window.open('', '_blank');

    const printForceStyle = `
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
    `;

    // En la línea donde defines el tamaño de página térmica (actualmente línea ~20):
// Cambia de: @page { size: 100mm 150mm; margin: 0; }
// A: @page { size: 100mm 190mm; margin: 0; }

// También puedes ajustar el padding del body si es necesario:
// body { width: 100mm; padding: 6mm; ... }

// VERSIÓN CORREGIDA:
const styles = esTermica ? `
    @page { size: 100mm 190mm; margin: 0; }
    body { width: 100mm; padding: 6mm; font-family: 'Helvetica', Arial, sans-serif; color: #000; line-height: 1.2; }
    
    .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #000; padding-bottom: 12px; margin-bottom: 15px; }
    .header-qr { width: 30mm; height: 30mm; flex-shrink: 0; }
    .info-header { text-align: right; text-transform: uppercase; margin-left: 10px; }
    .label-xs { font-size: 10px; color: #666; font-weight: bold; }
    .val-orden { font-size: 17px; font-weight: bold; margin-bottom: 4px; }
    .val-pedido { font-size: 28px; font-weight: 900; line-height: 1; }

    .destino-box { background: #f2f2f2; padding: 10px; border-left: 6px solid #000; margin-bottom: 15px; ${printForceStyle} }
    .destino-box .val { font-size: 20px; font-weight: bold; text-transform: uppercase; }

    .item-row { border-bottom: 1px solid #ccc; padding: 10px 0; }
    .desc-main { font-size: 15px; font-weight: bold; display: block; text-transform: uppercase; }
    
    /* AJUSTE TÉRMICA: SKU Y SOLICITANTE UN POCO MÁS GRANDES */
    .desc-sub { font-size: 12px; color: #333; font-family: monospace; font-weight: bold; }

    .cant-val { font-size: 20px; font-weight: bold; text-align: right; vertical-align: middle; }

    .total-container { page-break-inside: avoid; margin-top: 15px; }
    .total-card { 
        background: #000 !important; 
        color: #fff !important; 
        padding: 15px; 
        text-align: center; 
        ${printForceStyle}
    }
    .total-num { font-size: 32px; font-weight: bold; display: block; }

    .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; page-break-inside: avoid; }
    .brand-name { font-size: 13px; font-weight: 900; }
    .brand-id { font-size: 10px; color: #888; font-family: monospace; }
    ` : `
        @page { size: A4; margin: 10mm 15mm; }
        body { font-family: 'Helvetica', Arial, sans-serif; color: #333; line-height: 1.4; }
        
        .header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
        .header-qr { width: 35mm; height: 35mm; }
        .info-principal { text-align: right; }
        .label-mini { font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase; }
        .val-orden { font-size: 26px; font-weight: bold; color: #000; margin-bottom: 5px; }
        .val-pedido { font-size: 45px; font-weight: 900; color: #000; line-height: 1; }
        
        .destino-box { background: #f2f2f2; padding: 20px; border-left: 8px solid #000; margin-bottom: 25px; ${printForceStyle} }
        .destino-box .val { font-size: 30px; font-weight: bold; text-transform: uppercase; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        th { background: #000; color: #fff; text-align: left; padding: 12px; font-size: 14px; text-transform: uppercase; ${printForceStyle} }
        td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 15px; }
        
        .col-cant { text-align: right; font-weight: bold; font-size: 22px; }
        
        /* AJUSTE A4: SKU Y SOLICITANTE UN POCO MÁS GRANDES */
        .sku-txt { font-size: 13px; color: #444; font-family: monospace; font-weight: bold; display: block; }
        .desc-txt { font-weight: bold; font-size: 18px; display: block; margin: 2px 0; }

        .pie-pagina { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 3px solid #000;
            page-break-inside: avoid; 
        }
        
        .total-card { 
            background: #000 !important; 
            color: #fff !important; 
            padding: 20px 40px; 
            text-align: right; 
            min-width: 260px;
            ${printForceStyle}
        }
        .total-num { font-size: 42px; font-weight: bold; display: block; }
        .brand-name { font-size: 22px; font-weight: 900; color: #000; }
        .brand-id { font-size: 12px; color: #666; font-family: monospace; }
    `;

    let cuerpoHTML = '';
    if (esTermica) {
        data.materiales.forEach(item => {
            cuerpoHTML += `
                <div class="item-row">
                    <table style="width:100%">
                        <tr>
                            <td>
                                <span class="desc-sub">SKU: ${item.sku} | LOTE: ${item.lote}</span><br>
                                <span class="desc-main">${item.descripcion.toUpperCase()}</span>
                                <span class="desc-sub">SOLICITANTE: ${item.solicitante}</span>
                            </td>
                            <td class="cant-val">${parseFloat(item.cantidad).toFixed(1)}</td>
                        </tr>
                    </table>
                </div>`;
        });
    } else {
        cuerpoHTML = `
            <table>
                <thead>
                    <tr><th>Detalle del Material</th><th style="text-align:right;">Cant.</th></tr>
                </thead>
                <tbody>
                    ${data.materiales.map(item => `
                        <tr>
                            <td>
                                <span class="sku-txt">SKU: ${item.sku} | LOTE: ${item.lote}</span>
                                <span class="desc-txt">${item.descripcion.toUpperCase()}</span>
                                <span class="sku-txt">SOLICITANTE: ${item.solicitante}</span>
                            </td>
                            <td class="col-cant">${parseFloat(item.cantidad).toFixed(1)} <small style="font-size:14px">BLS</small></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    }

    const content = esTermica ? `
        <div class="header-container">
            <img src="${data.qrImageUrl}" class="header-qr">
            <div class="info-header">
                <div class="label-xs">Orden</div>
                <div class="val-orden"># ${data.ordenNumero}</div>
                <div class="label-xs">N° Pedido</div>
                <div class="val-pedido">${data.codigo}</div>
            </div>
        </div>
        <div class="destino-box">
            <div class="label-xs">Destino</div>
            <div class="val">${data.destino.toUpperCase()}</div>
        </div>
        ${cuerpoHTML}
        <div class="total-container">
            <div class="total-card">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Total General</div>
                <div class="total-num">${parseFloat(data.cantidadTotal).toFixed(1)} BLS</div>
            </div>
        </div>
        <div class="footer">
            <div class="brand-name">AGROQUIMICOS DEL NORTE S.A.</div>
            <div class="brand-id">ID: ${data.verificationCode}</div>
        </div>
    ` : `
        <div class="header-container">
            <img src="${data.qrImageUrl}" class="header-qr">
            <div class="info-principal">
                <div class="label-mini">Orden de Carga</div>
                <div class="val-orden"># ${data.ordenNumero}</div>
                <div class="label-mini">Número de Pedido</div>
                <div class="val-pedido">${data.codigo}</div>
            </div>
        </div>
        <div class="destino-box">
            <div class="label-mini">Destino del Material</div>
            <div class="val">${data.destino.toUpperCase()}</div>
        </div>
        ${cuerpoHTML}
        <div class="pie-pagina">
            <div class="brand-box">
                <div class="brand-name">AGROQUIMICOS DEL NORTE S.A.</div>
                <div class="brand-id">ID VERIFICACIÓN: ${data.verificationCode}</div>
            </div>
            <div class="total-card">
                <span style="font-size:14px; text-transform:uppercase; display:block; margin-bottom:5px; opacity:0.9;">Total General</span>
                <span class="total-num">${parseFloat(data.cantidadTotal).toFixed(1)} <small style="font-size:18px">BLS</small></span>
            </div>
        </div>
    `;

    printWindow.document.write(`<html><head><title>Impresión</title><style>${styles}</style></head><body>${content}</body></html>`);
    printWindow.document.close();
    
    setTimeout(() => { 
        printWindow.print(); 
        printWindow.close(); 
    }, 800);
}