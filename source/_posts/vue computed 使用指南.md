---
title: Vue3.0 之 意大利面条
date: 2021/01/12
---

vue3.0 python nodejs

## Vue 3.0 组合式 API

Vue 3.0 已经发布很久了，不知道大家有咩有用到项目里，我使用 Vue 3.0 已经六个月了，并且一直在使用组合式 API 来开发项目。

在 Vue 2.0 时代，响应式属性被我们这样写：

```javascript
export default {
  data() {
    return {
      isVisbile: false,
    };
  },
};
```

而在 Vue 3.0 中，响应式属性变成了函数式写法，通过 `reactive/ref` 函数来定义响应式属性。

```javascript
import { reactive, ref } from 'vue';

export default {
  setup() {
    const isVisible = ref(false);
    const data = reactive({
      name: 'hello world',
    });
    return {
      isVisbile,
      data,
    };
  },
};
```

并且，我们在 Vue 2.0 中熟知的配置化特性，像 `mounted` `watch` `computed` `components` 等等，在最新版本里都变成了函数式，我们可以可选的 `import` 它们。像这样：

```javascript
import { computed, onMounted, ref, watch, ... } from 'vue';
```

最终在 `setup` 方法里调用他们。

比如计算属性：

```javascript
import { reactive, ref } from 'vue';

export default {
  setup() {
    const isVisible = ref(false);
    const modelState = computed(() => {
      return isVisible ? '显示' : '隐藏';
    });
    return {
      isVisbile,
      modelState,
    };
  },
};
```

比如生命周期：

```javascript
import { onMounted } from 'vue';

export default {
  setup() {
    onMounted(() => {
      console.log('i am mounted');
    });
  },
};
```

这样写的好处是相同的业务逻辑写在一处，相比配置化的写法而言，逻辑更紧凑。以下是 `options`的写法，可以看到相同逻辑分散在各处，思维要常常跳跃。
![逻辑](https://user-images.githubusercontent.com/499550/62783021-7ce24400-ba89-11e9-9dd3-36f4f6b1fae2.png)

但代码都写到 `setup` 中就`100%`好吗，配置化的写法确实有其问题，但正是由于其配置化，可以让不同人写出来的代码下限不至于太低。

但 `Vue 3.0` 组合式 API 的写法，让我们把所有东西塞到 `setup` 中后，问题就出现了。很多人一不小心就写出了意大利面条式的代码，也有人会把逻辑写的分散开来，随着业务需求的增加，代码随之被塞到 setup 尾部，这比配置化更糟糕，最起码配置化还按照特性区分。

## 相同的业务紧密起来

我们再使用组合式 API 时，时刻要记住这点，相同的逻辑/响应式属性最好写在一起。

```javascript
export default {
  setup() {
    // 滚动条相关
    const scrollX = ref(0)
    function scrollTo(top) {
      scrollX.value = top
    }

    // 键盘事件相关
    const key = ref(null)
    function tapKeyborad(ev) {
      key.value = ev.target.keyCode
    }

    return {
      scrollX
      scrollTo,
      key,
      tapKeyborad
    }
  }
}
```

当然，你如果嫌 return 的对象过多，还可以合理的使用对象解构来分解，像这样：

```javascript
export default {
  setup() {
    // 滚动条相关
    const scrollX = ref(0)
    function scrollTo(top) {
      scrollX.value = top
    }
    const scrollSetup = {
      scrollX
      scrollTo,
    }
    // 键盘事件相关
    const key = ref(null)
    function tapKeyborad(ev) {
      key.value = ev.target.keyCode
    }
    const keyboradSetup = {
      key,
      tapKeyborad
    }
    return {
      ...scrollSetup,
      ...keyboradSetup
    }
  }
}
```

这样就更简洁了。

## 不要意大利面条

在我刚开始开发项目时，setup 的体积随着业务需求的增长越来越大，有个组件一度达到了 `500+` 行，添加代码时及其痛苦，这种情况就需要我们封装函数了，在 `react` 中就是自定义 hook 了，`Vue 3.0` 中我们可以这样优化上文的代码。

```javascript
// useScroll.js
export default function() {
  const scrollX = ref(0)
  function scrollTo(top) {
    scrollX.value = top
  }
  return {
    scrollX
    scrollTo,
  }
}
// useKeyBorad.js
export default function() {
  const key = ref(null)
  function tapKeyborad(ev) {
    key.value = ev.target.keyCode
  }
  return {
    key,
    tapKeyborad
  }
}
// app.vue
export default {
  setup() {
    // 滚动条相关
    const scrollSetup = useScroll()
    // 键盘事件相关
    const keyboradSetup = useKeyBorad()
    return {
      ...scrollSetup,
      ...keyboradSetup
    }
  }
}
```

通过这样的封装，代码变得更简洁了。
