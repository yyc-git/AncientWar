/**古代战争 移动算法类
 * 作者：YYC
 * 日期：2014-03-14
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var moveAlgorithm = (function () {
    var DEFAULT_DIRECTIONS = 8;
    var NEARDISTANCE = 0.4; //单位为方格大小

    return{
        findDirection: function (from, to) {
            var direction = 0;

            if (from[1] > to[1] && from[0] < to[0]) {
                direction = 0;
            }
            if (from[1] === to[1] && from[0] < to[0]) {
                direction = 1;
            }
            if (from[1] < to[1] && from[0] < to[0]) {
                direction = 2;
            }
            if (from[1] < to[1] && from[0] === to[0]) {
                direction = 3;
            }
            if (from[1] < to[1] && from[0] > to[0]) {
                direction = 4;
            }
            if (from[1] === to[1] && from[0] > to[0]) {
                direction = 5;
            }
            if (from[1] > to[1] && from[0] > to[0]) {
                direction = 6;
            }
            if (from[1] > to[1] && from[0] === to[0]) {
                direction = 7;
            }

            return direction;
        },
        getDirectionRoundNumber: function (direction, directions) {
            var directionNum = Math.round(direction),
                directions = directions || DEFAULT_DIRECTIONS;

            return directionNum === directions ? 0 : directionNum;
        },
        findAccurateDirection: function (from, to, directions) {
            var directions = directions || DEFAULT_DIRECTIONS;
            var angleBaseOnYPositiveAxis = this._findAngleBaseOnYPositiveAxisInGrid(from, to);

            return this._convertAngleBaseOnYPositiveAxisToDirection(angleBaseOnYPositiveAxis, directions);
        },
        _convertAngleBaseOnYPositiveAxisToDirection: function (angle, directions) {
            var directions = directions || DEFAULT_DIRECTIONS;
            var direction = directions * YYC.Tool.math.toFixed(angle / (2 * Math.PI), 4);

            return direction === directions ? 0 : direction;
        },
        findAccurateDirectionInPix: function (from, to, directions) {
            var directions = directions || DEFAULT_DIRECTIONS;
            var angleBaseOnYPositiveAxis = this._findAngleBaseOnYPositiveAxisInPix(from, to);


            return this._convertAngleBaseOnYPositiveAxisToDirection(angleBaseOnYPositiveAxis, directions);
        },
        /**
         * 计算以y正轴为基准的from到to的角度（y轴顺时针旋转）
         * 坐标系为垂直坐标系
         * @param from 方格坐标
         * @param to 方格坐标
         * @constructor
         */
        _findAngleBaseOnYPositiveAxisInGrid: function (from, to) {
            var angle = this._findAngleBaseOnXPositiveAxisInGrid(from, to);

            return this._convertAngleBaseOnXPositiveAxisToAngleBaseOnYPositiveAxis(angle);
        },
        _convertAngleBaseOnXPositiveAxisToAngleBaseOnYPositiveAxis: function (angle) {
            var n = Math.PI;

            angle += n / 2;

            if (angle >= 2 * n) {
                angle = angle - 2 * n;
            }

            return angle;
        },
        _findAngleBaseOnYPositiveAxisInPix: function (from, to) {
            var angle = this._findAngleBaseOnXPositiveAxisInPix(from, to),
                n = Math.PI;

            angle += n / 2;

            if (angle >= 2 * n) {
                angle = angle - 2 * n;
            }

            return angle;
        },
        _findAngleBaseOnXPositiveAxisByDirection: function (direction, directions) {
            var directions = directions || DEFAULT_DIRECTIONS,
                angleBaseOnYPositiveAxis = direction / directions * 2 * Math.PI,
                angleBaseOnXPositiveAxis = null,
                n = Math.PI;

            if (angleBaseOnYPositiveAxis <= n / 2) {
                angleBaseOnXPositiveAxis = angleBaseOnYPositiveAxis + 3 / 2 * n;
            }
            else {
                angleBaseOnXPositiveAxis = angleBaseOnYPositiveAxis - n / 2;
            }

            return angleBaseOnXPositiveAxis;
        },
        computeMovement: function () {
            var direction = 0,
                directions = 0,
                speed = 0,
                angle = null,
                from = null,
                to = null;

            if (YYC.Tool.judge.isArray(arguments[0])) {
                from = arguments[0];
                to = arguments[1];
                speed = arguments[2];

                angle = this._findAngleBaseOnXPositiveAxisInGrid(from, to);
            }
            else {
                direction = arguments[0];
                speed = arguments[1];
                directions = arguments[2];
                angle = this._findAngleBaseOnXPositiveAxisByDirection(direction, directions);
            }

            speed = YE.Director.getInstance().getPixPerFrame(speed);

            return [YYC.Tool.math.toFixed(speed * Math.cos(angle), 4),
                YYC.Tool.math.toFixed(speed * Math.sin(angle), 4)];
        },
        findAccurateDirectionByMovement: function (movement) {
            var direction = this.findAccurateDirectionInPix([0, 0], movement);

            return direction;
        },
        findNearestSprite: function (target, _class, filter) {
            var sprites = null;

            filter = filter || function () {
                return true;
            };

            sprites = window.entityLayer.getChilds().filter(function (build) {
                return build.isInstanceOf(_class) && filter(build);
            });

            if (sprites.length === 0) {
                return null;
            }

            return  this._getNearestSprite(target, sprites);
        },
        findNearestGrid: function (target, gridSprite) {
            var x = 0,
                y = 0,
                direction = 0;

            if (!gridSprite) {
                return null;
            }

            if (tool.isSingleGridSprite(gridSprite)) {
                x = gridSprite.gridX;
                y = gridSprite.gridY;
            }
            else if (tool.isMiddleSprite(gridSprite)) {
                direction = this.findDirection([gridSprite.gridX, gridSprite.gridY],
                    [target.gridX, target.gridY]);

                switch (direction) {
                    case 0:
                    case 1:
                        x = gridSprite.gridX + 1;
                        y = gridSprite.gridY;
                        break;
                    case 2:
                    case 3:
                        x = gridSprite.gridX + 1;
                        y = gridSprite.gridY + 1;
                        break;
                    case 4:
                    case 5:
                        x = gridSprite.gridX;
                        y = gridSprite.gridY + 1;
                        break;
                    case 6:
                    case 7:
                        x = gridSprite.gridX;
                        y = gridSprite.gridY;
                        break;
                }
            }
            else if (tool.isLargeSprite(gridSprite)) {
                direction = this.findDirection([gridSprite.gridX + 1, gridSprite.gridY + 1],
                    [target.gridX, target.gridY]);

                switch (direction) {
                    case 0:
                        x = gridSprite.gridX + 2;
                        y = gridSprite.gridY;
                        break;
                    case 1:
                        x = gridSprite.gridX + 2;
                        y = gridSprite.gridY + 1;
                        break;
                    case 2:
                        x = gridSprite.gridX + 2;
                        y = gridSprite.gridY + 2;
                        break;
                    case 3:
                        x = gridSprite.gridX + 1;
                        y = gridSprite.gridY + 2;
                        break;
                    case 4:
                        x = gridSprite.gridX;
                        y = gridSprite.gridY + 2;
                        break;
                    case 5:
                        x = gridSprite.gridX;
                        y = gridSprite.gridY + 1;
                        break;
                    case 6:
                        x = gridSprite.gridX;
                        y = gridSprite.gridY;
                        break;
                    case 7:
                        x = gridSprite.gridX + 1;
                        y = gridSprite.gridY;
                        break;
                }
            }
            else {
                throw new Error("精灵大小类型超出范围");
            }

            return [x, y];
        },
        isReachDestPoint: function (from, destination) {
            return tool.isInCircleRange(from, destination, 0.3);
        },
        isInBuildableSpriteRange: function (start, destination, distance) {
            return tool.isInPointToDiamondBoxEdgeDistance(start, destination, distance + NEARDISTANCE);
        },
        isNearBuildableSpriteDest: function (start, destination) {
            return tool.isInPointToDiamondBoxEdgeDistance(start, destination, NEARDISTANCE);
        },
        isReachDestGrid: function (now, destination) {
            return now[0] === destination[0] && now[1] === destination[1];
        },
        _getNearestSprite: function (target, sprites) {
            var nearestSprites = null;

            nearestSprites = sprites.pop();
            sprites.forEach(function (sprite) {
                if (Math.pow(sprite.gridX - target.gridX, 2) + Math.pow(sprite.gridY - target.gridY, 2)
                    < Math.pow(nearestSprites.gridX - target.gridX, 2) + Math.pow(nearestSprites.gridY - target.gridY, 2)) {
                    nearestSprites = sprite;
                }
            });

            return  nearestSprites;
        },
        /**
         * 计算以x正轴为基准的from到to的角度（x轴顺时针旋转）
         * 这里坐标系为垂直坐标系
         * @param from pix坐标
         * @param to pix坐标
         * @constructor
         */
        _findAngleBaseOnXPositiveAxisInPix: function (from, to) {
            var dx = to[0] - from[0],
                dy = to[1] - from[1],
                angle = 0,
                n = Math.PI;

            if (dx == 0) {
                if (to[1] >= from[1]) {
                    dx = 0.0000001;
                }
                else {
                    dx = -0.0000001;
                }

            }
            if (dy == 0) {
                if (to[0] >= from[0]) {
                    dy = 0.0000001;
                }
                else {
                    dy = -0.0000001;
                }

            }

            tanNum = Math.abs(dy / dx);

            if (dx > 0 && dy > 0) {                 // 第一项限
                angle = Math.atan(tanNum);
            }
            else if (dx < 0 && dy > 0) {        // 第二项限
                angle = n - Math.atan(tanNum)
            }
            else if (dx < 0 && dy < 0) {        // 第三项限
                angle = n + Math.atan(tanNum)
            }
            else {
                angle = 2 * n - Math.atan(tanNum);
            }


            return angle;
        },
        /**
         * 计算以x正轴为基准的from到to的角度（x轴顺时针旋转）
         * 这里坐标系为垂直坐标系
         * @param from 方格坐标
         * @param to 方格坐标
         * @constructor
         */
        _findAngleBaseOnXPositiveAxisInGrid: function (from, to) {
            from = tool.convertToPix(from[0], from[1]);
            to = tool.convertToPix(to[0], to[1]);

            return this._findAngleBaseOnXPositiveAxisInPix(from, to);
        },

        //*抛物线计算


        /**
         * 计算画布坐标系的抛物线的y值
         * @param parabolaCoefficient 标准垂直坐标系的抛物线系数
         * @param x 画布坐标系的x坐标
         * @constructor
         */
        computeParabolaY: function (parabolaCoefficient, x) {
            var a = parabolaCoefficient[0],
                b = parabolaCoefficient[1],
                c = parabolaCoefficient[2];

            var y = -(a * x * x + b * x + c);  //转换为画布坐标系的y坐标

            return Number(y.toFixed(4));
        },
        /**
         * 计算标准垂直坐标系的抛物线系数
         * 标准垂直坐标系是y正轴向上，画布坐标系是y正轴向下
         *
         * @param a 抛物线曲率
         数值越大，弧度越高
         为负值则开口向下，为正值则开口向上
         * @param point1 画布坐标系的点的像素坐标
         * @param point2 画布坐标系的点的像素坐标
         * @constructor
         */
        computeParabolaCoefficient: function (a, point1, point2) {
            point1 = [point1[0], -point1[1]];
            point2 = [point2[0], -point2[1]];

            var x1 = point1[0],
                y1 = point1[1],
                x2 = point2[0],
                y2 = point2[1];

            var b = (y1 - a * x1 * x1 - y2 + a * x2 * x2) / (x1 - x2);
            var c = y1 - a * x1 * x1 - b * x1;

            return [a, b, c];
        },
        computeParabolaMovement: function (direction, speed, parabolaCoefficient, directions) {
            var movement = null;

            movement = this.computeMovement(direction, speed, directions);

            if (this.isNearDirection(direction, 0, directions) || this.isNearDirection(direction, directions / 2, directions)) {
                return movement;
            }
            else {
                return [movement[0], this.computeParabolaY(parabolaCoefficient, movement[0]) ];
            }
        },
        isNearDirection: function (direction1, direction2, directions) {
            var directions = directions || DEFAULT_DIRECTIONS;
            var range = 0.1 + directions / 32;

            return Math.abs(direction1 - direction2) < range;
        },
        findAccurateDirectionByParabolaCoefficient: function (parabolaCoefficient, pointX, currentPixPos, destPixPos, directions) {
            var slope = this._computeTangentLineSlope(parabolaCoefficient, pointX),
                direction = 0;

            direction = this._convertSlopeToDirection(slope, directions);

            return this._computeLineDirectionBaseOnPos(direction, currentPixPos, destPixPos, directions);
        },
        _computeTangentLineSlope: function (parabolicEquation, pointX) {
            var differentialEquation = [2 * parabolicEquation[0], parabolicEquation[1]];

            return differentialEquation[0] * pointX + differentialEquation[1];
        },
        _convertSlopeToDirection: function (slope, directions) {
            var angleBaseOnXPositiveAxis = this._convertSlopeToAngleBaseOnXPositiveAxis(slope);
            var angleBaseOnYPositiveAxis = this._convertAngleBaseOnXPositiveAxisToAngleBaseOnYPositiveAxis(angleBaseOnXPositiveAxis);

            return  this._convertAngleBaseOnYPositiveAxisToDirection(angleBaseOnYPositiveAxis, directions);
        },
        _convertSlopeToAngleBaseOnXPositiveAxis: function (slope) {
            return    Math.PI - this._atanReturn0ToPI(slope);
        },
        //计算反正切值，返回值范围为[0,PI]
        _atanReturn0ToPI: function (num) {
            var angle = Math.atan(num);

            if (angle >= 0) {
                return angle;
            }

            return Math.PI + angle;
        },
        _computeLineDirectionBaseOnPos: function (direction, currentPixPos, destPixPos, directions) {
            var relationShip = null;

            relationShip = this._judgePosRelationShip(currentPixPos, destPixPos);

            resultDirection = direction;

            if (direction === 0 || direction === directions / 2) {
                if (relationShip.isUp) {
                    resultDirection = 0;
                }
                else {
                    resultDirection = directions / 2;
                }
            }
            else if (direction < directions / 2) {
                if (relationShip.isLeft) {
                    resultDirection = direction + directions / 2;
                }
            }
            else {
                if (relationShip.isRight) {
                    resultDirection = direction - directions / 2;
                }
            }

            return resultDirection;
        },
        _judgePosRelationShip: function (currentPixPos, targetPixPos) {
            var isLeft = false,
                isRight = false,
                isUp = false,
                isDown = false;

            if (currentPixPos[1] < targetPixPos[1]) {
                isDown = true;
            }
            else {
                isUp = true;
            }

            if (currentPixPos[0] < targetPixPos[0]) {
                isRight = true;
            }
            else {
                isLeft = true;
            }

            return {isLeft: isLeft, isRight: isRight, isUp: isUp, isDown: isDown};
        },
        judgeDirectionSide: function (direction, directions) {
            var directions = directions || DEFAULT_DIRECTIONS;
            var isLeftUp = false,
                isRightUp = false,
                isLeftDown = false,
                isRightDown = false,
                isLeft = false,
                isRight = false,
                isUp = false,
                isDown = false;

            direction = this.getDirectionRoundNumber(direction, directions);

            if (direction === 0) {
                isUp = true;
            }
            else if (direction === directions / 2) {
                isDown = true;
            }
            else if (direction == directions / 4) {
                isRight = true;
            }
            else if (direction == directions * 3 / 4) {
                isLeft = true;
            }
            else if (direction < directions / 4) {
                isRightUp = true;
            }
            else if (direction < directions / 2) {
                isRightDown = true;
            }
            else if (direction < directions * 3 / 4) {
                isLeftDown = true;
            }
            else {
                isLeftUp = true;
            }

            return {isLeft: isLeft, isRight: isRight, isUp: isUp, isDown: isDown,
                isLeftUp: isLeftUp, isLeftDown: isLeftDown, isRightUp: isRightUp, isRightDown: isRightDown};
        },


        //*拦截

        computeInterceptPos: function (interceptor, target) {
            var targetAttackedPixPos = tool.convertToPix(target.getAttackedPoint()),
                interceptorAttackPixPos = tool.convertToPix(interceptor.getAttackPoint()),
                math = YYC.Tool.math,
                targetSpeed = 0,
                interceptorSpeed = 0,
                targetDirection = 0;

            if (!target.isMoving()) {
                return [math.toFixed(targetAttackedPixPos[0], 4), math.toFixed(targetAttackedPixPos[1], 4)];
            }

            targetSpeed = YE.Director.getInstance().getPixPerFrame(target.speed);
            interceptorSpeed = YE.Director.getInstance().getPixPerFrame(interceptor.speed);
            targetDirection = target.direction;

            return this._computeMovingInterceptPos(interceptorAttackPixPos, interceptorSpeed, targetAttackedPixPos, targetDirection, targetSpeed);
        },
        _computeMovingInterceptPos: function (interceptorAttackPixPos, interceptorSpeed, targetAttackedPixPos, targetDirection, targetSpeed) {
            var angleBetweenTargetToInterceptorDirAndTargetDir = 0,
                targetMoveAngle = 0,
                posDistance = 0,
                targetMoveDistance = null,
                temp1 = null,
                temp2 = null,
                temp3 = null,
                math = YYC.Tool.math,
                targetToInterceptorDirection = 0;


            targetToInterceptorDirection = this.findAccurateDirectionInPix(targetAttackedPixPos, interceptorAttackPixPos);


            posDistance = tool.getPointDistance(interceptorAttackPixPos, targetAttackedPixPos);
            targetMoveAngle = this._findAngleBaseOnXPositiveAxisByDirection(targetDirection, 8);

            if (this.isInSameLine(targetToInterceptorDirection, targetDirection)) {
                return this._computeInterceptPosInSameLine(posDistance, targetMoveAngle, targetToInterceptorDirection, interceptorSpeed,
                    targetAttackedPixPos, targetDirection, targetSpeed);
            }
            else {
                angleBetweenTargetToInterceptorDirAndTargetDir = this._getIntersectionAngle(targetToInterceptorDirection, targetDirection);

                if (targetSpeed === interceptorSpeed) {
                    targetMoveDistance = posDistance / (2 * Math.cos(angleBetweenTargetToInterceptorDirAndTargetDir));
                }
                else {
                    temp1 = Math.pow(Math.cos(angleBetweenTargetToInterceptorDirAndTargetDir), 2) - (1 - Math.pow(interceptorSpeed / targetSpeed, 2));

                    //如果二次方程无解，则返回false
                    if (this._canNotIntercept(temp1)) {
                        return false;
                    }


                    temp2 = posDistance * Math.cos(angleBetweenTargetToInterceptorDirAndTargetDir) / (1 - Math.pow(interceptorSpeed / targetSpeed, 2));
                    temp3 = posDistance * Math.sqrt(temp1) / (1 - Math.pow(interceptorSpeed / targetSpeed, 2));

//                        targetMoveDistance = this._getMinPositiveNum([temp2 + temp3, temp2 - temp3]);
                    targetMoveDistance = temp2 - temp3;
                }

                return [math.toFixed(targetAttackedPixPos[0] + targetMoveDistance * Math.cos(targetMoveAngle), 4),
                    math.toFixed(targetAttackedPixPos[1] + targetMoveDistance * Math.sin(targetMoveAngle), 4)];
            }
        },
        _computeInterceptPosInSameLine: function (posDistance, targetMoveAngle, targetToInterceptorDirection, interceptorSpeed, targetAttackedPixPos, targetDirection, targetSpeed) {
            var targetMoveDistance = 0,
                math = YYC.Tool.math;

            if (this.isNearDirection(targetToInterceptorDirection, targetDirection)) {
                targetMoveDistance = posDistance / (targetSpeed + interceptorSpeed) * targetSpeed;
            }
            else {
                targetMoveDistance = posDistance / (interceptorSpeed - targetSpeed) * targetSpeed;
            }

            return [math.toFixed(targetAttackedPixPos[0] + targetMoveDistance * Math.cos(targetMoveAngle), 4),
                math.toFixed(targetAttackedPixPos[1] + targetMoveDistance * Math.sin(targetMoveAngle), 4)];
        },
        _canNotIntercept: function (num) {
            return num < 0;
        },
        _getIntersectionAngle: function (direction1, direction2, directions) {
            var directions = directions || DEFAULT_DIRECTIONS,
                a = Math.abs(direction1 - direction2) * 2 * Math.PI / directions;

            if (a > Math.PI) {
                return 2 * Math.PI - a;
            }
            return a;
        },
        isInSameLine: function (direction1, direction2, directions) {
            var directions = directions || DEFAULT_DIRECTIONS;

            return moveAlgorithm.isNearDirection(direction1, direction2) ||
                moveAlgorithm.isNearDirection(direction1 - directions / 2, direction2) ||
                moveAlgorithm.isNearDirection(direction2 - directions / 2, direction1);
        },


        //寻找可替代点（目的点不可达）

        _findReplaceGrid: function (originGrid, step, buildableGridData) {
            var grids = [],
                grid = originGrid;


            //左
            for (i = 0; i < step; i++) {
                grid = [grid[0], grid[1] + 1];
                if (this._isReachable(grid, buildableGridData)) {
                    grids.push(grid);
                }
            }

            //下
            for (i = 0; i < step; i++) {
                grid = [grid[0] + 1, grid[1]];
                if (this._isReachable(grid, buildableGridData)) {
                    grids.push(grid);
                }
            }
//
            //右
            for (i = 0; i < step; i++) {
                grid = [grid[0], grid[1] - 1];
                if (this._isReachable(grid, buildableGridData)) {
                    grids.push(grid);
                }
            }
            //上
            for (i = 0; i < step; i++) {
                grid = [grid[0] - 1, grid[1]];
                if (this._isReachable(grid, buildableGridData)) {
                    grids.push(grid);
                }
            }

            if (grids.length > 0) {
                return grids;
            }

            grid = [grid[0] - 1, grid[1] - 1];
            step += 2;

            return this._findReplaceGrid(grid, step, buildableGridData);
        },

        _isReachable: function (originGrid, buildableGridData) {
            return !tool.isDestOutOfMap(originGrid) &&
                buildableGridData[originGrid[1]][originGrid[0]] === 0;
        },
        findNearestReplaceGrid: function (fromGrid, toGrid, buildableGridData) {
            var grids = null,
                originGrid = [Math.floor(toGrid[0]) - 1, Math.floor(toGrid[1]) - 1]; //判断基点为目标坐标点的左上方一格的点

            grids = this._findReplaceGrid(originGrid, 2, buildableGridData);

            return this._findNearestGrid([Math.floor(fromGrid[0]), Math.floor(fromGrid[1])], grids);
        },
        _findNearestGrid: function (fromGrid, grids) {
            var nearestGrid = null,
                nearestDistance = null,
                distance = null;

            grids.forEach(function (grid) {
                distance = tool.getPointDistance(fromGrid, grid);

                if (!nearestDistance) {
                    nearestDistance = distance;
                    nearestGrid = grid;
                    return;
                }

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestGrid = grid;
                }
            });

            return nearestGrid;
        },
        isDestCanNotPass: function (destGrid, passableGridData) {
            var dest = [Math.floor(destGrid[0]), Math.floor(destGrid[1])],
                passableGridData = passableGridData || window.mapLayer.passableGridData;

            return tool.isDestOutOfMap(dest) || passableGridData[dest[1]][dest[0]] === 1;
        }
    }
}());