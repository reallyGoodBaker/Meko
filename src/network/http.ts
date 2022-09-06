import * as https from 'https'

interface Res {
    json(): any;
    text(): string;
    buffer(): Buffer
}

function request(
    method: 'POST'|'GET'|'DELETE',
    url: string, data: any,
    headers = {}
): Promise<Res|null> {
    url = url.replace(/https?:\/\//, '')

    const hostEnd = url.indexOf('/')
    const host = url.slice(0, hostEnd)
    const path = url.slice(hostEnd)

    return new Promise((resolve, reject) => {
        const req = https.request({
            method,
            hostname: host,
            port: 443,
            path: path,
            headers: Object.assign({
                'Content-Type': 'application/json'
            }, headers),
        }, res => {
            let rawData = Buffer.alloc(0)

            res.on('data', c => {
                if (!c) {
                    return
                }

                rawData = Buffer.concat([rawData, c])
            })

            res.on('end', () => {
                if (/20[0-3]/.test(res.statusCode + '')) {
                    resolve({
                        json() {
                            return JSON.parse(rawData.toString())
                        },
                        text() {
                            return rawData.toString()
                        },
                        buffer() {
                            return rawData
                        }
                    })
                } else {
                    resolve(null)
                }
            })
        })

        req.on('error', err => reject(err))

        if (data !== void 0) {
            req.write(JSON.stringify(data))
        }

        req.end()
    })
}

export async function post(url: string, data = {}, headers = {}) {
    return await request('POST', url, data, headers)
}

export async function del(url: string, headers = {}) {
    return await request('DELETE', url, undefined, headers)
}

export function get(url: string, data: any): Promise<Res> {
    const queryArray = []
    for (const k in data) {
        queryArray.push(`${k}=${data[k]}`)
    }
    const queryString = queryArray.join('&')

    url = queryArray.length
        ? url + '?' + queryString
        : url

    return new Promise(resolve => {
        https.get(url, res => {
            let rawData = Buffer.alloc(0)
    
            res.on('data', c => {
                rawData = Buffer.concat([rawData, c])
            })
    
            res.on('end', () => resolve({
                json() {
                    return JSON.parse(rawData.toString())
                },
                text() {
                    return rawData.toString()
                },
                buffer() {
                    return rawData
                }
            }))
        }).end()
    })
}