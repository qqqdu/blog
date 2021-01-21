var express = require('express');
const ws = require('nodejs-websocket')

var app = express();
const { exec } = require('child_process')
let str = `/Users/qqqdu/Desktop/script/gitrepo/`
let stack = []
let lock = false
let server 
let chatUsers = []
let stackMessage = ''
const sendChatUsers = (server, user) => {
  let chatIds = chatUsers.map(item => item.chatId)
  if (chatIds.indexOf(user.chatId) === -1) {
    chatUsers.push(user)
  }
  broadcast(server, stackMessage)
}
const broadcast = (info) => {
  console.log('broadcast', info)
  server.connections.forEach(function(conn) {
    conn.sendText(JSON.stringify(info))
  })
}
app.use(express.static(__dirname + '/public'));

app.get('/publish', async function(req, res){
  stack = []
  const branch = req.query.branch
  const project = req.query.project
  const tag = req.query.tag
  const online = +req.query.online

  if(lock) {
    res.send('有人捷足先登了')
    return
  }
  if(!branch || !project || !tag) {
    res.send('分支名和项目名加上我才能给你发布呀!!!')
    return
  }
  res.send('打包中，别急')
  lock = true
  try {
    await main(branch, project, tag, online)
  } catch(e) {

  } finally {
    lock = false
  }
});
app.get('/sayBro', function(req, res){
  res.send('bro');
});
console.log('listen')
console.log('http://localhost:30012')
app.listen(30012);
async function main(branch, project, tag, online) {
  const dir = str + project
  const list = [
  `cd ${dir} && ls`,
  `cd ${dir} && git checkout master`,
  `cd ${dir} && git pull`,
  `cd ${dir} && git checkout ${branch}`,
  `cd ${dir} && git pull origin ${branch}`,
  `cd ${dir} && git checkout .`,
  `cd ${dir} && npm install`,
  `cd ${dir} && npm run build`,
  `cd ${dir} && npm run publish${online === 1 ? ':dev' : ''} ${tag}`]
  
  for(let key of list) {
      // console.log('run', key)
      let res
      try {
        res = await listPromise(key)
      } catch(err) {
        return stack.push(err)
      }
      stack.push(res)
  }
  stackMessage = ''
}
function listPromise(runStr) {
  console.warn(runStr)
  return new Promise((resolve, reject) => {
      exec(runStr, (error, stdout, stderr) => {
          stackMessage += stdout + '<br/>'
          console.log(`stdout: ${stdout}`)
          if(stderr) {
            console.warn(stderr)
            stackMessage += stderr + '<br/>'
          }
          broadcast(stackMessage)
          resolve(stdout)

          if (error) {
            console.error(`上传失败: ${error}`)
            reject('上传失败')
            return
        }
      })
  })
}

server = ws.createServer(connection => {
  connection.on('text', function(result) {
      // sendChatUsers(server, '正在打包')
      console.log('发送消息', result)
      console.log(server.connections)
  })
  connection.on('connect', function(code) {
      console.log('开启连接', code)
      console.log(server.connections)
  })
  connection.on('close', function(code) {
      console.log('关闭连接', code)
      // chatUsers.splice(chatUsers.indexOf(server), 1)
      // console.log(chatUsers.length)
      // console.log(connection.name)
  })
  connection.on('error', function(code) {
      console.log('异常关闭', code)
      console.log(server.name)
  })
}).listen(8001)
