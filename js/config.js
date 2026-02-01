// VARIABLES GLOBALES COMPARTIDAS
window.orderMaterials = [];
window.currentLabelData = null;
window.qrImageUrl = null;
window.currentWebPageUrl = null;  // URL de la página web en Drive

// URL DE GOOGLE APPS SCRIPT
window.googleDriveWebAppUrl = "https://script.google.com/macros/s/AKfycbwLd6dBX8OPpe7iZPo0mnEtol_ANtaFe8sM5dwl2udrIarkXMMwSFbNYrjlpAAQAKw/exec";

// FUNCIONES DE UTILIDAD GLOBALES
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
    const actionButtons = [
        'printSingleBtn',
        'createWebPageBtn',
        'saveBtn'
    ];
    
    actionButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.disabled = false;
    });
};

// CONFIGURACIÓN INICIAL
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de etiquetas inicializado');
    console.log('🔗 Google Drive URL:', window.googleDriveWebAppUrl);
    
    // Inicialmente deshabilitar botones de acción
    const actionButtons = [
        'printSingleBtn',
        'createWebPageBtn',
        'saveBtn'
    ];
    
    actionButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) btn.disabled = true;
    });
});