import {configurator} from '@src/persistence/configurator'

(async() => {
    const data = await configurator.open('botConfig.json')
    console.log(data);
})()