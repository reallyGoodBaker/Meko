import { InstantiationService } from '@di'
import { instantiationServiceCollection } from '@src/initConfig'
import { IConfigurator } from '@persistence/configurator'

const instantiationService = new InstantiationService(instantiationServiceCollection)

class App {
    constructor(
        @IConfigurator private readonly configurator: IConfigurator,
    ) { }

    async startApp() {
        const [config] = await Promise.all([
            this.configurator.open('meko.config'),
        ])

        console.log(config.val());
        config.set({
            debugPort: 5039,
        })
    }
}

instantiationService.createInstance<App>(App).startApp()