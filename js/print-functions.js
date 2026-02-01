// print-functions.js - CORREGIDO PARA A4 Y TÉRMICA (10x15cm)

document.addEventListener('DOMContentLoaded', function() {
    const printSingleBtn = document.getElementById('printSingleBtn'); // Botón A4
    const printThermalBtn = document.getElementById('printThermalBtn'); // Botón Térmico

    if (printSingleBtn) {
        printSingleBtn.addEventListener('click', () => imprimirEtiqueta('A4'));
    }
    if (printThermalBtn) {
        printThermalBtn.addEventListener('click', () => imprimirEtiqueta('THERMAL'));
    }
});

function imprimirEtiqueta(tipo) {
    if (!window.currentLabelData) {
        alert('❌ Error: No hay datos de etiqueta para imprimir. Genere la etiqueta primero.');
        return;
    }

    const data = window.currentLabelData;
    const materiales = data.materiales || [];
    const esTermica = (tipo === 'THERMAL');

    const printWindow = window.open('', '_blank');
    
    // Configuración de estilos según el tipo de papel
    const styles = esTermica ? `
        @page { size: 100mm 150mm; margin: 0; }
        body { width: 100mm; height: 150mm; margin: 0; padding: 5mm; box-sizing: border-box; font-family: Arial, sans-serif; }
        .container { border: 2px solid black; height: 100%; display: flex; flex-direction: column; padding: 2mm; }
        .header { text-align: center; border-bottom: 2px solid black; margin-bottom: 5px; }
        .qr-section { display: flex; justify-content: center; margin: 10px 0; }
        .qr-section img { width: 45mm; height: 45mm; }
        .data-row { font-size: 12px; margin: 3px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 18px; font-weight: bold; text-align: center; margin-top: auto; border-top: 2px solid black; }
    ` : `
        @page { size: A4; margin: 10mm; }
        body { font-family: 'Courier New', monospace; padding: 20px; }
        .container { border: 1px solid #000; padding: 20px; max-width: 800px; margin: auto; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid black; }
        .qr-section img { width: 120px; height: 120px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; }
    `;

    // Construcción del HTML de materiales
    let materialesHtml = materiales.map(m => `
        <tr>
            <td>${m.sku}</td>
            <td>${m.descripcion}</td>
            <td>${m.lote}</td>
            <td style="text-align:right">${m.cantidad.toFixed(1)}</td>
        </tr>
    `).join('');

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Imprimir - ${data.ordenNumero}</title>
            <style>${styles}</style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div>
                        <h2 style="margin:0">AGRONORTE S.A.</h2>
                        <p style="margin:0">ORDEN: ${data.ordenNumero}</p>
                    </div>
                    ${!esTermica ? `<div class="qr-section"><img src="${data.qrImageUrl}"></div>` : ''}
                </div>

                <div class="info">
                    <p class="data-row"><strong>PEDIDO:</strong> ${data.codigo}</p>
                    <p class="data-row"><strong>DESTINO:</strong> ${data.destino}</p>
                </div>

                ${esTermica ? `<div class="qr-section"><img src="${data.qrImageUrl}"></div>` : ''}

                <table>
                    <thead>
                        <tr><th>SKU</th><th>DESC.</th><th>LOTE</th><th>CANT</th></tr>
                    </thead>
                    <tbody>
                        ${materialesHtml}
                    </tbody>
                </table>

                <div class="total">
                    TOTAL BOLSAS: ${data.cantidadTotal.toFixed(1)} BLS
                    <div style="font-size: 10px;">Verif: ${data.verificationCode}</div>
                </div>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(() => { window.close(); }, 500);
                };
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
}