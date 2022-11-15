import { InstantiationService } from '@di'
import { instantiationServiceCollection } from '@src/initConfig'
import { IConfigurator } from '@persistence/configurator'
import { IMainThread, CrossThread } from '@extension/thread'

const instantiationService = new InstantiationService(instantiationServiceCollection)

class App {
    constructor(
        @IConfigurator private readonly configurator: IConfigurator,
        @IMainThread private readonly mainThread: IMainThread,
    ) { }

    async startApp() {
        const [
            config
        ] = await Promise.all([
            this.configurator.open('meko.config'),
        ])

        // console.log(config.val())
        config.set({
            debugPort: 5039,
        })


        let a = 'Hello', a1 = 'World'

        const func = () => {
            const {isMainThread} = require('worker_threads')

            /**@async*/ a
            /**@async*/ a1

            console.log(a, a1)
            console.log(`isMainThread: ${isMainThread}`)

        }

        func()

        this.mainThread.run(
            CrossThread({a, a1})(func)
        )

    }
}

instantiationService.createInstance<App>(App).startApp()