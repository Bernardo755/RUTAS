/* Gestor principal: tarjetas de tarea y proceso nuevo */

// =========================================================
// J3. GESTOR PRINCIPAL (SELECTOR Y PROCESO NUEVO)
// =========================================================
// Tarjetas de tarea: sincronizan el selector oculto y ejecutan la lógica original
function elegirTarea(valor) {
    document.getElementById('main-selector').value = valor;
    document.querySelectorAll('.task-card').forEach(c => c.classList.toggle('active', c.dataset.task === valor));
    manejarSeleccionPrincipal();
}

function manejarSeleccionPrincipal() {
    let val = document.getElementById('main-selector').value;
    document.getElementById('panel-nuevo').style.display = (val === 'nuevo') ? 'block' : 'none';
    document.getElementById('panel-consulta').style.display = (val === 'consulta') ? 'block' : 'none';
    document.getElementById('app-container').style.display = (val === 'container') ? 'block' :'none';

    if (val === 'libre') {
        estadoActual = 'libre';
        procesoActivo = ''; subprocesoActivo = '';
        document.getElementById('app-container').style.display = 'block';
        setTimeout(() => { if(mapMulti) mapMulti.invalidateSize(); }, 300);
    }
}

function iniciarProcesoNuevo() {
    procesoActivo = document.getElementById('proc-nombre').value.trim();
    subprocesoActivo = document.getElementById('proc-sub').value.trim();
    if(!procesoActivo || !subprocesoActivo) {
        alert("Debes ingresar un nombre de proceso y sub-proceso."); return;
    }
    estadoActual = 'nuevo';
    document.getElementById('app-container').style.display = 'block';
    alert(`Proceso Iniciado:\nProceso: ${procesoActivo}\nSub-proceso: ${subprocesoActivo}`);
    setTimeout(() => { if(mapMulti) mapMulti.invalidateSize(); }, 300);
}
