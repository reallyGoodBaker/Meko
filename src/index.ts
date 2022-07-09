import {InstantiationService, ServiceCollection} from '@di'
import {IConfigurator, MekoConfigurator} from '@persistence/configurator'
import {IFileSystem, FileSystem} from '@persistence/fileSystem'

const instantiationService = new InstantiationService(
    new ServiceCollection([
        [IConfigurator, MekoConfigurator],
        [IFileSystem, FileSystem],
    ])
)


class App {
    constructor(
        @IConfigurator private readonly configurator: IConfigurator,
    ) {}

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