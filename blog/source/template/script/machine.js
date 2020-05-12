const machine = {
  currentState: 'roleVoid',
  states: {
    // 角色为空
    'roleVoid': {
      'interviewer_enter': 'interviewer_un_ready',
      'hunter_enter': 'hunter_un_ready',
      'host_enter': 'host_enter_un_ready',
      beforeEnter() {
        console.log('有人进入')
      }
    },
    // 面试官
    'interviewer_un_ready': {
      'interviewer_click_ready': 'meet_ready',
      beforeEnter() {
        if(!this.data.nowUserInfo.isHost && this.data.nowUserInfo.role === 1) {
          this.setData({
            btnText: '准备面试',
            btnDisabled: ''
          })
        }
      },
    },
    // 主持人，未开始面试状态
    'host_enter_un_ready': {
      'hunter_enter': 'host_enter_ready',
      beforeEnter() {
        if(this.data.nowUserInfo.isHost) {
          this.setData({
            btnText: '开始面试',
            btnDisabled: 'button--disabled'
          })
        }
      },
    },
    // 主持人就绪，求职者未准备
    'host_enter_ready': {
      // 求职者点击准备
      'hunter_click_ready': 'meet_ready'
    },
    // 求职者，面试未就绪，此时还不能准备，只有 interviewer_enter / host_enter 进入时才能准备
    'hunter_un_ready': {
      'interviewer_enter': 'hunter_un_plan',
      'host_enter': 'hunter_un_plan',
      beforeEnter() {
        if(this.data.nowUserInfo.role === 0) {
          this.setData({
            btnText: '准备面试',
            btnDisabled: 'button--disabled'
          })
        }
      },
    },
    // 求职者未准备状态
    'hunter_un_plan': {
      'hunter_click_ready': 'meet_ready',
      beforeEnter() {
        if(this.data.nowUserInfo.role === 0) {
          this.setData({
            btnText: '准备面试',
            btnDisabled: ''
          })
        }
        // 主持人
        if(this.data.nowUserInfo.isHost) {
          this.setData({
            btnText: '开始面试',
            btnDisabled: 'button--disabled',
            startInterview: ''
          })
        }
      },
    },
    // 面试准备状态
    'meet_ready': {
      'host_click_start': 'meet_start',
      'click_leave': 'leaved',
      'hunter_leave': 'hunter_un_plan',
      beforeEnter() {
        // 求职者
        if(this.data.nowUserInfo.role === 0) {
          this.setData({
            btnText: '离开面试',
            btnDisabled: '',
            leave: 'button--leave'
          })
        }
        // 主持人
        if(this.data.nowUserInfo.isHost) {
          this.setData({
            btnText: '开始面试',
            btnDisabled: '',
            startInterview: 'start-interview'
          })
        }
        // 面试官
        if(!this.data.nowUserInfo.isHost && this.data.nowUserInfo.role === 1) {
          this.setData({
            btnText: '离开面试',
            btnDisabled: '',
            leave: 'button--leave'
          })
        }
      },
    },
    // 面试开始
    'meet_start': {
      'host_click_end': 'meet_end',
      'click_leave': 'leaved',
      beforeEnter() {
        if(this.data.nowUserInfo.isHost) {
          this.setData({
            btnText: '结束面试',
            btnDisabled: '',
            leave: 'button--leave',
            startInterview: ''
          })
        }
      },
    },
    // 离开面试
    'leaved': {
      beforeEnter() {
        console.log('离开面试')
      }
    },
    // 面试结束
    'meet_end': {
      // 根据当前角色状态，跳转到对应的评价页面
      afterEnter() {
        console.log('终点')
      }
    }
  }
}
const states = machine.states
const hash = {}
function mapObj(state) {
  let prevX = 0, prevY = 0
  const nowState = states[state]
  const names = Object.getOwnPropertyNames(nowState)
  names.map((action) => {
    if(typeof nowState[action] !== 'function') {
      console.log(action)
      if(!hash[action]) {
        prevX = prevX + 10 + 100
        hash[action] = {
          width: 100,
          height: 100,
          x: prevX,
          y: 0,
          text: hash[action]
        }
      }
    }
  })
  return hash
  // console.log()
}

const points = getPoint(200, 500, 400, 10)
function mapState(states) {
  const names = Object.getOwnPropertyNames(states)
  return names.map((action, index) => {
    const reveice = Object.getOwnPropertyNames(states[action])
    reveice.map(key => {
      // key 接受什么行为
      // 下一个状态 states[action][key]
      // 下一个状态在数组中的位置 names.indexOf(states[action][key])
      const nextIndex = names.indexOf(states[action][key])
      document.getElementById('container').innerHTML += `<div class='line'></div>`
    })
    // 状态框
    return renderBlock(index * 140, index % 2 === 0 ? 100 : 300, action, index)
  }).join('')
}
function renderBlock(x, y, name, index) {
  return `<div class='${name} block' style='left:${points[index].x}px;top:${points[index].y}px;'>${name}</div>`
}
console.log( mapState(states))
// mapObj('roleVoid')
document.getElementById('container').innerHTML = mapState(states)

// 2 4
//  3 7

function getPoint(r, ox, oy, count){
  let point = []
  var radians = (Math.PI / 180) * Math.round(360 / count), //弧度
      i = 0;
  for(; i < count; i++){
      var x = ox + r * Math.sin(radians * i),
          y = oy + r * Math.cos(radians * i);

      point.unshift({x:x,y:y}); //为保持数据顺时针
  }
  return point
}