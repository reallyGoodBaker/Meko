import * as Meko from '@runtime/index'

Meko.register('sayhi')
.then(success => {
    if (success) {
        init()
    }
})

function init() {
    console.log('\nPlugin is running!');
}