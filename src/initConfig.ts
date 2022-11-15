import { IConfigurator, MekoConfigurator } from '@persistence/configurator'
import { IFileSystem, FileSystem } from '@persistence/fileSystem'
import { ServiceCollection } from '@di'
import { IMainThread, MainThread } from '@extension/thread'

export const instantiationServiceCollection = new ServiceCollection([
    [IFileSystem, FileSystem],
    [IConfigurator, MekoConfigurator],
    [IMainThread, MainThread],
])