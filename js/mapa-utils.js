/* Utilidades: mapas Leaflet con selector de vista, pestañas, errores, URL Google Maps */

// =========================================================
// J6. UTILIDADES: MAPA, PESTAÑAS, ERRORES, URL GOOGLE MAPS
// =========================================================
function inicializarMapa(idContenedor, lat, lon) {
    let m = L.map(idContenedor).setView([lat, lon], 13);
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' });
    const gHibrido = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 21, attribution: 'Google Maps' });
    const gSatelite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 21, attribution: 'Google Maps' });
    const gCalles = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { maxZoom: 21, attribution: 'Google Maps' });
    const gTerreno = L.tileLayer('https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', { maxZoom: 21, attribution: 'Google Maps' });
    osm.addTo(m);
    // Selector de vista del mapa
    L.control.layers({
        'OpenStreetMap': osm,
        'Google Híbrido': gHibrido,
        'Google Satélite': gSatelite,
        'Google Mapa': gCalles,
        'Google Terreno': gTerreno
    }, null, { collapsed: true }).addTo(m);
    return m;
}

function cambiarPestana(tipo) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    if(tipo === 'multi') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('tab-multi').classList.add('active');
        if(mapMulti) mapMulti.invalidateSize();
    } else if(tipo === 'single') {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('tab-single').classList.add('active');
        if(mapSingle) mapSingle.invalidateSize();
    } else if(tipo === 'kml') {
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
        document.getElementById('tab-kml').classList.add('active');
        if(mapKml) mapKml.invalidateSize();
    } else if(tipo === 'mapa') {
        document.querySelectorAll('.tab-btn')[3].classList.add('active');
        document.getElementById('tab-mapa').classList.add('active');
    }
}

function mostrarError(modo, msg) {
    let el = document.getElementById(modo + '_errorMsg');
    el.innerText = msg;
    el.style.display = 'block';
}

// Genera URL de Google Maps (origen, destino y paradas intermedias)
function generarGoogleMapsUrl(puntos) {
    if (puntos.length < 2) return '';
    let origen = `${puntos[0].lat},${puntos[0].lon}`;
    let destino = `${puntos[puntos.length - 1].lat},${puntos[puntos.length - 1].lon}`;
    let waypoints = puntos.slice(1, -1).map(p => `${p.lat},${p.lon}`).join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origen}&destination=${destino}`;
    if (waypoints) url += `&waypoints=${waypoints}`;
    return url;
}
