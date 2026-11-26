/* Pestaña 2: EscxEsc (origen fijo a múltiples destinos) */

// =========================================================
// J8. PESTAÑA 2: EscxEsc (ORIGEN FIJO → MÚLTIPLES DESTINOS)
// =========================================================
async function procesarRutaMasivaPuntoAPunto() {
    document.getElementById('s_errorMsg').style.display = 'none';
    document.getElementById('s_resultados').style.display = 'none';
    document.getElementById('s_loader').style.display = 'block';

    const oLat = parseFloat(document.getElementById('s_origenLat').value.replace(',', '.'));
    const oLon = parseFloat(document.getElementById('s_origenLon').value.replace(',', '.'));
    if (isNaN(oLat) || isNaN(oLon)) { mostrarError('s', "Coordenadas de origen inválidas."); document.getElementById('s_loader').style.display = 'none'; return; }

    const incluirRegreso = document.getElementById('s_regreso') ? document.getElementById('s_regreso').checked : false;

    let destinos = [];
    document.getElementById('s_destinos').value.trim().split('\n').forEach((l, i) => {
        let p = l.split(/,|\t/).map(x => x.trim());
        if(p.length >= 2 && !isNaN(parseFloat(p[0])) && !isNaN(parseFloat(p[1]))) destinos.push({ lat: parseFloat(p[0]), lon: parseFloat(p[1]), nombre: p[2] || `Dest ${i+1}` });
    });

    let promesas = destinos.map(d => {
        let coordsString = incluirRegreso
            ? `${oLon},${oLat};${d.lon},${d.lat};${oLon},${oLat}`
            : `${oLon},${oLat};${d.lon},${d.lat}`;

        return fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`)
            .then(r => r.json())
            .then(data => ({ d, data }));
    });

    try {
        let resultados = await Promise.all(promesas);
        let tbody = document.getElementById('s_tablaBody'); tbody.innerHTML = '';
        let tDist = 0, tTime = 0;

        // Estructura para almacenar cada ruta punto por punto de forma individual
        let listaRegistrosGuardar = [];
        kmlRutaSingle = { origen: { lat: oLat, lon: oLon, nombre: document.getElementById('s_nombreOrigen').value.trim() || 'Origen' }, items: [] };

        // 1. PRIMERO HACEMOS VISIBLE EL CONTENEDOR DE RESULTADOS
        document.getElementById('s_resultados').style.display = 'block';

        if (!mapSingle) mapSingle = inicializarMapa('mapSingle', oLat, oLon);
        routeLayerSingle.forEach(l => mapSingle.removeLayer(l)); routeLayerSingle = [];
        markersSingle.forEach(m => mapSingle.removeLayer(m)); markersSingle = [];
        let bounds = [[oLat, oLon]];
        markersSingle.push(L.marker([oLat, oLon]).addTo(mapSingle).bindPopup(`<b>ORIGEN</b>`));

        resultados.forEach((item, idx) => {
            if(item.data.code === 'Ok') {
                let route = item.data.routes[0];
                let d = item.d;
                let km = route.distance / 1000;
                let mn = route.duration / 60;
                tDist += km; tTime += mn;

                let linkIndividualMaps = incluirRegreso
                    ? `https://www.google.com/maps/dir/?api=1&origin=${oLat},${oLon}&destination=${oLat},${oLon}&waypoints=${d.lat},${d.lon}&travelmode=driving`
                    : `https://www.google.com/maps/dir/?api=1&origin=${oLat},${oLon}&destination=${d.lat},${d.lon}&travelmode=driving`;

                tbody.innerHTML += `
                    <tr>
                        <td>${idx+1}</td>
                        <td><strong>${d.nombre}</strong> ${incluirRegreso ? '<small style="color:#666;">(Ida y vuelta)</small>' : ''}</td>
                        <td>${d.lat}</td>
                        <td>${d.lon}</td>
                        <td style="color:#1a73e8; font-weight:bold;">${km.toFixed(2)} km</td>
                        <td style="color:#e37400; font-weight:bold;">${Math.round(mn)} min</td>
                        <td>
                            <a href="${linkIndividualMaps}" target="_blank" class="btn btn-sm btn-outline-primary" style="text-decoration:none; font-size:12px;">
                                🗺️ Abrir Mapa
                            </a>
                        </td>
                    </tr>`;

                bounds.push([d.lat, d.lon]);
                markersSingle.push(L.marker([d.lat, d.lon]).addTo(mapSingle).bindPopup(`${d.nombre}<br>${km.toFixed(2)}km`));

                let poly = L.polyline(route.geometry.coordinates.map(c => [c[1], c[0]]), {color:'#1a73e8', weight:4, opacity:0.7}).addTo(mapSingle);
                routeLayerSingle.push(poly);
                kmlRutaSingle.items.push({ d: d, km: km, mn: mn, coords: route.geometry.coordinates, link: linkIndividualMaps });

                // Objeto individual para la bitácora
                listaRegistrosGuardar.push({
                    modoApp: 'Múltiples Destinos',
                    resumen: `Destino: ${d.nombre} | Distancia: ${km.toFixed(2)} km | Tiempo: ${Math.round(mn)} min${incluirRegreso ? ' (Ida y vuelta)' : ''}`,
                    linkRuta: linkIndividualMaps,
                    datos: {
                        destino: d.nombre,
                        latitud: d.lat,
                        longitud: d.lon,
                        distanciaKm: km.toFixed(2),
                        tiempoMin: Math.round(mn),
                        viajeRedondo: incluirRegreso
                    }
                });
            }
        });

        // 2. ESPERAMOS 100ms Y FORZAMOS EL RECÁLCULO DE LEAFLET
        setTimeout(() => {
            mapSingle.invalidateSize();
            mapSingle.fitBounds(bounds, { padding: [30, 30] });
        }, 100);

        let sumaKm = tDist.toFixed(2);
        document.getElementById('s_totalDistancia').innerHTML = `Suma de Distancias: ${sumaKm} km | Tiempo acumulado: ${Math.round(tTime)} min`;

        document.getElementById('s_contenedorLinks').innerHTML = '';

        // Asignamos el arreglo completo de registros a la variable temporal
        tempDatosGuardar = listaRegistrosGuardar;
        renderizarBotonGuardar('s');

    } catch(e) { mostrarError('s', "Error al calcular distancias."); }
    finally { document.getElementById('s_loader').style.display = 'none'; }
}
