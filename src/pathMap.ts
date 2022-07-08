//简单的 paths 映射
//缺陷：paths 中每个数组只能存放一个路径
//特殊：通过/**@map*/标记需要映射的字符串

import * as fs from 'fs'
import * as path from 'path'

//此文件默认路径"/out/persistence/pathMap.js"
//映射时从相对于此文件的这个位置开始遍历文件
const MAP_ENTRY = path.resolve(__dirname, './')
//tsconfig 文件相对于此文件打包后的位置
const TSCONFIG_PATH = path.resolve(__dirname, '../tsconfig.json')
//具有数组内后缀名的文件才会被处理
const matchedSuffix = [
    '.js', '.mjs'
]


function pathJoin(...paths: string[]) {
    return path.join(...paths).replace(/\\/g, '/')
}

function matchSuffix(target: string, matchArr: string[]) {
    for (const suffix of matchArr) {
        if (target.endsWith(suffix))
            return true
    }

    return false
}

const tsConfig = JSON.parse(
    fs.readFileSync(TSCONFIG_PATH)
        .toString()
        .replace(/\/\/.*[\n\r]*/g, '')
        .replace(/[\s]\/\*[\s|\S]*?\*\//g, '')
)

function fileForeach(dir: string, handler: (scriptContent: string, realPath: string) => string) {
    fs.readdirSync(dir).forEach(_file => {
        const realPath = pathJoin(dir, _file)
        const stat = fs.statSync(realPath)

        if (stat.isFile() && matchSuffix(_file, matchedSuffix)) {
            fs.writeFile(realPath, handler.call(
                null, fs.readFileSync(realPath).toString(), pathJoin(realPath, '../')
            ), () => null)
        }

        if (stat.isDirectory()) {
            fileForeach(realPath, handler)
        }
    })
}


async function main() {
    const {paths, outDir, rootDir, baseUrl} = tsConfig.compilerOptions
    const baseUrlFromTsconfigDir = path.join(TSCONFIG_PATH, '../', baseUrl)
    const virtPaths = Object.keys(paths)
    const virtRealMap = new Map<string, string>()

    for (let virt of virtPaths) {
        let real = paths[virt][0].replace(rootDir, outDir)//在编译之后进行映射，目标就从rootDir变成outDir了
            real = pathJoin(baseUrlFromTsconfigDir, real)//绝对真实路径
            real = path.relative(MAP_ENTRY, real)//相对真实路径

        if (virt[virt.length-1] === '*') {
            virt = virt.slice(0, -1)
            real = real.slice(0, -1)
        }
        virtRealMap.set(virt, real)
    }


    const rewriteRequires = (rawScript: string, scriptDir: string) => {
        const replacer = (_: string, requirePath: string) => {
            for (const virt of virtRealMap.keys()) {

                if (!requirePath.startsWith(virt))
                    continue

                const relativeRealPath = virtRealMap.get(virt) as string,
                    scriptToRoot = path.relative(scriptDir, MAP_ENTRY),
                    rootToRequire = requirePath.replace(virt, relativeRealPath),
                    trueRequirePath = pathJoin(scriptToRoot, rootToRequire)

                _ = _.replace(
                    requirePath,
                    trueRequirePath.startsWith('.')
                        ? trueRequirePath
                        : './' + trueRequirePath
                )
            }

            return _
        }
        return rawScript.replace(/require\("(.*?)"\)/g, replacer)
            .replace(/\/\*\*@map\*\/[\s]*'(.*?)'/g, replacer)
            .replace(/\/\*\*@map\*\/[\s]*"(.*?)"/g, replacer)
            .replace(/\/\*\*@map\*\/[\s]*`(.*?)`/g, replacer)
    }

    fileForeach(MAP_ENTRY, rewriteRequires)
}

main()