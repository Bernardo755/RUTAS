/* Estado global compartido (variables de la aplicación) */

// =========================================================
// J2. VARIABLES GLOBALES
// =========================================================
let estadoActual = '';
let procesoActivo = '';
let subprocesoActivo = '';
let tempDatosGuardar = null;

let mapMulti = null, mapSingle = null, mapKml = null;
let routeLayerMulti = null, markersMulti = [];
let routeLayerSingle = [], markersSingle = [];
