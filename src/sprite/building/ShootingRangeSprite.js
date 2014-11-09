/**古代战争
 * 作者：YYC
 * 日期：2014-02-04
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var ShootingRangeSprite = YYC.Class(BuildingSprite, {
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
                p2 = [x + this.baseSize * 0.5 * Math.cos(leftHalfAngle),
                    y - this.baseSize * 0.5 * Math.sin(leftHalfAngle)
                ] ,
                p3 = [x + this.baseSize * 0.5 * Math.cos(leftHalfAngle),
                    y - this.height * 0.3
                ] ,
                p4 = [x + this.baseSize * 0.5 * Math.cos(leftHalfAngle) + this.width * 0.15,
                    y - this.height * 0.7
                ] ,
                p5 = [x + this.baseSize * 0.5 * Math.cos(leftHalfAngle) + this.width * 0.4,
                    y - this.height * 0.7
                ],
                p6 = [x + this.baseSize * 0.5 * Math.cos(leftHalfAngle) + this.width * 0.4,
                    y - this.height * 0.5
                ],
                p7 = [x + this.baseSize * 0.5 * Math.cos(leftHalfAngle) + this.width * 0.6,
                    y - this.height * 0.4
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
                ui.show("shootingRangePanel");
            }
        }
    },
    Public: {
        name: "shootingRange"
    }
});


