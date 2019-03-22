<template>
  <div class="wraper" ref="wraper">
    <div class="canvas-wraper">
      <canvas id="canvas"></canvas>
    </div>
    <div class="controlPanel">
      <div :class="[initIdx==idx ? 'contro-item active' : 'contro-item']" v-for="(item,idx) in toolsArr" :key="idx" 
          @click="handleTools(item, idx)">
        <i :class="'iconfont' + item.icon"></i>
      </div>
    </div>
  </div>
</template>
<script>
  import { fabric } from 'fabric'
  export default{
    data() {
      return{
        currentTool: '',
        canvasObj: null,
        initIdx: 0,
        toolsArr: [
          {
            name: 'pencil',
            icon: ' icon-pencil'
          },
          {
            name: 'line',
            icon: ' icon-line'
          },
          {
            name: 'arrow',
            icon: ' icon-arrow'
          },
          {
            name: 'xuxian',
            icon: ' icon-xuxian'
          },
          {
            name: 'text',
            icon: ' icon-ziti'
          },
          {
            name: 'juxing',
            icon: ' icon-juxing'
          },
          {
            name: 'cricle',
            icon: ' icon-yuanxing'
          },
          {
            name: 'ellipse',
            icon: ' icon-tuoyuanxing'
          },
          {
            name: 'equilateral', //三角形
            icon: ' icon-sanjiaoxing'
          },
          {
            name: 'remove',
            icon: ' icon-remove'
          },
          {
            name: 'undo',
            icon: ' icon-huitui'
          },
          {
            name: 'redo',
            icon: ' icon-xiangqian'
          },
          {
            name: 'reset',
            icon: ' icon-reset'
          },
        ],
        mouseFrom:{},
        mouseTo:{},
        moveCount: 1,
        doDrawing: false,
        redo: [],
        controlFlag: false,
        drawingObject: null, //绘制对象
        drawColor: '#E34F51',
        drawWidth: 2,
        zoom: window.zoom ? window.zoom : 1
      }
    },
    created() {
      this.$store.commit('TOOGLE_TOOLS', 'pencil')
    },
    mounted() {
      //初始化canvas 
      setTimeout( ()=>{
        this.initCanvas()
      },16)
    },
    computed:{
      canvasHeight(){
        return window.innerHeight - 62
      },
      canvasWidth() {
        return window.innerWidth - 100
      }
    },
    methods:{
      initCanvas() {
        let _this = this
        this.canvasObj = new fabric.Canvas('canvas',{
          isDrawingMode: true,
          selectable: false,
          selection: false
        })
        this.canvasObj.freeDrawingBrush.color = '#E34F51'
        this.canvasObj.freeDrawingBrush.width = 2
        this.canvasObj.setWidth(this.canvasWidth)
        this.canvasObj.setHeight(this.canvasHeight)
        //绑定画板事件
        this.canvasObj.on({
          'mouse:down': (o)=> {
            this.mouseFrom.x = o.e.offsetX;
            this.mouseFrom.y = o.e.offsetY;
            this.doDrawing = true;
          },
          'mouse:up': (o)=> {
            this.mouseTo.x = o.e.offsetX;
            this.mouseTo.y = o.e.offsetY;
            this.drawingObject = null;
            this.moveCount = 1;
            this.doDrawing = false;
          },
          'mouse:move': (o)=> {
            if (_this.moveCount % 2 && !_this.doDrawing) {
              //减少绘制频率
              return;
            }
            this.moveCount++;
            this.mouseTo.x = o.e.offsetX;
            this.mouseTo.y = o.e.offsetY;
            this.drawing();
          },
          'object:moving': (e)=> {
            e.target.opacity = 0.5;
          },
          'object:added': (e)=>{
            let object = e.target;
            if(!this.controlFlag) {
              this.redo = []
            }
            this.controlFlag = false
          },
          'object:modified':(e)=> {
            e.target.opacity = 1;
            let object = e.target;
          },
        });
      },
      transformMouse(mouseX, mouseY) {
        return { x: mouseX / this.zoom, y: mouseY / this.zoom };
      },
      resetObj() {
        this.canvasObj.isDrawingMode = false
        this.canvasObj.selectable = false
        this.canvasObj.selection = false
        this.canvasObj.skipTargetFind = true
      },
      handleTools(tools, idx) {
        this.initIdx = idx;
        this.$store.commit('TOOGLE_TOOLS', tools.name)
        if(tools.name != 'reset') {
          this.drawing()
        } else if(tools.name === 'reset'){
          this.canvasObj.clear()
        }
      },
      drawing() {
        let _this = this;
        if(this.drawingObject) {
          this.canvasObj.remove(this.drawingObject)
        }
        let canvasObject = null
        switch (this.currentTool) {
          case 'pencil':
            this.canvasObj.isDrawingMode = true
            break;
          case 'line':
            this.resetObj()
            canvasObject = new fabric.Line([this.mouseFrom.x,this.mouseFrom.y,this.mouseTo.x,this.mouseTo.y],{
              stroke: this.drawColor,
              strokeWidth: this.drawWidth
            }) 
            break;
          case 'arrow':
            this.resetObj()
            canvasObject = new fabric.Path(this.drawArrow(this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x, this.mouseTo.y, 17.5, 17.5), {
              stroke: this.drawColor,
              fill: "rgba(255,255,255,0)",
              strokeWidth: this.drawWidth
            });
            break;
          case 'xuxian': //doshed line
            this.resetObj()
            canvasObject = new fabric.Line([this.mouseFrom.x, this.mouseFrom.y, this.mouseTo.x, this.mouseTo.y],{
              strokeDashArray: [10, 3],
              stroke: this.drawColor,
              strokeWidth: this.drawWidth
            })
            break;
          case 'juxing': //矩形
            this.resetObj()
            let path =  "M " +
              this.mouseFrom.x +
              " " +
              this.mouseFrom.y +
              " L " +
              this.mouseTo.x +
              " " +
              this.mouseFrom.y +
              " L " +
              this.mouseTo.x +
              " " +
              this.mouseTo.y +
              " L " +
              this.mouseFrom.x +
              " " +
              this.mouseTo.y +
              " L " +
              this.mouseFrom.x +
              " " +
              this.mouseFrom.y +
              " z";
            canvasObject = new fabric.Path(path, {
              left: this.mouseFrom.x,
              top: this.mouseFrom.y,
              stroke: this.drawColor,
              strokeWidth: this.drawWidth,
              fill: "rgba(255, 255, 255, 0)"
            });
            break;
          case "cricle": //正圆
            this.resetObj()
            let radius = Math.sqrt((this.mouseTo.x - this.mouseFrom.x) * (this.mouseTo.x - this.mouseFrom.x) + (this.mouseTo.y - this.mouseFrom.y) * (this.mouseTo.y - this.mouseFrom.y)) / 2;
            canvasObject = new fabric.Circle({
              left: this.mouseFrom.x,
              top: this.mouseFrom.y,
              stroke: this.drawColor,
              fill: "rgba(255, 255, 255, 0)",
              radius: radius,
              strokeWidth: this.drawWidth
            });
            break;
          case "ellipse": //椭圆
            this.resetObj()
            let left = this.mouseFrom.x;
            let top = this.mouseFrom.y;
            let ellipse = Math.sqrt((this.mouseTo.x - left) * (this.mouseTo.x - left) + (this.mouseTo.y - top) * (this.mouseTo.y - top)) / 2;
            canvasObject = new fabric.Ellipse({
              left: left,
              top: top,
              stroke: this.drawColor,
              fill: "rgba(255, 255, 255, 0)",
              originX: "center",
              originY: "center",
              rx: Math.abs(left - this.mouseTo.x),
              ry: Math.abs(top - this.mouseTo.y),
              strokeWidth: this.drawWidth
            });
            break;
          case "equilateral": //等边三角形
            this.resetObj()
            let height = this.mouseTo.y - this.mouseFrom.y;
            canvasObject = new fabric.Triangle({
              top: this.mouseFrom.y,
              left: this.mouseFrom.x,
              width: Math.sqrt(Math.pow(height, 2) + Math.pow(height / 2.0, 2)),
              height: height,
              stroke: this.drawColor,
              strokeWidth: this.drawWidth,
              fill: "rgba(255,255,255,0)"
            });
            break;
          case "text":
            this.resetObj()
            let textbox = new fabric.Textbox("", {
              left: this.mouseFrom.x,
              top: this.mouseFrom.y,
              width: 150,
              fontSize: 18,
              borderColor: "#2c2c2c",
              fill: this.drawColor,
              hasControls: false
            });
            this.canvasObj.add(textbox);
            textbox.enterEditing();
            // textbox.hiddenTextarea.focus();
            break; 
          case 'remove':
            this.canvasObj.skipTargetFind = false
            this.canvasObj.selectable = true
            this.canvasObj.selection = true
            break;
          case 'redo':
            if(this.redo.length > 0) {
              this.controlFlag = true
              this.canvasObj.add(this.redo.pop())
              this.canvasObj.renderAll()
            }
            break;
          case 'undo': 
            if(this.canvasObj._objects.length >0) {
              this.redo.push(this.canvasObj._objects.pop())
              this.canvasObj.renderAll()
            } 
            break;
          default:
            // statements_def'
            break;
        }
        if(canvasObject) {
          this.canvasObj.add(canvasObject)
          this.drawingObject = canvasObject;
        }
      }, 
      //书写箭头的方法
      drawArrow(fromX, fromY, toX, toY, theta, headlen) {
        theta = typeof theta != "undefined" ? theta : 30;
        headlen = typeof theta != "undefined" ? headlen : 10;
        // 计算各角度和对应的P2,P3坐标
        let angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
          angle1 = (angle + theta) * Math.PI / 180,
          angle2 = (angle - theta) * Math.PI / 180,
          topX = headlen * Math.cos(angle1),
          topY = headlen * Math.sin(angle1),
          botX = headlen * Math.cos(angle2),
          botY = headlen * Math.sin(angle2);
        let arrowX = fromX - topX,
          arrowY = fromY - topY;
        let path = " M " + fromX + " " + fromY;
        path += " L " + toX + " " + toY;
        arrowX = toX + topX;
        arrowY = toY + topY;
        path += " M " + arrowX + " " + arrowY;
        path += " L " + toX + " " + toY;
        arrowX = toX + botX;
        arrowY = toY + botY;
        path += " L " + arrowX + " " + arrowY;
        return path;
      }
    },
    watch:{
      '$store.state.drawType': function() {
        this.currentTool = this.$store.state.drawType
      }
    }
  }
</script>

<style scrped lang="scss">
  .wraper{
    position: relative;
    width: 100%;
    height: 100%;
    margin: 0 auto;
    .canvas-wraper{
      height: calc(100% - 60px);
      width: 100%;
      background: url(../assets/001.jpg) repeat;
      overflow: hidden;
    }
    .controlPanel{
      position: absolute;
      left: 0;
      bottom: 20px;
      width: 100%;
      height: 62px;
      background: #ddd;
      display: flex;
      justify-content: center;
      align-items: center;    
      .contro-item{
        flex-basis: 100px;
        border-right: 1px solid #dad7d9;
        text-align: center;
        cursor: pointer;
        background: #fefefe;
        i{
          font-size: 38px;
          line-height: 62px;
        }
        &.active{
          background: #e34f51;
          color: #fff;
          border-radius: 3px;
          i{
            font-size: 42px;
          }
        }
      }
    }
  }

</style>