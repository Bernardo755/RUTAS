/* Búsqueda en Base de Datos (ID -> coordenadas) */

// =========================================================
// J4. BÚSQUEDA EN BASE DE DATOS (MODIFICADO)
// =========================================================

// Alterna entre ingreso manual y búsqueda por ID en BD
function toggleBD(modo) {
    let isDB = document.querySelector(`input[name="${modo}_tipo"]:checked`).value === 'db';
    document.getElementById(`${modo}_btn_bd`).style.display = isDB ? 'block' : 'none';
    let txt = document.getElementById(modo === 'm' ? 'm_waypoints' : (modo === 's' ? 's_destinos' : 'k_datos'));
    txt.placeholder = isDB
        ? "Ingresa aquí los ID a buscar en la Base (uno por línea)..."
        : "Formato manual (Latitud, Longitud, Nombre...)";
}

/*
   Busca cada valor por separado y respeta el MISMO ORDEN en que se ingresaron.
   - Si lo encuentra: inserta las coordenadas y demás datos de la base, pero en Nombre deja el valor que escribiste.
   - Si NO lo encuentra: NO lo elimina; conserva el valor que escribiste
     (en la columna Nombre, después de las coordenadas) y pone "NO ENCONTRADO"
     en los demás campos.
*/
async function extraerDeBD(modo) {
    const NO_ENC = 'NO ENCONTRADO';
    let txt = document.getElementById(modo === 'm' ? 'm_waypoints' : (modo === 's' ? 's_destinos' : 'k_datos'));
    let queries = txt.value.trim().split('\n').map(q => q.trim()).filter(q => q);

    if(queries.length === 0) {
        alert("Ingresa al menos un valor para buscar."); return;
    }

    document.getElementById(modo+'_loader').style.display = 'block';
    document.getElementById(modo+'_loader').innerText = "Buscando en registros... ⏳";

    try {
        // Una consulta por cada valor, en paralelo; Promise.all conserva el orden original
        let respuestas = await Promise.all(queries.map(async q => {
            try {
                let url = SCRIPT_URL + "?action=searchDB&queries=" + encodeURIComponent(JSON.stringify([q]));
                let response = await fetch(url);
                let result = await response.json();
                if (result.status === 'success' && result.data && result.data.length > 0) {
                    return { ok: true, data: result.data };
                }
                return { ok: true, data: [] };
            } catch (err) {
                return { ok: false, data: [] };
            }
        }));

        if (respuestas.every(r => !r.ok)) {
            throw new Error("Sin conexión con la base de datos.");
        }

        let lines = [];
        let encontrados = 0, noEncontrados = 0;

        respuestas.forEach((r, i) => {
            let q = queries[i];

            if (r.data.length > 0) {
                encontrados++;
                r.data.forEach(d => {
                    lines.push(
                        (modo === 'k')
                            ? `${d.lat}, ${d.lon}, ${q}, ${d.desc1}, ${d.desc2}, ${d.desc3}, blue`
                            : `${d.lat}, ${d.lon}, ${q}`
                    );
                });
            } else {
                noEncontrados++;
                // Se conserva el valor ingresado y el resto se marca como NO ENCONTRADO
                lines.push(
                    (modo === 'k')
                        ? `${NO_ENC}, ${NO_ENC}, ${q}, ${NO_ENC}, ${NO_ENC}, ${NO_ENC}, blue`
                        : `${NO_ENC}, ${NO_ENC}, ${q}`
                );
            }
        });

        txt.value = lines.join('\n');

        alert(`Búsqueda terminada.\nEncontrados: ${encontrados}\nNo encontrados: ${noEncontrados}\nLos datos se han insertado en el mismo orden.`);
        document.querySelector(`input[name="${modo}_tipo"][value="manual"]`).click();

    } catch (error) {
        console.error(error);
        alert("Error de conexión al consultar la base de datos.");
    } finally {
        document.getElementById(modo+'_loader').style.display = 'none';
        document.getElementById(modo+'_loader').innerText = "Trabajando... ⏳";
    }
}
