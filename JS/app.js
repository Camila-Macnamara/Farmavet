let medicamentos = [];

// Cargar medicamentos desde el archivo JSON
fetch('./js/productos.json')

  .then(response => response.json())
  .then(data => {
    medicamentos = data;
    mostrarProductos(); // Muestra los productos después de cargarlos
    actualizarCarritoEnDOM();
  })
  .catch(error => console.error('Error al cargar los productos:', error));


// Lógica del carrito

const botonFinalizar = document.getElementById("finalizar-pedido");
const formularioContainer = document.getElementById("formulario-container");
const formularioPedido = document.getElementById("formulario-pedido");
const mensaje = document.getElementById("mensaje");


// Carrito de compras
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Función para agregar productos al carrito
function agregarAlCarrito(idMedicamento, presentacion) {
  const medicamento = medicamentos.find((m) => m.id === idMedicamento);
  const itemCarrito = carrito.find(
    (item) =>
      item.medicamento.id === idMedicamento &&
      item.presentacion === presentacion
  );

  if (itemCarrito) {
    itemCarrito.cantidad++;
  } else {
    carrito.push({ medicamento, presentacion, cantidad: 1 });
  }

  guardarCarritoEnLocalStorage(); 
  actualizarCarritoEnDOM(); 
}

// Función para eliminar o reducir la cantidad de un producto en el carrito
function modificarCantidadEnCarrito(idMedicamento, presentacion, accion) {
  const itemCarrito = carrito.find(
    (item) =>
      item.medicamento.id === idMedicamento &&
      item.presentacion === presentacion
  );

  if (itemCarrito) {
    if (accion === "incrementar") {
      itemCarrito.cantidad++;
    } else if (accion === "reducir") {
      itemCarrito.cantidad--;
      if (itemCarrito.cantidad === 0) {
        carrito = carrito.filter((item) => item !== itemCarrito);
      }
    }
  }

  guardarCarritoEnLocalStorage();
  actualizarCarritoEnDOM();
}

// Función para guardar el carrito en Local Storage
function guardarCarritoEnLocalStorage() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// Función para calcular el total del carrito
function calcularTotal() {
  return carrito.reduce((total, item) => {
    const precioPresentacion = item.medicamento.presentaciones.find(
      (p) => p.nombre === item.presentacion
    ).precio;
    return total + precioPresentacion * item.cantidad;
  }, 0);
}

// Función para actualizar el carrito en el DOM
function actualizarCarritoEnDOM() {
  const listaCarrito = document.getElementsByClassName("listaCarrito")[0];
  listaCarrito.innerHTML = ""; 

  carrito.forEach((item) => {
    const li = document.createElement("li");
    const precioPresentacion = item.medicamento.presentaciones.find(
      (p) => p.nombre === item.presentacion
    ).precio; 
    li.textContent = `${item.medicamento.nombre} (${item.presentacion}) - ${item.cantidad} unidades - Precio: $${precioPresentacion}`;

    // Botón para aumentar la cantidad
    const botonAumentar = document.createElement("button");
    botonAumentar.textContent = "+";
    botonAumentar.onclick = () =>
      modificarCantidadEnCarrito(
        item.medicamento.id,
        item.presentacion,
        "incrementar"
      );

    // Botón para reducir la cantidad
    const botonReducir = document.createElement("button");
    botonReducir.textContent = "-";
    botonReducir.onclick = () =>
      modificarCantidadEnCarrito(
        item.medicamento.id,
        item.presentacion,
        "reducir"
      );

    li.appendChild(botonAumentar);
    li.appendChild(botonReducir);
    listaCarrito.appendChild(li);
  });

  // Calcular el total y mostrarlo
  const total = calcularTotal();
  const totalElement = document.getElementsByClassName("totalCarrito")[0];
  totalElement.textContent = `Total: $${total}`;
}

// Muestra el formulario al hacer clic en finalizar pedido
botonFinalizar.addEventListener("click", () => {
  formularioContainer.style.display = "block"; 
});


document.addEventListener('DOMContentLoaded', () => {
    formularioPedido.addEventListener('submit', (event) => {
        event.preventDefault(); 

// Obtener los datos del formulario y llenarlos automáticamente
const nombre = "Camila MacNamara";
const telefono = "123456789";
const direccion = "Calle CoderHouse 2024";

document.getElementById("nombre").value = nombre;
document.getElementById("telefono").value = telefono;
document.getElementById("direccion").value = direccion;

// Mostrar mensaje de confirmación
mensaje.textContent = `Gracias por comprar en Farma Vet, ${nombre}. Estaremos enviando tus productos a ${direccion} en los próximos días.`;
mensaje.style.display = 'block'; 

 // Limpiar el carrito de pedido
 carrito = []; 
 localStorage.removeItem("carrito"); 
 actualizarCarritoEnDOM(); 

// Limpiar el formulario y lo oculta
formularioPedido.reset();
formularioContainer.style.display = 'none'; 
});
});

// Generar los botones de productos dinámicamente
function mostrarProductos() {
  const productosContainer = document.getElementById("productos-container"); 
  productosContainer.innerHTML = "";

  medicamentos.forEach((medicamento) => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";

    // Crear la tarjeta de producto
    col.innerHTML = `
            <div class="card">
                <img src="${medicamento.imagen}" class="card-img-top" alt="${
      medicamento.nombre
    }">
                <div class="card-body">
                    <h5 class="card-title">${medicamento.nombre}</h5>
                    <p class="card-text">Propiedades: ${
                      medicamento.propiedades
                    }</p>
                    <p>Precio: <span class="precio" id="precio-${
                      medicamento.id
                    }">$${medicamento.presentaciones[0].precio}</span></p>
                    
                    <!-- Select para presentaciones -->
                    <select class="form-select mb-3" id="select-${
                      medicamento.id
                    }">
                        ${medicamento.presentaciones
                          .map(
                            (presentacion) => `
                            <option value="${presentacion.nombre}" data-precio="${presentacion.precio}">
                                ${presentacion.nombre}
                            </option>
                        `
                          )
                          .join("")}
                    </select>
                    
                    <button class="btn btn-primary" id="boton-agregar-${
                      medicamento.id
                    }">Agregar al Carrito</button>
                </div>
            </div>
        `;

    const selectPresentacion = col.querySelector(`#select-${medicamento.id}`);
    selectPresentacion.onchange = (event) => {
      const selectedOption = event.target.options[event.target.selectedIndex];
      const nuevoPrecio = selectedOption.dataset.precio; 
      document.getElementById(
        `precio-${medicamento.id}`
      ).textContent = `$${nuevoPrecio}`;
    };

    const botonAgregar = col.querySelector(`#boton-agregar-${medicamento.id}`);
    botonAgregar.onclick = () => {
      const presentacionSeleccionada = selectPresentacion.value;
      agregarAlCarrito(medicamento.id, presentacionSeleccionada);
    };

    productosContainer.appendChild(col);
  });
}

mostrarProductos();
actualizarCarritoEnDOM();
