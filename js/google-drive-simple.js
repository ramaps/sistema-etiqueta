// google-drive-simple.js - VERSIÓN CORREGIDA PARA CONEXIÓN CON APPS SCRIPT
const GOOGLE_DRIVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwEcYcKJ1c7l6YJM90XJ1Nfkqeo0whIbNZyJ0NdRod4k65LBbGuuOI0854nWdDpHfE/exec";

async function createWebPage() {
    console.log('🌐 ENVIANDO A GOOGLE DRIVE...');
    
    if (!currentLabelData) {
        alert('❌ Primero debe generar una etiqueta');
        return;
    }

    // Mostrar un indicador de carga (puedes usar el que ya tienes)
    const btn = document.getElementById('createWebPageBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
    
    try {
        // Preparamos los datos exactamente como los espera el script de Google
        const payload = {
            action: "createWebPage",
            ordenNumero: currentLabelData.ordenNumero,
            codigo: currentLabelData.codigo,
            destino: currentLabelData.destino,
            totalBolsas: currentLabelData.cantidadTotal,
            verificationCode: currentLabelData.verificationCode,
            htmlContent: generateWebPageHTML() // Esta función ya la tienes en tu archivo
        };

        // El truco para que Google no bloquee la subida es usar 'mode: no-cors'
        // y enviar el JSON como texto plano
        await fetch(GOOGLE_DRIVE_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        // Como usamos 'no-cors', no podemos leer la respuesta, 
        // pero si llega aquí es porque se envió.
        alert('✅ Solicitud enviada. La etiqueta aparecerá en Drive en unos segundos.');
        
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Hubo un problema al conectar con Google Drive.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}