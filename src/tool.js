/**古代战争
 * 作者：YYC
 * 日期：2014-02-03
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
(function () {

//计算向量叉乘
    function _computeCrossMul(v1, v2) {
        return v1[0] * v2[1] - v1[1] * v2[0];
    }

//判断两条线段是否相交
    function _isCross(p1, p2, p3, p4) {
        var v1 = [p1[0] - p3[0], p1[1] - p3[1]],
            v2 = [p2[0] - p3[0], p2[1] - p3[1]],
            v3 = [p4[0] - p3[0], p4[1] - p3[1]],
            v = _computeCrossMul(v1, v3) * _computeCrossMul(v2, v3);

        v1 = [p3[0] - p1[0], p3[1] - p1[1]];
        v2 = [p4[0] - p1[0], p4[1] - p1[1]];
        v3 = [p2[0] - p1[0], p2[1] - p1[1]];

        return !!((v <= 0 && _computeCrossMul(v1, v3) * _computeCrossMul(v2, v3) <= 0));
    }

    /**
     * 假如考虑边(P1,P2)，如果射线正好穿过P1或者P2,那么这个交点会被算作2次，
     * 处理办法是如果P的从坐标与P1,P2中较小的纵坐标相同，则直接忽略这种情况
     */
    function _isThroughPolygonNode(point, p1, p2) {
        return point[1] === Math.min(p1[1], p2[1]);
    }

    var tool = {
        /**
         * pix转换为方格坐标
         * @param x 相对于地图左上角的鼠标坐标x
         * @param y 相对于地图左上角的鼠标坐标y
         * @returns {Array}
         */
        convertToGrid: function (args) {
            var halfSize = tool.computeOnePixSize() / 2,
                gridWidth = config.map.gridWidth,
                gridHeight = config.map.gridHeight,
                mapGridWidth = config.map.mapGridWidth,
                pixOffsetX = config.map.pixOffsetX,
                pixOffsetY = config.map.pixOffsetY,
                x = 0,
                y = 0,
                tx = 0,
                ty = 0,
                gridX = 0,
                gridY = 0,
                math = YYC.Tool.math;

            if (arguments.length === 1) {
                x = arguments[0][0];
                y = arguments[0][1];
            }
            else {
                x = arguments[0];
                y = arguments[1];
            }

            tx = (x - pixOffsetX) / (gridWidth / 2 - halfSize);
            ty = (y - pixOffsetY - mapGridWidth * gridHeight / 2) / (gridHeight / 2 - halfSize);

            gridX = (tx - ty) / 2;
            gridY = (tx + ty) / 2;

            return [gridX, gridY];  ////四舍五入，解决浮点数误差的问题
        },
        /**
         * pix转换为方格坐标
         * @param gridX
         * @param gridY
         * @returns {Array}  [相对于地图左上角的坐标x（pix为单位），相对于地图左上角的坐标y（pix为单位）]
         */
        convertToPix: function (args) {
            var halfSize = tool.computeOnePixSize() / 2,
                gridWidth = config.map.gridWidth,
                gridHeight = config.map.gridHeight ,
                mapGridWidth = config.map.mapGridWidth,
                pixOffsetX = config.map.pixOffsetX,
                pixOffsetY = config.map.pixOffsetY,
                x = 0,
                y = 0,
                gridX = 0,
                gridY = 0,
                math = YYC.Tool.math;

            if (arguments.length === 1) {
                gridX = arguments[0][0];
                gridY = arguments[0][1];
            }
            else {
                gridX = arguments[0];
                gridY = arguments[1];
            }

            //计算后的坐标点位于菱形的左角
            x = (gridX + gridY) * gridWidth / 2 + pixOffsetX - halfSize * gridX - halfSize * gridY;
            y = (gridY - gridX ) / 2 * gridHeight + pixOffsetY + mapGridWidth * gridHeight / 2 + halfSize * gridX - halfSize * gridY;

//            y -= gridHeight / 2;    //将坐标点移到方格（包含菱形的矩形方格）左上角


            return [x, y];   ////四舍五入，解决浮点数误差的问题
        },
        convertToGridSize: function (pix) {
            var adjustmentFactor = 2;

            return pix / (config.map.gridWidth + config.map.gridHeight) * adjustmentFactor;
        },
        //获得一个菱形方块的边长
        getDiamondSize: function () {
            return Math.sqrt(Math.pow(config.map.gridWidth / 2, 2) + Math.pow(config.map.gridHeight / 2, 2));
        },
        //计算地图矩形图片一个像素方格的大小
        computeOnePixSize: function () {
            return config.map.gridWidth / 60;
        },
        convertToSmallMapGrid: function (args) {
            var halfSize = tool.computeSmallMapOnePixSize() / 2,
                gridWidth = config.map.smallGridWidth,
                gridHeight = config.map.smallGridHeight ,
                mapGridWidth = config.map.mapGridWidth,
                pixOffsetX = config.map.smallPixOffsetX,
                pixOffsetY = config.map.smallPixOffsetY,
                x = 0,
                y = 0,
                tx = 0,
                ty = 0,
                gridX = 0,
                gridY = 0,
                math = YYC.Tool.math;

            if (arguments.length === 1) {
                x = arguments[0][0];
                y = arguments[0][1];
            }
            else {
                x = arguments[0];
                y = arguments[1];
            }

            tx = (x - pixOffsetX) / (gridWidth / 2 - halfSize);
            ty = (y - pixOffsetY - mapGridWidth * gridHeight / 2) / (gridHeight / 2 - halfSize);

            gridX = (tx - ty) / 2;
            gridY = (tx + ty) / 2;

            return [gridX, gridY];  ////四舍五入，解决浮点数误差的问题
        },
        convertToSmallMapPix: function (args) {
            var halfSize = tool.computeSmallMapOnePixSize() / 2,
                gridWidth = config.map.smallGridWidth,
                gridHeight = config.map.smallGridHeight ,
                mapGridWidth = config.map.mapGridWidth,
                pixOffsetX = config.map.smallPixOffsetX,
                pixOffsetY = config.map.smallPixOffsetY,
                x = 0,
                y = 0,
                gridX = 0,
                gridY = 0,
                math = YYC.Tool.math;

            if (arguments.length === 1) {
                gridX = arguments[0][0];
                gridY = arguments[0][1];
            }
            else {
                gridX = arguments[0];
                gridY = arguments[1];
            }

            //计算后的坐标点位于菱形的左角
            x = (gridX + gridY) * gridWidth / 2 + pixOffsetX - halfSize * gridX - halfSize * gridY;
            y = (gridY - gridX ) / 2 * gridHeight + pixOffsetY + mapGridWidth * gridHeight / 2 + halfSize * gridX - halfSize * gridY;

//            y -= gridHeight / 2;    //将坐标点移到方格（包含菱形的矩形方格）左上角


            return [x, y];   ////四舍五入，解决浮点数误差的问题
        },
        //计算地图矩形图片一个像素方格的大小
        computeSmallMapOnePixSize: function () {
            return config.map.smallGridWidth / 60;
        },
        //获得小地图一个菱形方块的边长
        getSmallDiamondSize: function () {
            return Math.sqrt(Math.pow(config.map.smallGridWidth / 2, 2) + Math.pow(config.map.smallGridHeight / 2, 2));
        },
        convertToSmallMapPixSize:function(bigMapPixSize){
             return bigMapPixSize / config.map.scale;
        },

        //计算鼠标坐标（相对于画布左上角）
        computeRelativeMousePixPos: function (e, relativeDomId) {
            var relativeDom = document.getElementById(relativeDomId) || e.target,
                offset = null;

            offset = $(relativeDom).offset();

            return [e.pageX - offset.left, e.pageY - offset.top];
        },
        /**判断点是否在多边形内
         *
         * 有这样一个算法,假设现在有一个点和一个多边形,这个多边形可以是凸多边形也可以是凹多边形。
         * 找到这个点,然后从这个点水平往左画一条射线,方向指向左边,
         * 然后你找一下这条射线和多边形的各条边是否相交,统计一下相交的次数,
         * 如果相交偶数次,说明点在多边形外面,如果相交奇数次,说明点在多边形内.具体可以多画画试试
         *
         *
         * 注意到如果从P作水平向左的射线的话，如果P在多边形内部，那么这条射线与多边形的交点必为奇数，如果P在多边形外部，则交点个数必为偶数（0也在内）。所以，我们可以顺序考虑多边形的每条边，求出交点的总个数。还有一些特殊情况要考虑。假如考虑边(P1,P2)，
         1)如果射线正好穿过P1或者P2,那么这个交点会被算作2次，处理办法是如果P的从坐标与P1,P2中较小的纵坐标相同，则直接忽略这种情况
         2)如果射线水平，则射线要么与其无交点，要么有无数个，这种情况也直接忽略。
         3)如果射线竖直，而P0的横坐标小于P1,P2的横坐标，则必然相交。
         4)再判断相交之前，先判断P是否在边(P1,P2)的上面，如果在，则直接得出结论：P再多边形内部。
         * @param point
         * @param polygon
         * @returns {boolean}
         */
        isInPolygon: function (point, polygon) {
            var p1, p2, p3, p4, i;
            var count = 0,
                len = polygon.length;

            p1 = point;
            p2 = [-100000, polygon[1][1]];

            //对每条边都和射线作对比
            for (i = 0; i < len - 1; i++) {
                p3 = polygon[i];
                p4 = polygon[i + 1];
                if (_isCross(p1, p2, p3, p4) && !_isThroughPolygonNode(point, p3, p4)) {
                    count++
                }
            }
            //检查最后一条边
            p3 = polygon[len - 1];
            p4 = polygon[0];
            if (_isCross(p1, p2, p3, p4) && !_isThroughPolygonNode(point, p3, p4)) {
                count++
            }

            return (count % 2 !== 0);
        },
        /**
         * 判断两个多边形是否相交
         * @param polygon1
         * @param polygon2
         * @returns {boolean} 相交则返回true，否则返回false
         */
        isIntersect: function (polygon1, polygon2) {
            var result = false;

            polygon1.forEach(function (point) {
                if (tool.isInPolygon(point, polygon2)) {
                    result = true;
                    return $break;
                }
            });
            if (result === false) {
                polygon2.forEach(function (point) {
                    if (tool.isInPolygon(point, polygon1)) {
                        result = true;
                        return $break;
                    }
                });
            }

            return result;
        },
        isMiddleSprite: function (sprite) {
            return sprite.buildableGrid.length === 2;
        },
        isLargeSprite: function (sprite) {
            return sprite.buildableGrid.length === 3;
        },
        isSingleGridSprite: function (sprite) {
            return sprite.buildableGrid === undefined || sprite.buildableGrid.length === 1;
        },
        isInCircleRange: function (point1, point2, radius) {
            return this.getPointDistance(point1, point2) < radius;
        },
        isInPointToDiamondBoxEdgeDistance: function (point, diamondBoxLeftUpVertex, distance) {
            var pointToDiamondBoxEdgeDistance = this.getPointToDiamondBoxEdgeDistance(point, diamondBoxLeftUpVertex);

            return pointToDiamondBoxEdgeDistance < distance;
        },
        getPointDistance: function (point1, point2) {
            return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
        },
        getPointToDiamondBoxEdgeDistance: function (point, diamondBoxLeftUpVertex) {
            var pointToDiamondBoxEdgeDistance = 0,
                diamondBoxTopRightVertex = [diamondBoxLeftUpVertex[0] + 1, diamondBoxLeftUpVertex[1]],
                diamondBoxBottomRightVertex = [diamondBoxLeftUpVertex[0] + 1, diamondBoxLeftUpVertex[1] + 1],
                diamondBoxBottomLeftVertex = [diamondBoxLeftUpVertex[0], diamondBoxLeftUpVertex[1] + 1];

            //上/下
            if (point[0] >= diamondBoxLeftUpVertex[0] && point[0] <= diamondBoxTopRightVertex[0]) {
                if (point[1] <= diamondBoxLeftUpVertex[1]) {
                    pointToDiamondBoxEdgeDistance = diamondBoxLeftUpVertex[1] - point[1];
                }
                else if (point[1] >= diamondBoxBottomLeftVertex[1]) {
                    pointToDiamondBoxEdgeDistance = point[1] - diamondBoxBottomLeftVertex[1];
                }
            }
            //左/右
            else if (point[1] >= diamondBoxLeftUpVertex[1] && point[1] <= diamondBoxBottomLeftVertex[1]) {
                if (point[0] <= diamondBoxLeftUpVertex[0]) {
                    pointToDiamondBoxEdgeDistance = diamondBoxLeftUpVertex[0] - point[0];
                }
                else if (point[0] >= diamondBoxBottomRightVertex[0]) {
                    pointToDiamondBoxEdgeDistance = point[0] - diamondBoxBottomRightVertex[0];
                }
            }
            //左上
            else if (point[0] < diamondBoxLeftUpVertex[0] && point[1] < diamondBoxLeftUpVertex[1]) {
                pointToDiamondBoxEdgeDistance = Math.sqrt(Math.pow(point[0] - diamondBoxLeftUpVertex[0], 2) + Math.pow(point[1] - diamondBoxLeftUpVertex[1], 2));
            }
            //右上
            else if (point[0] > diamondBoxTopRightVertex[0] && point[1] < diamondBoxTopRightVertex[1]) {
                pointToDiamondBoxEdgeDistance = Math.sqrt(Math.pow(point[0] - diamondBoxTopRightVertex[0], 2) + Math.pow(point[1] - diamondBoxTopRightVertex[1], 2));
            }
            //右下
            else if (point[0] > diamondBoxBottomRightVertex[0] && point[1] > diamondBoxBottomRightVertex[1]) {
                pointToDiamondBoxEdgeDistance = Math.sqrt(Math.pow(point[0] - diamondBoxBottomRightVertex[0], 2) + Math.pow(point[1] - diamondBoxBottomRightVertex[1], 2));
            }
            //左下
            else if (point[0] < diamondBoxBottomLeftVertex[0] && point[1] > diamondBoxBottomLeftVertex[1]) {
                pointToDiamondBoxEdgeDistance = Math.sqrt(Math.pow(point[0] - diamondBoxBottomLeftVertex[0], 2) + Math.pow(point[1] - diamondBoxBottomLeftVertex[1], 2));
            }

            return pointToDiamondBoxEdgeDistance;
        },
        isDestOutOfMap: function (dest) {
            return dest[0] < 0 || dest[0] >= config.map.mapGridWidth || dest[1] < 0 || dest[1] >= config.map.mapGridHeight;
        },
        isFogGridOutOfMap: function (i, j) {
            var extendEdgeGridSize = window.fogLayer.getExtendEdgeGridSize(),
                fovData = window.fogLayer.getFOVData();

            return i < extendEdgeGridSize || j > fovData[0].length - extendEdgeGridSize;
        },
        roundDownGrid: function (grid) {
            return [Math.floor(grid[0]), Math.floor(grid[1])];
        },
        roundingNum: function (num) {
            return (0.5 + num) << 0;
        },
        isEqualGrid: function (grid1, grid2) {
            if (!grid1 || !grid2) {
                return false;
            }

            return grid1[0] === grid2[0] && grid1[1] === grid2[1];
        },
        isBuildingSprite: function (sprite) {
            return sprite.hasTag("building");
        },
        isUnitSprite: function (sprite) {
            return sprite.hasTag("unit");
        },
        isResourceSprite: function (sprite) {
            return sprite.hasTag("resource");
        },
        isGridSprite: function (sprite) {
            return sprite.buildableGrid !== undefined && sprite.passableGrid !== undefined;
        },
        isPlayerSprite: function (sprite) {
            var currentScene = YE.Director.getInstance().getCurrentScene();

            return sprite.team === currentScene.playerTeam;
        },
        isEnemySprite: function (sprite) {
            var currentScene = YE.Director.getInstance().getCurrentScene();

            return sprite.team === currentScene.enemyTeam;
        },
        getRootPath: function () {
            var url = window.location.href;

            return  url.match(/.+project\//)[0];
        },
        drawBackgroundBlack: function (context, canvasData) {
            context.fillStyle = "#000000";
            context.fillRect(0, 0, canvasData.width, canvasData.height);
        },
        playGlobalSound: function (soundId) {
            YE.SoundManager.getInstance().play(soundId);
        },
        playUnitsSound: function (items, soundId) {
            if (items.length === 0 || tool.isEnemySprite(items[0])) {
                return;
            }

            if (this._isAllUnits(items)) {
                if (items.contain(function (sprite) {
                    return sprite.isInstanceOf(ArcherSprite);
                })) {
                    tool.playGlobalSound(soundId);
                    return;
                }

                tool.playGlobalSound("farmer_" + soundId);
            }
        },
        _isAllUnits: function (items) {
            var self = this;

            return items.filter(function (item) {
                return self.isUnitSprite(item);
            }).length === items.length;
        }

    };

    window.tool = tool;
}());