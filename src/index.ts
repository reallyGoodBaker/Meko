import {configurator} from '@src/persistence/configurator'
import {pluginLoader} from '@loader/loader'
import * as path from 'path';

(async() => {
    const data = await configurator.open('botConfig.json')
    console.log(data?.val());
    pluginLoader.setupPlugin(path.resolve(
        __dirname,
        /**@map*/'@plugins/sayhi/index'
    ))
})()