/**古代战争
 * 作者：YYC
 * 日期：2014-02-27
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
(function () {
    var DIRECTIONS = 8,
        MAX_COLLISIONCOUNT = 5;

    var Steer = YYC.Class({
        Private: {
            _addCollisionTerrains: function (grid, nextX, nextY, radius, range) {
                var mapGridWidth = config.map.mapGridWidth,
                    mapGridHeight = config.map.mapGridHeight,
                    x1 = 0,
                    x2 = 0,
                    y1 = 0,
                    y2 = 0,
                    i = 0,
                    j = 0,
                    collisionObjects = [];

                //移动后的位置的左右上下range个方格的范围
                x1 = Math.max(0, Math.floor(nextX) - range);
                x2 = Math.min(mapGridWidth - 1, Math.floor(nextX) + range);

                y1 = Math.max(0, Math.floor(nextY) - range);
                y2 = Math.min(mapGridHeight - 1, Math.floor(nextY) + range);


                //判断与不能通过的地形碰撞
                for (i = x1; i <= x2; i++) {
                    for (j = y1; j <= y2; j++) {
                        if (grid[j][i] == 1) {
                            if (tool.isInPointToDiamondBoxEdgeDistance([nextX, nextY], [i, j],
                                tool.convertToGridSize(radius * 0.05))) {
                                collisionObjects.push({collisionType: "gridHard", gridPos: [i, j ]});
                            }
                        }
                    }
                }

                if (tool.isDestOutOfMap([nextX, nextY])) {
                    collisionObjects.push({collisionType: "gridHard", gridPos: [nextX, nextY]});
                }

                return collisionObjects;
            },
            _addCollisionUnits: function (nextX, nextY, radius, uid, units, range) {
                var collisionObjects = [];

                units.forEach(function (unit) {
                    if (unit.getUid() !== uid
                        && !unit.isDead()
                        && Math.abs(unit.gridX - nextX) <= range && Math.abs(unit.gridY - nextY) <= range) {
                        if (tool.isInCircleRange([unit.gridX, unit.gridY], [nextX, nextY], tool.convertToGridSize(radius + unit.radius))) {
                            collisionObjects.push({collisionType: "unitHard", gridPos: [unit.gridX, unit.gridY ], with: unit});
                        }
                        else if (tool.isInCircleRange([unit.gridX, unit.gridY], [nextX, nextY], tool.convertToGridSize(radius * 1.5 + unit.radius))) {
                            collisionObjects.push({collisionType: "unitSoft", gridPos: [unit.gridX, unit.gridY ], with: unit});
                        }
                    }
                });

                return collisionObjects;
            },
            _setHighestPriorityCollisionObject: function (collisionObjects, nextGrid) {
                var highestPriorityCollisionObject = null;

                if (collisionObjects.length === 0) {
                    if (this.highestPriorityCollisionObject) {
                        this.last_highestPriorityCollisionObject = this.highestPriorityCollisionObject;
                    }

                    this.highestPriorityCollisionObject = null;
                    return;
                }

                highestPriorityCollisionObject = this._getNearestTerrainCollisionObject(collisionObjects, nextGrid);

                if (highestPriorityCollisionObject === null) {
                    highestPriorityCollisionObject = this._getNearestUnitCollisionObject(collisionObjects, nextGrid);
                }

                this.highestPriorityCollisionObject = highestPriorityCollisionObject;
                this.last_highestPriorityCollisionObject = highestPriorityCollisionObject;
            },
            _getNearestTerrainCollisionObject: function (collisionObjects, nextGrid) {
                var min = null,
                    highestPriorityCollisionObject = null,
                    distance = null,
                    collObjects = null;

                collObjects = this._getTerrainCollisionObjects(collisionObjects);

                collObjects.forEach(function (collObject) {
                    distance = tool.getPointToDiamondBoxEdgeDistance(nextGrid, collObject.gridPos);
                    if (min === null || distance < min) {
                        min = distance;
                        highestPriorityCollisionObject = collObject;
                    }
                });

                return highestPriorityCollisionObject;
            },
            _getTerrainCollisionObjects: function (collisionObjects) {
                return collisionObjects.filter(function (collObject) {
                    return collObject.collisionType === "gridHard";
                });
            },
            _getNearestUnitCollisionObject: function (collisionObjects, nextGrid) {
                var min = null,
                    highestPriorityCollisionObject = null,
                    distance = null;

                collisionObjects.forEach(function (collObject) {
                    distance = tool.getPointDistance(nextGrid, collObject.gridPos);
                    if (min === null || distance < min) {
                        min = distance;
                        highestPriorityCollisionObject = collObject;
                    }
                });

                return highestPriorityCollisionObject;
            },
            _findCollObjectUnitToSprite: function (unitCoordinatePoint, currentCoordinatePoint) {
                return  moveAlgorithm.findAccurateDirection(unitCoordinatePoint, currentCoordinatePoint);
            },
            _findCollObjectTerrainGridToSprite: function (terrainGrid, currentCoordinatePoint) {
                return moveAlgorithm.findAccurateDirection(tool.roundDownGrid(terrainGrid), tool.roundDownGrid(currentCoordinatePoint));
            },
            _getMiddleDirectionUnderSameLine: function (maxDirection, minDirection, current, destGrid) {
                var direction = 0,
                    destDirection = moveAlgorithm.findAccurateDirection(current, destGrid);

                if (destDirection <= minDirection || destDirection > maxDirection) {
                    direction = this._getMiddleDirectionUnderMoreThanFour(maxDirection, minDirection);
                }
                else {
                    direction = this._getMiddleDirectionUnderLessThanFour(maxDirection, minDirection);
                }

                return direction;
            },
            _getMiddleDirectionUnderMoreThanFour: function (maxDirection, minDirection) {
                var direction = 0;

                direction = maxDirection + (DIRECTIONS + minDirection - maxDirection) / 2;
                direction = direction >= DIRECTIONS ? direction - DIRECTIONS : direction;

                return direction;
            },
            _getMiddleDirectionUnderLessThanFour: function (maxDirection, minDirection) {
                return minDirection + (maxDirection - minDirection) / 2;
            }
        },
        Public: {
            collisionCount: 0,
            colliding: false,
            highestPriorityCollisionObject: null,        //记录当前与精灵碰撞的最高优先级的碰撞实体
            last_highestPriorityCollisionObject: null,  //记录上一次最高优先级的碰撞实体

            isCollisionUnit: function (collisionObject) {
                return collisionObject.collisionType.contain("unit");
            },
            isTerrainCollision: function (collObject) {
                return collObject.collisionType === "gridHard";
            },
            calculateDirection: function (collisionObjects, nextGrid, currentGrid, nextDirection, destGrid) {
                var newDirection = 0,
                    collisionDirection = 0;

                collisionDirection = this.calculateCollisionDirection(collisionObjects, nextGrid, currentGrid);
                newDirection = this.getMiddleDirection(nextDirection, collisionDirection, currentGrid, destGrid);

                return newDirection;
            },
            getMiddleDirection: function (pathDirection, collisionDirection, current, destGrid) {
                var direction = 0,
                    max = Math.max(pathDirection, collisionDirection),
                    min = Math.min(pathDirection, collisionDirection);

                if (moveAlgorithm.isInSameLine(max, min)) {
                    direction = this._getMiddleDirectionUnderSameLine(max, min, current, destGrid);
                }
                else if (max - min > 4) {
                    direction = this._getMiddleDirectionUnderMoreThanFour(max, min);
                }
                else {
                    direction = this._getMiddleDirectionUnderLessThanFour(max, min);
                }

                return YYC.Tool.math.toFixed(direction, 4);
            },
            calculateCollisionDirection: function (collisionObjects, nextStep, current) {
                var direction = 0,
                    forceVectorX = 0,
                    forceVectorY = 0,
                    collisionDirection = 0,
                    forceMagnitude = 0,
                    movement = null,
                    self = this;

                collisionObjects.push({collisionType: "attraction", gridPos: nextStep});

                collisionObjects.forEach(function (collObject) {
                    switch (collObject.collisionType) {
                        case "unitHard":
                            forceMagnitude = 2;
                            collisionDirection = self._findCollObjectUnitToSprite(collObject.gridPos, current);
                            break;
                        case "unitSoft":
                            forceMagnitude = 1;
                            collisionDirection = self._findCollObjectUnitToSprite(collObject.gridPos, current);
                            break;
                        case "attraction":
                            forceMagnitude = -0.25;
                            collisionDirection = self._findCollObjectUnitToSprite(collObject.gridPos, current);
                            break;
                        case "gridHard":
                            forceMagnitude = 4;
                            collisionDirection = self._findCollObjectTerrainGridToSprite(collObject.gridPos, current);
                            break;
                    }

                    movement = moveAlgorithm.computeMovement(collisionDirection, forceMagnitude);
                    forceVectorX = forceVectorX + movement[0];
                    forceVectorY = forceVectorY + movement[1];
                });

                direction = moveAlgorithm.findAccurateDirectionByMovement([forceVectorX, forceVectorY]);

                return direction;
            },
            getCollisionObjects: function (grid, nextGrid, units, uid, radius) {
                var nextX = nextGrid[0],
                    nextY = nextGrid[1],
                    collisionObjects = [],
                    range = 2;

                collisionObjects = this._addCollisionUnits(nextX, nextY, radius, uid, units, range);
                collisionObjects = collisionObjects.concat(this._addCollisionTerrains(grid, nextX, nextY, radius, range));

                this._setHighestPriorityCollisionObject(collisionObjects, nextGrid);

                if (collisionObjects.length > 0) {
                    this.colliding = true;
                }

                return collisionObjects;
            },
            resetFlag: function () {
                this.colliding = false;
            },
            AddCollisionCount: function () {
                if (!this.collisionCount) {
                    this.collisionCount = 1
                } else {
                    this.collisionCount++;
                }
            },
            isCollisionTooMuch: function () {
                return this.collisionCount > MAX_COLLISIONCOUNT;
            },
            resetCollisionCount: function () {
                this.collisionCount = 0;
            }
        }
    });

    window.Steer = Steer;
}());
