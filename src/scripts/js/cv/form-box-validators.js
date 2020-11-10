
var RE_DNI = /^(\d{8})([A-Z])$/;
var RE_CIF = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/;
var RE_NIE = /^[XYZ]\d{7,8}[A-Z]$/;

function validSpainId(str) {
	return !str ? true
		: str.match(RE_DNI) ? validDNI(str)
		: str.match(RE_CIF) ? validCIF(str)
		: str.match(RE_NIE) ? validNIE(str)
		: false;
};

function validDNI(dni) {
	var letras = "TRWAGMYFPDXBNJZSQVHLCKE";
	var letra = letras.charAt(parseInt(dni, 10) % 23);
	return letra == dni.charAt(8);
};

function validCIF(cif) {
	var match = cif.match(RE_CIF);
	var letter = match[1];
	var number  = match[2];
	var control = match[3];
	var sum = 0;

	for (var i = 0; i < number.length; i++) {
		var n = parseInt(number[i], 10);
		//Odd positions (Even index equals to odd position. i=0 equals first position)
		if ((i % 2) === 0) {
			n *= 2; //Odd positions are multiplied first
			// If the multiplication is bigger than 10 we need to adjust
			n = (n < 10) ? n : (parseInt(n / 10) + (n % 10));
		}
		sum += n;
	}

	sum %= 10;
	var control_digit = (sum !== 0) ? 10 - sum : sum;
	var control_letter = "JABCDEFGHI".substr(control_digit, 1);
	return letter.match(/[ABEH]/) ? (control == control_digit) //Control must be a digit
				: letter.match(/[KPQS]/) ? (control == control_letter) //Control must be a letter
				: ((control == control_digit) || (control == control_letter)); //Can be either
};

function validNIE(nie) {
	//Change the initial letter for the corresponding number and validate as DNI
	var prefix = nie.charAt(0);
	prefix = (prefix == "X") ? 0 : (prefix == "Y") ? 1 : (prefix == "Z") ? 2 : prefix;
	return validDNI(prefix + nie.substr(1));
};
