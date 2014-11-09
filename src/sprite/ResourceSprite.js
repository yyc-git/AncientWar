/**古代战争
 * 作者：YYC
 * 日期：2014-02-12
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var ResourceSprite = YYC.Class(SelectableSprite, {
    Init: function (data) {
        this.base(data);

        this.P_createAndSetDisplayTarget("resource_json", "resource_image", this.name, this.pixelOffsetX, this.pixelOffsetY);
    },
    Protected: {
        P_createSelectRange: function (x, y) {
            var mapLayer = window.mapLayer;
            var leftHalfAngle = mapLayer.getLeftHalfAngle();
            var width = this.selectRangeWidth;
            var height = this.selectRangeHeight;

            var p1 = [x, y],
                p2 = [ x, y - height ] ,
                p3 = [x + width,
                    y - height
                ] ,
                p4 = [x + width, y ],
                p5 = [x + this.baseSize * Math.cos(leftHalfAngle),
                    y + this.baseSize * Math.sin(leftHalfAngle)
                ];

            return [p1, p2, p3, p4, p5];
        }
    },
    Public: {
        isExplore:false,

        drawSelection: function (context) {
            this.P_drawDiamondBox(this.drawingX, this.drawingY);
        },
        showInfo: function () {
            if (!this.selected) {
                return;
            }
            ui.clearInfo();
            ui.showSpriteInfo(this.name + "总数：" + Math.round(this.total));
        }
    }
});