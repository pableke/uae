
const { remote } = require("electron");
const main = remote.require("./main");
const valid = require("validate-box"); //validators

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
	reset.click(); //clear inputs
	pid.value = product._id;
	name.value = product.name;
	price.value = valid.nb.float(product.price);
	info.value = product.info;
}

function deleteProduct(id) {
	if (confirm("¿Confirma que desea eliminar este producto?")) {
		main.producto.deleteById(id).then(table => {
			main.showNotification("Electron App", name.value + " eliminado correctamente");
			getProducts();
		});
	}
}

function setError(el, msg) {
	el.focus();
	el.classList.add("is-invalid");
	document.querySelector("#invalid-" + el.id).innerHTML = msg;
}

form.addEventListener("submit", ev => {
	ev.preventDefault();
	let data = main.producto.save(pid.value, name.value, price.value, info.value);
	if (data.errno) {
		data.info && setError(info, data.info);
		data.price && setError(price, data.price);
		data.name && setError(name, data.name);
		return main.showNotification("Electron App", "Error al guardar los datos introducidos");
	}

	main.showNotification("Electron App", name.value + " guardado correctamente");
	reset.click();
	getProducts();
});
reset.addEventListener("click", ev => {
	pid.value = name.value = price.value = info.value = null;
	name.classList.remove("is-invalid");
	price.classList.remove("is-invalid");
	info.classList.remove("is-invalid");
	name.focus();
});

// Init
getProducts();
