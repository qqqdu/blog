// 中缀转后缀

// (a+b)*c-(a+b)/e  
// ab+c*ab+e/-

/**
 *  d + c * (a + b * 4)
 * 
 * 
 * s1 +*(+*
 * s2 dcab4*+*+
 * S1 +*(+*)
 * S2 dcab4*+*+
 * 
 * 如果是字符，则压栈
 * 如果是字母，并且字符栈不为空，则出字母栈，
 * 否则压数字栈
 */
function calculator(str) {
  let n = 0, charStack = [], numStack = [], reducerStr =  [], leftIndex = -1
  const op = {'+' : 1, '-' : 1, '*' : 2, '/' : 2, '(' : 3, ')' : 3}
  while(n < str.length) {
    const byte = str[n]
    // 数字
    if(/\d/.test(byte)) {
      reducerStr.push(byte)
      console.log('数字', byte)
    } else if(/\(|\)/.test(byte)) {
      // 左括号入栈
      if(byte === '(') {
        charStack.push(byte)
        leftIndex = n
        console.log('左括号', byte)
      // 右括号出栈
      } else {
        let nowChar = charStack.pop()
        console.log('右括号', byte, nowChar)
        while(nowChar && nowChar !== '(') {
          reducerStr.push(nowChar)
          nowChar = charStack.pop()
          console.log('运算符', nowChar)
        }
      }
    // 符号
    } else {
      // 字符栈顶元素
      let nowChar = charStack[charStack.length - 1]
      while(nowChar && op[byte] < op[nowChar] && nowChar !== '(') {
        charStack.pop()
        reducerStr.push(nowChar)
        nowChar = charStack[charStack.length - 1]
      }
      charStack.push(byte)
    }
    console.warn('字符',charStack)
    console.warn('结果', reducerStr)
    n++
  }
  while(charStack.length) {
    reducerStr.push(charStack.pop())
  }
  return reducerStr.join('')
}

// calculator('1+2*(3+4*4)')

console.log(calculator('1+2*(3+4)*4'))
/**
 * +*
 * 123*+44*+
 */
function neebo(arr) {
  arr = arr.split('')
  const op = ['+', '-', '*', '/']
  const byte = []
  while(arr.length) {
    let now = arr.shift()
    const index = op.indexOf(now)
    console.log(byte)
    // 是符号
    if(index !== -1) {
      // 栈顶两元素
      const end = +byte.pop(),
            first = +byte.pop();
      switch(index){
        case 0:
          byte.push( first + end)
          break;
        case 1:
          byte.push( first - end)
          break;
        case 2:
          byte.push( first * end)
          break;
        case 3:
          byte.push( first / end)
          break;
      }
    // 不是符号
    } else {
      byte.push(now)
    }
  }
  console.log(byte)
}
neebo('1234+4**+')
// dcab4*+*+

// a + b * c
// 2 + 5 * 4
/**
 * a b c
 * + *
 * 
 * bc*a+
 * 45*2+
 * */