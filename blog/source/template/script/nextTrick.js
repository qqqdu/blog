let callbackStack = []
function nextTrick(callback) {
  callbackStack.push(callback)
  if(!Promise.resolve) {
    let p1 = Promise.resolve()
    
    p1.then(() => {
      if(callbackStack.length) {
        callbackStack.forEach(fn => fn())
        callbackStack.length = 0
      }
    })
  } else {
    setTimeout(() => {
      if(callbackStack.length) {
        callbackStack.forEach(fn => fn())
        callbackStack.length = 0
      }
    }, 0)
  }
}
console.log(5)
nextTrick(() => console.log(1))
console.log(6)
nextTrick(() => console.log(2))
console.log(7)
nextTrick(() => console.log(3))