import * as Meko from '@src/loader/runtime/index'

Meko.register('sayhi')
.then(success => {
    if (success) {
        init()
    }
})

function init() {
    console.log('\nPlugin is running!');
}

Meko.provide({
    sayHi() {
        console.log('Yes, you say hi!');
    }
})