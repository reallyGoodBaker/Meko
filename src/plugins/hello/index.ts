import * as Meko from '@src/loader/runtime/index'

Meko.register('hello')
.then(success => {
    if (success) {
        init()
    }
})

async function init() {
    setTimeout(async () => {
        const hello = await Meko.getProvider('hello')
        const agent = hello?.getAgent() as any

        setTimeout(() => {
            agent.sayHi()
        }, 1000);
    }, 1000);
}