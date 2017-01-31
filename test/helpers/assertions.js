const chai = require( "chai" );
const chaiAsPromised = require( "chai-as-promised" );
const chaiSubset = require( "chai-subset" );

const assert = chai.assert;
chai.use( chaiAsPromised );
chai.use( chaiSubset );

module.exports = {
	chai, assert
};
