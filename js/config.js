// config.js - CONFIGURACIÓN Y FUNCIONES GLOBALES
window.orderMaterials = [];
window.currentLabelData = null;
window.qrImageUrl = null;
window.currentWebPageUrl = null; 

window.googleDriveWebAppUrl = "https://script.google.com/macros/s/AKfycbwEcYcKJ1c7l6YJM90XJ1Nfkqeo0whIbNZyJ0NdRod4k65LBbGuuOI0854nWdDpHfE/exec";

// FUNCION CRITICA: Genera un ID único para que el QR no se confunda
window.generateVerificationCode = function(ordenNumero) {
    // Tomamos los últimos 8 dígitos del timestamp actual (milisegundos)
    // Esto garantiza que si generas dos "Etiqueta_1", tengan IDs distintos
    const uniqueStamp = Date.now().toString().slice(-8);
    return `AGN-${ordenNumero}-${uniqueStamp}`;
};

window.copyToClipboard = function(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
};

window.enableActionButtons = function() {
    const actionButtons = ['printSingleBtn', 'createWebPageBtn', 'saveBtn', 'printThermalBtn'];
    actionButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.disabled = false;
    });
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Configuración cargada con IDs únicos');
});