/**
 * 这个脚本是专门打tag用的
 */
  // node git jobmd-weapp release-12.5.1 develop
  const { exec } = require('child_process')
//   const str = `/Users/qqqdu/Desktop/dxy/gitrepo/${process.argv[2]}`
  const current = process.argv[3]
  const toBranch = process.argv[4]
  const tagName = `v12.5.3`
  const project = [
    'jobmd_v3',
    'jobmd_ent',
    'jobmd_admin',
    'jobmd-mobile',   
    'jobmd_user',
    'jobmd_ent_v'
  ]
console.log('3s后执行以下操作')
project.map(async val => {
    await main(`/Users/qqqdu/Desktop/dxy/gitrepo/${val}`)
})
async function main(str) {

    const list = [
        `cd ${str} && ls`,
        `cd ${str} && git checkout develop`,
        `cd ${str} && git pull origin develop`,
        // 删除本地分支
        `cd ${str} && git tag ${tagName}`,
        `cd ${str} && git push origin ${tagName}`,
    ]
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
  