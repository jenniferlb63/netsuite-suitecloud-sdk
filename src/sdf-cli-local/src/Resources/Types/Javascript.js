
const _ = require('underscore');
const Utils = require('../../Utils');
const Resource = require('../Resource');

module.exports = class Javascript extends Resource {
	constructor(options) {

        super(options);

		this.format = '.js';
	}


};