/** 事件订阅 */
// var object = {}

// _.extend(object, Backbone.Events)
// object.on('click', (ev) => {
//   console.log('click', ev)
// })
// object.off()
// object.trigger('click', 234)

const Input = Backbone.Model.extend({
})
const input = new Input({
  background: 'black',
  value: 'white'
})
// input.on('change:value', function(res) {
//   console.log('这里设定颜色', res)
// })

const DocumentRow = Backbone.View.extend({
  model : input,
  initialize: function() {
    this.model.bind("change:value", this.render, this)
  },
  events : {
    "input input" : "changeValue"
  },
  changeValue : function(e){
    input.set({
      value: e.target.value
    })
  },
  render: function(res) {
      // Render the 'name' attribute of the model associated
      // inside the DOM element referred by 'el'
      console.log('render')
      const { value } = res.changed
      $('input').val(value)
      return this
  }
});
const documents = new DocumentRow({
  el: $('body')
})
input.set({
  value: 'sss'
})