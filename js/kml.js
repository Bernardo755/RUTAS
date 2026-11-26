/* Pestaña 3: MAPA KML (paleta de colores, KML y Google Maps) */

// =========================================================
// J9. PESTAÑA 3: MAPA KML
// =========================================================

// ---------- J9.1 Variables y paleta ----------
let kmlPuntos = [];
let markersKml = [];
let puntoKmlSeleccionado = null;

// Colores que se muestran en la paleta (un solo nombre por color)
const PALETA_UI = [
    'rojo', 'carmesi', 'borgoña', 'rosa', 'magenta',
    'naranja', 'salmón', 'coral', 'amarillo', 'dorado',
    'verde', 'lima', 'olivo', 'turquesa', 'azul',
    'celeste', 'marino', 'morado', 'violeta', 'indigo',
    'marron', 'chocolate', 'blanco', 'gris', 'plateado', 'negro'
];

// ---------- J9.2 Mapa de colores (hex para el mapa web, abgr para el KML) ----------
const mapaColores = {
        // --- Rojos ---
        'rojo':       { hex: '#e74c3c', abgr: 'ff3c4ce7' },
        'red':        { hex: '#e74c3c', abgr: 'ff3c4ce7' },
        'carmesi':    { hex: '#dc143c', abgr: 'ff3c14dc' },
        'crimson':    { hex: '#dc143c', abgr: 'ff3c14dc' },
        'borgoña':    { hex: '#800020', abgr: 'ff200080' },
        'burgundy':   { hex: '#800020', abgr: 'ff200080' },

        // --- Rosas ---
        'rosa':       { hex: '#ff69b4', abgr: 'ffb469ff' },
        'pink':       { hex: '#ff69b4', abgr: 'ffb469ff' },
        'magenta':    { hex: '#e91e63', abgr: 'ff631ee9' },

        // --- Naranjas y salmones ---
        'naranja':    { hex: '#e67e22', abgr: 'ff227ee6' },
        'orange':     { hex: '#e67e22', abgr: 'ff227ee6' },
        'salmón':     { hex: '#fa8072', abgr: 'ff7280fa' },
        'salmon':     { hex: '#fa8072', abgr: 'ff7280fa' },
        'coral':      { hex: '#ff7f50', abgr: 'ff507fff' },

        // --- Amarillos ---
        'amarillo':   { hex: '#f1c40f', abgr: 'ff0fc4f1' },
        'yellow':     { hex: '#f1c40f', abgr: 'ff0fc4f1' },
        'dorado':     { hex: '#ffd700', abgr: 'ff00d7ff' },
        'gold':       { hex: '#ffd700', abgr: 'ff00d7ff' },

        // --- Verdes ---
        'verde':      { hex: '#2ecc71', abgr: 'ff71cc2e' },
        'green':      { hex: '#2ecc71', abgr: 'ff71cc2e' },
        'lima':       { hex: '#cddc39', abgr: 'ff39dccd' },
        'lime':       { hex: '#cddc39', abgr: 'ff39dccd' },
        'olivo':      { hex: '#556b2f', abgr: 'ff2f6b55' },
        'olive':      { hex: '#556b2f', abgr: 'ff2f6b55' },
        'turquesa':   { hex: '#1abc9c', abgr: 'ff9cbc1a' },
        'turquoise':  { hex: '#1abc9c', abgr: 'ff9cbc1a' },

        // --- Azules ---
        'azul':       { hex: '#3498db', abgr: 'ffdb9834' },
        'blue':       { hex: '#3498db', abgr: 'ffdb9834' },
        'celeste':    { hex: '#00bcd4', abgr: 'ffd4bc00' },
        'cyan':       { hex: '#00bcd4', abgr: 'ffd4bc00' },
        'marino':     { hex: '#1b4f72', abgr: 'ff724f1b' },
        'navy':       { hex: '#1b4f72', abgr: 'ff724f1b' },

        // --- Morados ---
        'morado':     { hex: '#9b59b6', abgr: 'ffb6599b' },
        'purple':     { hex: '#9b59b6', abgr: 'ffb6599b' },
        'violeta':    { hex: '#8e44ad', abgr: 'ffad448e' },
        'indigo':     { hex: '#4b0082', abgr: 'ff82004b' },

        // --- Marrones ---
        'marron':     { hex: '#795548', abgr: 'ff485579' },
        'brown':      { hex: '#795548', abgr: 'ff485579' },
        'cafe':       { hex: '#795548', abgr: 'ff485579' },
        'chocolate':  { hex: '#d2691e', abgr: 'ff1e69d2' },

        // --- Neutros ---
        'blanco':     { hex: '#ffffff', abgr: 'ffffffff' },
        'white':      { hex: '#ffffff', abgr: 'ffffffff' },
        'gris':       { hex: '#95a5a6', abgr: 'ffa6a595' },
        'grey':       { hex: '#95a5a6', abgr: 'ffa6a595' },
        'plateado':   { hex: '#bdc3c7', abgr: 'ffc7c3bd' },
        'silver':     { hex: '#bdc3c7', abgr: 'ffc7c3bd' },
        'negro':      { hex: '#2c3e50', abgr: 'ff503e2c' },
        'black':      { hex: '#2c3e50', abgr: 'ff503e2c' }
};

function obtenerColor(input) {
    let key = (input || 'azul').toLowerCase().trim();
    return mapaColores[key] || mapaColores['azul'];
}

// ---------- J9.3 Iconos y escape HTML ----------
// Crea un marcador SVG puro para Leaflet
function crearIconoSVG(colorHex) {
    let svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="42">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="${colorHex}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="12" cy="12" r="4" fill="#ffffff"/>
    </svg>`;
    return L.divIcon({
        html: svg,
        className: '',
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -36]
    });
}

function escaparHTML(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ---------- J9.4 Paleta flotante ----------
function abrirPaletaMapa(idx) {
    if (!kmlPuntos[idx]) return;

    puntoKmlSeleccionado = idx;
    const punto = kmlPuntos[idx];
    const panel = document.getElementById('k_paletaMapa');
    const nombre = document.getElementById('k_paletaPuntoNombre');
    const contenedor = document.getElementById('k_paletaColores');

    nombre.innerText = punto.nom || `Punto ${idx + 1}`;

    const colorActual = obtenerColor(punto.col);

    contenedor.innerHTML = PALETA_UI.map(key => {
        const color = mapaColores[key];
        const seleccionado =
            color.hex.toLowerCase() === colorActual.hex.toLowerCase();

        return `
            <button
                type="button"
                class="k-paleta-color ${seleccionado ? 'selected' : ''}"
                style="background:${color.hex};"
                title="${key}"
                aria-label="${key}"
                onclick="seleccionarColorMapa('${key.replace(/'/g, "\\'")}')">
            </button>
        `;
    }).join('');

    panel.style.display = 'block';
}

function seleccionarColorMapa(colorKey) {
    if (
        puntoKmlSeleccionado === null ||
        !kmlPuntos[puntoKmlSeleccionado]
    ) {
        return;
    }

    const idx = puntoKmlSeleccionado;
    kmlPuntos[idx].col = colorKey;
    const colorObj = obtenerColor(colorKey);

    // Actualizar el pin visible en el mapa
    if (markersKml[idx]) {
        markersKml[idx].setIcon(crearIconoSVG(colorObj.hex));
    }

    // Actualizar el color mostrado en la tabla
    const filas = document.querySelectorAll('#k_tablaBody tr');
    if (filas[idx]) {
        const celdas = filas[idx].querySelectorAll('td');
        if (celdas[7]) {
            celdas[7].innerText = colorKey;
        }
    }

    // Regenerar inmediatamente el archivo KML descargable
    actualizarDescargaKml();

    // Mantener abierta la misma paleta, mostrando el nuevo color seleccionado
    abrirPaletaMapa(idx);
}

function cerrarPaletaMapa() {
    const panel = document.getElementById('k_paletaMapa');
    if (panel) panel.style.display = 'none';
    puntoKmlSeleccionado = null;
}

// ---------- J9.5 Generación y descarga del KML ----------
function generarKmlContent(puntos) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
${puntos.map(p => {
    let colorObj = obtenerColor(p.col);
    return `
<Placemark>
  <name>${escaparHTML(p.nom)}</name>
  <description>${escaparHTML(p.d1)} - ${escaparHTML(p.d2)} - ${escaparHTML(p.d3)}</description>
  <Style>
    <IconStyle>
      <color>${colorObj.abgr}</color>
      <scale>1.1</scale>
      <Icon>
        <href>http://maps.google.com/mapfiles/kml/pushpin/wht-pushpin.png</href>
      </Icon>
    </IconStyle>
  </Style>
  <Point><coordinates>${p.lon},${p.lat},0</coordinates></Point>
</Placemark>`;
}).join('')}
  </Document>
</kml>`;
}

function actualizarDescargaKml() {
    if (!kmlPuntos || kmlPuntos.length === 0) return;

    const kmlContent = generarKmlContent(kmlPuntos);
    const blob = new Blob(
        [kmlContent],
        { type: 'application/vnd.google-earth.kml+xml' }
    );

    const enlace = document.getElementById('k_btnDescarga');
    if (!enlace) return;

    // Liberar el Blob anterior para evitar acumular memoria
    if (enlace.dataset.blobUrl) {
        URL.revokeObjectURL(enlace.dataset.blobUrl);
    }

    const url = URL.createObjectURL(blob);
    enlace.href = url;
    enlace.dataset.blobUrl = url;
}

// ---------- J9.6 procesarKML ----------
function procesarKML() {
    document.getElementById('k_errorMsg').style.display = 'none';
    document.getElementById('k_resultados').style.display = 'none';
    cerrarPaletaMapa();

    let texto = document.getElementById('k_datos').value.trim();
    if (!texto) {
        mostrarError('k', 'Ingresa al menos un punto válido.');
        return;
    }

    let lineas = texto.split('\n');
    kmlPuntos = [];
    let tbody = document.getElementById('k_tablaBody');
    tbody.innerHTML = '';

    lineas.forEach((l, i) => {
        let p = l.split(/,|\t/).map(x => x.trim());

        if (p.length >= 2 && !isNaN(parseFloat(p[0])) && !isNaN(parseFloat(p[1]))) {
            let obj = {
                lat: p[0],
                lon: p[1],
                nom: p[2] || '',
                d1: p[3] || '',
                d2: p[4] || '',
                d3: p[5] || '',
                col: p[6] || 'azul'
            };

            kmlPuntos.push(obj);

            tbody.innerHTML += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${escaparHTML(obj.nom)}</td>
                    <td>${escaparHTML(obj.lat)}</td>
                    <td>${escaparHTML(obj.lon)}</td>
                    <td>${escaparHTML(obj.d1)}</td>
                    <td>${escaparHTML(obj.d2)}</td>
                    <td>${escaparHTML(obj.d3)}</td>
                    <td>${escaparHTML(obj.col)}</td>
                </tr>`;
        }
    });

    if (kmlPuntos.length === 0) {
        mostrarError('k', 'Sin puntos válidos.');
        return;
    }

    // Crear el primer KML descargable
    actualizarDescargaKml();

    // Mostrar primero el contenedor para que Leaflet calcule correctamente su tamaño
    document.getElementById('k_resultados').style.display = 'block';

    if (!mapKml) {
        mapKml = inicializarMapa(
            'mapKml',
            parseFloat(kmlPuntos[0].lat),
            parseFloat(kmlPuntos[0].lon)
        );
    }

    setTimeout(() => {
        mapKml.invalidateSize();

        // Limpiar solamente los marcadores anteriores
        markersKml.forEach(m => mapKml.removeLayer(m));
        markersKml = [];

        let bounds = [];

        kmlPuntos.forEach((p, idx) => {
            const lat = parseFloat(p.lat);
            const lon = parseFloat(p.lon);

            bounds.push([lat, lon]);

            let colorObj = obtenerColor(p.col);

            let marcador = L.marker(
                [lat, lon],
                { icon: crearIconoSVG(colorObj.hex) }
            ).addTo(mapKml);

            // Un clic en el pin abre la única paleta flotante reutilizable
            marcador.on('click', function () {
                this.closePopup();
                abrirPaletaMapa(idx);
            });

            marcador.bindPopup(`
                <div style="min-width:160px;">
                    <strong>${escaparHTML(p.nom || 'Punto ' + (idx + 1))}</strong>
                    <br>
                    <span style="font-size:12px;color:#64748b;">
                        ${escaparHTML(p.lat)}, ${escaparHTML(p.lon)}
                    </span>
                    <br>
                    <span style="font-size:12px;">
                        ${escaparHTML(p.d1)}
                    </span>
                    <br><br>
                    <span style="font-size:11px;color:#265b4e;">
                        🎨 Haz clic en el pin para cambiar su color
                    </span>
                </div>
            `);

            markersKml.push(marcador);
        });

        if (bounds.length === 1) {
            mapKml.setView(bounds[0], 15);
        } else {
            mapKml.fitBounds(bounds, { padding: [30, 30] });
        }
    }, 100);

    tempDatosGuardar = {
        modoApp: 'Mapa KML',
        resumen: `Puntos procesados en KML: ${kmlPuntos.length}`,
        linkRuta: `https://www.google.com/maps/search/?api=1&query=${kmlPuntos[0].lat},${kmlPuntos[0].lon}`,
        datos: { totalPuntos: kmlPuntos.length }
    };

    renderizarBotonGuardar('k');
}

// ---------- J9.7 Botón Google Maps del KML (NUEVO) ----------
/*
   - 1 punto: abre Google Maps centrado en ese punto.
   - 2 o más puntos: abre Google Maps con todos los puntos en el orden
     de la tabla (Google permite máximo 10 puntos por enlace; si hay más,
     se usan los primeros 10).
*/
function abrirKmlEnGoogleMaps() {
    if (!kmlPuntos || kmlPuntos.length === 0) {
        alert("Primero genera el mapa KML.");
        return;
    }

    if (kmlPuntos.length === 1) {
        window.open(
            `https://www.google.com/maps/search/?api=1&query=${kmlPuntos[0].lat},${kmlPuntos[0].lon}`,
            '_blank'
        );
        return;
    }

    let puntos = kmlPuntos;

    if (puntos.length > 10) {
        alert("Google Maps permite máximo 10 puntos por enlace. Se abrirán los primeros 10.\nPara ver todos con sus colores, descarga el KML e impórtalo en Google My Maps (mymaps.google.com).");
        puntos = puntos.slice(0, 10);
    }

    let url = generarGoogleMapsUrl(
        puntos.map(p => ({ lat: p.lat, lon: p.lon }))
    );

    window.open(url, '_blank');
}
