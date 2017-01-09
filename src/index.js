let sayHello = () => console.log('hello world')

window.onload = sayHello

setTimeout(() => {
    throw new Error('test')
})
