/**古代战争
 * 作者：YYC
 * 日期：2014-02-02
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var config = {
    version: "0.2.0",
    authorInfo: "<p>作者：YYC</p>"
        + "<p>邮箱：395976266@qq.com</p>"
        + "<p>博客：<a style='color:white;' href='http://www.cnblogs.com/chaogex/' target='_blank'>码农终结者</a></p>"
        + "<p>GitHub:<a style='color:white;' href='https://github.com/yyc-git/AncientWar' target='_blank'>AncientWar</a></p>"
        + "<p>引擎:<a style='color:white;' href='https://github.com/yyc-git/YEngine2D' target='_blank'>YEngine2D</a></p>",
    bowerSupport:"<br/><p>浏览器支持：Chrome, Firefox</p>",
    versionHistory: "<br/><p>版本历史：</p><dl style='margin-top:0px;'><dt>v0.1</dt><dd>发布第1版</dd>"
        + "<dt>v0.2</dt><dd>修复bug</dd><dd>优化寻路</dd>"
        + "</dl>",

    returnFlag: "returnFlag",

    map: {
        //*大地图

        //方格大小
        gridWidth: 60,
        gridHeight: 30,
        //地图大小
        mapGridWidth: 90,
        mapGridHeight: 90,
        /**
         * 地图四个角距离画布的距离
         * @type {number}
         */
        pixOffsetX: 300,
        pixOffsetY: 300,

        //*小地图

        scale: 18,   //地图缩放比例
        smallGridWidth: 3.3,
        smallGridHeight: 1.6,
        smallPixOffsetX: 16,
        smallPixOffsetY: 16
    },
    spriteConfig: {
        building: {
            buildFrameData: {
                singleGrid: {
                    pixelOffsetX: 0,
                    pixelOffsetY: 20,
                    width: 60,
                    height: 35
                },
                middle: {
                    pixelOffsetX: 0,
                    pixelOffsetY: 40,
                    width: 120,
                    height: 70
                },
                large: {
                    pixelOffsetX: 0,
                    pixelOffsetY: 60,
                    width: 170,
                    height: 105
                }
            },
            ruinFrameData: {
                singleGrid: {
                    pixelOffsetX: 0,
                    pixelOffsetY: 18,
                    width: 60,
                    height: 35
                },
                middle: {
                    pixelOffsetX: 0,
                    pixelOffsetY: 30,
                    width: 120,
                    height: 65
                },
                large: {
                    pixelOffsetX: -10,
                    pixelOffsetY: 45,
                    width: 170,
                    height: 85
                }
            }
        },
        base: {
            cName: "基地",
            width: 170,
            height: 135,
            baseSize: 100,

            pixelOffsetX: 0,
            pixelOffsetY: 110,
            buildableGrid: [
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1]
            ],
            passableGrid: [
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1]
            ],
            canAttack: false,
            cost: 50,
            build_speed: 0.05,
            hitPoints: 1000,
            sight: 12
        },
        shootingRange: {
            cName: "射击场",
            width: 170,
            height: 135,
            baseSize: 100,

            pixelOffsetX: -5,
            pixelOffsetY: 95,

            buildableGrid: [
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1]
            ],
            passableGrid: [
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1]
            ],
            canAttack: false,
            hitPoints: 800,
            sight: 12,
            cost: 40,
            build_speed: 0.1
        },
        tower: {
            cName: "箭塔",
            width: 60,
            height: 100,
            baseSize: 33,

            pixelOffsetX: 0,
            pixelOffsetY: 88,

            buildableGrid: [
                [1]
            ],
            passableGrid: [
                [1]
            ],
            hitPoints: 400,
            canAttack: true,
            sight: 12,
            attackDistance: 11,
            damage: 20,
            reloadTime: 100,
            cost: 40,
            build_speed: 0.1
        },
        farmer: {
            cName: "农民",
            hitPoints: 50,
            radius: 10,
            speed: 60,
            gather_maxMeat: 5,
            gather_speed: 0.04,
            canAttack: true,
            attackDistance: 0.5,
            sight: 10,
            reloadTime: 100,
            damage: 5,
            damageFrameIndex: 7,
            produce_speed: 0.3,
            cost: 10
        },
        archer: {
            cName: "弓箭手",
            hitPoints: 60,
            radius: 12,
            speed: 50,
            canAttack: true,
            attackDistance: 8,
            sight: 8,
            reloadTime: 30,
            damage: 10,
            damageFrameIndex: 3,
            produce_speed: 0.2,
            cost: 20
        },
        arrow: {
            speed: 400
        },
        food: {
            width: 60,
            height: 60,
            baseSize: 33,

            pixelOffsetX: 0,
            pixelOffsetY: 45,


            selectRangeWidth: 50,
            selectRangeHeight: 50,

            buildableGrid: [
                [1]
            ],
            passableGrid: [
                [1]
            ]
        },
        moutain: {
            width: 120,
            height: 120,
            pixelOffsetX: -10,
            pixelOffsetY: 80,
            buildableGrid: [
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1]
            ],
            passableGrid: [
                [1, 1, 1],
                [1, 1, 1],
                [1, 0, 0]
            ]
        },
        plants: {
            width: 30,
            height: 30,
            pixelOffsetX: -15,
            pixelOffsetY: 18,
            buildableGrid: [
                [0]
            ],
            passableGrid: [
                [0]
            ]
        }
    }
};