import {createIdentifier} from '@di'

export interface IMekoFs {
    getProjectDirectory(): string;
    writeFile(filePath: string, data: string | Buffer): Promise<boolean>
    readFile(filePath: string): Promise<Buffer>
    
}

export const IMekoFs = createIdentifier<IMekoFs>('meko-fs')