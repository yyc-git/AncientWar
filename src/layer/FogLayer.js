/**古代战争
 * 作者：YYC
 * 日期：2014-03-15
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
(function () {
    var FogState = {
        HIDE: 0,
        EXPLORE: 1,
        VISIBLE: 2
    };

    var FogLayer = YYC.Class(YE.Layer, {
        Private: {
            //地图迷雾数据
            _fovData: [],
            //地图已探索区域数据
            _exploreData: [],
            //fovData沿地图左上和右上边缘往外扩4个方格，为了处理“精灵位于左上、右上边缘时，会超出地图 ”的情况
            _extendEdgeGridSize: 4,
            _isJumpToViewPoint: false,
            _firstDrawFog: true,

            _drawFogEffect: function () {
                var i = 0,
                    j = 0,
                    len1 = this._fovData.length,
                    len2 = this._fovData[0].length,
                    mapLayer = window.mapLayer,
                    graphics = this.getGraphics(),
                    pixPos = null,
                    singleDiamondBoxSize = tool.getDiamondSize() * 1.1, //扩大菱形方格边长，使得迷雾完全遮挡菱形方格
                    offsetX = window.mapLayer.getOffsetX(),
                    offsetY = window.mapLayer.getOffsetY(),
                    leftHalfAngle = window.mapLayer.getLeftHalfAngle(),
                    hide = FogState.HIDE,
                    explore = FogState.EXPLORE,
                    hidePointArr = [],
                    explorePointArr = [],
                    hideStyle = "rgba(0,0,0,1)",
                    exploreStyle = "rgba(0,0,0,0.8)";

                for (i = 0; i < len1; i++) {
                    for (j = 0; j < len2; j++) {
                        if (tool.isFogGridOutOfMap(i, j)) {
                            continue;
                        }

                        if (this._fovData[i][j] === hide || this._fovData[i][j] === explore) {
                            pixPos = tool.convertToPix(j, i - this._extendEdgeGridSize);

                            // 只绘制视口框内的迷雾方格
                            // 因为pixPos是迷雾方格的坐标点，视口边缘的迷雾方格可能虽然坐标点在视口范围之外，但方格一部分位于视口之内。
                            // 所以扩大了视口框的判定范围，将这部分方格也包括进来
                            if (!mapLayer.isInViewPoint(pixPos[0], pixPos[1], 60, 15, 0, 15)) {
                                continue;
                            }

                            if (this._fovData[i][j] === hide) {
                                hidePointArr.push([pixPos[0] - offsetX, pixPos[1] - offsetY]);
                            }
                            else if (this._fovData[i][j] === explore) {
                                explorePointArr.push([pixPos[0] - offsetX, pixPos[1] - offsetY]);
                            }
                        }
                    }
                }

                //一次绘制多个菱形方格
                graphics.fillMultipleDiamondBox(
                    hideStyle,
                    hidePointArr,
                    leftHalfAngle,
                    singleDiamondBoxSize
                );
                graphics.fillMultipleDiamondBox(
                    exploreStyle,
                    explorePointArr,
                    leftHalfAngle,
                    singleDiamondBoxSize
                );
            },
            _computeFOV: function () {
                this._resetFOV();
                this._setVisibleData();
                this._computeFOVByExploreData();
            },
            _setVisibleData: function () {
                var explore = FogState.EXPLORE,
                    _fovData = this._fovData,
                    _exploreData = this._exploreData,
                    point = null,
                    self = this,
                    x = 0,
                    y = 0,
                    x0 = 0,
                    x1 = 0,
                    y0 = 0,
                    y1 = 0,
                    i = 0,
                    j = 0;

                window.entityLayer.getChilds().forEach(function (sprite) {
                    if (!tool.isPlayerSprite(sprite)) {
                        return;
                    }

                    point = sprite.getSightPoint();
                    x = Math.floor(point[0]);
                    y = Math.floor(point[1]);

                    x0 = Math.max(0, x - sprite.sight);
                    y0 = Math.max(-self._extendEdgeGridSize, y - sprite.sight);

                    x1 = Math.min(config.map.mapGridWidth - 1 + self._extendEdgeGridSize, x + sprite.sight);
                    y1 = Math.min(config.map.mapGridHeight - 1, y + sprite.sight);

                    for (i = y0; i <= y1; i++) {
                        for (j = x0; j <= x1; j++) {
                            _exploreData[i + self._extendEdgeGridSize][j] = explore;
                            _fovData[i + self._extendEdgeGridSize][j] = 1;
                        }
                    }
                });
            },
            _computeFOVByExploreData: function () {
                var _fovData = this._fovData,
                    _exploreData = this._exploreData,
                    i = 0,
                    j = 0;

                for (i = 0; i < _fovData.length; i++) {
                    for (j = 0; j < _fovData[i].length; j++) {
                        _fovData[j][i] = _fovData[j][i] + _exploreData[j][i];
                    }
                }
            },
            _initData: function () {
                var hide = FogState.HIDE,
                    i = 0,
                    j = 0,
                    mapGridWidth = config.map.mapGridWidth,
                    mapGridHeight = config.map.mapGridHeight;

                for (i = 0; i < mapGridHeight + this._extendEdgeGridSize; i++) {
                    this._fovData[i] = [];
                    this._exploreData[i] = [];
                    for (j = 0; j < mapGridWidth + this._extendEdgeGridSize; j++) {
                        this._fovData[i][j] = hide;
                        this._exploreData[i][j] = hide;
                    }
                }
            },
            _resetFOV: function () {
                var hide = FogState.HIDE,
                    i = 0,
                    j = 0,
                    mapGridWidth = config.map.mapGridWidth,
                    mapGridHeight = config.map.mapGridHeight;

                for (i = 0; i < mapGridHeight + this._extendEdgeGridSize; i++) {
                    this._fovData[i] = [];
                    for (j = 0; j < mapGridWidth + this._extendEdgeGridSize; j++) {
                        this._fovData[i][j] = hide;
                    }
                }
            },
            _isGridSpriteVisible: function (sprite) {
                var i = 0,
                    j = 0,
                    visible = FogState.VISIBLE,
                    gridFloorPos = [Math.floor(sprite.gridX) , Math.floor(sprite.gridY) ];

                for (i = 0; i < sprite.buildableGrid.length; i++) {
                    for (j = 0; j < sprite.buildableGrid[i].length; j++) {
                        if (this._fovData[gridFloorPos[1] + i + this._extendEdgeGridSize][gridFloorPos[0] + j] === visible) {
                            return true;
                        }
                    }
                }

                if (this.isExplore(sprite)) {
                    return true;
                }

                return false;
            }
        },
        Public: {
            draw: function (context) {
                this._drawFogEffect();
            },
            getFOVData: function () {
                return this._fovData;
            },
            getFogState: function () {
                return FogState;
            },
            getExtendEdgeGridSize: function () {
                return this._extendEdgeGridSize;
            },
            isInFog: function (gridPosX, gridPosY) {
                var visible = FogState.VISIBLE;

                if (gridPosY + this._extendEdgeGridSize < 0 || gridPosY + this._extendEdgeGridSize >= this._fovData.length) {
                    return true;
                }

                return this._fovData[Math.floor(gridPosY + this._extendEdgeGridSize)][Math.floor(gridPosX)] !== visible;

            },
            isVisible: function (sprite) {
                if (tool.isGridSprite(sprite)) {
                    return this._isGridSpriteVisible(sprite);
                }

                return !this.isInFog(sprite.gridX, sprite.gridY);
            },
            isExplore: function (sprite) {
                return sprite.isExplore === true;
            },
            canBeDetected: function (sprite) {
                return sprite.isExplore !== undefined;
            },
            adjustRunInterval: function (actionStr) {
                //第一次主循环先绘制出初始的画面，防止画面抖动
                if (this._firstDrawFog) {
                    this._firstDrawFog = false;
                    return;
                }

                switch (actionStr) {
                    case "not roll":
                        if (this._isJumpToViewPoint) {
                            this.resumeRunInterval();
                            this._isJumpToViewPoint = false;
                            break;
                        }
                        if (!this.isSetRunInterval()) {
                            this.setRunInterval(0.5);
                        }
                        break;
                    case "roll":
                        this.resumeRunInterval();
                        break;
                    case "jumpToViewPoint":
                        this._isJumpToViewPoint = true;
                        break;
                    default :
                        throw new Error("error");
                        break;
                }
            },
            onStartLoop: function () {
                this._computeFOV();
            },
            onEnter: function () {
                this._initData();
            }
        }
    });

    window.FogLayer = FogLayer;
}());
