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

let animationTotal = []

let wjb = (function() {
    let moduleOb = {}

    function loadAnimation(params){
    	for (let i=0; i<params.length; i++) {
    		let animationItem = new AnimationItem()
    		animationItem.setData(params[i])
    		animationTotal.push(animationItem)
    	}

    	return animationTotal
    }

    function start(){
    	context.clearRect(0, 0, canvas.width, canvas.height) // 清除画布

    	for (let i=0; i<animationTotal.length; i++) {
    		if (animationTotal[i].endTaskTotal) return 

    		animationTotal[i].start()
    		requestID = requestAnimationFrame(start)
    	}
    }

    function stop(){
        for (let i=0; i<animationTotal.length; i++) {
            animationTotal[i].stop()
        }
    }

    function reset(){
    	context.clearRect(0, 0, canvas.width, canvas.height) // 清除画布

    	for (let i=0; i<animationTotal.length; i++) {
    		animationTotal[i].reset()
    		requestID = requestAnimationFrame(start)
    	}
    }

    moduleOb.loadAnimation = loadAnimation
    moduleOb.start = start
    moduleOb.stop = stop
    moduleOb.reset = reset
    return moduleOb
}())