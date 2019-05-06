'use strict';

const _ = require('underscore');

module.exports = function(req, res){

	const protocol = req.protocol;
	const host = req.get('host');
	const app = req.params.app;

	const resources = {
		css: {
			tag: 'link',
			resource: 'css',
			url: `${protocol}://${host}/css/${app}.css`
		},
		requirejs: {
			tag: 'script',
			resource: 'requirejs',
			url: `${protocol}://${host}/javascript/require.js`
		},
		define_patch: {
			tag: 'script',
			resource: 'define_patch',
			url: `${protocol}://${host}/define_patch.js`
		},
		javascript_libs: {
			tag: 'script',
			resource: 'javascript_libs',
			url: 'javascript-libs.js'
		},
		templates: {
			tag: 'script',
			resource: 'templates',
			url: `${protocol}://${host}/templates/${app}-templates.js`
		},
		js_core: {
			tag: 'script',
			resource: 'js_core',
			url: null
		},
		js_extensions: {
			tag: 'script',
			resource: 'js_extensions',
			url: `${protocol}://${host}/extensions/${app}_ext.js`
		}
	}

	
	const response = _.values(resources);

	res.setHeader('Content-Type', 'application/json');
	res.json(response);

};