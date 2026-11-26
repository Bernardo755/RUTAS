/* Pestaña 1: Ruta Múltiple */

// =========================================================
// J7. PESTAÑA 1: RUTA MÚLTIPLE
// =========================================================
async function procesarRutaMultiple() {

    document.getElementById('m_errorMsg').style.display = 'none';
    document.getElementById('m_resultados').style.display = 'none';
    document.getElementById('m_loader').style.display = 'block';
    const oLat = parseFloat(document.getElementById('m_origenLat').value.replace(',', '.'));
    const oLon = parseFloat(document.getElementById('m_origenLon').value.replace(',', '.'));
    if (isNaN(oLat) || isNaN(oLon)) { mostrarError('m', "Coordenadas de origen no válidas."); document.getElementById('m_loader').style.display = 'none'; return; }
    let puntos = [{ lat: oLat, lon: oLon, nombre: document.getElementById('m_nombreOrigen').value.trim() || 'Origen' }];
    const lineas = document.getElementById('m_waypoints').value.trim().split('\n');
    lineas.forEach((linea, idx) => {
        const p = linea.split(/,|\t/).map(x => x.trim());
        if(p.length >= 2 && !isNaN(parseFloat(p[0])) && !isNaN(parseFloat(p[1]))) puntos.push({ lat: parseFloat(p[0]), lon: parseFloat(p[1]), nombre: p[2] || `Parada ${idx+1}` });
    });
    if (document.getElementById('m_regreso').checked) puntos.push({ lat: oLat, lon: oLon, nombre: 'Regreso a Origen' });
    if (puntos.length < 2) { mostrarError('m', "Puntos insuficientes."); document.getElementById('m_loader').style.display = 'none'; return; }
    let coordsString = puntos.map(p => `${p.lon},${p.lat}`).join(';');

    let urlOSRM = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
    try {
        let res = await fetch(urlOSRM);
        let data = await res.json();
        if (data.code !== 'Ok') throw new Error();
        let route = data.routes[0];

        let tbody = document.getElementById('m_tablaBody'); tbody.innerHTML = '';

        tbody.innerHTML += `<tr><td>0</td><td><strong>${puntos[0].nombre}</strong></td><td>${puntos[0].lat}</td><td>${puntos[0].lon}</td><td>-</td><td>-</td></tr>`;
        route.legs.forEach((leg, i) => {
            tbody.innerHTML += `<tr><td>${i+1}</td><td><strong>${puntos[i+1].nombre}</strong></td><td>${puntos[i+1].lat}</td><td>${puntos[i+1].lon}</td><td style="color:#1a73e8; font-weight:bold;">${(leg.distance/1000).toFixed(2)} km</td><td style="color:#e37400; font-weight:bold;">${Math.round(leg.duration/60)} min</td></tr>`;
        });
        let distTotalKm = (route.distance/1000).toFixed(2);
        let tiempoMin = Math.round(route.duration/60);
        document.getElementById('m_totalDistancia').innerHTML = `Total: ${distTotalKm} km | Tiempo: ${tiempoMin} min`;
        // Generar Link a Google Maps
        let linkMaps = generarGoogleMapsUrl(puntos);
        document.getElementById('m_contenedorLinks').innerHTML = `<a href="${linkMaps}" target="_blank" class="btn-link">🗺️ Abrir Ruta Múltiple en Google Maps</a>`;
        document.getElementById('m_resultados').style.display = 'block';
        if (!mapMulti) mapMulti = inicializarMapa('map', oLat, oLon);
        if (routeLayerMulti) mapMulti.removeLayer(routeLayerMulti);
        markersMulti.forEach(m => mapMulti.removeLayer(m)); markersMulti = [];
        let coordsGeoJson = route.geometry.coordinates.map(c => [c[1], c[0]]);
        routeLayerMulti = L.polyline(coordsGeoJson, { color: '#1a73e8', weight: 5 }).addTo(mapMulti);
        mapMulti.fitBounds(routeLayerMulti.getBounds(), { padding: [30, 30] });
        kmlRutaMulti = { puntos: puntos, ruta: route.geometry.coordinates, legs: route.legs, km: route.distance / 1000, min: route.duration / 60 };
        puntos.forEach((p, i) => {
            let m = L.marker([p.lat, p.lon]).addTo(mapMulti).bindPopup(`<b>${i}. ${p.nombre}</b>`);
            markersMulti.push(m);
        });
        // Asignar datos temporales para bitácora
        tempDatosGuardar = {
            modoApp: 'Ruta Múltiple',
            resumen: `Distancia: ${distTotalKm} km | Paradas: ${puntos.length}`,
            linkRuta: linkMaps,
            datos: { distanciaGlobal: distTotalKm, paradas: puntos.length, puntosRecorridos: puntos.map(p=>p.nombre) }
        };
        renderizarBotonGuardar('m');
    } catch(e) {
        mostrarError('m', "Error al calcular la ruta.");
    } finally { document.getElementById('m_loader').style.display = 'none'; }
}
