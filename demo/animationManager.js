let DEFAULT_INTERVAL = 1000/60

let requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            function (callback) {
                return window.setTimeout(callback, callback.interval || DEFAULT_INTERVAL)
            }
})()

let cancelAnimationFrame = (function () {
    return window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.oCancelAnimationFrame ||
            function (id) {
                return window.clearTimeout(id)
            }
})()

// 加载的动画所有数据
let animationTotal = []

let wjb = (function() {
    let moduleOb = {}

    /**
    * 添加动画
    * @param  animationParam  动画的所有数组对象数据，如 [animationObj1, animationObj2, animationObj3]
    */
    function add(animationParam){
        for (let i=0; i<animationParam.length; i++) {
            let animationItem = new AnimationItem()
            animationItem.setData(animationParam[i])
            animationTotal.push(animationItem)
        }

        return this
    }


    /**
    * 加载动画
    * @param  name  动画名称，加载多个时，直接传数组即可。如 [name1, name2], 若没传参数时默认为全部加载
    */
    function loadAnimation(name){
    	for (let i=0; i<animationTotal.length; i++) {
            if (name === undefined || name === animationTotal[i].name || name.indexOf(animationTotal[i].name) !== -1) {
                animationTotal[i].isLoaded = true
            }
    	}

        this.startUp()

        return this
    }

    // 启动动画
    function startUp(){
        context.clearRect(0, 0, canvas.width, canvas.height) // 清除画布

    	for (let i=0; i<animationTotal.length; i++) {
            if (animationTotal[i].isLoaded) {
                animationTotal[i].start()
                animationTotal[i].requestID = requestAnimationFrame(startUp)
            }
    	}      
    }

    /**
    * 开始动画
    * @param  name  动画名称，开始多个时，直接传数组即可。如 [name1, name2], 若没传参数时默认为全部开始
    */
    function start(name){
        for (let i=0; i<animationTotal.length; i++) {
            if (name === undefined || name === animationTotal[i].name || name.indexOf(animationTotal[i].name) !== -1) {
                if (!animationTotal[i].isLoaded) {
                    animationTotal[i].then(animationTotal[i].name + '动画还未加载')
                } else {
                    if (!animationTotal[i].isPaused) {
                        animationTotal[i].isPaused = true
                        this.startUp()
                    }
                }
            }
        }
    }

    /**
    * 暂停动画
    * @param  name  动画名称，暂停多个时，直接传数组即可。如 [name1, name2], 若没传参数时默认为全部暂停
    */
    function stop(name){
        for (let i=0; i<animationTotal.length; i++) {
            if (name === undefined || name === animationTotal[i].name || name.indexOf(animationTotal[i].name) !== -1) {
                if (animationTotal[i].isPaused) {
                    animationTotal[i].isPaused = false
                    animationTotal[i].stop() 
                }
            }
        }
    }

    /**
    * 重置动画
    * @param  name  动画名称，重置多个时，直接传数组即可。如 [name1, name2], 若没传参数时默认为全部重置
    */
    function reset(name){
    	context.clearRect(0, 0, canvas.width, canvas.height) // 清除画布

    	for (let i=0; i<animationTotal.length; i++) {
            if (name === undefined || name === animationTotal[i].name || name.indexOf(animationTotal[i].name) !== -1) {
                animationTotal[i].reset()
                this.startUp()
            }
    	}
    }

    /**
    * 删除动画
    * @param  name  动画名称，删除多个时，直接传数组即可。如 [name1, name2], 若没传参数时默认为删除全部
    */
    function remove(name){
        for (let i=0; i<animationTotal.length; i++) {
            if (name === undefined || name === animationTotal[i].name || name.indexOf(animationTotal[i].name) !== -1) {
                animationTotal.splice(i, 1)
            } 
        }
    }

    moduleOb.add = add
    moduleOb.loadAnimation = loadAnimation
    moduleOb.startUp = startUp
    moduleOb.start = start
    moduleOb.stop = stop
    moduleOb.reset = reset
    moduleOb.remove = remove
    return moduleOb
}())