// 初始化状态
let STATE_INITIAL = 0 
// 开始状态
let STATE_START = 1
// 停止状态
let STATE_STOP = 2
// 完成状态
let STATE_FINISH = 3

let AnimationItem = function() {
	this.state = STATE_INITIAL
    this.animationData = {} // 动画数据
    this.animationType = ''
    this.fillStyle = ''
    this.task = []
    this.fr = 0
    this.loop = true
    this.delay = 0

    this.currentFr = 0 // 当前帧
    this.startFr = 0 // 动画的开始帧
    this.currentLoop = 0 // 当前任务次数
    this.taskIndex = 0 // 当前任务序号

    this.endTaskTotal = false
}

AnimationItem.prototype = {
    setData: function(params) {
    	// this.initstartX = params.animationData.startX
    	// this.initstartY = params.animationData.startY
    	this.animationData = params.animationData
    	this.animationType = params.animationType
    	this.fillStyle = params.fillStyle
    	this.task = params.task
    	this.fr = params.fr
    	this.loop = params.loop
    	this.delay = params.delay

        // 通过深拷贝保存初始数据
        this.initData = JSON.parse(JSON.stringify(params))

    	// this.startFrames()
    },

    startFrames: function() {    	
        // 判断动画开始帧数
        if (this.fr === undefined || this.startFr === this.fr) {
            this.draw()
        } else {
        	this.startFr++
        }
    },

    draw: function() {
    	context.beginPath() // 绘制开始

        // 动画类型处理
        if (this.animationType === "arc") {
            context.arc(this.animationData.startX, this.animationData.startY, this.animationData.radius, this.animationData.sAngle, this.animationData.eAngle, this.animationData.counterclockwise)
        } else if (this.animationType === "rect") {
            context.rect(this.animationData.startX, this.animationData.startY, this.animationData.width, this.animationData.height)
        } else if (this.animationType === "image") {
            let img = new Image() // 创建一个 Image 对象
            img.src = this.animationData.imageUrl // 为 Image 对象指定图片源
            img.onload = function(){ // 等到图片加载进来之后
                context.drawImage(img, this.animationData.startX, this.animationData.startY, this.animationData.width, this.animationData.height) // 五参数的情况，图片大小由后两个参数控制
            }
            return this.track()
        } else {
            return this._then("画类型未设置")
        }

        context.fillStyle = this.fillStyle
        context.fill()

        this.track()
    },

    track: function() {
    	let task = this.task[this.taskIndex]
    	let mx = task.mx || 0
    	let my = task.my || 0
    	let vx = task.vx || 0
    	let vy = task.vy || 0
    	let fr = this.currentFr

    	this.animationData.startX += mx + vx * fr
    	this.animationData.startY += my + vy * fr

    	this.range()
    },

    start: function() {
    	if (this.state === STATE_START) {
            cancelAnimationFrame(requestID)
        }
        this.state = STATE_START

    	this.startFrames()
    },

    stop: function() {
    	if (this.state === STATE_START) {
            this.state === STATE_STOP
            cancelAnimationFrame(requestID)
        }
    },

    reset: function() {  	
        // 恢复初始默认值
        this.recover()
        this.currentFr = 0
        this.startFr = 0
        this.currentLoop = 0
        this.taskIndex = 0
        this.endTaskTotal = false
    },

    range: function() {
    	let task = this.task[this.taskIndex]

    	this.currentFr++

    	// 通过设置动画帧数 fr 来控制范围
    	if (task.fr !== undefined && this.currentFr === task.fr + 1 || this.currentFr === 0) {
        	// 双向、单向模式处理
        	this.direction()  
    	} else if (task.fr == undefined) { // 没设置动画帧数时，默认范围为画布
        	this.exceedCanvasRange()
    	}
    },

    direction: function() {
    	let task = this.task[this.taskIndex]
    	let loop = task.loop || this.loop

    	if (task.direction === "twoWay") {
        	task.mx = -task.mx || 0
        	task.my = -task.my || 0

        	if (this.currentFr === 0) {
            	this.currentFr = 0
        	} else {
            	this.currentFr = -this.currentFr + 1
        	}

        	this.currentLoop += 1/2
    	} else if (task.direction === undefined || task.direction === "oneWay") {
        	this.currentFr = 0
        	this.currentLoop++

        	if (this.currentLoop !== loop) {
            	if (this.taskIndex === 0) {
                	this.recover()
            	} else {
                	if (task.continuity === undefined || task.continuity === "start") {
                    	this.recover()
                	} else if (task.continuity === "previous" || task.continuity === "custom") {
                    	if (this.lastStartX !== undefined && this.lastStartY !== undefined) {
                        	this.animationData.startX = this.lastStartX
                        	this.animationData.startY = this.lastStartY

                        	if (this.animationType === "polygon") {
                            	for (let i=0; i<this.animationData.lineToList.length; i++) {
                                	this.animationData.lineToList[i][0] = this.lastLineToList[i][0]
                                	this.animationData.lineToList[i][1] = this.lastLineToList[i][1]
                            	}
                        	}
                    	} else {
                        	this.recover()
                    	}                 
                	}
            	}
        	}
    	}

    	this.repeatLoop() // 当前任务完成后的重复处理
    },

    repeatLoop: function() {
    	let task = this.task[this.taskIndex]
    	let loop = task.loop || this.loop

    	if (this.currentLoop === loop) {
        	this.currentLoop = 0

        	if (task.continuity === "previous") { // 接着上一任务位置开始
            	this.previousTaskEndPoint()
        	} else if (task.continuity === "custom") { // 不连续，自定义起点位置重新开始
        		if (task.sx !== undefined) this.animationData.startX = task.sx
        		if (task.sy !== undefined) this.animationData.startY = task.sy

            	this.previousTaskEndPoint()
        	}

        	this.taskIndex++

        	// 全部任务完成
        	if (this.taskIndex === this.task.length) {
            	this.taskIndex = 0     
            	this.endTaskTotal = true
        	}
    	}
    },

    recover: function() {
    	// 恢复动画初始值
    	this.animationData.startX = this.initData.animationData.startX
    	this.animationData.startY = this.initData.animationData.startY

    	// 双向模式时，重置动画时保证移动方向为初始值(即返回没完成时重置动画)
    	if (!Number.isInteger(this.currentLoop)) {
        	this.task[this.taskIndex].mx = this.initData.task[this.taskIndex].mx
        	this.task[this.taskIndex].my = this.initData.task[this.taskIndex].my
    	}
    },

    previousTaskEndPoint: function() {
    	this.lastStartX = this.animationData.startX
    	this.lastStartY = this.animationData.startY
    },

    then: function (tips) {
    	console.log(tips)
	}
}