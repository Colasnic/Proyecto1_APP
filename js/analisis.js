/*
  js/analisis.js
  ----------------
  Script encargado de:
    - Descargar datos abiertos desde datos.gov.co
    - Filtrar y agrupar mediciones por año
    - Calcular promedios anuales de oxígeno disuelto y turbiedad
    - Dibujar dos gráficos con Chart.js
    - Permitir ampliar cualquier gráfico en un modal
*/

// URL de la API (límite de registros para controlar tamaño)
const API_URL = "https://www.datos.gov.co/resource/syfm-bqhq.json?$limit=1000";

// Variables globales para los gráficos
let chart1, chart2;
let modalChart;

// Petición de datos y procesamiento principal
fetch(API_URL)
  .then(res => res.json())
  .then(data => {

    // Filtrar sólo registros que contienen los campos necesarios
    const registros = data.filter(r => 
        r.oxigeno_disuelto && 
        r.turbiedad &&
        r.fecha_de_la_medicion
    );

    // Estructura para agrupar valores por año
    let datosPorAnio = {};

    // Recorrer registros y clasificar por año
    registros.forEach(r => {
        const fecha = new Date(r.fecha_de_la_medicion);
        const anio = fecha.getFullYear();

        // Convertir cadenas a números
        const oxigeno = parseFloat(r.oxigeno_disuelto);
        const turbiedad = parseFloat(r.turbiedad);

        // Ignorar valores no numéricos
        if(!isNaN(oxigeno) && !isNaN(turbiedad)){
            if(!datosPorAnio[anio]){
                datosPorAnio[anio] = { oxigenos: [], turbiedades: [] };
            }
            datosPorAnio[anio].oxigenos.push(oxigeno);
            datosPorAnio[anio].turbiedades.push(turbiedad);
        }
    });

    // Años disponibles ordenados
    const anios = Object.keys(datosPorAnio).sort();

    // Calcular promedios anuales (dos arrays paralelos a 'anios')
    const promedioOxigeno = anios.map(a => {
        const vals = datosPorAnio[a].oxigenos;
        return (vals.reduce((x,y)=>x+y,0)/vals.length).toFixed(2);
    });

    const promedioTurbiedad = anios.map(a => {
        const vals = datosPorAnio[a].turbiedades;
        return (vals.reduce((x,y)=>x+y,0)/vals.length).toFixed(2);
    });

    // ===== GRAFICO 1: Oxígeno promedio anual (barra) =====
    chart1 = new Chart(document.getElementById("graficoOxigeno"), {
        type: "bar",
        data: {
            labels: anios,
            datasets: [{
                label: "Promedio anual Oxígeno (mg/L)",
                data: promedioOxigeno,
                backgroundColor: "#1976d2"
            }]
        },
        options: {
            responsive: true,
            animation: { duration: 1500 }
        }
    });

    // ===== GRAFICO 2: Comparación Oxígeno vs Turbiedad (barras agrupadas) =====
    chart2 = new Chart(document.getElementById("graficoDepto"), {
        type: "bar",
        data: {
            labels: anios,
            datasets: [
                {
                    label: "Oxígeno promedio anual (mg/L)",
                    data: promedioOxigeno,
                    backgroundColor: "#1976d2"
                },
                {
                    label: "Turbiedad promedio anual (NTU)",
                    data: promedioTurbiedad,
                    backgroundColor: "#ff9800"
                }
            ]
        },
        options: {
            responsive: true,
            animation: { duration: 1500 },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Activar comportamiento de ampliación modal para ambos gráficos
    activarModal(chart1);
    activarModal(chart2);

});


// ===== FUNCION: activarModal =====
// Añade un listener para ampliar el gráfico en un modal al hacer clic.
function activarModal(chart) {

    const modal = document.getElementById("chartModal");
    const modalCanvas = document.getElementById("modalCanvas");

    // Al hacer clic sobre el canvas del chart original, abrir modal
    chart.canvas.onclick = function() {
        modal.style.display = "flex";

        // Si ya había un chart en el modal, destruirlo para evitar fugas
        if(modalChart) modalChart.destroy();

        // Recrear el mismo tipo y datos dentro del modal (sin mantener aspect ratio)
        modalChart = new Chart(modalCanvas, {
            type: chart.config.type,
            data: chart.config.data,
            options: { responsive: true, maintainAspectRatio: false }
        });
    };

    // Cerrar modal al hacer clic en el fondo
    modal.onclick = function() { modal.style.display = "none"; };

}