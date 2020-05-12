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

var canvas = new fabric.Canvas('canvas');



function mapState(states) {
  const points = getPoint(100, 100, 100, 10)
  const names = Object.getOwnPropertyNames(states)
  return names.map((action, index) => {
    // 状态框
    renderBlock(index * 140, index % 2 === 0 ? 100 : 300, action, index)
    const reveice = Object.getOwnPropertyNames(states[action])
    reveice.map((key, reveice_index) => {
      // key 接受什么行为
      // 下一个状态 states[action][key]
      // 下一个状态在数组中的位置 names.indexOf(states[action][key])
      const nextIndex = names.indexOf(states[action][key])
      const count = 0
      if(nextIndex !== -1) {
        console.log(key, action, reveice_index)
        drawPath(
          points[index].x + (count * reveice_index), 
          points[index].y + (count * reveice_index), 
          points[nextIndex].x + (count * reveice_index), 
          points[nextIndex].y + (count * reveice_index), 
          key,
          action,
          reveice_index
        )
      }
      // document.getElementById('container').innerHTML += `<div class='line'></div>`
    })
  }).join('')
}
mapState(machine.states)

async function renderBlock(x, y, name, index) {
  await sleep()
  const points = getPoint(500, 100, 100, 10)
  const radius = 45
  var rect = new fabric.Circle({
    radius,
    fill: 'red',
    originX: 'center',
    originY: 'center'
  });

  var text = new fabric.Text(name, {
    fontSize: 16,
    fill: 'white',
    originX: 'center',
    originY: 'center'
  })
  var group = new fabric.Group([rect, text], {
    left: points[index].x - radius,
    top: points[index].y - radius
  })
  canvas.add(group);
}
function getPoint(r, ox, oy, count){
  r = 350
  ox = 400
  oy = 400
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
async function drawPath(x,y,x1,y1, name, action, reveice_index) {
  let diff = 0, count = 10
  var path = new fabric.Path(`M ${x} ${y} L ${x1} ${y1} z`);
  path.set({ fill: 'red', stroke: 'green', opacity: 0.5 });
  const k= (y1-y)/(x1-x)
  const origin = Math.atan(k) * 180 / Math.PI
  // 平移后x
  // (cos(90 - origin) * count + x)
  // 平移后y
  // (count / cos(origin)   + y)
  // 平移后y
  // (count * cos(origin) + y)
  // 平移后x

  // 转换为原点
  const row = x1 - x, col = y1 - y
  //  const k= (y-y1)/(x-x1)
  var text = new fabric.Text(name, {
    fontSize: 16,
    fill: 'white',
    originX: 'center',
    originY: 'center',
    left: x + (x1-x + 20) / 2,
    top: y + (y1-y + 20) / 2,
    angle: Math.atan(k) * 180 / Math.PI
  })

  fabric.Image.fromURL("arrow.png", function (oImg) {
  // 　　canvas.add(oImg)
    oImg.left = x + (x1-x - 40) / 2
    oImg.top = y + (y1-y - 40) / 2
    oImg.scaleX = oImg.scaleY = 0.1
    
    let rot = Math.atan(k) * 180 / Math.PI
    // console.log(rot)
    if(row > 0 && col > 0) {
      rot = rot
      // 不变
    } else if(row > 0 && col < 0) {
      // rot = 90 + rot
    } else if(row < 0 && col > 0) {
      // rot = 270 + rot
      // rot = 90 - rot
      rot = 180 + rot

    } else if(row < 0 && col < 0){
      rot = 180 + rot
    }
    // oImg.rotate(360 + Math.atan(k) * 180 / Math.PI)
    oImg.rotate(rot)
    if(action === '22') {
      console.error('----')
      console.warn('x1', x1,'x', x,'y1', y1,'y', y)
      console.warn(row, col)
      console.log(k, name, rot)
      console.error('----')
    }
    var group = new fabric.Group([path, text, oImg], {
      
    })
    canvas.add(group);
    // canvas.add(oImg)
  // 　　oImg.hasControls = oImg.hasBorders = false
  })
}
function sleep() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    })
  })
}