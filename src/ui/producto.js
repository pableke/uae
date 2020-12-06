
const valid = require("validate-box"); //validators
const { ipcRenderer } = require("electron");

const forms = document.querySelectorAll("form");
const products = document.querySelector("div#products");
const inputs = forms[0].elements; //inputs node-list by ID

function fnSubmit(form) {
	ipcRenderer.send(form.action, valid.values(form.elements));
}
function fnResetForm(form) {
	form.classList.remove("d-none"); //force show form
	valid.focus(form.elements).reset(form.elements, el => { el.classList.remove("is-invalid"); });
}
ipcRenderer.on("product:get", function(ev, product) {
	fnResetForm(forms[0]); //show form, clear inputs and set focus
	forms[1].classList.add("d-none"); //hide search form
	valid.load(inputs, product, { price: valid.nb.float });
});

function setError(id, msg) {
	let el = inputs[id];
	el.classList.add("is-invalid");
	el.parentNode.querySelector("#invalid-" + id).innerHTML = msg;
	el.focus();
}
ipcRenderer.on("product:save", function(ev, data) {
	if (data.errno > 0) {
		data.info && setError("info", data.info);
		data.price && setError("price", data.price);
		data.name && setError("name", data.name);
		//ipcRenderer.send("show", "Error al guardar los datos introducidos");
	}
	else {
		ipcRenderer.send("show", "'" + data.name + "' guardado correctamente");
		fnResetForm(forms[0]); //show form, clear inputs and set focus
		fnSubmit(forms[1]); //reload list
	}
});

// Init. view
ipcRenderer.on("product:search", function(ev, list) {
	products.innerHTML = list || '<div class="card card-body m-2 animated fadeInRight text-center"><h3>No data found</h3></div>';
	products.querySelectorAll(".btn-secondary").forEach(btn => {
		btn.addEventListener("click", ev => { ipcRenderer.send("product:get", ev.target.dataset.id); });
	});
	products.querySelectorAll(".btn-danger").forEach(btn => {
		btn.addEventListener("click", ev => {
			if (confirm("¿Confirma que desea eliminar este producto?"))
				ipcRenderer.send("product:delete", ev.target.dataset.id);
		});
	});
});

//Init. DOM elements
forms.forEach((form, i) => {
	form.addEventListener("submit", ev => {
		ev.preventDefault(); //prevent default submit
		valid.focus(form.elements); //focus on first
		fnSubmit(form); //send form
	});
	form.querySelectorAll("button[type=reset]").forEach(el => {
		el.addEventListener("click", ev => { fnResetForm(form); });
	});
	form.querySelectorAll(".btn-toggle").forEach(el => {
		el.addEventListener("click", ev => { //toggle forms
			forms.forEach(form => { form.classList.toggle("d-none"); });
			valid.focus(forms[(i+1)%2].elements);
		});
	});
});
fnSubmit(forms[1]);
