/**古代战争 生产的相关算法
 * 作者：YYC
 * 日期：2014-03-10
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */

var produceAlgorithm = (function () {
    var MAX_FINDDEEP = 2;

    function _findPlaceableGrid(originGrid, step, buildableGridData, deep) {
        if (deep > MAX_FINDDEEP) {
            return null;
        }

        //左
        for (i = 0; i < step; i++) {
            originGrid = [originGrid[0], originGrid[1] + 1];
            if (_isPlaceable(originGrid, buildableGridData)) {
                return originGrid;
            }
        }

        //下
        for (i = 0; i < step; i++) {
            originGrid = [originGrid[0] + 1, originGrid[1]];
            if (_isPlaceable(originGrid, buildableGridData)) {
                return originGrid;
            }
        }
//
        //右
        for (i = 0; i < step; i++) {
            originGrid = [originGrid[0], originGrid[1] - 1];
            if (_isPlaceable(originGrid, buildableGridData)) {
                return originGrid;
            }
        }
        //上
        for (i = 0; i < step; i++) {
            originGrid = [originGrid[0] - 1, originGrid[1]];
            if (_isPlaceable(originGrid, buildableGridData)) {
                return originGrid;
            }
        }

        originGrid = [originGrid[0] - 1, originGrid[1] - 1];
        step += 2;
        deep += 1;

        return _findPlaceableGrid(originGrid, step, buildableGridData, deep);
    }

    function _isPlaceable(originGrid, buildableGridData) {
        return !tool.isDestOutOfMap(originGrid) &&
            buildableGridData[originGrid[1]][originGrid[0]] === 0;
    }


    return {
        findPlaceableGrid: function (target, buildableGridData) {
            var originGrid = [Math.floor(target.gridX) - 1, Math.floor(target.gridY) - 1];  //判断基点为目标坐标点的左上方一格的点
            var step = 0;
            var i = 0;

            if (tool.isSingleGridSprite(target)) {
                step = 2
            }
            else if (tool.isMiddleSprite(target)) {
                step = 3;
            }
            else if (tool.isLargeSprite(target)) {
                step = 4;
            }
            else {
                throw new Error("大小类型错误");
            }

            return _findPlaceableGrid(originGrid, step, buildableGridData, 1);
        }
    }
}());