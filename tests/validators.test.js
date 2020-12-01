
const valid = require("../src/services/validator");

describe("Service Validator", () => {
	test("Login", () => {
		expect(valid.user({})).toBe(false);
	});
});
