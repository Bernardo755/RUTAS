/* Procesos guardados y bitácora */

// =========================================================
// J5. PROCESOS GUARDADOS Y BITÁCORA
// =========================================================
async function cargarProcesosDesdeBD() {
    document.getElementById('loader-consulta').style.display = 'block';
    document.getElementById('bloque-select-consulta').style.display = 'none';
    document.getElementById('resultados-consulta').innerHTML = '';

    try {
        let response = await fetch(SCRIPT_URL + "?action=getProcesos");
        let result = await response.json();

        if(result.status === 'success') {
            let select = document.getElementById('select-consulta-procesos');
            select.innerHTML = '<option value="">Selecciona un proceso...</option>';
            result.data.forEach(p => {
                select.innerHTML += `<option value="${p}">${p}</option>`;
            });
            document.getElementById('bloque-select-consulta').style.display = 'block';
        }
    } catch (e) {
        alert("Error al cargar los procesos guardados.");
    } finally {
        document.getElementById('loader-consulta').style.display = 'none';
    }
}

async function cargarDetalleProceso(procesoNombre) {
    if(!procesoNombre) return;
    document.getElementById('loader-consulta').style.display = 'block';
    try {
        let response = await fetch(SCRIPT_URL + "?action=getDetalleProceso&proceso=" + encodeURIComponent(procesoNombre));
        let result = await response.json();

        if(result.status === 'success') {
            let html = `<h3>Registros de: ${procesoNombre}</h3><table><thead><tr><th>Fecha</th><th>Sub-Proceso</th><th>Modo</th><th>Resumen</th><th>Enlace Ruta</th></tr></thead><tbody>`;
            result.data.forEach(row => {
                let linkHtml = row.linkRuta ? `<a href="${row.linkRuta}" target="_blank" class="btn-link" style="padding:4px 8px; font-size:12px;">🗺️ Ver Ruta</a>` : 'N/A';
                html += `<tr>
                    <td>${new Date(row.fecha).toLocaleString()}</td>
                    <td><strong>${row.subproceso}</strong></td>
                    <td>${row.modo}</td>
                    <td>${row.resumen || ''}</td>
                    <td>${linkHtml}</td>
                </tr>`;
            });
            html += `</tbody></table>`;
            document.getElementById('resultados-consulta').innerHTML = html;
        }
    } catch(e) {
        alert("Error al obtener el detalle del proceso.");
    } finally {
        document.getElementById('loader-consulta').style.display = 'none';
    }
}

function renderizarBotonGuardar(modo) {
    let caja = document.getElementById(modo + '_guardar_btn_box');
    if(estadoActual === 'nuevo') {
        caja.innerHTML = `<button class="action-btn" style="background:#34a853;" onclick="enviarABitacora()">💾 Guardar Resultados y Link en Bitácora</button>`;
    } else {
        caja.innerHTML = '';
    }
}

async function enviarABitacora() {
    if(!tempDatosGuardar || !procesoActivo) return;

    // Si es un objeto individual (Módulo 1) lo envuelve en un arreglo; si ya es arreglo (Módulo 2) lo mantiene
    let listaAEnviar = Array.isArray(tempDatosGuardar) ? tempDatosGuardar : [tempDatosGuardar];

    if (listaAEnviar.length === 0) return;

    try {
        // Una petición HTTP independiente por cada punto/destino
        let promesasEnvio = listaAEnviar.map(item => {
            let payload = {
                proceso: procesoActivo,
                subproceso: subprocesoActivo,
                modo: item.modoApp,
                resumen: item.resumen,
                linkRuta: item.linkRuta,
                datosJSON: JSON.stringify(item.datos)
            };

            let formData = new URLSearchParams();
            formData.append('action', 'saveBitacora');
            formData.append('payload', JSON.stringify(payload));

            return fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });
        });

        // Esperar a que se envíen todos los registros
        await Promise.all(promesasEnvio);

        alert(`¡Guardado exitoso!\nProceso: ${procesoActivo}\nSe registraron ${listaAEnviar.length} punto(s) de forma independiente en la bitácora.`);
    } catch(e) {
        alert("Error al guardar en la bitácora.");
        console.error(e);
    }
}
