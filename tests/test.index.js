const _ = require('lodash');
const expect = require('chai').expect;
const NametagPlugin = require('../src/index.js');


// Define a simple class that will emulate the plugin's usage of Serverless
class MockServerless {
    constructor(serverlessConfig) {
        this.config = serverlessConfig;
        this.service = {
            custom: serverlessConfig.custom,
            getAllFunctions: function () {
                return _.keys(serverlessConfig.functions);
            },
            getFunction: function (name) {
                return serverlessConfig.functions[name];
            }
        };
    }

    getProvider() {
        return {}
    }
}


// Define the tests
function testNoCustomNametagConfig() {
    let mockServerless = new MockServerless({
        custom: {},
        functions: {
            NoNametag: {
                name: 'NoNametagLambdaFunction'
            },
            DefaultNametag: {
                name: 'DefaultNametagLambdaFunction',
                nametag: {tag: true}
            },
            CustomNametag: {
                name: 'CustomNametagLambdaFunction',
                nametag: {tag: true, tagName: 'CustomName'}
            },
            ExplicitNoNametag: {
                name: 'ExplicitNoNametagLambdaFunction',
                nametag: {tag: false, tagName: 'DoesNotMatter'}
            },
            AdditionalTags: {
                name: 'AdditionalTagsLambdaFunction',
                nametag: {tag: true},
                tags: {AnotherTag: 'here'}
            }
        }
    });

    new NametagPlugin(mockServerless, {}).hooks['before:package:compileFunctions']();

    expect(mockServerless.config.functions.NoNametag.tags).to.be.undefined;

    expect(mockServerless.config.functions.DefaultNametag.tags)
        .to.be.an('object')
        .and.have.property('Name').equal('DefaultNametagLambdaFunction');

    expect(mockServerless.config.functions.CustomNametag.tags)
        .to.be.an('object')
        .and.have.property('CustomName').equal('CustomNametagLambdaFunction');

    expect(mockServerless.config.functions.ExplicitNoNametag.tags).to.be.undefined;

    expect(mockServerless.config.functions.AdditionalTags.tags)
        .to.be.an('object')
        .and.have.property('Name').equal('AdditionalTagsLambdaFunction');
    expect(mockServerless.config.functions.AdditionalTags.tags)
        .to.be.an('object')
        .and.have.property('AnotherTag').equal('here');
}


function testWithCustomNametagConfig() {
    let mockServerless = new MockServerless({
        custom: {
            nametag: {tag: true, tagName: 'SpecialName'}
        },
        functions: {
            ExplicitNoNametag: {
                name: 'ExplicitNoNametagLambdaFunction',
                nametag: {tag: false, tagName: 'DoesNotMatter'}
            },
            DefaultNametag: {
                name: 'DefaultNametagLambdaFunction',
            },
            CustomNametag: {
                name: 'CustomNametagLambdaFunction',
                nametag: {tag: true, tagName: 'CustomName'}
            },
            ExplicitNametag: {
                name: 'ExplicitNametagLambdaFunction',
                nametag: {tag: true}
            },
            AdditionalTags: {
                name: 'AdditionalTagsLambdaFunction',
                tags: {AnotherTag: 'here'}
            }
        }
    });
    new NametagPlugin(mockServerless, {}).hooks['before:package:compileFunctions']();

    // noinspection BadExpressionStatementJS
    expect(mockServerless.config.functions.ExplicitNoNametag.tags)
        .to.be.undefined;

    expect(mockServerless.config.functions.DefaultNametag.tags)
        .to.be.an('object')
        .and.have.property('SpecialName').equal('DefaultNametagLambdaFunction');

    expect(mockServerless.config.functions.CustomNametag.tags)
        .to.be.an('object')
        .and.have.property('CustomName').equal('CustomNametagLambdaFunction');

    expect(mockServerless.config.functions.ExplicitNametag.tags)
        .to.be.an('object')
        .and.have.property('SpecialName').equal('ExplicitNametagLambdaFunction');

    expect(mockServerless.config.functions.AdditionalTags.tags)
        .to.be.an('object')
        .and.have.property('SpecialName').equal('AdditionalTagsLambdaFunction');
    expect(mockServerless.config.functions.AdditionalTags.tags)
        .to.be.an('object')
        .and.have.property('AnotherTag').equal('here');
}


// Run the tests
testNoCustomNametagConfig();
testWithCustomNametagConfig();
