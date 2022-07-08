import {InstantiationService, ServiceCollection} from '@di'
import {ISave, Save} from '@persistence/binaryStore'

const col = new ServiceCollection()
const service = new InstantiationService(col)

class Test {
    constructor(
        @ISave private save: ISave
    ) {
        console.log(save);  
    }
}

class App {
    constructor() {
        col.set(ISave, Save)
        const test = service.createInstance<Test>(Test)
    }

    startApp() {

    }
}

new App().startApp()