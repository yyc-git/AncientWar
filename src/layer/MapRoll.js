/**古代战争
 * 作者：YYC
 * 日期：2014-02-03
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var MapRoll = YYC.Class({
    Init: function (canvasWidth, canvasHeight, mapBufferCanvasData) {
        this._canvasWidth = canvasWidth;
        this._canvasHeight = canvasHeight;
        this._wholeMapWidth = mapBufferCanvasData.width;
        this._wholeMapHeight = mapBufferCanvasData.height;
    },
    Private: {
        _panningThreshold: 10,
        _panningSpeed: 5,


        //视口中心坐标
        _viewPointX: 0,
        _viewPointY: 0,
        _insideCanvas: false,

        _pixOffsetX: 0,
        _pixOffsetY: 0,

        //整个地图的大小
        //包括了地图的上下左右四个角与画布边缘的空白距离
        _wholeMapWidth: 0,
        _wholeMapHeight: 0,

        _halfHeight: 0,
        _halfWidth: 0,

        //左角的一半的三角函数
        _tan1: 0,

        //每次循环x/y方向的滚动值，用于边缘滚动
        _panningSpeedY: 0,
        _panningSpeedX: 0,

        _canvasWidth: 0,
        _canvasHeight: 0,
        _gameAreaWidth: 0,
        _gameAreaHeight: 0,

        _setGameAreaSize: function () {
            var size = ui.getGameAreaSize();

            this._gameAreaWidth = size.width;
            this._gameAreaHeight = size.height;
        },
        _calculateGameCoordinates: function (x, y) {
            this.gameX = x + this.offsetX;
            this.gameY = y + this.offsetY;
        },
        _isRollLeft: function () {
            return this.x <= this._panningThreshold;
        },
        _isRollRight: function () {
            return this.x >= this._gameAreaWidth - this._panningThreshold;
        },
        _isRollUp: function () {
            return this.y <= this._panningThreshold;
        },
        _isRollDown: function () {
            return this.y >= this._gameAreaHeight - this._panningThreshold;
        },
        //此处判断的下限设为this.panningSpeed而不是设为0。
        //这是因为本次判断后，会继续往左移动一次（最大移动panningSpeed）。
        //如果此处设为0，则本次移动后，offsetX会为负值，需要在下次循环中，将offsetX重设为0，这样会导致画面抖动！
        _notLeftEnd: function () {
            return this.offsetX >= this._panningSpeed;
        },
        _notRightEnd: function () {
            return this.offsetX + this._canvasWidth + this._panningSpeed <= this._wholeMapWidth;
        },
        _notUpEnd: function () {
            return this.offsetY >= this._panningSpeed;
        },
        _notDownEnd: function () {
            return this.offsetY + this._canvasHeight + this._panningSpeed <= this._wholeMapHeight;
        },
        //位于地图右半边
        _isInRight: function () {
            return this._viewPointX > this._wholeMapWidth / 2;
        },
        _isInLeft: function () {
            return this._viewPointX < this._wholeMapWidth / 2;
        },
        _isInDown: function () {
            return this._viewPointY > this._wholeMapHeight / 2;
        },
        _isInUp: function () {
            return this._viewPointY < this._wholeMapHeight / 2;
        },
        //视口位于地图左上的边缘
        //与上角的tan1进行比较
        _isInLeftUpEdge: function () {
            return this._viewPointX <= this._halfWidth && this._viewPointY <= this._halfHeight
                && (this._viewPointY - this._pixOffsetY) / (this._wholeMapWidth / 2 - this._viewPointX) <= this._tan1;
        },
        //视口位于地图左下的边缘
        //与下角的tan1进行比较
        _isInLeftDownEdge: function () {
            return this._viewPointX <= this._halfWidth && this._viewPointY > this._halfHeight
                && (this._wholeMapHeight - this._pixOffsetX - this._viewPointY) / (this._wholeMapWidth / 2 - this._viewPointX) <= this._tan1;
        },
        //视口位于地图右上的边缘
        //与上角的tan1比较
        _isInRightUpEdge: function () {
            return this._viewPointX > this._halfWidth && this._viewPointY <= this._halfHeight
                && (this._viewPointY - this._pixOffsetY) / (this._viewPointX - this._wholeMapWidth / 2) <= this._tan1;
        },
        //视口位于地图右下的边缘
        //与下角的tan1比较
        _isInRightDownEdge: function () {
            return this._viewPointX > this._halfWidth && this._viewPointY > this._halfHeight
                && (this._wholeMapHeight - this._pixOffsetY - this._viewPointY) / (this._viewPointX - this._wholeMapWidth / 2) <= this._tan1;
        }
    },
    Public: {
        // 地图滚动补偿的坐标
        offsetX: 0,
        offsetY: 0,

        // 相对于地图左上角的鼠标坐标
        gameX: 0,
        gameY: 0,

        // 鼠标坐标（相对于画布左上角）
        x: 0,
        y: 0,

        onmousemove: function (e) {
            var pixPos = null,
                targetId = e.target.id;

            pixPos = tool.computeRelativeMousePixPos(e, "gameArea");

            this.x = pixPos[0];
            this.y = pixPos[1];

            if (targetId === "effectLayerCanvas") {
                pixPos = tool.computeRelativeMousePixPos(e);

                this._calculateGameCoordinates(pixPos[0], pixPos[1]);
            }
        },
        init: function () {
            var cos1 = 0,
                sin1 = 0;

            this._setGameAreaSize();

            this._pixOffsetX = config.map.pixOffsetX;
            this._pixOffsetY = config.map.pixOffsetY;
            this._halfHeight = this._wholeMapHeight / 2;
            this._halfWidth = this._wholeMapWidth / 2;
            this._tan1 = this._wholeMapHeight / this._wholeMapWidth;

            cos1 = this._halfWidth /
                Math.sqrt(this._halfHeight * this._halfHeight + this._halfWidth * this._halfWidth);
            sin1 = this._halfHeight /
                Math.sqrt(this._halfHeight * this._halfHeight + this._halfWidth * this._halfWidth);

            this._panningSpeedY = this._panningSpeed * sin1;
            this._panningSpeedX = this._panningSpeed * cos1;
        },
        handleRoll: function () {
            var refreshBackground = false;

            this._viewPointX = this.offsetX + this._canvasWidth / 2;
            this._viewPointY = this.offsetY + this._canvasHeight / 2;


            if (this._isRollLeft()) {
                if (this._notLeftEnd()) {
                    if (this._isInRight()) {
                        refreshBackground = true;
                        this.offsetX -= this._panningSpeed;
                    }
                    else {
                        if (this._isInLeftUpEdge()) {
                            this.offsetX -= this._panningSpeedX;
                            this.offsetY += this._panningSpeedY;

                            return "update";
                        }

                        if (this._isInLeftDownEdge()) {
                            this.offsetX -= this._panningSpeedX;
                            this.offsetY -= this._panningSpeedY;

                            return "update";
                        }
                        //视口位于地图内部
                        refreshBackground = true;
                        this.offsetX -= this._panningSpeed;
                    }
                }
            }
            if (this._isRollRight()) {
                if (this._notRightEnd()) {
                    if (this._isInLeft()) {
                        refreshBackground = true;
                        this.offsetX += this._panningSpeed;
                    }
                    else {
                        if (this._isInRightUpEdge()) {
                            this.offsetX += this._panningSpeedX;
                            this.offsetY += this._panningSpeedY;

                            return "update";
                        }
                        else if (this._isInRightDownEdge()) {
                            this.offsetX += this._panningSpeedX;
                            this.offsetY -= this._panningSpeedY;

                            return "update";
                        }
                        //视口位于地图内部
                        else {
                            refreshBackground = true;
                            this.offsetX += this._panningSpeed;
                        }
                    }
                }
            }
            if (this._isRollUp()) {
                if (this._notUpEnd()) {
                    if (this._isInDown()) {
                        refreshBackground = true;
                        this.offsetY -= this._panningSpeed;
                    }
                    else {
                        if (this._isInLeftUpEdge()) {
                            this.offsetX += this._panningSpeedX;
                            this.offsetY -= this._panningSpeedY;

                            return "update";
                        }
                        if (this._isInRightUpEdge()) {
                            this.offsetX -= this._panningSpeedX;
                            this.offsetY -= this._panningSpeedY;

                            return "update";
                        }
                        //视口位于地图内部
                        refreshBackground = true;
                        this.offsetY -= this._panningSpeed;
                    }

                }
            }
            if (this._isRollDown()) {
                if (this._notDownEnd()) {
                    if (this._isInUp()) {
                        refreshBackground = true;
                        this.offsetY += this._panningSpeed;
                    }
                    else {
                        if (this._isInLeftDownEdge()) {
                            this.offsetX += this._panningSpeedX;
                            this.offsetY += this._panningSpeedY;

                            return "update";
                        }
                        else if (this._isInRightDownEdge()) {
                            this.offsetX -= this._panningSpeedX;
                            this.offsetY += this._panningSpeedY;

                            return "update";
                        }
                        //视口位于地图内部
                        refreshBackground = true;
                        this.offsetY += this._panningSpeed;
                    }
                }
            }

            if (refreshBackground) {
                return "update";
            }

            return "not roll";
        }
    }
});