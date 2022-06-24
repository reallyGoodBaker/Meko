import {configurator} from '@src/persistence/configurator'
import {pluginLoader} from '@src/loader/loader'
import * as path from 'path';

(async() => {
    const data = await configurator.open('botConfig.json')
    console.log(data?.val('account'));
    pluginLoader.setupPlugin(path.resolve(
        __dirname,
        /**@map*/'@plugins/sayhi/index'
    ), {})
    pluginLoader.setupPlugin(path.resolve(
        __dirname,
        /**@map*/'@plugins/hello/index'
    ), {})
})()