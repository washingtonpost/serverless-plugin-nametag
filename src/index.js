'use strict';


const _ = require('lodash');


class ServerlessPluginNametag {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options;
        this.provider = serverless.getProvider('aws');

        this.hooks = {
            'before:package:compileFunctions': this.beforePackageCompileFunctions.bind(this),
        };
    }

    beforePackageCompileFunctions() {
        const defaults = {
            tag: false,
            tagName: 'Name'
        };
        const config = _.merge(defaults, _.get(this.serverless, 'service.custom.nametag'));

        this.serverless.service.getAllFunctions().forEach(functionName => {
            const function_ = this.serverless.service.getFunction(functionName);

            const functionConfig = _.merge({}, config, function_.nametag);

            // Only tag this function if nametag has been configured to do so
            if (functionConfig.tag) {

                // Ensure a tag object exists on the function
                if (!function_.tags) {
                    function_.tags = {}
                }

                // Tag the function with the appropriate key and fully-qualified function name as the value
                function_.tags[functionConfig.tagName] = function_.name;
            }
        });
    }
}


module.exports = ServerlessPluginNametag;
