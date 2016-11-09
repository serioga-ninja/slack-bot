import RssToSlackService = require('./services/RssToSlackService');
import {App} from "./interfaces";
import _ = require('lodash');

export = function (apps: App[]) {
    if (!apps.length) {
        throw new Error('There is no url to work with');
    }

    var RTSApps = _.map(apps, (app) => {
        return new RssToSlackService(app).start();
    });
}