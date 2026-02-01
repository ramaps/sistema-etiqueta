// print-functions.js - CORREGIDO PARA A4 Y TÉRMICA (10x15cm)

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

    // Estilos CSS para el tamaño 10x15cm
    const styles = esTermica ? `
        @page { size: 100mm 150mm; margin: 0; }
        body { 
            width: 100mm; height: 150mm; margin: 0; padding: 5mm; 
            box-sizing: border-box; font-family: Arial, sans-serif; 
        }
        .label-container { 
            border: 2px solid black; height: 100%; display: flex; 
            flex-direction: column; padding: 2mm; box-sizing: border-box;
        }
        .header-section { border-bottom: 2px solid black; padding-bottom: 5px; text-align: center; }
        .qr-box { text-align: center; margin: 10px 0; }
        .qr-box img { width: 45mm; height: 45mm; }
        .details { font-size: 14px; margin: 5px 0; line-height: 1.2; }
        .table-materials { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 11px; }
        .table-materials th, .table-materials td { border: 1px solid black; padding: 3px; text-align: left; }
        .total-box { margin-top: auto; border-top: 2px solid black; text-align: center; font-size: 18px; font-weight: bold; }
    ` : `
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Courier New', monospace; }
        .label-container { border: 1px solid #000; padding: 20px; }
        .qr-box img { width: 120px; height: 120px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid black; padding: 8px; }
    `;

    // Generar las filas de materiales
    const filas = data.materiales.map(m => `
        <tr>
            <td>${m.sku}</td>
            <td>${m.descripcion}</td>
            <td>${m.lote}</td>
            <td style="text-align:right">${m.cantidad.toFixed(1)}</td>
        </tr>
    `).join('');

    printWindow.document.write(`
        <html>
        <head>
            <style>${styles}</style>
        </head>
        <body>
            <div class="label-container">
                <div class="header-section">
                    <h2 style="margin:0">AGRONORTE S.A.</h2>
                    <strong>ORDEN: ${data.ordenNumero}</strong>
                </div>

                <div class="details">
                    <div><strong>PEDIDO:</strong> ${data.codigo}</div>
                    <div><strong>DESTINO:</strong> ${data.destino}</div>
                </div>

                <div class="qr-box">
                    <img src="${data.qrImageUrl}">
                </div>

                <table class="table-materials">
                    <thead>
                        <tr><th>SKU</th><th>DESC.</th><th>LOTE</th><th>CANT</th></tr>
                    </thead>
                    <tbody>${filas}</tbody>
                </table>

                <div class="total-box">
                    TOTAL: ${data.cantidadTotal.toFixed(1)} BLS
                    <div style="font-size:9px; font-weight:normal;">Verificación: ${data.verificationCode}</div>
                </div>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => window.close(), 500);
                }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}