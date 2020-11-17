
const valid = require("validate-box"); //validators
const { ipcRenderer } = require("electron");

const form = document.querySelector("form#product");
const pid = document.querySelector("input#pid");
const name = document.querySelector("input#name");
const price = document.querySelector("input#price");
const info = document.querySelector("textarea#info");
const reset = document.querySelector("button[type=reset]");
const products = document.querySelector("div#products");

ipcRenderer.on("product:get", function(ev, product) {
	reset.click(); //first => clear inputs
	pid.value = product._id;
	name.value = product.name;
	price.value = valid.nb.float(product.price);
	info.value = product.info;
});

form.addEventListener("submit", ev => {
	ipcRenderer.send("product:save", { _id: pid.value, name: name.value, price: price.value, info: info.value });
	ev.preventDefault();
});
reset.addEventListener("click", ev => {
	pid.value = name.value = price.value = info.value = null;
	name.classList.remove("is-invalid");
	price.classList.remove("is-invalid");
	info.classList.remove("is-invalid");
	name.focus();
});
ipcRenderer.on("product:save-ok", function(ev) {
	ipcRenderer.send("show", name.value + " guardado correctamente");
	reset.click();
	getProducts();
});

function setError(el, msg) {
	el.focus();
	el.classList.add("is-invalid");
	el.parentNode.querySelector("#invalid-" + el.id).innerHTML = msg;
}
ipcRenderer.on("product:save-error", function(ev, errors) {
	errors.info && setError(info, errors.info);
	errors.price && setError(price, errors.price);
	errors.name && setError(name, errors.name);
	ipcRenderer.send("show", "Error al guardar los datos introducidos");
});

// Init. view
const tplProduct ='<div class="card card-body m-2 animated fadeInRight"><h4>@name;</h4><p>@info;</p><h3>@price; &euro;</h3><p><button class="btn btn-danger btn-sm" data-id="@_id;">Delete</button><button class="btn btn-secondary btn-sm ml-1" data-id="@_id;">Edit</button></p></div>';
function getProducts() { ipcRenderer.send("product:get-all", tplProduct); }
ipcRenderer.on("product:get-all", function(ev, list) {
	products.innerHTML = list;
	products.querySelectorAll(".btn-secondary").forEach(btn => {
		btn.addEventListener("click", ev => { ipcRenderer.send("product:get", ev.target.dataset.id); });
	})
	products.querySelectorAll(".btn-danger").forEach(btn => {
		btn.addEventListener("click", ev => {
			if (confirm("¿Confirma que desea eliminar este producto?"))
				ipcRenderer.send("product:delete", ev.target.dataset.id);
		});
	})
});
getProducts();
