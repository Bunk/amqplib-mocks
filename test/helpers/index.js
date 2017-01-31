const assertionUtils = require( "./assertions" );

global.testHelpers = Object.assign( {
	chai: assertionUtils.chai,
	assert: assertionUtils.assert
} );
