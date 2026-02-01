// print-functions.js - VERSIÓN MODIFICADA CON NUEVO FORMATO

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
                    text-align: center;
                    margin-bottom: ${esTermica ? '8px' : '15px'};
                }
                
                .orden-numero {
                    font-size: ${esTermica ? '28px' : '36px'};
                    font-weight: bold;
                    margin-bottom: ${esTermica ? '4px' : '8px'};
                    letter-spacing: 1px;
                }
                
                .n-pedido {
                    font-size: ${esTermica ? '18px' : '24px'};
                    font-weight: bold;
                    margin-bottom: ${esTermica ? '10px' : '15px'};
                }
                
                .destino-label {
                    font-size: ${esTermica ? '11px' : '14px'};
                    font-weight: bold;
                    margin-bottom: ${esTermica ? '2px' : '4px'};
                }
                
                .destino-nombre {
                    font-size: ${esTermica ? '12px' : '16px'};
                    font-weight: bold;
                    margin-bottom: ${esTermica ? '10px' : '20px'};
                    text-transform: uppercase;
                }
                
                .separator {
                    border-top: 2px solid #000;
                    margin: ${esTermica ? '8px 0' : '15px 0'};
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
                <!-- Encabezado -->
                <div class="header-section">
                    <div class="orden-numero">ORDEN:</div>
                    <div class="orden-numero">${data.ordenNumero}</div>
                    
                    <div class="n-pedido">N de Pedido: ${data.codigo}</div>
                    
                    <div class="destino-label">DESTINO:</div>
                    <div class="destino-nombre">${data.destino}</div>
                </div>
                
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
                    </div>
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    // Pequeña espera para que todo cargue
                    setTimeout(function() {
                        window.print();
                        // Cerrar después de imprimir
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    }, 100);
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