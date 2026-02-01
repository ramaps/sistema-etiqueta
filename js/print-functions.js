// print-functions.js - VERSIÓN COMPLETA CORREGIDA

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
    
    // Calcular cuántos materiales caben por página
    const materialesPorPagina = esTermica ? 4 : 8; // Ajustar según espacio
    
    // Dividir materiales en páginas si es necesario
    const paginasDeMateriales = [];
    for (let i = 0; i < data.materiales.length; i += materialesPorPagina) {
        paginasDeMateriales.push(data.materiales.slice(i, i + materialesPorPagina));
    }

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
            font-size: 9px;
            line-height: 1.1;
        }
        .label-container {
            border: none;
            padding: 0;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .qr-container {
            width: 18mm;
            height: 18mm;
            border: 1px solid #ccc;
            padding: 0.5mm;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2mm auto;
        }
        .qr-container img {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            image-rendering: crisp-edges;
        }
        .page-break {
            page-break-after: always;
            break-after: page;
        }
    ` : `
        @page { 
            size: A4; 
            margin: 12mm; 
        }
        body { 
            margin: 0;
            padding: 0;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            line-height: 1.2;
        }
        .label-container {
            border: none;
            padding: 0;
            max-width: 100%;
        }
        .qr-container {
            width: 50px;
            height: 50px;
            border: 1px solid #ccc;
            padding: 1px;
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
        .page-break {
            page-break-after: always;
            break-after: page;
            margin-top: 20mm;
        }
        .header-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 5mm;
            border-bottom: 1px solid #000;
            padding-bottom: 3mm;
        }
    `;

    // Generar la fecha en formato día/mes/año
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });

    // Función para generar el encabezado de cada página
    function generarEncabezadoPagina(numeroPagina, totalPaginas) {
        const qrHTML = tieneQR ? `
            <div class="qr-container">
                <img src="${qrUrl}" alt="QR Code" style="width: 100%; height: 100%;">
            </div>
        ` : '';
        
        return esA4 ? `
            <div class="header-section">
                <div style="flex: 1;">
                    <div style="font-size: 24px; font-weight: bold; margin-bottom: 2px;">
                        ORDEN: ${data.ordenNumero}
                    </div>
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">
                        N de Pedido: ${data.codigo}
                    </div>
                    <div style="font-size: 12px; font-weight: bold; margin-bottom: 2px;">
                        DESTINO:
                    </div>
                    <div style="font-size: 14px; font-weight: bold; text-transform: uppercase;">
                        ${data.destino}
                    </div>
                    ${totalPaginas > 1 ? `<div style="font-size: 8px; margin-top: 4px; color: #666;">Página ${numeroPagina} de ${totalPaginas}</div>` : ''}
                </div>
                ${qrHTML}
            </div>
        ` : `
            <div style="text-align: center; margin-bottom: 4mm;">
                <div style="font-size: 20px; font-weight: bold; margin-bottom: 1mm;">
                    ORDEN: ${data.ordenNumero}
                </div>
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 2mm;">
                    N de Pedido: ${data.codigo}
                </div>
                <div style="font-size: 10px; font-weight: bold; margin-bottom: 1mm;">
                    DESTINO:
                </div>
                <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 2mm;">
                    ${data.destino}
                </div>
                ${qrHTML}
                ${totalPaginas > 1 ? `<div style="font-size: 6px; margin-top: 1mm; color: #666;">Página ${numeroPagina} de ${totalPaginas}</div>` : ''}
            </div>
        `;
    }

    // Función para generar materiales de una página
    function generarMaterialesPagina(materiales) {
        let materialsHTML = '';
        
        materiales.forEach((item, index) => {
            // Para etiqueta térmica, diseño más compacto
            if (esTermica) {
                materialsHTML += `
                    <div style="margin-bottom: 3mm; padding-bottom: 2mm; ${index < materiales.length - 1 ? 'border-bottom: 0.5px solid #999;' : ''}">
                        <div style="font-weight: bold; font-size: 9px; margin-bottom: 1mm;">
                            CANTIDADES: ${item.cantidad.toFixed(1)} BLS
                        </div>
                        <div style="font-size: 8px; margin-bottom: 0.5mm;">
                            <strong>SKU:</strong> ${item.sku}
                        </div>
                        <div style="font-size: 8px; font-weight: bold; margin-bottom: 0.5mm;">
                            ${item.descripcion}
                        </div>
                        <div style="font-size: 8px; margin-bottom: 0.5mm;">
                            <strong>LOTE:</strong> ${item.lote} -
                        </div>
                        <div style="font-size: 8px; margin-bottom: 0.5mm;">
                            <strong>SOL.:</strong> ${item.solicitante}
                        </div>
                        <div style="font-size: 8px; margin-bottom: 0.5mm;">
                            <strong>BANDERA -</strong> ${item.bandera || 'SIN CÓDIGO'}
                        </div>
                    </div>
                `;
            } else {
                // Para A4, diseño más espaciado
                materialsHTML += `
                    <div style="margin-bottom: 4mm; padding-bottom: 3mm; ${index < materiales.length - 1 ? 'border-bottom: 1px dashed #999;' : ''}">
                        <div style="font-weight: bold; font-size: 11px; margin-bottom: 1mm;">
                            CANTIDADES: ${item.cantidad.toFixed(1)} BLS
                        </div>
                        <div style="font-size: 10px; margin-bottom: 1mm;">
                            <strong>SKU:</strong> ${item.sku}
                        </div>
                        <div style="font-size: 10px; font-weight: bold; margin-bottom: 1mm;">
                            ${item.descripcion}
                        </div>
                        <div style="font-size: 10px; margin-bottom: 1mm;">
                            <strong>LOTE:</strong> ${item.lote} -
                        </div>
                        <div style="font-size: 10px; margin-bottom: 1mm;">
                            <strong>SOL.:</strong> ${item.solicitante}
                        </div>
                        <div style="font-size: 10px; margin-bottom: 1mm;">
                            <strong>BANDERA -</strong> ${item.bandera || 'SIN CÓDIGO'}
                        </div>
                    </div>
                `;
            }
        });
        
        return materialsHTML;
    }

    // Función para generar el pie de página
    function generarPiePagina(esUltimaPagina) {
        const totalGeneral = esUltimaPagina ? `
            <div style="text-align: center; margin: ${esTermica ? '3mm 0' : '5mm 0'}; padding: ${esTermica ? '2mm' : '3mm'}; border: ${esA4 ? '1px solid #000' : 'none'};">
                <div style="font-size: ${esTermica ? '11px' : '14px'}; font-weight: bold; margin-bottom: ${esTermica ? '1mm' : '2mm'};">
                    TOTAL GENERAL DE BOLSAS:
                </div>
                <div style="font-size: ${esTermica ? '14px' : '18px'}; font-weight: bold;">
                    ${data.cantidadTotal.toFixed(1)} BLS
                </div>
            </div>
        ` : '';
        
        const fechaYCodigo = esUltimaPagina ? `
            <div style="font-size: ${esTermica ? '7px' : '9px'}; text-align: center; margin-top: ${esTermica ? '1mm' : '2mm'};">
                Código: ${data.verificationCode} | ${fechaFormateada}
            </div>
        ` : '';
        
        return `
            ${totalGeneral}
            <div style="text-align: center; margin-top: ${esTermica ? '3mm' : '5mm'}; padding-top: ${esTermica ? '2mm' : '3mm'}; border-top: 1px solid #000;">
                <div style="font-weight: bold; font-size: ${esTermica ? '10px' : '12px'}; margin-bottom: ${esTermica ? '1mm' : '2mm'};">
                    AGROQUIMICOS DEL NORTE S.A.
                </div>
                ${fechaYCodigo}
            </div>
        `;
    }

    // Construir el contenido HTML con múltiples páginas si es necesario
    let contenidoHTML = '';
    
    paginasDeMateriales.forEach((materialesPagina, index) => {
        const esUltimaPagina = (index === paginasDeMateriales.length - 1);
        const numeroPagina = index + 1;
        const totalPaginas = paginasDeMateriales.length;
        
        contenidoHTML += `
            <div class="${esA4 ? 'page' : ''}" style="${esA4 ? 'min-height: 270mm; padding: 12mm;' : ''}">
                ${generarEncabezadoPagina(numeroPagina, totalPaginas)}
                ${generarMaterialesPagina(materialesPagina)}
                ${esUltimaPagina ? generarPiePagina(true) : generarPiePagina(false)}
            </div>
            ${!esUltimaPagina ? '<div class="page-break"></div>' : ''}
        `;
    });

    printWindow.document.write(`
        <html>
        <head>
            <title>Etiqueta ${data.ordenNumero}</title>
            <style>
                ${styles}
                
                /* Estilos comunes para impresión */
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                @media print {
                    .page-break {
                        page-break-after: always;
                        break-after: page;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
                
                /* Para A4: asegurar que cada página ocupe una hoja completa */
                .page {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
            </style>
        </head>
        <body>
            <div class="label-container">
                ${contenidoHTML}
            </div>
            
            <script>
                window.onload = function() {
                    // Esperar a que carguen las imágenes (especialmente el QR)
                    setTimeout(function() {
                        window.print();
                        // Cerrar después de imprimir
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    }, ${tieneQR ? '300' : '150'});
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