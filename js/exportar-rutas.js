/* Descarga de KML y Excel de las pestañas 1 y 2 */

// =========================================================
// J6B. DESCARGA KML DE RUTAS (PESTAÑAS 1 Y 2)
// =========================================================
let kmlRutaMulti = null;    // { puntos, ruta }  -> se llena en procesarRutaMultiple
let kmlRutaSingle = null;   // { origen, items } -> se llena en procesarRutaMasivaPuntoAPunto

function kmlPlacemarkPunto(nombre, lat, lon, desc, abgr) {
    return `
<Placemark>
  <name>${escaparHTML(nombre)}</name>
  <description>${escaparHTML(desc || '')}</description>
  <Style><IconStyle><color>${abgr}</color><scale>1.1</scale>
    <Icon><href>http://maps.google.com/mapfiles/kml/pushpin/wht-pushpin.png</href></Icon>
  </IconStyle></Style>
  <Point><coordinates>${lon},${lat},0</coordinates></Point>
</Placemark>`;
}

// coordsLonLat: arreglo de [lon, lat]
function kmlPlacemarkLinea(nombre, coordsLonLat, desc) {
    return `
<Placemark>
  <name>${escaparHTML(nombre)}</name>
  <description>${escaparHTML(desc || '')}</description>
  <Style><LineStyle><color>ffe8731a</color><width>4</width></LineStyle></Style>
  <LineString><tessellate>1</tessellate><coordinates>${coordsLonLat.map(c => c[0] + ',' + c[1] + ',0').join(' ')}</coordinates></LineString>
</Placemark>`;
}

function descargarArchivoKml(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Pestaña 1: puntos en orden + trazo completo de la ruta
function descargarKmlMulti() {
    if (!kmlRutaMulti) { alert("Primero procesa la ruta."); return; }
    const pts = kmlRutaMulti.puntos;
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
<name>Ruta Múltiple</name>`;
    pts.forEach((p, i) => {
        kml += kmlPlacemarkPunto(`${i}. ${p.nombre}`, p.lat, p.lon, `Orden: ${i}`, i === 0 ? 'ff3c4ce7' : 'ffdb9834');
    });
    kml += kmlPlacemarkLinea('Ruta', kmlRutaMulti.ruta.map(c => [c[1], c[0]]), `Paradas: ${pts.length}`);
    kml += `
  </Document>
</kml>`;
    descargarArchivoKml(kml, 'ruta_multiple.kml');
}

// Pestaña 2: origen + cada destino + la ruta de cada destino
function descargarKmlSingle() {
    if (!kmlRutaSingle || kmlRutaSingle.items.length === 0) { alert("Primero calcula las distancias."); return; }
    const o = kmlRutaSingle.origen;
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
<name>Rutas desde ${escaparHTML(o.nombre)}</name>`;
    kml += kmlPlacemarkPunto(o.nombre, o.lat, o.lon, 'Origen', 'ff3c4ce7');
    kmlRutaSingle.items.forEach(it => {
        kml += kmlPlacemarkPunto(it.d.nombre, it.d.lat, it.d.lon, `Distancia: ${it.km.toFixed(2)} km | Tiempo: ${Math.round(it.mn)} min`, 'ffdb9834');
        kml += kmlPlacemarkLinea(`Ruta a ${it.d.nombre}`, it.coords, `Distancia: ${it.km.toFixed(2)} km | Tiempo: ${Math.round(it.mn)} min`);
    });
    kml += `
  </Document>
</kml>`;
    descargarArchivoKml(kml, 'rutas_individuales.kml');
}


// ---------- Excel de los puntos (pestañas 1 y 2) ----------
function guardarExcel(data, hoja, archivo, anchos) {
    if (typeof XLSX === 'undefined') { alert("No se pudo cargar la librería de Excel. Revisa tu conexión a internet."); return; }
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = anchos.map(w => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, hoja);
    XLSX.writeFile(wb, archivo);
}

// Pestaña 1: #, Nombre, Latitud, Longitud, Distancia, Tiempo (+ total)
function descargarExcelMulti() {
    if (!kmlRutaMulti) { alert("Primero procesa la ruta."); return; }
    const pts = kmlRutaMulti.puntos, legs = kmlRutaMulti.legs || [];
    const data = [['#', 'Nombre', 'Latitud', 'Longitud', 'Distancia (km)', 'Tiempo (min)']];
    pts.forEach((p, i) => {
        const leg = i > 0 ? legs[i - 1] : null;
        data.push([i, p.nombre, p.lat, p.lon,
            leg ? Number((leg.distance / 1000).toFixed(2)) : '-',
            leg ? Math.round(leg.duration / 60) : '-']);
    });
    data.push(['', 'TOTAL', '', '', Number(kmlRutaMulti.km.toFixed(2)), Math.round(kmlRutaMulti.min)]);
    guardarExcel(data, 'Ruta Múltiple', 'ruta_multiple.xlsx', [6, 34, 14, 14, 16, 14]);
}

// Pestaña 2: #, Destino, Latitud, Longitud, Distancia, Tiempo, Google Maps (+ total)
function descargarExcelSingle() {
    if (!kmlRutaSingle || kmlRutaSingle.items.length === 0) { alert("Primero calcula las distancias."); return; }
    const o = kmlRutaSingle.origen;
    const data = [['#', 'Destino', 'Latitud', 'Longitud', 'Distancia (km)', 'Tiempo (min)', 'Google Maps']];
    data.push(['Origen', o.nombre, o.lat, o.lon, '-', '-', '']);
    let tKm = 0, tMin = 0;
    kmlRutaSingle.items.forEach((it, i) => {
        tKm += it.km; tMin += it.mn;
        data.push([i + 1, it.d.nombre, it.d.lat, it.d.lon, Number(it.km.toFixed(2)), Math.round(it.mn), it.link]);
    });
    data.push(['', 'TOTAL', '', '', Number(tKm.toFixed(2)), Math.round(tMin), '']);
    guardarExcel(data, 'Destinos', 'rutas_individuales.xlsx', [8, 34, 14, 14, 16, 14, 60]);
}
