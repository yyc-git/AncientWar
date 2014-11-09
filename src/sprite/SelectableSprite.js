/**古代战争
 * 作者：YYC
 * 日期：2014-02-12
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var SelectableSprite = YYC.AClass(Sprite, {
    Init: function (data) {
        this.base(data);
    },
    Protected: {
        P_drawDiamondBox: function (x, y) {
            this.getGraphics().drawDiamondBox(mapLayer.getSelectionBorderColor(), 1, [x, y],
                window.mapLayer.getLeftHalfAngle(),
                this.baseSize);
        },

        Abstract: {
            P_createSelectRange: function (x, y) {
            }
        }
    },
    Private: {
        __beforeDraw: function (context) {
            if (this.selected) {
                this.drawSelection(context);
            }
        }
    },
    Public: {
        selected: false,
        selectRange: [],

        draw: function (context) {
            this.base(context);
        },
        clearInfo: function () {
            ui.clearInfo();
        },
        onEnter: function () {
            this.base();
            this.selectRange = this.P_createSelectRange(this.getPositionX(), this.getPositionY());
        },
        onBeforeDraw: function (context) {
            this.__beforeDraw(context);
        },
        onStartLoop: function () {
            this.base();

            this.drawingX = this.getPositionX() - this.getOffsetX();
            this.drawingY = this.getPositionY() - this.getOffsetY();
        }
    },
    Abstract: {
        drawSelection: function (context) {
        },
        showInfo: function () {
        }
    }
});