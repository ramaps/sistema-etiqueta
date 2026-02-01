// print-functions.js - VERSIÓN CON QR INCLUIDO

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

    // Verificar si tenemos URL del QR
    const qrUrl = data.qrImageUrl || '';
    const tieneQR = qrUrl && qrUrl.startsWith('data:image');
    
    // TAMAÑOS:
    // A4: 210mm × 297mm (normalmente con márgenes)
    // Térmica: 100mm × 150mm (10x15cm)
    
    const esA4 = !esTermica;
    
    // Estilos CSS según el tipo de impresión
    const styles = esTermica ? `
        @page { 
            size: 100mm 150mm; 
            margin: 0; 
        }
        body { 
            margin: 0;
            padding: 3mm;
            width: 94mm;  /* 100mm - 6mm de padding total */
            height: 144mm; /* 150mm - 6mm de padding total */
            font-family: 'Courier New', monospace;
            font-size: 10px;
            line-height: 1.2;
        }
        .label-container {
            border: none;
            padding: 0;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .qr-container {
            width: 25mm;
            height: 25mm;
            border: 1px solid #ccc;
            padding: 1mm;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 4mm auto;
        }
        .qr-container img {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            image-rendering: crisp-edges;
        }
    ` : `
        @page { 
            size: A4; 
            margin: 15mm; 
        }
        body { 
            margin: 0;
            padding: 15mm;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.3;
        }
        .label-container {
            border: 1px solid #000;
            padding: 15px;
            max-width: 700px;
            margin: 0 auto;
            position: relative;
            min-height: 250mm;
        }
        .qr-container {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 60px;
            height: 60px;
            border: 1px solid #ccc;
            padding: 2px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .qr-container img {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
        }
        .header-with-qr {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        .header-text {
            flex: 1;
        }
    `;

    // Generar el contenido de materiales en el nuevo formato
    let materialsHTML = '';
    
    data.materiales.forEach((item, index) => {
        materialsHTML += `
            <div class="material-section" style="margin-bottom: ${esTermica ? '10px' : '15px'}; padding-bottom: ${esTermica ? '8px' : '12px'}; ${index < data.materiales.length - 1 ? 'border-bottom: 1px solid #999;' : ''}">
                <div style="font-weight: bold; margin-bottom: 4px; font-size: ${esTermica ? '10px' : '12px'};">
                    CANTIDADES:
                </div>
                <div style="margin-bottom: 2px; font-size: ${esTermica ? '9px' : '11px'};">
                    <strong>SKU:</strong> ${item.sku}
                </div>
                <div style="margin-bottom: 2px; font-size: ${esTermica ? '9px' : '11px'}; font-weight: bold;">
                    ${item.descripcion}
                </div>
                <div style="margin-bottom: 2px; font-size: ${esTermica ? '9px' : '11px'};">
                    <strong>LOTE:</strong> ${item.lote} - <strong>SOL.:</strong> ${item.solicitante}
                </div>
                <div style="margin-bottom: 2px; font-size: ${esTermica ? '9px' : '11px'};">
                    <strong>BANDERA -</strong> ${item.bandera || 'SIN CÓDIGO'}
                </div>
                <div style="text-align: right; font-size: ${esTermica ? '12px' : '14px'}; font-weight: bold; margin-top: 4px;">
                    ${item.cantidad.toFixed(1)} BLS
                </div>
            </div>
        `;
    });

    // Generar la fecha en formato día/mes/año
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });

    // Generar HTML del QR si existe
    const qrHTML = tieneQR ? `
        <div class="qr-container">
            <img src="${qrUrl}" alt="QR Code" style="width: 100%; height: 100%;">
        </div>
    ` : '';

    printWindow.document.write(`
        <html>
        <head>
            <title>Etiqueta ${data.ordenNumero}</title>
            <style>
                ${styles}
                
                /* Estilos comunes */
                .label-container * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                .header-section {
                    ${esA4 ? 'display: flex; justify-content: space-between; align-items: flex-start;' : 'text-align: center;'}
                    margin-bottom: ${esTermica ? '8px' : '15px'};
                }
                
                .header-content {
                    ${esA4 ? 'flex: 1;' : ''}
                }
                
                .orden-numero {
                    font-size: ${esTermica ? '28px' : '36px'};
                    font-weight: bold;
                    margin-bottom: ${esTermica ? '4px' : '8px'};
                    letter-spacing: 1px;
                    ${esTermica ? '' : 'text-align: left;'}
                }
                
                .n-pedido {
                    font-size: ${esTermica ? '18px' : '24px'};
                    font-weight: bold;
                    margin-bottom: ${esTermica ? '10px' : '15px'};
                    ${esTermica ? '' : 'text-align: left;'}
                }
                
                .destino-label {
                    font-size: ${esTermica ? '11px' : '14px'};
                    font-weight: bold;
                    margin-bottom: ${esTermica ? '2px' : '4px'};
                    ${esTermica ? '' : 'text-align: left;'}
                }
                
                .destino-nombre {
                    font-size: ${esTermica ? '12px' : '16px'};
                    font-weight: bold;
                    margin-bottom: ${esTermica ? '10px' : '0'};
                    text-transform: uppercase;
                    ${esTermica ? '' : 'text-align: left;'}
                }
                
                .separator {
                    border-top: 2px solid #000;
                    margin: ${esTermica ? '8px 0' : '15px 0'};
                    clear: both;
                }
                
                .total-section {
                    text-align: center;
                    margin: ${esTermica ? '10px 0' : '20px 0'};
                    padding: ${esTermica ? '8px' : '15px'};
                    border: ${esA4 ? '1px solid #000' : 'none'};
                    background-color: ${esA4 ? '#f5f5f5' : 'transparent'};
                }
                
                .total-title {
                    font-size: ${esTermica ? '12px' : '16px'};
                    font-weight: bold;
                    margin-bottom: ${esTermica ? '4px' : '8px'};
                }
                
                .total-value {
                    font-size: ${esTermica ? '16px' : '20px'};
                    font-weight: bold;
                }
                
                .footer-section {
                    text-align: center;
                    margin-top: ${esTermica ? '10px' : '20px'};
                    padding-top: ${esTermica ? '8px' : '15px'};
                    border-top: 2px solid #000;
                    font-size: ${esTermica ? '10px' : '12px'};
                }
                
                .empresa-nombre {
                    font-weight: bold;
                    margin-bottom: ${esTermica ? '2px' : '4px'};
                    font-size: ${esTermica ? '11px' : '14px'};
                }
                
                .codigo-fecha {
                    font-size: ${esTermica ? '8px' : '10px'};
                }
                
                .qr-label {
                    font-size: ${esTermica ? '6px' : '8px'};
                    text-align: center;
                    margin-top: ${esTermica ? '1mm' : '2px'};
                    color: #666;
                    font-style: italic;
                }
                
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            <div class="label-container">
                <!-- Encabezado con QR -->
                <div class="header-section">
                    <div class="header-content">
                        <div class="orden-numero">ORDEN:</div>
                        <div class="orden-numero">${data.ordenNumero}</div>
                        
                        <div class="n-pedido">N de Pedido: ${data.codigo}</div>
                        
                        <div class="destino-label">DESTINO:</div>
                        <div class="destino-nombre">${data.destino}</div>
                    </div>
                    
                    ${esA4 ? qrHTML : ''}
                </div>
                
                ${esTermica ? qrHTML : ''}
                ${esTermica && tieneQR ? '<div class="qr-label">Escanear para ver online</div>' : ''}
                
                <div class="separator"></div>
                
                <!-- Materiales -->
                <div class="materials-section">
                    ${materialsHTML}
                </div>
                
                <div class="separator"></div>
                
                <!-- Total general -->
                <div class="total-section">
                    <div class="total-title">TOTAL GENERAL DE BOLSAS:</div>
                    <div class="total-value">${data.cantidadTotal.toFixed(1)} BLS</div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Pie -->
                <div class="footer-section">
                    <div class="empresa-nombre">AGROQUIMICOS DEL NORTE S.A.</div>
                    <div class="codigo-fecha">
                        Código: ${data.verificationCode} | ${fechaFormateada}
                        ${esA4 && tieneQR ? '<br><small>Escanear QR para ver versión web</small>' : ''}
                    </div>
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    // Pequeña espera para que todo cargue (especialmente la imagen del QR)
                    setTimeout(function() {
                        window.print();
                        // Cerrar después de imprimir
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    }, ${tieneQR ? '200' : '100'});
                };
                
                // También permitir imprimir con Ctrl+P
                document.addEventListener('keydown', function(e) {
                    if (e.ctrlKey && e.key === 'p') {
                        e.preventDefault();
                        window.print();
                    }
                });
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}