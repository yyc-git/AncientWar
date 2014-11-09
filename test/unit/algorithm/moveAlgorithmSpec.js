/**古代战争
 * 作者：YYC
 * 日期：2014-03-14
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("moveAlgorithm", function () {
    var algorithm = moveAlgorithm,
        sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("findDirection", function () {
        it("计算移动的方向（整数）并返回", function () {
            expect(algorithm.findDirection([0, 1], [1, 0])).toEqual(0);
            expect(algorithm.findDirection([0, 1], [1, 1])).toEqual(1);
            expect(algorithm.findDirection([0, 1], [1, 2])).toEqual(2);
            expect(algorithm.findDirection([0, 1], [0, 2])).toEqual(3);
            expect(algorithm.findDirection([1, 1], [0, 2])).toEqual(4);
            expect(algorithm.findDirection([1, 1], [0, 1])).toEqual(5);
            expect(algorithm.findDirection([1, 1], [0, 0])).toEqual(6);
            expect(algorithm.findDirection([1, 1], [1, 0])).toEqual(7);
        });
    });

    describe("findAccurateDirection", function () {
        beforeEach(function () {
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
            sandbox.stub(tool, "computeOnePixSize").returns(0);
        });

        it("计算精确的移动的方向（保留4位小数）并返回（默认方向总数为8）", function () {


            expect(algorithm.findAccurateDirection([0, 1], [1, 0])).toEqual(0);
            expect(algorithm.findAccurateDirection([0, 1], [1.5, 0])).toEqual(0.2512);

            expect(algorithm.findAccurateDirection([0, 1], [1, 1])).toEqual(1);
            expect(algorithm.findAccurateDirection([0, 1], [1, 1.6])).toEqual(1.688);


            expect(algorithm.findAccurateDirection([0, 1], [1, 2])).toEqual(2);
            expect(algorithm.findAccurateDirection([0, 1], [0, 2])).toEqual(3);
            expect(algorithm.findAccurateDirection([1, 1], [0, 2])).toEqual(4);
            expect(algorithm.findAccurateDirection([1, 1], [0, 1])).toEqual(5);
            expect(algorithm.findAccurateDirection([1, 1], [0, 0])).toEqual(6);
            expect(algorithm.findAccurateDirection([1, 1], [1, 0])).toEqual(7);
        });
        it("可以设置方向总数", function () {
            var directions = 16;

            expect(algorithm.findAccurateDirection([1, 1], [1, 0], directions)).toEqual(14);
        });
    });

//    describe("getPathDirection", function () {
//        it("获得寻路的移动方向整数", function () {
//            expect(moveAlgorithm.getPathDirection(0)).toEqual(0);
//            expect(moveAlgorithm.getPathDirection(0.4)).toEqual(1);
//            expect(moveAlgorithm.getPathDirection(1.3)).toEqual(1);
//            expect(moveAlgorithm.getPathDirection(2)).toEqual(2);
//            expect(moveAlgorithm.getPathDirection(2.6)).toEqual(3);
//            expect(moveAlgorithm.getPathDirection(3.6)).toEqual(3);
//            expect(moveAlgorithm.getPathDirection(4)).toEqual(4);
//            expect(moveAlgorithm.getPathDirection(4.1)).toEqual(5);
//            expect(moveAlgorithm.getPathDirection(5.5)).toEqual(5);
//            expect(moveAlgorithm.getPathDirection(6)).toEqual(6);
//            expect(moveAlgorithm.getPathDirection(6.9)).toEqual(7);
//            expect(moveAlgorithm.getPathDirection(7.9)).toEqual(7);
//        });
//    });

    describe("getDirectionRoundNumber", function () {
        it("方向四舍五入并返回，默认方向总数为8方向", function () {
            expect(moveAlgorithm.getDirectionRoundNumber(0)).toEqual(0);
            expect(moveAlgorithm.getDirectionRoundNumber(0.4)).toEqual(0);
            expect(moveAlgorithm.getDirectionRoundNumber(1.3)).toEqual(1);
            expect(moveAlgorithm.getDirectionRoundNumber(2)).toEqual(2);
            expect(moveAlgorithm.getDirectionRoundNumber(2.6)).toEqual(3);
            expect(moveAlgorithm.getDirectionRoundNumber(4)).toEqual(4);
            expect(moveAlgorithm.getDirectionRoundNumber(4.1)).toEqual(4);
            expect(moveAlgorithm.getDirectionRoundNumber(5.5)).toEqual(6);
            expect(moveAlgorithm.getDirectionRoundNumber(6)).toEqual(6);
            expect(moveAlgorithm.getDirectionRoundNumber(6.9)).toEqual(7);
            expect(moveAlgorithm.getDirectionRoundNumber(7.9)).toEqual(0);
        });
        it("可以设置方向总数", function () {
            var directions = 16;

            expect(moveAlgorithm.getDirectionRoundNumber(12.1, directions)).toEqual(12);
            expect(moveAlgorithm.getDirectionRoundNumber(15.9, directions)).toEqual(0);
        });
    });

//    describe("_findAngleInGrid", function () {
//        it("计算以x正轴为基准的from到to的角度", function () {
//            function toFixed(num) {
//                return Number(Number(num).toFixed(3));
//            }
//
//            expect(toFixed(algorithm._findAngleInGrid([0, 0], [1, 1]))).toEqual(0);
//            expect(toFixed(algorithm._findAngleInGrid([0, 1], [1, 1]) / (2 * Math.PI))).toEqual(7 / 8);
//
//        });
//    });

    describe("_findAngleBaseOnXPositiveAxisInPix", function () {
        it("计算以x正轴为基准的from到to的角度", function () {
            function toFixed(num) {
                return YYC.Tool.math.toFixed(num, 3);
            }

            expect(toFixed(algorithm._findAngleBaseOnXPositiveAxisInPix([2, 2], [3, 1]) / (2 * Math.PI))).toEqual(7 / 8);

        });
    });

//    describe("_getAngleBaseOnYPositiveAxisInGrid", function () {
//        it("计算以y正轴为基准的from到to的角度", function () {
//            expect(algorithm._getAngleBaseOnYPositiveAxisInGrid([0, 1], [1, 1]) / (2 * Math.PI)).toEqual(7/8);
//        });
//    });

    describe("computeMovement", function () {
        var speed = 10,
            angle = Math.PI / 4,
            from = [1, 1],
            velocityComponentX = YYC.Tool.math.toFixed(speed * Math.cos(angle), 4),
            velocityComponentY = YYC.Tool.math.toFixed(speed * Math.sin(angle), 4);

        beforeEach(function () {
            sandbox.stub(YE.Director, "getInstance").returns({
                getPixPerFrame: function (speed) {
                    return speed;
                }
            });
        });

        describe("如果参数为direction, speed，directions", function () {
            it("计算x、y轴移动距离（保留4位小数），计算每帧移动的距离，默认方向总数为8方向", function () {
                expect(algorithm.computeMovement(0, speed)).toEqual([-0, -speed]);
                expect(algorithm.computeMovement(1, speed)).toEqual([velocityComponentX, -velocityComponentY]);
                expect(algorithm.computeMovement(2, speed)).toEqual([speed, -0]);
                expect(algorithm.computeMovement(3, speed)).toEqual([velocityComponentX, velocityComponentY]);
                expect(algorithm.computeMovement(4, speed)).toEqual([0, speed]);
                expect(algorithm.computeMovement(5, speed)).toEqual([-velocityComponentX, velocityComponentY]);
                expect(algorithm.computeMovement(6, speed)).toEqual([-speed, 0]);
                expect(algorithm.computeMovement(7, speed)).toEqual([-velocityComponentX, -velocityComponentY]);

                expect(algorithm.computeMovement(0.5, speed)).toEqual([ 3.8268, -9.2388 ]);
                expect(algorithm.computeMovement(6.3, speed)).toEqual([ -9.7237, -2.3345 ]);
            });
            it("可以设置方向总数", function () {
                var directions = 16;

                expect(algorithm.computeMovement(6.3, speed, directions)).toEqual([ 6.1909, 7.8532 ]);
            });
        });

        describe("如果参数为from, to, speed", function () {
            it("计算沿着from到to的方向的x、y轴移动距离（保留4位小数），计算每帧移动的距离", function () {
                var sandbox = sinon.sandbox.create();
                sandbox.stub(window.config, "map", {
                    gridWidth: 10,
                    gridHeight: 10,
                    pixOffsetX: 0,
                    pixOffsetY: 0,
                    mapGridWidth: 10
                });

                expect(algorithm.computeMovement(from, [2, 0], speed)).toEqual([-0, -speed]);
                expect(algorithm.computeMovement(from, [2, 1], speed)).toEqual([velocityComponentX, -velocityComponentY]);
                expect(algorithm.computeMovement(from, [2, 2], speed)).toEqual([speed, 0]);
                expect(algorithm.computeMovement(from, [1, 2], speed)).toEqual([velocityComponentX, velocityComponentY]);
                expect(algorithm.computeMovement(from, [0, 2], speed)).toEqual([0, speed]);
                expect(algorithm.computeMovement(from, [0, 1], speed)).toEqual([-velocityComponentX, velocityComponentY]);
                expect(algorithm.computeMovement(from, [0, 0], speed)).toEqual([-speed, -0]);
                expect(algorithm.computeMovement(from, [1, 0], speed)).toEqual([-velocityComponentX, -velocityComponentY]);

                expect(algorithm.computeMovement(from, [2, 1.5], speed)).toEqual([ 9.4868, -3.1623 ]);
            });
        });
    });

//    describe("findDirectionByMovement", function () {
//        it("根据computeMovement计算的movement，逆推direction", function () {
//            expect(algorithm.findDirectionByMovement([0, -1])).toEqual(0);
//            expect(algorithm.findDirectionByMovement([1, -1])).toEqual(1);
//            expect(algorithm.findDirectionByMovement([1, 0])).toEqual(2);
//            expect(algorithm.findDirectionByMovement([1, 1])).toEqual(3);
//            expect(algorithm.findDirectionByMovement([0, 1])).toEqual(4);
//            expect(algorithm.findDirectionByMovement([-1, 1])).toEqual(5);
//            expect(algorithm.findDirectionByMovement([-1, 0])).toEqual(6);
//            expect(algorithm.findDirectionByMovement([-1, -1])).toEqual(7);
//
//        });
//    });

    describe("findAccurateDirectionByMovement", function () {
        it("根据computeMovement计算的movement，逆推精确的direction（保留4位小数）", function () {
            //因为_findAngleBaseOnXPositiveAxisInPix中当dx/dy为0时，设置了dx/dy的近似值，所以有误差

            expect(algorithm.findAccurateDirectionByMovement([0, -1])).toEqual(0);
            expect(algorithm.findAccurateDirectionByMovement([1, -1])).toEqual(1);
            expect(algorithm.findAccurateDirectionByMovement([1, 0])).toEqual(2);
            expect(algorithm.findAccurateDirectionByMovement([1, 1])).toEqual(3);
            expect(algorithm.findAccurateDirectionByMovement([0, 1])).toEqual(4);
            expect(algorithm.findAccurateDirectionByMovement([-1, 1])).toEqual(5);
            expect(algorithm.findAccurateDirectionByMovement([-1, 0])).toEqual(6);
            expect(algorithm.findAccurateDirectionByMovement([-1, -1])).toEqual(7);

            expect(algorithm.findAccurateDirectionByMovement([ 9.49, -3.16])).toEqual(1.5904);

        });
    });

    describe("findNearestSprite， 找到离目标最近的指定类型和条件的精灵", function () {
        var fakeBases = null,
            fakeTarget = null;

        function buildFakeSprite(gridX, gridY) {
            return {
                gridX: gridX,
                gridY: gridY
            }
        }

        beforeEach(function () {
            fakeTarget = {
                gridX: 5,
                gridY: 5
            };
            sandbox.stub(window, "entityLayer", {
                getChilds: function () {
                    return  {
                        filter: function () {
                            return fakeBases;
                        }
                    }
                }
            });
        });
        afterEach(function () {
        });

        it("可指定精灵过滤条件", function () {
            var filter = function (sprite) {
                return sprite.gridX === 4;
            };
            var fakeSprite1 = buildFakeSprite(3, 3),
                fakeSprite2 = buildFakeSprite(4, 4);
            fakeBases = [
                fakeSprite1,
                fakeSprite2
            ];

            var sprite = algorithm.findNearestSprite(fakeTarget, BaseSprite, filter);

            expect(sprite).toEqual(fakeSprite2);
        });
        it("如果没找到，则返回null", function () {
            fakeBases = [];

            expect(algorithm.findNearestSprite(fakeTarget, BaseSprite)).toBeNull();
        });
    });

    describe("findNearestGrid", function () {
        var fakeTarget = null;

        function buildFakeSprite(buildableGrid, gridX, gridY) {
            return {
                gridX: gridX,
                gridY: gridY,
                buildableGrid: buildableGrid
            }
        }

        beforeEach(function () {
            fakeTarget = {
                gridX: 5,
                gridY: 5
            };
        });
        afterEach(function () {
        });

        it("寻找小型精灵的最近的方格", function () {
            var fakeSprite = buildFakeSprite([1], 4, 4);

            var sprite = algorithm.findNearestGrid(fakeTarget, fakeSprite);

            expect(sprite).toEqual([fakeSprite.gridX, fakeSprite.gridY]);
        });

        describe("寻找中型精灵的最近的方格", function () {
            it("测试1", function () {
                var fakeSprite = buildFakeSprite([
                    [1, 1],
                    [1, 1]
                ], 2, 3);

                var sprite = algorithm.findNearestGrid(fakeTarget, fakeSprite);

                expect(sprite).toEqual([fakeSprite.gridX + 1, fakeSprite.gridY + 1]);
            });
            it("测试2", function () {
                var fakeSprite = buildFakeSprite([
                    [1, 1],
                    [1, 1]
                ], 6, 7);

                var sprite = algorithm.findNearestGrid(fakeTarget, fakeSprite);

                expect(sprite).toEqual([fakeSprite.gridX, fakeSprite.gridY]);
            });
        });

        describe("寻找大型精灵的最近的方格", function () {
            it("测试1", function () {
                var fakeSprite = buildFakeSprite([
                    [1, 1, 1],
                    [1, 1, 1],
                    [1, 1, 1]
                ], 1, 4);

                var sprite = algorithm.findNearestGrid(fakeTarget, fakeSprite);

                expect(sprite).toEqual([fakeSprite.gridX + 2, fakeSprite.gridY + 1]);
            });
            it("测试2", function () {
                var fakeSprite = buildFakeSprite([
                    [1, 1, 1],
                    [1, 1, 1],
                    [1, 1, 1]
                ], 6, 7);

                var sprite = algorithm.findNearestGrid(fakeTarget, fakeSprite);

                expect(sprite).toEqual([fakeSprite.gridX, fakeSprite.gridY]);
            });
            it("测试3", function () {
                var fakeSprite = buildFakeSprite([
                    [1, 1, 1],
                    [1, 1, 1],
                    [1, 1, 1]
                ], 4, 1);

                var sprite = algorithm.findNearestGrid(fakeTarget, fakeSprite);

                expect(sprite).toEqual([fakeSprite.gridX + 1, fakeSprite.gridY + 2]);
            });
        });
    });

    describe("抛物线移动", function () {
        describe("computeParabolaY", function () {
            it("在画布坐标系中，计算抛物线的y坐标（保留4位小数）", function () {
                var parabolaCoefficient = [-0.2, 4, -25];

                expect(moveAlgorithm.computeParabolaY(parabolaCoefficient, 5)).toEqual(10);
                expect(moveAlgorithm.computeParabolaY(parabolaCoefficient, 15)).toEqual(10);
                expect(moveAlgorithm.computeParabolaY(parabolaCoefficient, 12)).toEqual(5.8);
            });
        });

        describe("computeParabolaCoefficient", function () {
            it("在画布坐标系中，计算抛物线方程系数数组", function () {
                var point1 = [5, 10],
                    point2 = [20, 25],
                    a = -0.2;

                expect(moveAlgorithm.computeParabolaCoefficient(a, point1, point2)).toEqual([a, 4, -25]);
            });
        });

        describe("findAccurateDirectionByParabolaCoefficient", function () {
            beforeEach(function () {
            });
            afterEach(function () {
            });

            it("计算抛物线在指定点的切线方向", function () {
                var a = -0.2,
                    b = 4,
                    c = -25;
                var directions = 16; //设置为16方向
                var parabolicEquation = [a, b, c];
                var currentPixPos = [10, 10];


                expect(moveAlgorithm.findAccurateDirectionByParabolaCoefficient(parabolicEquation, 10, currentPixPos, [20, 10], directions)).toEqual(4);
                expect(moveAlgorithm.findAccurateDirectionByParabolaCoefficient(parabolicEquation, 5, currentPixPos, [5, 20], directions)).toEqual(9.1808);
                expect(moveAlgorithm.findAccurateDirectionByParabolaCoefficient(parabolicEquation, 12, currentPixPos, [5, 5], directions)).toEqual(13.718399999999999);
            });
        });

        describe("isNearDirection", function () {
            it("判断两者是否接近，接近的范围判断大小与方向总数成正比", function () {
                expect(moveAlgorithm.isNearDirection(1, 0.6)).toBeFalsy();
                expect(moveAlgorithm.isNearDirection(1, 0.9)).toBeTruthy();

                expect(moveAlgorithm.isNearDirection(11.5, 12.2, 16)).toBeFalsy();
                expect(moveAlgorithm.isNearDirection(11.5, 11.8, 16)).toBeTruthy();
            });
        });

        describe("judgeDirectionSide", function () {
            it("根据精灵方向判断所面对的方向", function () {
                expect(moveAlgorithm.judgeDirectionSide(0).isUp).toBeTruthy();
                expect(moveAlgorithm.judgeDirectionSide(1).isRightUp).toBeTruthy();
                expect(moveAlgorithm.judgeDirectionSide(2).isRight).toBeTruthy();
                expect(moveAlgorithm.judgeDirectionSide(3).isRightDown).toBeTruthy();
                expect(moveAlgorithm.judgeDirectionSide(4).isDown).toBeTruthy();
                expect(moveAlgorithm.judgeDirectionSide(5).isLeftDown).toBeTruthy();
                expect(moveAlgorithm.judgeDirectionSide(6).isLeft).toBeTruthy();
                expect(moveAlgorithm.judgeDirectionSide(7).isLeftUp).toBeTruthy();

                expect(moveAlgorithm.judgeDirectionSide(9, 16).isLeftDown).toBeTruthy();

                expect(moveAlgorithm.judgeDirectionSide(1).isUp).toBeFalsy();
            });
        });
    });

    describe("拦截", function () {
        describe("computeInterceptPos，计算拦截点坐标（保留4位小数）", function () {
            function buildFakeItem(x, y, speed, isMoving, direction) {
                return {
                    getAttackPoint: function () {
                        return [x, y];
                    },
                    getAttackedPoint: function () {
                        return [x, y];
                    },
                    speed: speed,
                    isMoving: function () {
                        return isMoving || false;
                    },
                    direction: direction || 0
                }
            }

            beforeEach(function () {
                sandbox.stub(YE.Director, "getInstance").returns({
                    getPixPerFrame: function (speed) {
                        return speed;
                    }
                });
                sandbox.stub(tool, "convertToPix",function (gridArr) {
                    return gridArr;
                });
            });

            it("如果拦截者无法拦截目标，则返回false", function () {
                var interceptor = buildFakeItem(10, 10, 1);

                expect(moveAlgorithm.computeInterceptPos(interceptor, buildFakeItem(15, 10, 2, true, 1))).toBeFalsy();
            });
            it("如果目标没有移动，则返回目标坐标", function () {
                var interceptor = buildFakeItem(10, 10, 3);

                expect(moveAlgorithm.computeInterceptPos(interceptor, buildFakeItem(15, 10, 2, false, 1))).toEqual([15, 10]);
            });

            describe("如果目标移动方向在拦截者和目标的连线上或者附近", function () {
                var interceptor = buildFakeItem(10, 10, 4);

                it("如果目标往远离拦截者所在位置方向移动", function () {
                    expect(moveAlgorithm.computeInterceptPos(interceptor, buildFakeItem(15, 10, 2, true, 2))).toEqual([20, 10]);
                    expect(moveAlgorithm.computeInterceptPos(interceptor, buildFakeItem(20, 21, 2, true, 3.1))).toEqual([ 29.6547, 32.3042 ]);
                });
                it("如果目标往拦截者所在位置方向移动", function () {
                    expect(moveAlgorithm.computeInterceptPos(interceptor, buildFakeItem(15, 10, 4, true, 6))).toEqual([12.5, 10]);
                    expect(moveAlgorithm.computeInterceptPos(interceptor, buildFakeItem(20, 21, 2.1, true, 7.1))).toEqual([ 16.6762, 17.1084 ]);

                });
            });

            it("计算拦截点的pix坐标", function () {
                var interceptor = buildFakeItem(50, 50, 5);

                expect(moveAlgorithm.computeInterceptPos(interceptor, buildFakeItem(60, 40, 2.5, true, 3)))
                    .toEqual([ 65.7735, 45.7735 ]);

                expect(moveAlgorithm.computeInterceptPos(buildFakeItem(400, 700, 5),
                    buildFakeItem(800, 700, 5, true, 7))).toEqual([ 600, 500 ]);

                expect(moveAlgorithm.computeInterceptPos(interceptor, buildFakeItem(55, 45, 2, true, 7)))
                    .toEqual([ 52.8178, 42.8178 ]);
                expect(moveAlgorithm.computeInterceptPos(interceptor, buildFakeItem(55, 45, 2, true, 1)))
                    .toEqual([ 58.3333, 41.6667 ]);
            });
        });
    });

    describe("isInSameLine", function () {
        it("判断方向是否在同一直线附近", function () {
            expect(moveAlgorithm.isInSameLine(1.1, 4.9)).toBeTruthy();
            expect(moveAlgorithm.isInSameLine(4.8, 4.9)).toBeTruthy();
            expect(moveAlgorithm.isInSameLine(2, 4)).toBeFalsy();

            expect(moveAlgorithm.isInSameLine(1.1, 9, 16)).toBeTruthy();
            expect(moveAlgorithm.isInSameLine(12, 11.9, 16)).toBeTruthy();
            expect(moveAlgorithm.isInSameLine(6, 13.2, 16)).toBeFalsy();
        });
    });

    describe("findNearestReplaceGrid", function () {
        var fromGrid = [0, 0];
        fakeCurrentMapBuildableGrid = [];

        function initBuildableGrid() {
            var x = 0,
                y = 0;

            for (y = 0; y < config.map.mapGridHeight; y++) {
                fakeCurrentMapBuildableGrid[y] = [];
                for (x = 0; x < config.map.mapGridWidth; x++) {
                    fakeCurrentMapBuildableGrid[y][x] = 0;
                }
            }
        }

        function setBuildableGridArea(flag, start, end) {
            var x = 0,
                y = 0;

            for (y = start[1]; y <= end[1]; y++) {
                for (x = start[0]; x <= end[0]; x++) {
                    fakeCurrentMapBuildableGrid[y][x] = flag;
                }
            }
        }

//    function buildFakeTarget(buildableGrid, gridX, gridY) {
//        return  {
//            buildableGrid: buildableGrid,
//            gridX: gridX,
//            gridY: gridY
//        };
//    }

        beforeEach(function () {
            sandbox.stub(config, "map", {
                mapGridWidth: 10,
                mapGridHeight: 10
            });
            initBuildableGrid();
        });
        afterEach(function () {
        });

        describe("以目的点为基准，逆时针从内往外每层遍历寻找离出发点最近的可到达的点", function () {
            it("测试替代点在第一层的情况", function () {
                setBuildableGridArea(1, [1, 3], [3, 3]);
                setBuildableGridArea(1, [2, 2], [3, 2]);
                setBuildableGridArea(1, [1, 1], [2, 1]);

                expect(algorithm.findNearestReplaceGrid(fromGrid, [2, 2], fakeCurrentMapBuildableGrid)).
                    toEqual([1, 2]);
            });
            it("测试替代点在第二层的情况", function () {
                setBuildableGridArea(1, [2, 2], [4, 4]);
                setBuildableGridArea(1, [1, 1], [1, 5]);

                expect(algorithm.findNearestReplaceGrid(fromGrid, [3, 3], fakeCurrentMapBuildableGrid)).
                    toEqual([2, 1]);
            });
            it("测试“第二层中有方格在地图外，替代点在第三层”的情况", function () {
                setBuildableGridArea(1, [2, 0], [6, 3]);
                setBuildableGridArea(1, [1, 0], [1, 4]);

                expect(algorithm.findNearestReplaceGrid(fromGrid, [4, 1], fakeCurrentMapBuildableGrid)).
                    toEqual([2, 4]);
            });
//            it("如果遍历了整个地图都没有找到替代点，则返回目的点", function () {
//                setBuildableGridArea(1, [0, 0], [9, 9]);
//
//                expect(algorithm.findNearestReplaceGrid(fromGrid, [4, 1], fakeCurrentMapBuildableGrid)).
//                    toEqual([4, 1]);
//            });
        });
    });
});
