/**古代战争
 * 作者：YYC
 * 日期：2014-02-11
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var BaseSprite = YYC.Class(BuildingSprite, {
    Init: function (data) {
        this.base(data);
    },
    Private: {
    },
    Protected: {
        P_createSelectRange: function (x, y) {
            var mapLayer = window.mapLayer;

            var leftHalfAngle = mapLayer.getLeftHalfAngle();

            var p1 = [x, y],
                p2 = [x ,
                    y - this.height * 0.2
                ] ,
                p3 = [x +this.width*0.35,
                    y - this.height * 0.38
                ] ,
                p4 = [x +this.width*0.35,
                    y - this.height * 0.75
                ] ,
                p5 = [x +this.width*0.8,
                    y - this.height * 0.75
                ],
                p6 = [x +this.width*0.8,
                    y - this.height * 0.35
                ],
                p7 = [x +this.width,
                    y - this.height * 0.25
                ],
                p8 = [x + this.width,
                    y
                ],
                p9 = [x + this.baseSize * Math.cos(leftHalfAngle),
                    y + this.baseSize * Math.sin(leftHalfAngle)
                ];

            return [p1, p2, p3, p4, p5, p6, p7, p8, p9];
        },
        P___showMoreInfo: function () {
            if (this.isNormalState() || this.isProduceState()) {
                ui.show("basePanel");
            }
        }
    },
    Public: {
        name: "base"
    }
});


