// config.js - CONFIGURACIÓN GLOBAL
window.orderMaterials = [];
window.currentLabelData = null;
window.qrImageUrl = null;
window.currentWebPageUrl = null; 

// TU NUEVA URL DE GOOGLE APPS SCRIPT
window.googleDriveWebAppUrl = "https://script.google.com/macros/s/AKfycbxE9aDhPs99lqTQ7z1_bRub-UOVZI3ITJ0te3ekKMhzEtrSuUa1p_kjH4u3GthGRNFZ/exec";

window.generateVerificationCode = function(ordenNumero) {
    const timestamp = Date.now().toString().slice(-6);
    return `AGN-${ordenNumero}-${timestamp}`;
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