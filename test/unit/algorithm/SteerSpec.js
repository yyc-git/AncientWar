/**古代战争
 * 作者：YYC
 * 日期：2014-02-27
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("Steer", function () {
    var steer = null;
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        steer = new Steer();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("getCollisionObjects，获得移动后与其碰撞的objects", function () {
        var nextGrid = null;
        var grid = null;
        var units = null;

        beforeEach(function () {
            grid = [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ];
        });
        afterEach(function () {
        });

        describe("根据精灵与其它单位坐标点之间的距离来判断是否碰撞并返回碰撞单位信息", function () {
            function buildFakeUnit(uid, gridX, gridY) {
                return {
                    getUid: function () {
                        return uid;
                    },
                    gridX: gridX,
                    gridY: gridY,
                    radius: 20,
                    isDead: function () {
                        return false;
                    }
                }
            }

            it("记录碰撞类型、碰撞精灵的坐标和碰撞的精灵", function () {
                var uid = 1,
                    radius = 10;
                nextGrid = [2.5, 2];
                sandbox.stub(tool, "convertToGridSize",function (radius) {
                    return radius / 20;
                });
                units = [
                    buildFakeUnit(1),
                    buildFakeUnit(2, 1, 1.2),
                    buildFakeUnit(3, 2, 2),
                    buildFakeUnit(4, 3, 2),
                    buildFakeUnit(5, 2, 3)
                ];

                var objects = steer.getCollisionObjects(grid, nextGrid, units, uid, radius);

                expect(objects).toEqual([
                    { collisionType: 'unitSoft', gridPos: [ 1, 1.2 ], with: units[1] },
                    { collisionType: 'unitHard', gridPos: [ 2, 2 ], with: units[2] },
                    { collisionType: 'unitHard', gridPos: [ 3, 2 ], with: units[3]},
                    { collisionType: 'unitHard', gridPos: [ 2, 3 ], with: units[4]}
                ]);
            });
        });

        describe("根据精灵坐标点到地形方块的距离来判断是否碰撞并返回碰撞地形方块信息", function () {
            beforeEach(function () {
            });

            it("记录碰撞类型、碰撞方块的坐标", function () {
                nextGrid = [2.1, 2.3];
                grid[2][1] = 1;
                grid[2][3] = 1;
                grid[1][2] = 1;
                grid[3][2] = 1;
                sandbox.stub(tool, "convertToGridSize").returns(0.2);
                units = [];

                var objects = steer.getCollisionObjects(grid, nextGrid, units);

                expect(objects).toEqual([
                    { collisionType: 'gridHard', gridPos: [ 1, 2 ] }
                ]);
            });
            it("如果精灵下一步会移动到地图外，则加入边界方块的碰撞，从而阻止精灵移动到地图外", function () {
                sandbox.stub(tool, "isDestOutOfMap").returns(true);
                nextGrid = [-0.1, 0];

                var objects = steer.getCollisionObjects(grid, nextGrid, units);

                expect(objects).toEqual([
                    { collisionType: 'gridHard', gridPos: [ -0.1, 0 ] }
                ]);
            });
        });

        describe("设置最高优先级的碰撞实体", function () {
            it("如果没有发生碰撞，则保存上次的最高优先级碰撞实体，置当前的最高优先级碰撞实体为null", function () {
                sandbox.stub(steer, "_addCollisionTerrains").returns([]);
                sandbox.stub(steer, "_addCollisionUnits").returns([]);
                var highestPriorityCollisionObject = {};
                steer.highestPriorityCollisionObject = highestPriorityCollisionObject;

                steer.getCollisionObjects([], [], []);

                expect(steer.last_highestPriorityCollisionObject).toEqual(highestPriorityCollisionObject);
                expect(steer.highestPriorityCollisionObject).toBeNull();
            });

            describe("否则", function () {
                it("如果有地形方块碰撞，则设置离精灵最近的碰撞方块为最高优先级", function () {
                    var nextGrid = [1, 1];
                    var collObject1 = { collisionType: 'gridHard', gridPos: [ 1, 4 ] },
                        collObject2 = { collisionType: 'gridHard', gridPos: [ 2, 2 ] };
                    sandbox.stub(steer, "_addCollisionTerrains").returns([ collObject1, collObject2]);

                    var objects = steer.getCollisionObjects(grid, nextGrid, units);

                    expect(steer.highestPriorityCollisionObject).toEqual(collObject2);
                });
                it("否则，则设置离精灵最近的碰撞单位为最高优先级", function () {
                    var nextGrid = [1, 1];
                    var collObject1 = { collisionType: 'unitSoft', gridPos: [ 1, 4 ] },
                        collObject2 = { collisionType: 'unitHard', gridPos: [ 1, 2 ] },
                        collObject3 = { collisionType: 'unitHard', gridPos: [ 2, 2 ] };
                    sandbox.stub(steer, "_addCollisionUnits").returns([ collObject1, collObject2, collObject3]);

                    var objects = steer.getCollisionObjects(grid, nextGrid, units);

                    expect(steer.highestPriorityCollisionObject).toEqual(collObject2);
                });
            });
        });

        describe("如果发生了碰撞", function () {
            it("设置碰撞标志为true", function () {
                sandbox.stub(steer, "_addCollisionUnits").returns([
                    {}
                ]);

                var objects = steer.getCollisionObjects(grid, nextGrid, units);

                expect(steer.colliding).toBeTruthy();
            });
        });

    });

    describe("calculateDirection，根据碰撞情况，计算实际的移动方向并返回", function () {
        var collisionObjects = null,
            nextStep = null,
            current = null,
            nextStepDirection = null;

        beforeEach(function () {
            collisionObjects = [
                {}
            ];
            nextStep = [1, 1];
            current = [2, 2];
            nextStepDirection = 0;
        });
        afterEach(function () {
        });

//        it("如果发生了hard碰撞，则移动方向为碰撞方向", function () {
//            steer.hardCollision = true;
//            sandbox.stub(steer, "calculateCollisionDirection").returns(1);
//
//            var direction = steer.calculateDirection(collisionObjects, nextStep, current, nextStepDirection);
//
//            expect(direction).toEqual(1);
//        });
        it("否则，移动方向为碰撞方向和寻路的下一步方向的合成方向", function () {
            var collisionDirection = 3,
                middleDirection = 2,
                destGrid = [];
            steer.hardCollision = false;
            sandbox.stub(steer, "calculateCollisionDirection").returns(collisionDirection);
            sandbox.stub(steer, "getMiddleDirection").returns(middleDirection);

            var direction = steer.calculateDirection(collisionObjects, nextStep, current, nextStepDirection, destGrid);

            expect(direction).toEqual(2);
            expect(steer.getMiddleDirection).toCalledWith(nextStepDirection, collisionDirection, current, destGrid);
        });
    });


    describe("calculateCollisionDirection，计算碰撞方向并返回", function () {
        var collisionObjects = null,
            current = null;

        beforeEach(function () {
            current = [2, 2];
            sandbox.stub(window.config, "map", {
                //令菱形方块四个角为90度，从而使地图方块方向与移动方向对应
                // （如[0,0] -> [1,1]就对应移动方向3（实际上为3.04，
                // 因为_findAngleBaseOnXPositiveAxisInPix中当dx/dy为0时，设置了dx/dy的近似值，所以有误差））
                gridWidth: 10,
                gridHeight: 10,

                mapGridWidth: 20,
                mapGridHeight: 20,
                pixOffsetX: 100,
                pixOffsetY: 100
            });

            sandbox.stub(YE.Director, "getInstance").returns({
                getPixPerFrame: function (speed) {
                    return speed;
                }
            });
        });
        afterEach(function () {
        });

        it("吸引力attraction会使实体倾向于往预定的nextStep的方向移动", function () {
            var nextStep = [2, 1];
            collisionObjects = [
//                { collisionType: 'unitSoft', gridPos: [ 2, 1 ] }
//                { collisionType: 'gridSoft', gridPos: [ 2, 3 ] }
            ];
            var direction = steer.calculateCollisionDirection(collisionObjects, nextStep, current);

            expect(direction).toEqual(7);
        });
        describe("测试与单位之间的碰撞（碰撞方向为碰撞单位坐标点到精灵坐标点的方向）", function () {
            it("测试hard碰撞", function () {
                var nextStep = [3, 2];
                collisionObjects = [
                    { collisionType: 'unitHard', gridPos: [ 3.2, 2.8 ] }
                ];

                var direction = steer.calculateCollisionDirection(collisionObjects, nextStep, current);

                expect(direction).toEqual(5.8472);
            });
            it("soft碰撞测试1", function () {
                var nextStep = [2, 1];
                collisionObjects = [
                    { collisionType: 'unitSoft', gridPos: [ 2, 1 ] }
                ];
                var direction = steer.calculateCollisionDirection(collisionObjects, nextStep, current);

                expect(direction).toEqual(3);
            });
            it("soft碰撞测试2", function () {
                var nextStep = [1, 1];
                collisionObjects = [
                    { collisionType: 'unitSoft', gridPos: [ 1, 3 ] }
                ];
                var direction = steer.calculateCollisionDirection(collisionObjects, nextStep, current);

                expect(direction).toEqual(7.688);
            });
            it("测试soft和hard碰撞", function () {
                var nextStep = [1, 3];
                collisionObjects = [
                    { collisionType: 'unitSoft', gridPos: [ 2, 1 ] } ,
                    { collisionType: 'unitSoft', gridPos: [ 2, 0 ] } ,
                    { collisionType: 'unitHard', gridPos: [ 3, 2 ] }
                ];
                var direction = steer.calculateCollisionDirection(collisionObjects, nextStep, current);

                expect(direction).toEqual(4);
            });
        });

        describe("测试与地形之间的碰撞（碰撞方向为碰撞地形方块到精灵所在方块的方向）", function () {
            it("测试hard碰撞", function () {
                var nextStep = [3, 2];
                collisionObjects = [
                    { collisionType: 'gridHard', gridPos: [ 3.2, 2.8 ] }
                ];

                var direction = steer.calculateCollisionDirection(collisionObjects, nextStep, current);

                expect(direction).toEqual(5);
            });
        });
    });

    describe("getMiddleDirection", function () {
        var current = null;

        beforeEach(function () {
            current = [2, 2];
            sandbox.stub(window.config, "map", {
                //令菱形方块四个角为90度，从而使地图方块方向与移动方向对应
                // （如[0,0] -> [1,1]就对应移动方向3（实际上为3.04，
                // 因为_findAngleBaseOnXPositiveAxisInPix中当dx/dy为0时，设置了dx/dy的近似值，所以有误差））
                gridWidth: 10,
                gridHeight: 10,

                mapGridWidth: 20,
                mapGridHeight: 20,
                pixOffsetX: 100,
                pixOffsetY: 100
            });
        });
        afterEach(function () {
        });

        describe("如果当前移动方向和碰撞导向方向近似位于同一直线上（差值小于0.1）且相反", function () {
            it("如果目的地不在直线上，则合成方向为目的地所在的一侧（最大的方向顺时针或逆时针旋转一半）", function () {
                expect(steer.getMiddleDirection(3, 7.05, current, [4, 1])).toEqual(1.025);
                expect(steer.getMiddleDirection(4, 0, current, [3, 3])).toEqual(2);
                expect(steer.getMiddleDirection(2, 6, current, [3, 1])).toEqual(0);
            });

            describe("否则", function () {
                it("如果目的地为最小的方向，则合成方向为让最大的方向顺时针旋转一半", function () {
                    expect(steer.getMiddleDirection(3, 7, current, [2, 3])).toEqual(1);
                    expect(steer.getMiddleDirection(4, 0.01, current, [3, 1])).toEqual(6.005);
                    expect(steer.getMiddleDirection(5, 1, current, [3, 2])).toEqual(7);
                });
                it("如果目的地为最大的方向，则合成方向为让最小的方向顺时针旋转一半", function () {
                    expect(steer.getMiddleDirection(3, 7, current, [2, 1])).toEqual(5);
                    expect(steer.getMiddleDirection(4, 0.01, current, [1, 3])).toEqual(2.005);
                    expect(steer.getMiddleDirection(5, 1, current, [1, 2])).toEqual(3);
                });
            });
        });

        it("获得当前移动方向和碰撞导向方向的合成方向（保留4位小数）", function () {
            expect(steer.getMiddleDirection(1, 2, null, null)).toEqual(1.5);
            expect(steer.getMiddleDirection(1.2, 3.5, null, null)).toEqual(2.35);
            expect(steer.getMiddleDirection(1, 4, null, null)).toEqual(2.5);

            expect(steer.getMiddleDirection(2, 0, null, null)).toEqual(1);
            expect(steer.getMiddleDirection(1, 6.2, null, null)).toEqual(7.6);
            expect(steer.getMiddleDirection(1, 7, null, null)).toEqual(0);
        });
    });

//    describe("isNearDestinationAndColliding", function () {
//        beforeEach(function () {
//        });
//        afterEach(function () {
//        });
//
//        it("判断是否在目的地附近且发生了碰撞", function () {
//            steer.colliding = true;
//            sandbox.stub(tool, "convertToGridSize").andCallFake(function (range) {
//                return range;
//            });
//            var range = 2,
//                dest = [2, 2],
//                current = [1, 1];
//
//            expect(steer.isNearDestinationAndColliding(dest, current, range)).toBeTruthy();
//
//            range = 1;
//            dest = [2, 2];
//            current = [1, 1];
//
//            expect(steer.isNearDestinationAndColliding(dest, current, range)).toBeFalsy();
//        });
//    });
});
