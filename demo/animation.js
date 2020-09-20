let DEFAULT_INTERVAL = 1000/60

// 初始化状态
let STATE_INITIAL = 0 
// 开始状态
let STATE_START = 1
// 停止状态
let STATE_STOP = 2
// 完成状态
let STATE_FINISH = 3

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

function Animation() {
    this.state = STATE_INITIAL
    this.fr = 0 // 总帧数
    this.initData = { // 初始数据默认值
        targetListParam: [
            { // 动画目标初始参数对象
                startX: 200,
                startY: 50,
                radius: 25,
                sAngle: 0,
                eAngle: 2 * Math.PI,
                counterclockwise: false,
                targetType: "", // 动画目标类型
                fillStyle: "blue", // 填充颜色
                imageUrl: "https://cdn.jsdelivr.net/gh/wujinbao/markdown_files@v7.3/XML/goldCoin.png",
                width: 50,
                height: 50,
                lineToList: [
                    [130, 50], [150, 70], [130, 90], [80, 90], [60, 70]
                ],
                lastLineToList: []
            }
        ],
        motionListParam: [
            { // 运动参数默认值           
                task: [ // 任务总计
                    {mx: 0, my: 0,  vx: 0, vy: 0, fr: 0, loop: 0, continuity: "start", sx: 0, sy: 0, delay: 0}
                ],
                fr: 0, // 动画开始帧数
                loop: 0, // 当前动画任务重复次数
                delay: 0, // 一个任务完成后，下个任务开始的延时时间
            }
        ],
        fr: [], // 当前动画帧数
        loop: [], // 动画重复次数
        taskIndex: [], // 当前任务队列索引值
        endTask: [], // 该任务是否已完成
        endTaskTotal: [], // 全部任务是否已完成
        startTarget: [], // 动画是否开始
        targetIndex: 0, // 当前动画序号
    }
}

/**
 * 是否拖尾效果
 * @param  rgba  拖尾，透明度设置
 */
Animation.prototype.clean = function (rgba) {
    // 阻断动画完成后点击开始
    if (this.state === STATE_FINISH) return this

    if (!rgba) {
        context.clearRect(0, 0, canvas.width, canvas.height)
    } else {
        context.fillStyle = rgba
        context.fillRect(0, 0, canvas.width, canvas.height)
    }

    return this
}

/**
 * 绘制动画目标
 * @param  targetListParam  动画目标参数对象
 * @param  motionListParam  动画目标运动参数值
 */
Animation.prototype.target = function (targetListParam, motionListParam) {
    // 阻断动画完成后点击开始
    if (this.state === STATE_FINISH) return this

    if (motionListParam === undefined) { // 未传参数可选参数时，使用默认初始值
        if (targetListParam.length == 1) {
            motionListParam = this.initData.motionListParam
        } else {
            motionListParam = []
            for (let i=0; i<targetListParam.length; i++) {
                motionListParam.push(this.initData.motionListParam[0])
            }
        }
    }

    if (targetListParam === undefined) { // 未传参数可选参数时，使用默认初始值
        targetListParam = this.initData.targetListParam
    }

    // 处理参数 targetParam 对象中有些 key 没传时使用默认值
    // let keys = Object.keys(this.initData.targetListParam[targetIndex])
    // for (let i=0; i<keys.length; i++) {
    //     if (targetParam[keys[i]] === undefined) {
    //         if (keys[i] === "lineToList") {
    //             targetParam.lineToList = []
    //             for (let i=0; i<this.initData.targetListParam[targetIndex].lineToList.length; i++) {
    //                 let item = this.initData.targetListParam[targetIndex].lineToList[i]
    //                 targetParam.lineToList[i] = [item[0], item[1]]
    //             }
    //         } else {
    //             targetParam[keys[i]] = this.initData.targetListParam[targetIndex][keys[i]]
    //         }
    //     }
    // }

    this.fr++

    for (let i=0; i<targetListParam.length; i++) {
        // 保存初始动画目标参数对象
        this._initData(targetListParam, motionListParam)

        let targetParam = targetListParam[i]
        let motionParam = motionListParam[i]

        this.initData.targetIndex = i // 当前动画序号

        // 判断动画开始帧数
        if (motionParam.fr === this.fr) {
            this.initData.startTarget[i] = true
        }

        if (motionParam.fr === undefined || this.initData.startTarget[i]) {
            this._draw(targetParam, motionParam)
        }
    }

    return this
}

/**
 * 开始动画
 * @param  callback  动画重复的回调函数
 */
Animation.prototype.start = function (callback) {
    let _motionParam = this.initData.motionListParam[this.initData.targetIndex]
    let endTaskTotal = this.initData.endTaskTotal

    // 阻断动画完成后点击开始
    if (this.state === STATE_FINISH) return this

    for (let i=0; i<endTaskTotal.length; i++) {
        if (!endTaskTotal[i]) {
            if (this.state === STATE_START) {
                cancelAnimationFrame(requestID)
            }
            this.state = STATE_START

            if (_motionParam.endTask) {
                _motionParam.endTask = false

                setTimeout(function(){
                    requestID = requestAnimationFrame(callback)
                }, _motionParam.delay)
            } else {
                requestID = requestAnimationFrame(callback)
            }

            return this
        } else {
            if (i === endTaskTotal.length - 1) {
                for (let x=0; x<endTaskTotal.length; x++) {
                    endTaskTotal[x] = false
                    this.initData.startTarget[x] = false
                    this.fr = 0
                    this.state = STATE_FINISH
                }

                return this
            }
        }
    }
}

/**
 * 停止动画
 * @param  requestID  清除 requestAnimationFrame 的 ID
 */
Animation.prototype.stop = function (requestID) {
    if (this.state === STATE_START) {
        this.state === STATE_STOP
        cancelAnimationFrame(requestID)
    }

    return this
}

/**
 * 重置动画
 * @param  requestID  清除 requestAnimationFrame 的 ID
 * @param  targetListParam  动画目标参数数组对象
 * @param  motionListParam  动画目标运动参数数组对象
 */
Animation.prototype.reset = function (requestID, targetListParam, motionListParam) {
    for (let i=0; i<targetListParam.length; i++) {
        this.initData.targetIndex = i // 当前动画序号
        this._recover(targetListParam[i], motionListParam[i])

        // 恢复初始默认值
        this.initData.fr[i] = 0
        this.initData.loop[i] = 0
        this.initData.taskIndex[i] = 0
        this.initData.endTask[i] = false
        this.initData.endTaskTotal[i] = false
        this.initData.startTarget[i] = false
    }

    this.fr = 0
    this.state = STATE_START
 
    this.stop(requestID).clean().target(targetListParam)

    return this
}

/**
 * 初始化动画目标参数对象
 * @param  targetListParam  动画目标参数数组对象
 * @param  motionListParam  动画目标运动参数数组对象
 */
Animation.prototype._initData = function (targetListParam, motionListParam) {
    let targetIndex = this.initData.targetIndex

    // 动画目标初始参数对象
    if (this.state === STATE_INITIAL) {
        // 设置初始默认值
        this.initData.fr[targetIndex] = 0
        this.initData.loop[targetIndex] = 0
        this.initData.taskIndex[targetIndex] = 0
        this.initData.endTask[targetIndex] = false
        this.initData.endTaskTotal[targetIndex] = false
        this.initData.startTarget[targetIndex] = false

        // 通过深拷贝保存初始数据
        this.initData.targetListParam = JSON.parse(JSON.stringify(targetListParam))
        this.initData.motionListParam = JSON.parse(JSON.stringify(motionListParam))
    }
}

/**
 * 绘制动画
 * @param  targetParam  当前动画目标参数对象
 * @param  motionParam  运动参数默认值
 */
Animation.prototype._draw = function (targetParam, motionParam) {
    let targetIndex = this.initData.targetIndex

    context.beginPath() // 绘制开始

        // 动画类型处理
        if (targetParam.targetType === "arc") {
            context.arc(targetParam.startX, targetParam.startY, targetParam.radius, targetParam.sAngle, targetParam.eAngle, targetParam.counterclockwise)
        } else if (targetParam.targetType === "rect") {
            context.rect(targetParam.startX, targetParam.startY, targetParam.width, targetParam.height)
        } else if (targetParam.targetType === "image") {
            let img = new Image() // 创建一个 Image 对象
            img.src = targetParam.imageUrl // 为 Image 对象指定图片源
            img.onload = function(){ // 等到图片加载进来之后
                this.clean()
                context.drawImage(img, targetParam.startX, targetParam.startY, targetParam.width, targetParam.height) // 五参数的情况，图片大小由后两个参数控制
            }
            return this._track(targetParam, motionParam)
        } else if (targetParam.targetType === "polygon") {
            context.moveTo(targetParam.startX, targetParam.startY)
            for (let i=0; i<targetParam.lineToList.length; i++) {
                let item = targetParam.lineToList[i]
                context.lineTo(item[0], item[1])
            }
            context.closePath()
        } else {
            return this._then("动画类型未设置")
        }

        context.fillStyle = targetParam.fillStyle || this.initData.targetListParam[targetIndex].fillStyle
        context.fill()

        if (!this.initData.endTaskTotal[targetIndex]) {
            this._track(targetParam, motionParam)
        }
}

/**
 * 动画目标轨迹
 * @param  targetParam  当前动画目标参数对象
 * @param  motionParam  运动参数默认值
 */
Animation.prototype._track = function (targetParam, motionParam) {
    let targetIndex = this.initData.targetIndex
    let _motionParam = this.initData.motionListParam[targetIndex]
    let taskIndex = this.initData.taskIndex[targetIndex]
    let task = motionParam.task[taskIndex]
    let _task = _motionParam.task[taskIndex]
    let mx = task.mx || 0
    let my = task.my || 0
    let vx = task.vx || 0
    let vy = task.vy || 0
    let fr = this.initData.fr[targetIndex]

    targetParam.startX += mx + vx * fr
    targetParam.startY += my + vy * fr

    let lineToList = targetParam.lineToList

    // 动画为多边形的处理
    if (targetParam.targetType === "polygon") {
        for (let i=0; i<lineToList.length; i++) {
            let item = lineToList[i]

            item[0] += mx + vx * fr
            item[1] += my + vy * fr
        }
    }

    this._range(targetParam, motionParam)
}

/**
 * 动画运动范围处理
 * @param  targetParam  当前动画目标参数对象
 * @param  motionParam  运动参数默认值
 */
Animation.prototype._range = function (targetParam, motionParam) {
    let targetIndex = this.initData.targetIndex
    let _motionParam = this.initData.motionListParam[targetIndex]
    let taskIndex = this.initData.taskIndex[targetIndex]
    let task = motionParam.task[taskIndex]
    let _task = _motionParam.task[taskIndex]

    this.initData.fr[targetIndex]++

    // 通过设置动画帧数 fr 来控制范围
    if (task.fr !== undefined && this.initData.fr[targetIndex] === task.fr + 1 || this.initData.fr[targetIndex] === 0) {
        // 双向、单向模式处理
        this._direction(targetParam, motionParam)  
    } else if (task.fr == undefined) { // 没设置动画帧数时，默认范围为画布
        this._exceedCanvasRange(targetParam, motionParam)
    }
}

/**
 * 双向、单向模式处理
 * @param  targetParam  当前动画目标参数对象
 * @param  motionParam  动画目标运动参数值
 */
Animation.prototype._direction = function (targetParam, motionParam) {
    let targetIndex = this.initData.targetIndex
    let _targetParam = this.initData.targetListParam[targetIndex]
    let _motionParam = this.initData.motionListParam[targetIndex]
    let taskIndex = this.initData.taskIndex[targetIndex]
    let task = motionParam.task[taskIndex]
    let _task = _motionParam.task[taskIndex]

    if (task.direction === "twoWay") {
        task.mx = -task.mx || 0
        task.my = -task.my || 0

        if (this.initData.fr[targetIndex] === 0) {
            this.initData.fr[targetIndex] = 0
        } else {
            this.initData.fr[targetIndex] = -this.initData.fr[targetIndex] + 1
        }

        this.initData.loop[targetIndex] += 1/2
    } else if (task.direction === undefined || task.direction === "oneWay") {
        this.initData.fr[targetIndex] = 0
        this.initData.loop[targetIndex]++

        if (this.initData.loop[targetIndex] !== task.loop) {
            if (taskIndex === 0) {
                this._recover(targetParam, motionParam)
            } else {
                _task.continuity = motionParam.task[taskIndex - 1].continuity
                if (_task.continuity === undefined || _task.continuity === "start") {
                    this._recover(targetParam, motionParam)
                } else if (_task.continuity === "previous" || _task.continuity === "custom") {
                    if (_targetParam.lastStartX !== undefined && _targetParam.lastStartY !== undefined) {
                        targetParam.startX = _targetParam.lastStartX
                        targetParam.startY = _targetParam.lastStartY

                        if (targetParam.targetType === "polygon") {
                            for (let i=0; i<targetParam.lineToList.length; i++) {
                                targetParam.lineToList[i][0] = _targetParam.lastLineToList[i][0]
                                targetParam.lineToList[i][1] = _targetParam.lastLineToList[i][1]
                            }
                        }
                    } else {
                        this._recover(targetParam, motionParam)
                    }                 
                }
            }
        }
    }

    this._loop(targetParam, motionParam) // 当前任务完成后的重复处理
}

/**
 * 当前任务完成后的重复处理
 * @param  targetParam  当前动画目标参数对象
 * @param  motionParam  当前动画目标运动参数对象
 */
Animation.prototype._loop = function (targetParam, motionParam) {
    let targetIndex = this.initData.targetIndex
    let _targetParam = this.initData.targetListParam[targetIndex]
    let _motionParam = this.initData.motionListParam[targetIndex]
    let taskIndex = this.initData.taskIndex[targetIndex]
    let task = motionParam.task[taskIndex]
    let _task = _motionParam.task[taskIndex]
    let loop = task.loop || motionParam.loop

    if (this.initData.loop[targetIndex] === loop) {
        _task.delay = task.delay || motionParam.delay || 0
        this.initData.loop[targetIndex] = 0
        this.initData.endTask[targetIndex] = true
        this.stop(requestID)

        if (task.continuity === "previous") { // 接着上一任务位置开始
            this._previousTaskEndPoint(targetParam)
        } else if (task.continuity === "custom") { // 不连续，自定义起点位置重新开始
            if (task.sx !== undefined && task.sy !== undefined) {
                // 动画为多边形的处理
                if (targetParam.targetType === "polygon") {
                    let X = task.sx - _targetParam.startX
                    let Y = task.sy - _targetParam.startY
                    for (let i=0; i<targetParam.lineToList.length; i++) {
                        targetParam.lineToList[i][0] = _targetParam.lineToList[i][0] + X
                        targetParam.lineToList[i][1] = _targetParam.lineToList[i][1] + Y                 
                    }
                }

                targetParam.startX = task.sx
                targetParam.startY = task.sy
            } else if (task.sx !== undefined && task.sy === undefined) {
                // 动画为多边形的处理
                if (targetParam.targetType === "polygon") {
                    let X = task.sx - _targetParam.startX
                    for (let i=0; i<targetParam.lineToList.length; i++) {
                        targetParam.lineToList[i][0] = _targetParam.lineToList[i][0] + X
                    }
                }

                targetParam.startX = task.sx
            } else if (task.sx === undefined && task.sy !== undefined) {
                // 动画为多边形的处理
                if (targetParam.targetType === "polygon") {
                    let Y = task.sy - _targetParam.startY
                    for (let i=0; i<targetParam.lineToList.length; i++) {
                        targetParam.lineToList[i][1] = _targetParam.lineToList[i][1] + Y
                    }
                }

                targetParam.startY = task.sy
            }

            this._previousTaskEndPoint(targetParam)
        }

        this.initData.taskIndex[targetIndex]++

        // 全部任务完成
        if (this.initData.taskIndex[targetIndex] === motionParam.task.length) {
            this.initData.taskIndex[targetIndex] = 0     
            this.initData.endTaskTotal[targetIndex] = true
        }
    }
}

/**
 * 超出画布范围处理
 * @param  targetParam  当前动画目标参数对象
 * @param  motionParam  运动参数默认值
 */
Animation.prototype._exceedCanvasRange = function (targetParam, motionParam) {
    let _motionParam = this.initData.motionListParam[this.initData.targetIndex]
    let taskIndex = this.initData.taskIndex[targetIndex]
    let task = motionParam.task[taskIndex]

    // 超出画布范围时反弹
    if (targetParam.targetType == "arc") {
        if (task.direction === undefined || task.direction === "twoWay") {
            let rangeStartX = targetParam.radius
            let rangeEndX = canvas.width - targetParam.radius
            let rangeStartY = targetParam.radius
            let rangeEndY = canvas.width - targetParam.radius

            if (targetParam.startY > rangeEndY || targetParam.startY < rangeStartY || targetParam.startX > rangeEndX || targetParam.startX < rangeStartX) {
                this._direction(targetParam, motionParam)
            }
        } else if (task.direction === "oneWay") {
            let rangeStartX = -targetParam.radius
            let rangeEndX = canvas.width + targetParam.radius
            let rangeStartY = -targetParam.radius
            let rangeEndY = canvas.width + targetParam.radius

            if (targetParam.startY > rangeEndY || targetParam.startY < rangeStartY || targetParam.startX > rangeEndX || targetParam.startX < rangeStartX) {
                this._direction(targetParam, motionParam)
            }
        }
    } else if (targetParam.targetType == "rect" || targetParam.targetType == "image") {
        if (task.direction === undefined || task.direction === "twoWay") {
            let rangeStartX = targetParam.width
            let rangeEndX = canvas.width - targetParam.width
            let rangeStartY = targetParam.height
            let rangeEndY = canvas.width - targetParam.height

            if (targetParam.startY > rangeEndY || targetParam.startY < rangeStartY || targetParam.startX > rangeEndX || targetParam.startX < rangeStartX) {
                this._direction(targetParam, motionParam)
            }
        } else if (task.direction === "oneWay") {
            let rangeStartX = -targetParam.width
            let rangeEndX = canvas.width + targetParam.width
            let rangeStartY = -targetParam.height
            let rangeEndY = canvas.width + targetParam.height

            if (targetParam.startY > rangeEndY || targetParam.startY < rangeStartY || targetParam.startX > rangeEndX || targetParam.startX < rangeStartX) {
                this._direction(targetParam, motionParam)
            }
        }
    }  else if (targetParam.targetType == "polygon") {
        if (task.direction === undefined || task.direction === "twoWay") {
            let rangeStartX = 0
            let rangeEndX = canvas.width
            let rangeStartY = 0
            let rangeEndY = canvas.height

            if (targetParam.startY > rangeEndY || targetParam.startY < rangeStartY || targetParam.startX > rangeEndX || targetParam.startX < rangeStartX) {
                this._direction(targetParam, motionParam)
            }
        } else if (task.direction === "oneWay") {
            let rangeStartX = 0
            let rangeEndX = canvas.width
            let rangeStartY = 0
            let rangeEndY = canvas.height

            if (targetParam.startY > rangeEndY || targetParam.startY < rangeStartY || targetParam.startX > rangeEndX || targetParam.startX < rangeStartX) {
                this._direction(targetParam, motionParam)
            }
        }
    }
}

/**
 * 恢复数据为初始值
 * @param  targetParam  当前动画目标参数对象
 * @param  motionParam  当前动画目标运动参数对象
 */
Animation.prototype._recover = function (targetParam, motionParam) {
    let targetIndex = this.initData.targetIndex
    let _targetParam = this.initData.targetListParam[targetIndex]
    let _motionParam = this.initData.motionListParam[targetIndex]
    let taskIndex = this.initData.taskIndex[targetIndex]
    let task = motionParam.task[taskIndex]
    let _task = _motionParam.task[taskIndex]

    // 恢复动画初始值
    targetParam.startX = _targetParam.startX
    targetParam.startY = _targetParam.startY

    // 动画为多边形的处理
    if (targetParam.targetType === "polygon") {
        for (let i=0; i<targetParam.lineToList.length; i++) {
            targetParam.lineToList[i][0] = _targetParam.lineToList[i][0]
            targetParam.lineToList[i][1] = _targetParam.lineToList[i][1]
        }
    }

    // 双向模式时，重置动画时保证移动方向为初始值(即返回没完成时重置动画)
    if (!Number.isInteger(this.initData.loop[targetIndex])) {
        task.mx = _task.mx
        task.my = _task.my
    }
}

/**
 * 保存上一任务结束点位置
 * @param  targetParam  当前动画目标参数对象
 */
Animation.prototype._previousTaskEndPoint = function (targetParam) {
    let _targetParam = this.initData.targetListParam[this.initData.targetIndex]

    _targetParam.lastStartX = targetParam.startX
    _targetParam.lastStartY = targetParam.startY

    // 动画为多边形的处理
    if (targetParam.targetType === "polygon") {
        for (let i=0; i<targetParam.lineToList.length; i++) {
            let item = targetParam.lineToList[i]
            _targetParam.lastLineToList[i] = [item[0], item[1]]                 
        }
    }
}

/**
 * 通过回调函数打印未设置的内容
 * @param  tips  未设置的内容
 */
Animation.prototype._then = function (tips) {
    console.log(tips)
}