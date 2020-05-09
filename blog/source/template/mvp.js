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
    setYear: data => {
      this.model.data.year = data
    },
    setName: data => {
      data = 'MR: ' + fullName
      this.model.data.name = data
    }
  },
  init() {
    this.setData(this.model.data)
    this.view.bindDom()
  },
  view: {
    bindDom() {
      $('#submit').click(this.controller.getURL1)
      $('#some ID').click(this.controller.getURL2)
      $('#name').input(this.controller.bindName)
      $('#year').input(this.controller.bindYear)
    },
    renderText(options) {
      $('#name').text(options.name)
      $('#year').text(options.year)
    }
  },
  controller: {
    bindName() {
      this.model.setName($(this).val())
      this.view.renderText(this.model)
    },
    bindYear() {
      this.model.setYear($(this).val())
      this.view.renderText(this.model)
    },
    getURL1() {
      // 请求1
      $.ajax({
        url: this.model.url.URL1,
        data: {
          val: 'data'
        },
        success: res => {
          // 业务逻辑
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