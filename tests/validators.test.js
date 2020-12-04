
const valid = require("../src/lib/validator");

describe("Service Validator", () => {
	test("User", () => {
		expect(valid.user({})).toBe(false);
		expect(valid.user({ nombre: "dsf dsd fddsf", ap1: "", correo: "sadfjk fsd" })).toBe(false);
		expect(valid.user({ nombre: "453234", ap1: "asadfa", nif: "11111111H", correo: "sadfjk@fsd.es" })).toBe(true);
	});

	test("Contact", () => {
		expect(valid.contact({})).toBe(false);
		expect(valid.contact({ nombre: "dsf dsd fddsf", correo: "sadfjk-fsd.com", asunto: "uu sddaslkjf dsf", info: "ñlkj  kljklk jaskñjdfl dsafadsf" })).toBe(false);
		expect(valid.contact({ nombre: "dsf dsd fddsf", correo: "ajfjk@fsd.com", asunto: "sd daslkjf dsf" })).toBe(false);
		expect(valid.contact({ nombre: "dsf dsd fddsf", correo: "sadfjk@fsd.pk", asunto: "sddaslkjf dsf", info: "ñlkj  kljklk jaskñjdfl dsafadsf" })).toBe(true);
	});

	test("Login", () => {
		expect(valid.login()).toBe(false);
		expect(valid.login("jkds sdd", "asdf' dk-2")).toBe(false);
		expect(valid.login("jkds-sdd", "kdsfj#ek31")).toBe(true);
	});

	test("Password", () => {
		expect(valid.password()).toBe(false);
		expect(valid.password("jkds sdd", 2342, "rwdfsd")).toBe(false);
		expect(valid.password("jkd'ssdd", "kdsfj#ek31", "kdsfj#ek31")).toBe(false);
		expect(valid.password("jkds-sdd", "k-.dsfj#ek31", "k-.dsfj#ek31")).toBe(true);
	});

	test("Captcha", () => {
		expect(valid.email() && valid.captcha()).toBe(false);
		expect(valid.email("akñljf fsasdkjl") && valid.captcha("")).toBe(false);
		expect(valid.email("akñljf#fsasdkjl") && valid.captcha("kdasjfha")).toBe(false);
		expect(valid.email("lñkjsadf@dfskj.dc") && valid.captcha("ksalñdjfi444kljrqñlfkji4wrjio4jkjrq4kljrq348rjqk4ljflñqkwjcqkljr34ijc4kl3jfklqerrqk34ñj81u98cjcrefcjtqk43j58cujrqirjwklwejrq")).toBe(true);
	});

	test("Product", () => {
		expect(valid.product()).toBe(false);
		expect(valid.product("jkds sdd", "ll234 32kk")).toBe(false);
		expect(valid.product("", "123,01", "kkk")).toBe(false);
		expect(valid.product("jkds sdd", ".76", "ll234 32kk")).toBe(false);
		expect(valid.product("fdslajf dfsaf", .34, "asdf asdf kkk adfa")).toBe(true);
		expect(valid.product("fdslajf dfsaf", 24135.87634, "asdf asdf kkk adfa")).toBe(true);
	});
});
