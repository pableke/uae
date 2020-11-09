
const { remote } = require("electron");
const main = remote.require("./main");

const form = document.querySelector("form#product");
const pid = document.querySelector("input#pid");
const name = document.querySelector("input#name");
const price = document.querySelector("input#price");
const info = document.querySelector("textarea#info");
const reset = document.querySelector("button[type=reset]");

const products = document.querySelector("div#products");

const tplProduct ='<div class="card card-body m-2 animated fadeInRight"><h4>@name;</h4><p>@info;</p><h3>@price; &euro;</h3><p><button class="btn btn-danger btn-sm" onclick="deleteProduct(@_id;)">Delete</button><button class="btn btn-secondary btn-sm ml-1" onclick="editProduct(@_id;)">Edit</button></p></div>';
function getProducts() { //init function
	products.innerHTML = main.producto.formatAll(tplProduct);
}

function editProduct(id) {
	let product = main.producto.getById(id);
	pid.value = product._id;
	name.value = product.name;
	price.value = product.price;
	info.value = product.info;
	name.focus();
}

function deleteProduct(id) {
	if (confirm("¿Confirma que desea eliminar este producto?")) {
		main.producto.deleteById(id).then(table => {
			main.showNotification("Electron App", "Producto eliminado correctamente");
			getProducts();
		});
	}
}

form.addEventListener("submit", ev => {
	ev.preventDefault();
	main.producto.save(pid.value, name.value, price.value, info.value);
	main.showNotification("Electron App", name.value + " guardado correctamente");
	reset.click();
	getProducts();
});
reset.addEventListener("click", ev => {
	pid.value = name.value = price.value = info.value = null;
	name.focus();
});

// Init
getProducts();
