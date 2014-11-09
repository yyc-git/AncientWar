/**古代战争
 * 作者：YYC
 * 日期：2014-05-16
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
(function () {
    var SmallMapFogLayer = YYC.Class(SmallMapLayer, {
        Private: {
            __lastFOVData: null,

            __drawHideEffect: function () {
                var context = this.getContext();

                context.save();

                context.globalCompositeOperation = "destination-out";

                this.__drawAddedExploreOrVisibleGrid();

                context.restore();
            },
            __drawAddedExploreOrVisibleGrid: function () {
                var graphics = this.getGraphics(),
                    singleDiamondBoxSize = tool.getSmallDiamondSize() * 2,   //扩大菱形方格边长，使得迷雾完全遮挡菱形方格
                    leftHalfAngle = window.mapLayer.getSmallMapLeftHalfAngle(),
                    fillStyle = "rgba(0,0,0,1)";

                //一次绘制多个菱形方格
                graphics.fillMultipleDiamondBox(
                    fillStyle,
                    this.__getAddedExploreOrVisiblePixPos(),
                    leftHalfAngle,
                    singleDiamondBoxSize
                );
            },
            __getAddedExploreOrVisiblePixPos: function () {
                var fovData = window.fogLayer.getFOVData(),
                    i = 0,
                    j = 0,
                    extendEdgeGridSize = window.fogLayer.getExtendEdgeGridSize(),
                    pixPos = null,
                    hide = window.fogLayer.getFogState().HIDE,
                    addedExploreOrVisiblePixPosArr = [];

                if (this.__lastFOVData === null) {
                    for (i = 0; i < fovData.length; i++) {
                        for (j = 0; j < fovData[i].length; j++) {
                            if (tool.isFogGridOutOfMap(i, j)) {
                                continue;
                            }
                            if (fovData[i][j] !== hide) {
                                pixPos = tool.convertToSmallMapPix(j, i - extendEdgeGridSize);
                                addedExploreOrVisiblePixPosArr.push([pixPos[0], pixPos[1]]);
                            }
                        }
                    }

                    this.__lastFOVData = YYC.Tool.extend.extendDeep(fovData);
                }
                else {
                    for (i = 0; i < fovData.length; i++) {
                        for (j = 0; j < fovData[i].length; j++) {
                            if (tool.isFogGridOutOfMap(i, j)) {
                                continue;
                            }
                            if (fovData[i][j] !== hide) {
                                if (this.__lastFOVData[i][j] === hide) {
                                    this.__lastFOVData[i][j] = fovData[i][j];

                                    pixPos = tool.convertToSmallMapPix(j, i - extendEdgeGridSize);
                                    addedExploreOrVisiblePixPosArr.push([pixPos[0], pixPos[1]]);
                                }
                            }
                        }
                    }
                }

                return addedExploreOrVisiblePixPosArr;
            },
            __hideAllSmallMap: function () {
                var configMap = config.map,
                    i = 0,
                    j = 0,
                    graphics = this.getGraphics(),
                    singleDiamondBoxSize = tool.getSmallDiamondSize() * 2,   //扩大菱形方格边长，使得迷雾完全遮挡菱形方格
                    leftHalfAngle = window.mapLayer.getSmallMapLeftHalfAngle(),
                    hidePointArr = [],
                    hideStyle = "rgba(0,0,0,1)";

                for (i = 0; i < configMap.mapGridHeight; i++) {
                    for (j = 0; j < configMap.mapGridWidth; j++) {
                        hidePointArr.push(tool.convertToSmallMapPix(j, i));
                    }
                }

                //一次绘制多个菱形方格
                graphics.fillMultipleDiamondBox(
                    hideStyle,
                    hidePointArr,
                    leftHalfAngle,
                    singleDiamondBoxSize
                );
            }
        },
        Public: {
            draw: function (context) {
                this.__drawHideEffect();

                //在第一次主循环中先绘制出初始的画面，然后再降低调用频率，防止画面抖动
                this.setRunInterval(0.5);
            },
            clear: function () {
            },
            onEnter: function () {
                this.base();

                this.__hideAllSmallMap();
            }
        }
    });

    window.SmallMapFogLayer = SmallMapFogLayer;
}());
