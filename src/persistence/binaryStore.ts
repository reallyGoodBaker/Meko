import * as fs from 'fs'

export class Save {
    private _accessor: Array<string | number> = []
    private _data: Uint8Array[] = []

    add(key: string, val: Uint8Array) {
        if (!~this._accessor.indexOf(key)) {
            this._accessor.push(key)
            this._data.push(val)
        }

        return this
    }

    get(key: string) {
        const i = this._accessor.indexOf(key)

        if (~i) {
            return this._data[i]
        }

        return null
    }

    access(index: number) {
        const acc = this._accessor
        const data = this._data
        const len = acc.length

        if (-index > -len && index < len) {

            if (index < 0) {
                index = len + index
            }

            return [
                acc[index],
                data[index]
            ]
        }

        return [-1, null]
    }

    delete(key: string) {
        const i = this._accessor.indexOf(key)
        if (~i) {
            const acc = this._accessor
            const data = this._data

            this._accessor = acc.slice(0, i).concat(acc.slice(i + 1))
            this._data = data.slice(0, i).concat(data.slice(i + 1))
        }
        return this
    }

    writeBinary(filename: string) {
        let data = this._data,
            dataSize = 0,
            accessor = this._accessor,
            dataEntries: any[] = []

        for (let i = 0; i < accessor.length; i++) {
            const k = accessor[i]
            const v = data[i].byteLength

            dataEntries.push([k, [dataSize, v]])
            dataSize += v
        }
        
        
        const accessorBin = Buffer.from(JSON.stringify(dataEntries))

        fs.writeFileSync(filename, Buffer.from([accessorBin.byteLength]))
        fs.appendFileSync(filename, accessorBin)

        for (const val of data) {
            fs.appendFileSync(filename, val as Uint8Array)
        }
    }

    static fromFile(filename: string) {
        const bundle = fs.readFileSync(filename)
        const accSize = bundle.readUInt8(0)
        const _acc = new Uint8Array(accSize)
        const save = new Save()

        bundle.copy(_acc, 0, 1, accSize + 1)
        
        const acc = JSON.parse(Buffer.from(_acc).toString())

        for (const map of acc) {
            const [k, [_start, size]] = map
            const buf = new Uint8Array(size)
            const start = _start + accSize + 1

            bundle.copy(buf, 0, start, start + size)

            save._accessor.push(k)
            save._data.push(buf)
        }
        
        return save
    }

    parse(key: string, decorator: (buf: Uint8Array) => any) {
        const data = this.get(key)
        if (data) {
            return decorator.call(null, data)
        }
        return null
    }

    string(key: string) {
        return this.parse(key, buf => {
            return Buffer.from(buf).toString()
        })
    }


}