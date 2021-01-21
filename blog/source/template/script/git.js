
  /**
   * 这个代码做的是，将分支A 合并到 分支B
   */
  // node git jobmd-weapp release-12.5.1 develop
  const { exec } = require('child_process')
  const str = `/Users/qqqdu/Desktop/dxy/gitrepo/${process.argv[2]}`
  const current = process.argv[3]
  const toBranch = process.argv[4]
  const needTag = true
  const tagName = 'false'
  const list = [
  `cd ${str} && ls`,
  `cd ${str} && git status`,
  `cd ${str} && git checkout ${current}`,
  `cd ${str} && git pull origin ${current}`,
  `cd ${str} && git checkout ${toBranch}`,
  `cd ${str} && git pull origin ${toBranch}`,
  `cd ${str} && git merge --no-ff ${current}`,
  `cd ${str} && git push origin ${toBranch}`,
//   `cd ${str} && git tag v12.5.3`,
//   `cd ${str} && git push origin v12.5.3`,
]
if(needTag) {
    const arr = [
        `cd ${str} && git tag ${tagName}`,
        `cd ${str} && git push origin ${tagName}`,
    ]
    list.concat(arr)
}
console.log(list)
return
setTimeout(() => {
    main()
}, 3000)
console.log('3s后执行以下操作')
console.log(list)
async function main() {
    for(let key of list) {
        console.log('run', key)
        await listPromise(key)
    }
}
function listPromise(runStr) {
    return new Promise((resolve, reject) => {
        exec(runStr, (error, stdout, stderr) => {
            if (error) {
                console.error(`上传失败: ${error}`)
                reject(false)
                return
            }
            console.log(`stdout: ${stdout}`)
            console.log(`stderr: ${stderr}`)
            resolve(true)
        })
    })
}
  

