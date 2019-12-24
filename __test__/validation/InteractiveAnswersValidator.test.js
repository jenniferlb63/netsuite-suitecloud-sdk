'use strict';

const {
	validateFieldIsNotEmpty,
	validateFieldHasNoSpaces,
	validateFieldIsLowerCase,
	validatePublisherId,
	validateProjectVersion,
	validateArrayIsNotEmpty,
	validateSuiteApp,
	validateScriptId,
	validateXMLCharacters,
	validateNotProductionUrl,
	validateEmail,
} = require('../../src/validation/InteractiveAnswersValidator');

const positiveResponse = {
	result: true,
};

describe('validateFieldIsNotEmpty', function() {
	const failureResponse = {
		result: false,
		validationMessage: 'This value cannot be empty.',
	};

	it('should return true when string is not empty', function() {
		expect(validateFieldIsNotEmpty('NoneEmptyString')).toEqual(positiveResponse);
	});

	it('should return false with validation message when string is empty', function() {
		expect(validateFieldIsNotEmpty('')).toEqual(failureResponse);
	});
});

describe('validateFieldHasNoSpaces', function() {
	const failureResponse = {
		result: false,
		validationMessage: 'This field cannot contain spaces.',
	};

	it('should return true when string has no spaces', function() {
		expect(validateFieldHasNoSpaces('StringNoSpaces')).toEqual(positiveResponse);
	});

	it('should return false with validation message when string has spaces', function() {
		expect(validateFieldHasNoSpaces('String with spaces')).toEqual(failureResponse);
	});
});

describe('validateFieldIsLowerCase', function() {
	const fieldOptionId = 'testFieldOptionId';
	const failureResponse = {
		result: false,
		validationMessage: 'The ' + fieldOptionId + ' field contains forbidden characters. Use only lowercase letters and numbers.',
	};

	it('should return true when string is in lower case', function() {
		expect(validateFieldIsLowerCase(fieldOptionId, 'lowercase')).toEqual(positiveResponse);
	});

	it('should return false with validation message when string is not all in lower case', function() {
		expect(validateFieldIsLowerCase(fieldOptionId, 'WithUpperCase')).toEqual(failureResponse);
	});
});

describe('validatePublisherId', function() {
	const failureResponse = {
		result: false,
		validationMessage:
			'The publisher ID must be a fully qualified name, such as "com.netsuite". It must contain lowercase alphanumeric characters and exactly one period. The ID cannot begin or end with a period.',
	};

	it('should return true when string is in valid publisher id format', function() {
		expect(validatePublisherId('com.netsuite')).toEqual(positiveResponse);
	});

	it('should return false with validation message when string does not have a "."', function() {
		expect(validatePublisherId('comnetsuite')).toEqual(failureResponse);
	});

	it('should return false with validation message when string is not all in lower case', function() {
		expect(validatePublisherId('Com.netsuite')).toEqual(failureResponse);
	});

	it('should return false with validation message when string has more than one "."', function() {
		expect(validatePublisherId('Com.net.suite')).toEqual(failureResponse);
	});
});

describe('validateProjectVersion', function() {
	const failureResponse = {
		result: false,
		validationMessage: 'The project version must only contain digits and dots. Ensure it follows a pattern such as "0.0.0".',
	};

	it('should return true when string is in valid project version format with parts having more than one digit', function() {
		expect(validateProjectVersion('10.100.1000')).toEqual(positiveResponse);
	});

	it('should return true when string is in valid project version format', function() {
		expect(validateProjectVersion('1.0.0')).toEqual(positiveResponse);
	});

	it('should return false with validation message when string has letters', function() {
		expect(validateProjectVersion('1.a.b')).toEqual(failureResponse);
	});

	it('should return false with validation message when string has less than 3 digits', function() {
		expect(validateProjectVersion('1.0')).toEqual(failureResponse);
	});

	it('should return false with validation message when string has more than 3 digits', function() {
		expect(validateProjectVersion('1.0.0.0')).toEqual(failureResponse);
	});
});

describe('validateArrayIsNotEmpty', function() {
	const failureResponse = {
		result: false,
		validationMessage: 'Error: You should choose at least one option.',
	};

	it('should return true when array is not empty', function() {
		expect(validateArrayIsNotEmpty([1, 2, 3])).toEqual(positiveResponse);
	});

	it('should return false with validation message when array is empty', function() {
		expect(validateArrayIsNotEmpty([])).toEqual(failureResponse);
	});
});

describe('validateSuiteApp', function() {
	const failureResponse = {
		result: false,
		validationMessage: 'The specified application ID is wrongly formatted. Ensure it follows a pattern such as "com.example.mysuiteapp".',
	};

	it('should return true when string is in valid SuiteApp id format', function() {
		expect(validateSuiteApp('com.netsuite.suiteapp1')).toEqual(positiveResponse);
	});

	it('should return false with validation message when string does not have a "."', function() {
		expect(validateSuiteApp('suiteapp1')).toEqual(failureResponse);
	});

	it('should return false with validation message when string has less than 2 "."', function() {
		expect(validateSuiteApp('netsuite.suiteapp1')).toEqual(failureResponse);
	});

	it('should return false with validation message when string has more than 2 "."', function() {
		expect(validateSuiteApp('com.netsuite.suiteapp1.extra')).toEqual(failureResponse);
	});
});

describe('validateScriptId', function() {
	const failureResponse = {
		result: false,
		validationMessage: 'The specified script ID contains forbidden characters. Use only lowercase letters, numbers, or underscores.',
	};

	it('should return true when string is a valid script id', function() {
		expect(validateScriptId('scriptid_1')).toEqual(positiveResponse);
	});

	it('should return false with validation message when string is not all in lower case', function() {
		expect(validateScriptId('Scriptid')).toEqual(failureResponse);
	});
});

describe('validateXMLCharacters', () => {
	const failureResponse = {
		result: false,
		validationMessage: 'This field contains at least one of the following forbidden characters: <, >, &, \', or ".',
	};

	it("should return a response with a positive result when the string dosen't contain invalid characters", () => {
		const someValidStrings = ['My valid string 90 (with parenthesis)', 'Another one with dolar $ signs $', 'Even another one with % ^ * - _ '];
		someValidStrings.forEach(string => expect(validateXMLCharacters(string)).toEqual(positiveResponse));
	});

	it('should return a response with a negative result and a validation message when the string contains any of the following characters:   < > & \' " ', () => {
		expect(validateXMLCharacters('< my invalid string >')).toEqual(failureResponse);
		expect(validateXMLCharacters('using and ampersand & to check it fails')).toEqual(failureResponse);
		expect(validateXMLCharacters('using " some quotes \' characters')).toEqual(failureResponse);
		expect(validateXMLCharacters("mixing_Some > of them < all 'in' the &same string \"")).toEqual(failureResponse);
	});
});

describe('validateEmail', () => {
	const failureResponse = {
		result: false,
		validationMessage: 'Invalid email address.',
	};

	it('should return a response with a positive result when the string is a valid email address', () => {
		expect(validateEmail('myemail@domain.com')).toEqual(positiveResponse);
		expect(validateEmail('my.email@domain.com')).toEqual(positiveResponse);
	});

	it('should return a response with a negative result and a validation message when the string contains an invalid email address', () => {
		expect(validateEmail('mywrongemail.domain.com')).toEqual(failureResponse);
		expect(validateEmail('.mywrongemail@domain.com')).toEqual(failureResponse);
		expect(validateEmail('mywrongemail@domain..com')).toEqual(failureResponse);
		expect(validateEmail('mywrongemail@domain')).toEqual(failureResponse);
		expect(validateEmail('mywrongemail@domain.c')).toEqual(failureResponse);
	});
});

describe('validateNotProductionUrl', () => {
	const failureResponse = {
		result: false,
		validationMessage:
			'Enter a non-production domain URL. If you want to use a production account, run "suitecloud setupaccount" without the "--dev" option.',
	};

	it('should return a response with a positive result when the URL is non-production one', () => {
		const nonProductionURLs = [
			'lp-quarks.se4.eng.netsuite.com',
			'dr-scrumbox-eu.du3.eng.netsuite.com',
			'sa.se4.eng.netsuite.com',
			'rm2.se4.eng.netsuite.com',
		];
		nonProductionURLs.forEach(url => expect(validateNotProductionUrl(url)).toEqual(positiveResponse));
	});

	it('should return a response with a negative result when using a production url', () => {
		const productinoURLs = [
			'system.netsuite.com',
			'system.na1.netsuite.com',
			'12345.app.netsuite.com',
			'wolfelectronics.app.netsuite.com',
			'Wolf-Electronics.app.netsuite.com',
		];
		productinoURLs.forEach(url => expect(validateNotProductionUrl(url)).toEqual(failureResponse));
	});
});
