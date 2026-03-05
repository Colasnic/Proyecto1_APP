/* ===================================
   FUNCIONES DEL MODAL DE CÓDIGO
   
   Archivo: circuito.js
   Propósito: Controlar el comportamiento interactivo del modal
              que muestra el código Arduino ampliado
   
   Funcionalidades:
   - Abrir/cerrar modal
   - Cerrar al hacer clic fuera (overlay)
   - Inicializar modal cerrado al cargar la página
   ==================================== */

/* ===================================
   openCodeModal()
   
   Función: Abre el modal del código
   
   ¿Cuándo se ejecuta?
   - Cuando el usuario hace clic en el bloque de código
   - onclick="openCodeModal()" en circuito.html
   
   ¿Qué hace?
   - Selecciona el elemento con id "codeModal"
   - Cambia su display de "none" a "block"
   - El CSS del modal lo mostrará centrado en pantalla
   ==================================== */
function openCodeModal() {
    document.getElementById('codeModal').style.display = 'block';
}


function openCodeModalArduino() {
    document.getElementById('codeModalArduino').style.display = 'block';
}
/* ===================================
   closeCodeModal()
   
   Función: Cierra el modal del código
   
   ¿Cuándo se ejecuta?
   - Cuando el usuario hace clic en el botón "×"
   - Cuando hace clic fuera del modal
   - Cuando navega a otra página
   - Cuando recarga la página
   
   ¿Qué hace?
   - Selecciona el elemento con id "codeModal"
   - Cambia su display de "block" a "none"
   - El modal desaparece inmediatamente
   ==================================== */
function closeCodeModal() {
    document.getElementById('codeModal').style.display = 'none';
}

function closeCodeModalArduino() {
    document.getElementById('codeModalArduino').style.display = 'none';
}

/* ===================================
   EVENT LISTENER: window.onclick
   
   Propósito: Cerrar el modal al hacer clic fuera de él
   
   ¿Cómo funciona?
   1. Cada vez que el usuario hace clic ANYWHERE en la página
   2. Este handler se ejecuta
   3. Verifica si el clic fue DIRECTAMENTE en el overlay (.modal)
   4. Si es así (event.target == modal), cierra el modal
   
   ¿Por qué "event.target == modal"?
   - Previene que cierres el modal al hacer clic DENTRO
   - Solo cierra si haces clic en el fondo oscuro (overlay)
   - event.target es el elemento clickeado
   ==================================== */
window.onclick = function(event) {
    var modal = document.getElementById('codeModal');
    /* Si el click fue directamente en el overlay (fondo oscuro) */
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

/* ===================================
   EVENT LISTENER: DOMContentLoaded
   
   Propósito: Inicializar el modal cuando la página carga
   
   ¿Cuándo se ejecuta?
   - Después de que el HTML se haya cargado completamente
   - ANTES de que las imágenes y otros recursos terminen de cargar
   - Es el momento perfecto para setup inicial
   
   ¿Qué hace?
   1. Espera a que el DOM esté listo
   2. Obtiene una referencia al elemento modal
   3. Verifica que exista (if modal)
   4. Lo deja oculto por defecto (display: "none")
   
   ¿Por qué es importante?
   - Asegura que el modal esté siempre cerrado al entrar a la página
   - Evita que el modal quede abierto si el usuario recarga
   - Previene que se vea un "parpadeo" inicial
   ==================================== */
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("codeModal");
    const imageModal = document.getElementById("imageModal");
    const modalArduino = document.getElementById("codeModalArduino");
    if (modal ) {
        modal.style.display = "none"; 
    }

    if (imageModal) {
        imageModal.style.display = "none";
    }

    if (modalArduino) {
        modalArduino.style.display = "none";
    }
});

/* ===================================
   CERRAR MODAL AL HACER CLIC FUERA
   
   Este handler cierra CUALQUIER modal cuando haces clic
   en el overlay (fondo oscuro) de la página.
   ==================================== */
window.onclick = function(event) {
    var codeModal = document.getElementById('codeModal');
    var imageModal = document.getElementById('imageModal');
    
    /* Cerrar modal de código */
    if (codeModal && event.target == codeModal) {
        codeModal.style.display = 'none';
    }
    
    /* Cerrar modal de imagen */
    if (imageModal && event.target == imageModal) {
        imageModal.style.display = 'none';
    }
}

/* ===================================
   FUNCIONES PARA MODAL DE IMÁGENES
   
   Permite ampliar las imágenes cuando el usuario
   hace clic en ellas. Similar al modal de código
   pero optimizado para mostrar imágenes en pantalla.
   ==================================== */

/* ===================================
   openImageModal(imageSrc)
   
   Función: Abre el modal mostrando la imagen ampliada
   
   Parámetro:
   - imageSrc: ruta de la imagen a mostrar
   
   ¿Cuándo se ejecuta?
   - Cuando el usuario hace clic en cualquier imagen
   - onclick="openImageModal(this.src)" en cada <img>
   
   ¿Qué hace?
   1. Obtiene el modal del DOM
   2. Obtiene el elemento <img> dentro del modal
   3. Asigna la fuente de imagen (imageSrc)
   4. Muestra el modal (display = 'block')
   ==================================== */
function openImageModal(imageSrc) {
    var modal = document.getElementById('imageModal');
    var img = document.getElementById('modalImage');
    img.src = imageSrc;
    modal.style.display = 'block';
}

/* ===================================
   closeImageModal()
   
   Función: Cierra el modal de imagen
   
   ¿Cuándo se ejecuta?
   - Cuando el usuario hace clic en el botón "×"
   - Cuando hace clic fuera del modal (en el overlay)
   
   ¿Qué hace?
   - Selecciona el modal con id "imageModal"
   - Cambia su display a "none"
   - La imagen desaparece inmediatamente
   ==================================== */
function closeImageModal() {
    var modal = document.getElementById('imageModal');
    modal.style.display = 'none';
}