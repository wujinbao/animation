# wjb 动画库

## 前言

开发的一套动画库，可以直接引用该动画库去实现一些动画效果。

### 使用说明

#### 1. 引用 wjb 动画库

    <script src="https://cdn.jsdelivr.net/gh/wujinbao/animation@v1.2/demo/animationItem.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/wujinbao/animation@v1.2/demo/animationManager.js"></script>
    
#### 2. wjb 动画库的基本方法

- #### 2.1 add 方法

add 方法是添加动画。参数 animationParam  动画的所有数组对象数据，如 [animationObj1, animationObj2, animationObj3]，对象属性结构如下：

- name 动画名称
- targetType 动画类型，属性值分别有 "arc"、"rect"、"image"
- fillStyle 动画填充的颜色
- fr 动画开始帧数，默认帧数为 0 开始
- loop 动画重复次数，默认动画重复无限次
- animationData 绘制动画所需的数据对象
- task 动画运动的轨迹、速度、方向等任务数组对象

##### 动画目标类型 animationType 设置为圆弧 "arc" 时；animationData 对象的属性如下表：

属性 | 描述说明
:---: | :---:
startX | 圆的中心的 x 坐标
startY | 圆的中心的 y 坐标
radius | 圆的半径
sAngle | 起始角，以弧度计
eAngle | 结束角，以弧度计
counterclockwise | 逆时针还是顺时针绘图。False = 顺时针，true = 逆时针

##### 动画目标类型 animationType 设置为矩形 "rect" 时；animationData 对象的属性如下表：

属性 | 描述说明
:---: | :---:
startX | 矩形左上角的 x 坐标
startY | 矩形左上角的 y 坐标
width | 矩形的宽度
height | 矩形的高度

##### 动画目标类型 animationType 设置为图片 "image" 时；animationData 对象的属性如下表：

属性 | 描述说明
:---: | :---:
imageUrl | 图片路径
startX | 在画布上放置图像的 x 坐标位置
startY | 在画布上放置图像的 y 坐标位置
width | 图片的宽度
height | 图片的高度

##### 动画任务 task 数组对象的属性如下表：

属性 | 描述说明
:---: | :---:
mx、my | 分别是动画横向、纵向移动距离（即初始速度）
vx、vy | 分别是动画横向、纵向加减速度（加速度为正数，减速度为负数），减速度时需注意设置的减速度不能大于初始速度（如 mx 必须大于 vx * fr；my 必须大于 vy * fr）
fr | 当前动画结束帧数（即运动时间，每帧为 1000/60 ms）
loop | 当前动画任务重复次数
direction | 方向模式，默认值为 "oneWay" 是单向模式；"twoWay" 是双向模式
continuity | 下一任务连接的开始方式。分为起点开始 "start"；自定义起点开始 "custom"；上一任务结束点开始 "previous"。（前两个也就是不连续,最后一个任务可以不用设置）
sx、sy | 分别是下一任务不连续时，自定义动画起点坐标（即 continuity 为 "custom" 时设置才起作用）

#### 语法格式

    wjb.add(animationParam)
    
- #### 2.2 loadAnimation 方法

loadAnimation 方法是加载动画。参数 name 动画名称，加载多个时，直接传数组即可。如 [name1, name2], 若没传参数时默认为全部加载。

#### 语法格式

    wjb.start(name)

- #### 2.3 start 方法

start 方法是动画开始。参数 name 动画名称，开始多个时，直接传数组即可。如 [name1, name2], 若没传参数时默认为全部开始。

#### 语法格式

    wjb.start(name)
    
- #### 2.4 stop 方法

stop 方法是动画暂停。参数 name 动画名称，暂停多个时，直接传数组即可。如 [name1, name2], 若没传参数时默认为全部暂停。

#### 语法格式

    wjb.stop(name)
    
- #### 2.5 reset 方法

reset 方法是动画重置。参数 name 动画名称，重置多个时，直接传数组即可。如 [name1, name2], 若没传参数时默认为全部重置。

#### 语法格式

    wjb.reset(name)
    
- #### 2.6 remove 方法

remove 方法是动画删除。参数 name 动画名称，删除多个时，直接传数组即可。如 [name1, name2], 若没传参数时默认为全部删除。

#### 语法格式

    wjb.remove(name)
    
#### 4. wjb 动画库实例演示

#### 实例

    <!DOCTYPE html>
    <html lang="zh">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <title>wjb - 动画库示例演示</title>
        </head>

        <body>
            <canvas id="canvas"></canvas>
            <button onclick="start()">开始</button>
            <button onclick="stop()">暂停</button>
            <button onclick="reset()">重播/重置</button>
            <button onclick="remove()">删除</button>

            <!-- 引用 wjb 动画库 -->
            <script src="https://cdn.jsdelivr.net/gh/wujinbao/animation@v1.1/demo/animationItem.js"></script>
            <script src="https://cdn.jsdelivr.net/gh/wujinbao/animation@v1.1/demo/animationManager.js"></script>
        </body>

        <script>
            let canvas = document.getElementById("canvas")
            let context = canvas.getContext("2d")
            canvas.width = 800 // 画布宽度
            canvas.height = 400 // 画布高度
        
            let rgba = "rgba(255, 255, 255, 0.3)" // 透明度设置，即拖尾效果程度

            let animationParam = [
        	    { // 动画对象为圆形
                    name: "one",
                    animationData: {
                        startX: 100,
                        startY: 50,
                        radius: 25,
                        sAngle: 0,
                        eAngle: 2 * Math.PI,
                        counterclockwise: false,
                    },
                    animationType: "arc", // 动画类型
                    fillStyle: "red", // 填充颜色
                    task: [
                        {mx: 2, my: 6, vx: 0.01, vy: -0.06, fr: 200, loop: 1, direction: "twoWay"},
                        {mx: 8, my: 1, vx: -0.1, vy: 0.01, fr: 160, loop: 2, direction: "oneWay", continuity: "custom", sx: 700, sy: 50},
                        {mx: -8, my: 0, vx: -0.2, fr: 40, loop: 2, direction: "oneWay", continuity: "previous"},
                        {mx: 0, my: 5, vy: 0.1, fr: 40, loop: 2, direction: "oneWay", continuity: "previous"},
                        {mx: 7, my: -5, fr: 60, direction: "oneWay", continuity: "previous"}
                    ],
                    loop: 3
        	    },
                { // 动画对象为矩形
                    name: "two",
                    animationData: {
                        startX: 250,
                        startY: 50,
                        width: 50,
                        height: 30,
                    },
                    animationType: "rect", // 动画类型
                    fillStyle: "blue", // 填充颜色
                    task: [
                        {mx: 8, my: 1, vx: -0.1, vy: 0.01, fr: 120, loop: 2, direction: "oneWay"},
                    ],
                    fr: 60,
                    loop: 3,
                },
                { // 动画对象为矩形
                    name: "three",
                    animationData: {
                        startX: 400,
                        startY: 50,
                        width: 50,
                        height: 30,
                    },
                    animationType: "rect", // 动画类型
                    fillStyle: "yellow", // 填充颜色
                    task: [
                        {mx: 8, my: 1, vx: -0.1, vy: 0.01, fr: 120, loop: 2},
                    ],
                    fr: 100,
                    loop: 2
                }
            ]

            // 可以直接采用链式也可以实现动画的添加与加载 wjb.add(animationParam).loadAnimation().start(["one", "three"])

            // 添加动画
            wjb.add(animationParam)
        
            // 加载动画
            wjb.loadAnimation()

            function start() {
                wjb.start()
            } 

            function stop() {
                wjb.stop(["one", "two"])
            }

            function reset() {
                wjb.reset()
            } 

            function remove() {
                wjb.remove(["one", "three"])
            } 
        </script>
    </html>
    
### 小结

wjx 动画库之后有其他动画效果的更新可随时关注下面 git 网址链接：

[animation 动画库 git 链接：https://github.com/wujinbao/animation](https://github.com/wujinbao/animation)

