import {Save} from '@persistence/binaryStore'
import * as path from 'path'
import * as fs from 'fs'

const save = new Save()

it('二进制存储', () => {
    const uint8Arr = new Uint8Array('Hello World'.split('').map(v => v.charCodeAt(0)))
    save.add('test1', uint8Arr)

    //以字符串形式读取
    expect(save.string('test1')).toBe('Hello World')

    //获取buffer
    expect(save.get('test1')).toBe(uint8Arr)

    //access
    expect(save.access(0)).toStrictEqual(['test1', uint8Arr])

    save.delete('test1')

    //测试删除功能是否正确
    expect(save.get('test1')).toBe(null)

    const binPath = path.resolve(__dirname, '../../../../__test.bin')
    save.add('test1', uint8Arr)

    //写入文件
    save.writeBinary(binPath)

    //读取文件
    const _save = Save.fromFile(binPath)    
    fs.rmSync(binPath)

    expect(_save.string('test1')).toBe('Hello World')

    expect(_save.access(0)).toStrictEqual(['test1', uint8Arr])
})