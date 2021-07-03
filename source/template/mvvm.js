let app = {
  init() {
    this.setData(this.model.data)
    this.view.bindDom()
  },
  _bindMVVM() {
    const vm = $("[data-mvvm]")
    vm.each(ev => {
      const el = $(vm[ev]),
            tagName = el[0].tagName,
            key = el.data('mvvm')
      el[0].addEventListener('input', (ev) => {
        this.model.data[key] = ev.target.value
        console.log(this.model.data, key)
      })
    })
  },
  _render() {
    const vm = $("[data-mv]")
    const mvvm = $("[data-mvvm");
    const self = this
    vm.each(renderFn)
    mvvm.each(renderFn)
    function renderFn() {
      const el = $(this),
          tagName = el[0].tagName
      const key = el.data('mv') || el.data('mvvm')
      const data = self.model.data[key]
      if(/INPUT|SELECT/.test(tagName)) {
        if(el.val() !== data) {
          el.val(data)
        }
      } else {
        if(el.text !== data) {
          el.text(data)
        }
      }
    }
  },
  _dirtyCheck() {
    requestAnimationFrame(() => {
      this._dirtyCheck()
      this._render()
    })
  },
  model: {
    data: {
      name: 'qqqdu',
      year: '24'
    }
  },
  view: {
    bindDom() {
      $('#submit').click(this.controller.getURL1)
      $('#some ID').click(this.controller.getURL2)
      $('#name').input(this.controller.bindName)
      $('#year').input(this.controller.bindYear)
    }
  },
  controller: {
  }
}

window.onload = function() {
  app._bindMVVM()
  app._render()
  app._dirtyCheck()
  setTimeout(() => {
    app.model.data.year = 100000
  }, 1000)
}