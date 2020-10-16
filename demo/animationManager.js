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

    // 加载动画数据
    function loadAnimation(params){
    	for (let i=0; i<params.length; i++) {
    		let animationItem = new AnimationItem()
    		animationItem.setData(params[i])
    		animationTotal.push(animationItem)
    	}

        this.startUp()

    	return animationTotal
    }

    // 第一次启动动画
    function startUp(){
        context.clearRect(0, 0, canvas.width, canvas.height) // 清除画布
        console.log(1)
    	for (let i=0; i<animationTotal.length; i++) {
            animationTotal[i].startUp()
    	}

        requestID = requestAnimationFrame(startUp)       
    }

    /**
    * 重新开始暂停的动画
    * @param  name  动画名称，重新开始多个时，直接传数组即可。如 [name1, name2], 若没传参数时默认为重新开始全部的暂停
    */
    function start(name){
        for (let i=0; i<animationTotal.length; i++) {
            if (name === undefined || name.indexOf(animationTotal[i].name) !== -1) {
                animationTotal[i].start()
            }
        }
    }

    /**
    * 暂停动画
    * @param  name  动画名称，暂停多个时，直接传数组即可。如 [name1, name2], 若没传参数时默认为暂停全部
    */
    function stop(name){
        for (let i=0; i<animationTotal.length; i++) {
            if (name === undefined || name.indexOf(animationTotal[i].name) !== -1) {
                animationTotal[i].stop()
            }
        }
    }

    /**
    * 重置动画
    * @param  name  动画名称，重置多个时，直接传数组即可。如 [name1, name2], 若没传参数时默认为重置全部
    */
    function reset(name){
    	context.clearRect(0, 0, canvas.width, canvas.height) // 清除画布

    	for (let i=0; i<animationTotal.length; i++) {
            if (name === undefined || name.indexOf(animationTotal[i].name) !== -1) {
                animationTotal[i].reset()
                requestID = requestAnimationFrame(startUp)
            }
    	}
    }

    /**
    * 删除动画
    * @param  name  动画名称，删除多个时，直接传数组即可。如 [name1, name2], 若没传参数时默认为删除全部
    */
    function remove(name){
        for (let i=0; i<animationTotal.length; i++) {
            if (name === undefined || name.indexOf(animationTotal[i].name) !== -1) {
                animationTotal.splice(i, 1)
            } 
        }
    }

    moduleOb.loadAnimation = loadAnimation
    moduleOb.startUp = startUp
    moduleOb.start = start
    moduleOb.stop = stop
    moduleOb.reset = reset
    moduleOb.remove = remove
    return moduleOb
}())