const chai = require( "chai" );
const chaiAsPromised = require( "chai-as-promised" );
const chaiSubset = require( "chai-subset" );
const sinon = require( "sinon" );

const assert = chai.assert;
chai.use( chaiAsPromised );
chai.use( chaiSubset );

sinon.assert.expose( chai.assert, { prefix: "" } );

module.exports = {
	chai, assert
};
