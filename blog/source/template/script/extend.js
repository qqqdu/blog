// 原型链继承
/*
function person(title) {
  this.title = title
}

person.prototype.hello = 3

function man() {
  this.year = 2
}
man.prototype = new person('lalala')

let man1 = new man()
let man2 = new man()
console.log(man1.hello)
console.log(man2.hello)
*/
// 组合继承
// function person(title) {
//   this.title = title
// }

// person.prototype.hello = 3
// function man(arg) {
//   person.call(this, arg)
// }
// man.prototype = new person()
// let man1 = new man(2)
// let man2 = new man(3)


function person(title) {
  this.title = title
  this.call = function() {}
}
// function man() {
//   this.year = 4
// }
// man.prototype = new person('man')
// const man1 = new man()
// 无法传参数
// instanceof 无法确定谁是父类
// 实例共享圆形链

// function man(arg) {
//   person.call(this, arg)
// }
// let man2 = new man('title')

// 没有共享原型链

// function man(arg) {
//   person.call(this, arg)
// }
// man.prototype = new person('title')
// let man2 = new man('title')
// // 共享原型链
// // person被调用两次
// function content(obj) {
//   var fn = function() {}
//   fn.prototype = obj
//   return new fn()
// }
// var man = new person()
// var man1 = content(man)
// var man2 = content(man)

//寄生
// function person(title) {
//   this.title = title
// }

// person.prototype.hello = 3

// function content(obj) {
//   var fn = function() {}
//   fn.prototype = obj
//   return new fn()
// }
// function man() {
//   var con = content(new person())
//   con.a = 3
//   return con
// }
// var man19 = new man()
// 寄生组合

function person(title) {
  this.title = title
}
function content(obj) {
  var fn = function() {}
  fn.prototype = obj
  return new fn()
}
var p1 = content(person.prototype)
function man() {
  person.apply(this)
}
man.prototype = p1
p1.constructor = man
let man1 = new man()