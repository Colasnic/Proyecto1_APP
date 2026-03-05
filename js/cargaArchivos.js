/*
    js/cargaArchivos.js

    Funcionalidad:
    - Parsear un archivo CSV subido por el usuario (se usa PapaParse para manejar campos
        entrecomillados que contienen comas).
    - Normalizar filas desalineadas (si una fila tiene más campos que la cabecera,
        concatena los extras en la última columna).
    - Poblar dos selectores de columna y graficar hasta dos series con Chart.js.

    Elementos del DOM usados:
    - `#csvFile`      : input file
    - `#columnSelect` : primer selector de columna
    - `#columnSelect2`: segundo selector de columna
    - `#graficoCSV`   : canvas para Chart.js

    Notas:
    - Si prefieres que PapaParse use la primera fila como cabeceras automáticamente,
        cambia la opción `header` a `true` en la llamada a `Papa.parse` y ajusta la
        lógica de normalización según sea necesario.
*/

let datasetGlobal = [];
let headersGlobal = [];
let chartCSV;

document.getElementById("csvFile").addEventListener("change", function(e){
    const file = e.target.files[0];

    if (!file) return;

    /* Analizamos el archivo CSV de forma robusta con PapaParse. Establecemos `header: false` 
    para poder tratar explícitamente la primera fila como encabezado y aplicar una heurística de normalización 
    cuando las filas tienen un número de campos diferente al del encabezado.*/

    Papa.parse(file, {
        dynamicTyping: false,
        skipEmptyLines: true,
        complete: function(results) {
            const rows = results.data; // matriz de matrices (ya que header:false)

            if (!rows || rows.length === 0) {
                headersGlobal = [];
                datasetGlobal = [];
                generarSelectorColumnas();
                return;
            }

            // Si PapaParse devolvió arrays: la primera fila la tratamos como cabeceras
            if (Array.isArray(rows[0])) {
                const headerRow = rows[0].map(h => String(h).replace(/"/g, "").trim());
                headersGlobal = headerRow;

                // Resto de filas como arrays de valores (limpiamos comillas y espacios)
                const dataRows = rows.slice(1).map(r => r.map(c => (c === undefined ? '' : String(c).replace(/"/g, '').trim())));

                // Heurística de normalización:
                // - Si una fila tiene más campos que la cabecera, se unen los campos extra
                //   en la última columna (se asume que las comas extra estaban dentro
                //   de un campo sin cerrar correctamente; ajustar si necesitas otra lógica).
                // - Si faltan campos, se rellenan con cadenas vacías.
                datasetGlobal = dataRows.map(r => {
                    let normalized = [];
                    if (r.length > headersGlobal.length) {
                        normalized = r.slice(0, headersGlobal.length - 1).concat([r.slice(headersGlobal.length - 1).join(",")]);
                    } else if (r.length < headersGlobal.length) {
                        normalized = r.concat(new Array(headersGlobal.length - r.length).fill(''));
                    } else {
                        normalized = r;
                    }
                    let obj = {};
                    headersGlobal.forEach((h, i) => obj[h] = normalized[i]);
                    return obj;
                });

            } else {
                // Si PapaParse devolviera objetos (header:true), se normaliza igualmente
                headersGlobal = results.meta && results.meta.fields ? results.meta.fields.slice() : Object.keys(rows[0]);
                datasetGlobal = rows.map(r => {
                    let obj = {};
                    headersGlobal.forEach(h => {
                        obj[h] = r[h] !== undefined && r[h] !== null ? String(r[h]).replace(/"/g, '').trim() : '';
                    });
                    return obj;
                });
            }

            // Después de parsear y normalizar, llenar los selectores y graficar
            generarSelectorColumnas();
        },
        header: false
    });
});

/**
 * Rellena los selectores de columna con las cabeceras detectadas.
 * - Crea las opciones para `#columnSelect` y `#columnSelect2` a partir de `headersGlobal`.
 * - Asigna el evento `onchange` para que al cambiar cualquiera de los selects
 *   se re-grafiquen las series.
 * - Llama a `graficarColumnas` para renderizar un gráfico inicial si hay datos.
 */
function generarSelectorColumnas(){

    const select1 = document.getElementById("columnSelect");
    const select2 = document.getElementById("columnSelect2");
    // Limpiar opciones anteriores
    select1.innerHTML = "";
    select2.innerHTML = "";

    // Poblar ambos select con las cabeceras detectadas
    headersGlobal.forEach(header => {
        const option1 = document.createElement("option");
        option1.value = header;
        option1.textContent = header;
        select1.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = header;
        option2.textContent = header;
        select2.appendChild(option2);
    });

    // Re-graficar cuando cambie cualquiera de los selects
    select1.onchange = graficarColumnas;
    select2.onchange = graficarColumnas;

    // Graficar inicialmente (si ya hay datos)
    graficarColumnas();
}


/**
 * Construye las series a graficar y crea el gráfico con Chart.js.
 * - Toma las columnas seleccionadas en `#columnSelect` y `#columnSelect2`.
 * - Convierte valores numéricos (reemplazando coma decimal por punto) con `parseNumber`.
 * - Si ambas columnas son iguales, solo añade una serie.
 * - Destruye el gráfico previo (`chartCSV`) antes de crear uno nuevo.
 */
function graficarColumnas() {
    if(!datasetGlobal || datasetGlobal.length === 0) return; // nada que graficar

    // ======= EJE X: combinar Fecha + Hora =======
    const dataX = datasetGlobal.map(fila => {
        // crear fecha legible: "dd/mm/yyyy hh:mm:ss"
        return fila["Fecha"] + " " + fila["Hora"];
    });

    // ======= EJE Y: Temp(C) y Voltaje(mV) =======
    const parseNumber = (valor) => {
        if (!valor) return null;
        const numero = Number(String(valor).replace(",", "."));
        return isNaN(numero) ? null : numero;
    };

    const dataTemp = datasetGlobal.map(fila => parseNumber(fila["Temp(C)"]));
    const dataVoltaje = datasetGlobal.map(fila => parseNumber(fila["Voltaje(mV)"]));

    // ======= Destruir gráfico previo si existe =======
    if(chartCSV) chartCSV.destroy();

    // ======= Crear nuevo gráfico =======
    chartCSV = new Chart(
        document.getElementById("graficoCSV"),
        {
            type: "line",
            data: {
                labels: dataX, // eje X = Fecha + Hora
                datasets: [
                    {
                        label: "Temp(C)",
                        data: dataTemp,
                        borderColor: "#2e7d32",
                        backgroundColor: "#2e7d32",
                        fill: false,
                        tension: 0.2
                    },
                    {
                        label: "Voltaje(mV)",
                        data: dataVoltaje,
                        borderColor: "#1565c0",
                        backgroundColor: "#1565c0",
                        fill: false,
                        tension: 0.2
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: true } },
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: { 
                        display: true, 
                        title: { display: true, text: "Fecha / Hora" },
                        ticks: { maxRotation: 90, minRotation: 45 }
                    },
                    y: { 
                        display: true, 
                        title: { display: true, text: "Valor" } 
                    }
                }
            }
        }
    );
}