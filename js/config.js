/* Configuración: URL de Google Sheets y app externa de MAPA */

// =========================================================
// J1. CONFIGURACIÓN
// =========================================================

// Conexión a Google Sheets (Apps Script)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwb--hDzQtufC2X7uzT250nx7NDrX7BS_3Jo2dO0GGsN0pg5vSG1BCSmBTOqwadO5Dr/exec"; // <--- PEGA TU URL DE APPS SCRIPT AQUÍ

// App externa de MAPA (se abre directamente, sin iframe)
const MAPA_APP_URL = "https://bernardo755.github.io/MAPA/";

let ventanaMapa = null;

function abrirAplicacionMapa() {
    if (!MAPA_APP_URL || MAPA_APP_URL === "PEGA_AQUI_LA_LIGA_DE_LA_APP_DE_MAPA") {
        alert("Primero coloca la liga de la aplicación de MAPA en la constante MAPA_APP_URL del código.");
        return;
    }

    ventanaMapa = window.open(MAPA_APP_URL, "_blank");

    if (!ventanaMapa) {
        alert("El navegador bloqueó la ventana. Permite las ventanas emergentes para este sitio y vuelve a intentarlo.");
        return;
    }

    // La segunda aplicación queda completamente independiente.
    ventanaMapa.focus();
}
