import {IConfigurator, MekoConfigurator} from '@persistence/configurator'
import {IFileSystem, FileSystem} from '@persistence/fileSystem'
import {ServiceCollection} from '@di'


export const instantiationServiceCollection = new ServiceCollection([
    [IFileSystem, FileSystem],
    [IConfigurator, MekoConfigurator],
])