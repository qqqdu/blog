
let app = {
  model: {
    url: {
      'URL1': 'https//xxx/URL1',
      'URL2': 'https//xxx/URL2'
    },
    data: {
      name: 'qqqdu',
      year: '24'
    },
    setData: data => {
      this.model.data = {
        ...this.model.data,
        ...data
      }
      this.view.render(this.model.data)
    }
  },
  init() {
    this.setData(this.model.data)
    this.view.bindDom()
  },
  view: {
    bindDom() {
      $('#submit').click(() => {
        this.controller.getURL1($('#input').val())
      })
      $('#some ID').click(() => {
        this.controller.getURL2()
      })
      $('#name').input(this.controller.bindName)
      $('#year').input(this.controller.bindYear)
    },
    render(options) {
      $('#name').text(options.name)
      $('#year').text(options.year)
    }
  },
  controller: {
    bindName() {
      // 业务处理
      let fullName = $(this).val()
      fullName = 'MR: ' + fullName
      this.setData({
        name: fullName
      })
    },
    bindYear() {
      this.setData({
        year: $(this).val()
      })
    },
    getURL1(data) {
      // 请求1
      $.ajax({
        url: this.model.url.URL1,
        data: {
          val: data
        },
        success: res => {
          this.setData(res.data)
        }
      })
    },
    getURL2() {
      // 请求2
      $.ajax({
        url: this.model.url.URL2,
        success: res => {
          this.setData(res.data)
        }
      })
    }
  }
}