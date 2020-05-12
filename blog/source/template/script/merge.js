/**
 * 这个脚本是专门合并所有项目的两个分支用的
 */
  // node merge release-12.10.2 master
  const { exec } = require('child_process')
//   const str = `/Users/qqqdu/Desktop/dxy/gitrepo/${process.argv[2]}`
  const current = process.argv[2]
  const toBranch = process.argv[3]
  const tagName = `v12.10.1`
  let needTag = false
  if(toBranch === 'master') {
    needTag = true
  }
  const project = [
    'jobmd_ent_v',
    'jobmd_ent_collaborate',
    'jobmd_collaborate_mobile',
    // 'jobmd_hunter',
    // 'jobmd-mobile',   
    // 'jobmd_campus_weapp',
    // 'jobmd_ent_v',
    // 'jobmd-weapp',
    // 'jobmd_admin'
    // 'jobmd_ent',
  ]
console.log('3s后执行以下操作')
project.map(async val => {
    await main(`/Users/qqqdu/Desktop/dxy/gitrepo/${val}`)
})
async function main(str) {
    
    let list = [
      `cd ${str} && ls`,
      `cd ${str} && git checkout master`,
      `cd ${str} && git pull`,
      `cd ${str} && git status`,
      `cd ${str} && git checkout ${current}`,
      `cd ${str} && git pull origin ${current}`,
      `cd ${str} && git checkout ${toBranch}`,
      `cd ${str} && git pull origin ${toBranch}`,
      `cd ${str} && git merge --no-ff ${current}`,
      `cd ${str} && git push origin ${toBranch}`,
    ]
    if(needTag) {
      const arr = [
          `cd ${str} && git tag ${tagName}`,
          `cd ${str} && git push origin ${tagName}`,
      ]
      list = list.concat(arr)
    }
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
  