import {createIdentifier} from '@di'
import {IHttps} from '@network/https'
import {IFileStream} from '@persistence/fileSystem'

interface IDownload {
    
}

interface IDownloadWatcher {
    onProgressChange(progress: number): void
    onFinish(): void
    onError(): void
}

interface IDownloadStream {

}