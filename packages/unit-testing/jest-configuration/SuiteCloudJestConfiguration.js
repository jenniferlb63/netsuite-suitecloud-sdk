const assert = require('assert');
const path = require('path');
const { PROJECT_FOLDER_ARG } = require('../ApplicationConstants');
const TESTING_FRAMEWORK_PATH = '@oracle/suitecloud-unit-testing';
const CORE_STUBS_PATH = `${TESTING_FRAMEWORK_PATH}/stubs`;
const nodeModulesToTransform = [CORE_STUBS_PATH].join('|');
const SUITESCRIPT_FOLDER_REGEX = '^SuiteScripts(.*)$';
const ProjectInfoService = require('../services/ProjectInfoService');

const PROJECT_TYPE = {
	SUITEAPP: 'SUITEAPP',
	ACP: 'ACP',
};

const CORE_STUBS = [
	{
		module: 'N/action',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/action/action.js`,
	},
	{
		module: 'N/action/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/action/ActionInstance.js`,
	},
	{
		module: 'N/auth',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/auth/auth.js`,
	},
	{
		module: 'N/cache',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/cache/cache.js`,
	},
	{
		module: 'N/cache/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/cache/CacheInstance.js`,
	},
	{
		module: 'N/certificateControl',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/certificateControl/certificateControl.js`,
	},
	{
		module: 'N/certificateControl/certificate',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/certificateControl/Certificate.js`,
	},
	{
		module: 'N/commerce/recordView',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/commerce/recordView.js`,
	},
	{
		module: 'N/commerce/promising',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/commerce/promising.js`,
	},
	{
		module: 'N/commerce/webstore/order',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/commerce/webstore/order.js`,
	},
	{
		module: 'N/commerce/webstore/shopper',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/commerce/webstore/shopper.js`,
	},
	{
		module: 'N/commerce/webstore/shopper/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/commerce/webstore/ShopperInstance.js`,
	},
	{
		module: 'N/compress',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/compress/compress.js`,
	},
	{
		module: 'N/compress/archiver',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/compress/Archiver.js`,
	},
	{
		module: 'N/crypto',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/crypto.js`,
	},
	{
		module: 'N/crypto/certificate',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/certificate/certificate.js`,
	},
	{
		module: 'N/crypto/certificate/signedXml',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/certificate/SignedXml.js`,
	},
	{
		module: 'N/crypto/certificate/signer',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/certificate/Signer.js`,
	},
	{
		module: 'N/crypto/certificate/verifier',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/certificate/Verifier.js`,
	},
	{
		module: 'N/crypto/cipher',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/Cipher.js`,
	},
	{
		module: 'N/crypto/cipher/payload',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/CipherPayload.js`,
	},
	{
		module: 'N/crypto/decipher',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/Decipher.js`,
	},
	{
		module: 'N/crypto/hash',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/Hash.js`,
	},
	{
		module: 'N/crypto/hmac',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/Hmac.js`,
	},
	{
		module: 'N/crypto/secretKey',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/crypto/SecretKey.js`,
	},
	{
		module: 'N/currency',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/currency/currency.js`,
	},
	{
		module: 'N/currentRecord',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/currentRecord/currentRecord.js`,
	},
	{
		module: 'N/currentRecord/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/currentRecord/CurrentRecordInstance.js`,
	},
	{
		module: 'N/currentRecord/field',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Field.js`,
	},
	{
		module: 'N/currentRecord/column',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Column.js`,
	},
	{
		module: 'N/currentRecord/sublist',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Sublist.js`,
	},
	{
		module: 'N/dataset',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/dataset/dataset.js`,
	},
	{
		module: 'N/dataset/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/dataset/DatasetInstance.js`,
	},
	{
		module: 'N/dataset/condition',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/dataset/Condition.js`,
	},
	{
		module: 'N/dataset/column',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/dataset/Column.js`,
	},
	{
		module: 'N/dataset/join',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/dataset/Join.js`,
	},
	{
		module: 'N/datasetLink',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/datasetLink/datasetLink.js`,
	},
	{
		module: 'N/datasetLink/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/datasetLink/DatasetLinkInstance.js`,
	},
	{
		module: 'N/email',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/email/email.js`,
	},
	{
		module: 'N/encode',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/encode/encode.js`,
	},
	{
		module: 'N/format',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/format/format.js`,
	},
	{
		module: 'N/http',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/http/http.js`,
	},
	{
		module: 'N/http/clientResponse',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/http/ClientResponse.js`,
	},
	{
		module: 'N/https',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/https.js`,
	},
	{
		module: 'N/https/clientCertificate',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/clientCertificate.js`,
	},
	{
		module: 'N/https/clientResponse',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/ClientResponse.js`,
	},
	{
		module: 'N/https/secretKey',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/SecretKey.js`,
	},
	{
		module: 'N/https/secureString',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/SecureString.js`,
	},
	{
		module: 'N/https/clientCertificate',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/https/clientCertificate/clientCertificate.js`,
	},
	{
		module: 'N/log',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/log/log.js`,
	},
	{
		module: 'N/plugin',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/plugin/plugin.js`,
	},
	{
		module: 'N/query',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/query.js`,
	},
	{
		module: 'N/query/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/QueryInstance.js`,
	},
	{
		module: 'N/query/column',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Column.js`,
	},
	{
		module: 'N/query/component',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Component.js`,
	},
	{
		module: 'N/query/iterator',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Iterator.js`,
	},
	{
		module: 'N/query/page',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Page.js`,
	},
	{
		module: 'N/query/pagedData',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/pagedData.js`,
	},
	{
		module: 'N/query/pageRange',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/pageRange.js`,
	},
	{
		module: 'N/query/period',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Period.js`,
	},
	{
		module: 'N/query/relativeDate',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/RelativeDate.js`,
	},
	{
		module: 'N/query/result',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Result.js`,
	},
	{
		module: 'N/query/resultSet',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/ResultSet.js`,
	},
	{
		module: 'N/query/sort',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/Sort.js`,
	},
	{
		module: 'N/query/suiteQL',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/query/SuiteQL.js`,
	},
	{
		module: 'N/record',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/record.js`,
	},
	{
		module: 'N/record/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/RecordInstance.js`,
	},
	{
		module: 'N/record/field',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Field.js`,
	},
	{
		module: 'N/record/line',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Line.js`,
	},
	{
		module: 'N/record/sublist',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/record/Sublist.js`,
	},
	{
		module: 'N/redirect',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/redirect/redirect.js`,
	},
	{
		module: 'N/runtime',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/runtime/runtime.js`,
	},
	{
		module: 'N/runtime/script',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/runtime/Script.js`,
	},
	{
		module: 'N/runtime/session',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/runtime/Session.js`,
	},
	{
		module: 'N/runtime/user',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/runtime/User.js`,
	},
	{
		module: 'N/search',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/search.js`,
	},
	{
		module: 'N/search/instance',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/SearchInstance.js`,
	},
	{
		module: 'N/search/column',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Column.js`,
	},
	{
		module: 'N/search/filter',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Filter.js`,
	},
	{
		module: 'N/search/result',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Result.js`,
	},
	{
		module: 'N/search/resultSet',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/ResultSet.js`,
	},
	{
		module: 'N/search/pagedData',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/SearchPagedData.js`,
	},
	{
		module: 'N/search/pageRange',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/SearchPageRange.js`,
	},
	{
		module: 'N/search/setting',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Setting.js`,
	},
	{
		module: 'N/xml',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/xml.js`,
	},
	{
		module: 'N/xml/attr',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/Attr.js`,
	},
	{
		module: 'N/xml/document',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/Document.js`,
	},
	{
		module: 'N/xml/element',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/search/Element.js`,
	},
	{
		module: 'N/xml/node',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/Node.js`,
	},
	{
		module: 'N/xml/parser',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/Parser.js`,
	},
	{
		module: 'N/xml/xPath',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/xml/XPath.js`,
	},
	{
		module: 'N/workbook',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/workbook.js`,
	},
	{
		module: 'N/workbook/aspect',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Aspect.js`,
	},
	{
		module: 'N/workbook/calculatedMeasure',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/CalculatedMeasure.js`,
	},
	{
		module: 'N/workbook/category',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Category.js`,
	},
	{
		module: 'N/workbook/chart',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Chart.js`,
	},
	{
		module: 'N/workbook/childNodesSelector',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/ChildNodesSelector.js`,
	},
	{
		module: 'N/workbook/color',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Color.js`,
	},
	{
		module: 'N/workbook/conditionalFilter',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/ConditionalFilter.js`,
	},
	{
		module: 'N/workbook/conditionalFormat',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/ConditionalFormat.js`,
	},
	{
		module: 'N/workbook/conditionalFormatRule',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/ConditionalFormatRule.js`,
	},
	{
		module: 'N/workbook/currency',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Currency.js`,
	},
	{
		module: 'N/workbook/dataDimension',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/DataDimension.js`,
	},
	{
		module: 'N/workbook/dataDimensionItem',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/DataDimensionItem.js`,
	},
	{
		module: 'N/workbook/dataDimensionValue',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/DataDimensionValue.js`,
	},
	{
		module: 'N/workbook/dataDimensionItemValue',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/DataDimensionItemValue.js`,
	},
	{
		module: 'N/workbook/dataMeasure',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/DataMeasure.js`,
	},
	{
		module: 'N/workbook/descendantOrSelfNodesSelector',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/DescendantOrSelfNodesSelector.js`,
	},
	{
		module: 'N/workbook/dimensionSelector',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/DimensionSelector.js`,
	},
	{
		module: 'N/workbook/duration',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Duration.js`,
	},
	{
		module: 'N/workbook/fieldContext',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/FieldContext.js`,
	},
	{
		module: 'N/workbook/fontSize',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/FontSize.js`,
	},
	{
		module: 'N/workbook/legend',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Legend.js`,
	},
	{
		module: 'N/workbook/limitingFilter',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/LimitingFilter.js`,
	},
	{
		module: 'N/workbook/measureSelector',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/MeasureSelector.js`,
	},
	{
		module: 'N/workbook/measureValue',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/MeasureValue.js`,
	},
	{
		module: 'N/workbook/measureValueSelector',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/MeasureValueSelector.js`,
	},
	{
		module: 'N/workbook/pathSelector',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/PathSelector.js`,
	},
	{
		module: 'N/workbook/pivot',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Pivot.js`,
	},
	{
		module: 'N/workbook/pivotAxis',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/PivotAxis.js`,
	},
	{
		module: 'N/workbook/pivoIntersection',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/PivotIntersection.js`,
	},
	{
		module: 'N/workbook/pivotResultsIterator',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/PivotResultsIterator.js`,
	},
	{
		module: 'N/workbook/positionPercent',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/PositionPercent.js`,
	},
	{
		module: 'N/workbook/positionUnits',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/PositionUnits.js`,
	},
	{
		module: 'N/workbook/positionValues',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/PositionValues.js`,
	},
	{
		module: 'N/workbook/range',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Range.js`,
	},
	{
		module: 'N/workbook/record',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Record.js`,
	},
	{
		module: 'N/workbook/recordKey',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/RecordKey.js`,
	},
	{
		module: 'N/workbook/reportStyle',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/ReportStyle.js`,
	},
	{
		module: 'N/workbook/section',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Section.js`,
	},
	{
		module: 'N/workbook/sectionValue',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/SectionValue.js`,
	},
	{
		module: 'N/workbook/series',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Series.js`,
	},
	{
		module: 'N/workbook/sort',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Sort.js`,
	},
	{
		module: 'N/workbook/sortByDataDimensionItem',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/SortByDataDimensionItem.js`,
	},
	{
		module: 'N/workbook/sortByMeasure',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/SortByMeasure.js`,
	},
	{
		module: 'N/workbook/sortDefinition',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/SortDefinition.js`,
	},
	{
		module: 'N/workbook/style',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Style.js`,
	},
	{
		module: 'N/workbook/table',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/Table.js`,
	},
	{
		module: 'N/workbook/tableColumn',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/TableColumn.js`,
	},
	{
		module: 'N/workbook/tableColumnCondition',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/TableColumnCondition.js`,
	},
	{
		module: 'N/workbook/tableColumnFilter',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/TableColumnFilter.js`,
	},
	{
		module: 'N/workbook/workbook',
		path: `<rootDir>/node_modules/${CORE_STUBS_PATH}/workbook/WorkbookInstance.js`,
	},
];

class SuiteCloudAdvancedJestConfiguration {
	constructor(options) {
		assert(options.projectFolder, "The 'projecFolder' property must be specified to generate a SuiteCloud Jest configuration");
		assert(options.projectType, "The 'projectType' property must be specified to generate a SuiteCloud Jest configuration");
		this.projectFolder = this._getProjectFolder(options.projectFolder);
		this.projectType = options.projectType;
		this.customStubs = options.customStubs;
		if (this.customStubs == null) {
			this.customStubs = [];
		}

		this.projectInfoService = new ProjectInfoService(this.projectFolder);
	}

	_getProjectFolder(projectFolder) {
		if (process.argv && process.argv.length > 0) {
			for (let i = 0; i < process.argv.length; i++) {
				let argv = process.argv[i].split('=');
				if (argv.length === 2 && argv[0] === PROJECT_FOLDER_ARG) {
					return path.join(argv[1], projectFolder);
				}
			}
		}
		return path.join(process.cwd(), projectFolder);
	}

	_getSuiteScriptFolderPath() {
		if (this.projectType === PROJECT_TYPE.ACP) {
			return `${this.projectFolder}/FileCabinet/SuiteScripts$1`;
		}
		if (this.projectType === PROJECT_TYPE.SUITEAPP) {
			let applicationId = this.projectInfoService.getApplicationId();
			return `${this.projectFolder}/FileCabinet/SuiteApps/${applicationId}$1`;
		}
		throw 'Unrecognized projectType. Please revisit your SuiteCloud Jest configuration';
	}

	_generateStubsModuleNameMapperEntries() {
		const stubs = {};
		const forEachFn = (stub) => {
			stubs[`^${stub.module}$`] = stub.path;
		};
		CORE_STUBS.forEach(forEachFn);
		this.customStubs.forEach(forEachFn);

		return stubs;
	}

	generate() {
		const suiteScriptsFolder = {};
		suiteScriptsFolder[SUITESCRIPT_FOLDER_REGEX] = this._getSuiteScriptFolderPath();

		const customizedModuleNameMapper = Object.assign({}, this._generateStubsModuleNameMapperEntries(), suiteScriptsFolder);
		return {
			transformIgnorePatterns: [`/node_modules/(?!${nodeModulesToTransform})`],
			transform: {
				'^.+\\.js$': `<rootDir>/node_modules/${TESTING_FRAMEWORK_PATH}/jest-configuration/SuiteCloudJestTransformer.js`,
			},
			moduleNameMapper: customizedModuleNameMapper,
		};
	}
}

module.exports = {
	build: (options) => {
		return new SuiteCloudAdvancedJestConfiguration(options).generate();
	},
	ProjectType: PROJECT_TYPE,
};
