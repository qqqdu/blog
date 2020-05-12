// const obj = require('./main')
// const obj2 = require('./other')

// obj.add()
// console.log(obj.a)
async function main() {
  const obj3 = await import('./m.mjs').catch(e => console.log(e))
  console.log(obj3)
}

// main()
Object.defineProperty(exports, '__esModule', {
  value: true
})
console.log(exports.__esModule)
exports.__esModule = false
console.log(exports.__esModule)
module.exports = 3
