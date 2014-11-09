/**古代战争
 * 作者：YYC
 * 日期：2014-03-10
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("produceAlgorithm", function () {
    var algorithm = produceAlgorithm,
    sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });
    //最多寻找2层，如果没有找到位置，则返回null
    describe("findPlaceableGrid", function () {
        var fakeTarget = null,
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

        function buildFakeTarget(buildableGrid, gridX, gridY) {
            return  {
                buildableGrid: buildableGrid,
                gridX: gridX,
                gridY: gridY
            };
        }

        beforeEach(function () {
            sandbox.stub(config, "map",  {
                mapGridWidth: 10,
                mapGridHeight: 10
            })     ;
            initBuildableGrid();
        });
        afterEach(function () {
            sandbox.restore();
        });

        describe("找到taget附近可放置的方格。从taget左上角的左边一格开始寻找，每层寻找顺序为沿着target逆时针寻找，层次顺序为内->外", function () {
            describe("测试寻找第一层", function () {
                describe("测试寻找左侧", function () {
                    it("测试1", function () {
                        fakeTarget = buildFakeTarget([1], 1, 1);

                        expect(algorithm.findPlaceableGrid(fakeTarget, fakeCurrentMapBuildableGrid)).toEqual([0, 1]);
                    });
                    it("测试2", function () {
                        fakeTarget = buildFakeTarget([1], 1, 1);
                        fakeCurrentMapBuildableGrid[1][0] = 1;

                        expect(algorithm.findPlaceableGrid(fakeTarget, fakeCurrentMapBuildableGrid)).toEqual([0, 2]);
                    });
                    it("测试3", function () {
                        fakeTarget = buildFakeTarget([
                            [1, 1],
                            [1, 1]
                        ], 1, 1);
                        setBuildableGridArea(1, [0,1], [0,2]);

                        expect(algorithm.findPlaceableGrid(fakeTarget, fakeCurrentMapBuildableGrid)).toEqual([0, 3]);
                    });
                });

                describe("测试寻找下侧", function () {
                    it("测试1", function () {
                        fakeTarget = {
                            buildableGrid: [
                                [1, 1, 1],
                                [1, 1, 1],
                                [1, 1, 1]
                            ],
                            gridX: 1,
                            gridY: 1
                        };
                        setBuildableGridArea(1, [0,1], [0,4]);

                        expect(algorithm.findPlaceableGrid(fakeTarget, fakeCurrentMapBuildableGrid)).toEqual([1, 4]);
                    });
                    it("测试2", function () {
                        fakeTarget = {
                            buildableGrid: [1],
                            gridX: 1,
                            gridY: 1
                        };
                        setBuildableGridArea(1, [0,1], [0,2]);
                        fakeCurrentMapBuildableGrid[2][1] = 1;

                        expect(algorithm.findPlaceableGrid(fakeTarget, fakeCurrentMapBuildableGrid)).toEqual([2, 2]);
                    });
                    it("测试3", function () {
                        fakeTarget = {
                            buildableGrid: [
                                [1, 1],
                                [1, 1]
                            ],
                            gridX: 1,
                            gridY: 1
                        };
                        setBuildableGridArea(1, [0,1], [0,3]);
                        setBuildableGridArea(1, [1,3], [2,3]);

                        expect(algorithm.findPlaceableGrid(fakeTarget, fakeCurrentMapBuildableGrid)).toEqual([3, 3]);
                    });
                });

                describe("测试寻找右侧", function () {
                    it("测试1", function () {
                        fakeTarget = {
                            buildableGrid: [
                                [1]
                            ],
                            gridX: 1,
                            gridY: 1
                        };
                        setBuildableGridArea(1, [0,1], [0,2]);
                        setBuildableGridArea(1, [1,2], [2,2]);

                        expect(algorithm.findPlaceableGrid(fakeTarget, fakeCurrentMapBuildableGrid)).toEqual([2, 1]);
                    });
                });

                describe("测试寻找上侧", function () {
                    it("测试1", function () {
                        fakeTarget = {
                            buildableGrid: [
                                [1]
                            ],
                            gridX: 1,
                            gridY: 1
                        };
                        setBuildableGridArea(1, [0,0], [2,2]);
                        fakeCurrentMapBuildableGrid[0][0] = 0;

                        expect(algorithm.findPlaceableGrid(fakeTarget, fakeCurrentMapBuildableGrid)).toEqual([0, 0]);
                    });
                });

                describe("如果当前方格超出地图，则进行下一格判断", function () {
                    it("测试1", function () {
                        fakeTarget  = buildFakeTarget([
                            [1, 1],
                            [1, 1]
                        ], 0, 0);

                        expect(algorithm.findPlaceableGrid(fakeTarget, fakeCurrentMapBuildableGrid)).
                            toEqual([0, 2]);
                    });
                    it("测试2", function () {
                        fakeTarget = buildFakeTarget([
                            [1]
                        ], 0, 9);

                        expect(algorithm.findPlaceableGrid(fakeTarget, fakeCurrentMapBuildableGrid)).
                            toEqual([1, 9]);
                    });
                });
            });

            describe("测试寻找第二层", function () {
                it("测试寻找第二层左侧", function () {
                    fakeTarget = {
                        buildableGrid: [
                            [1]
                        ],
                        gridX: 2,
                        gridY: 2
                    };
                    setBuildableGridArea(1, [1,1], [3,3]);

                    expect(algorithm.findPlaceableGrid(fakeTarget, fakeCurrentMapBuildableGrid)).
                        toEqual([0, 1]);
                });
                it("测试寻找第二层下侧", function () {
                    fakeTarget = {
                        buildableGrid: [
                            [1]
                        ],
                        gridX: 2,
                        gridY: 2
                    };
                    setBuildableGridArea(1, [1,1], [3,3]);
                    setBuildableGridArea(1, [0,1], [0,4]);

                    expect(algorithm.findPlaceableGrid(fakeTarget, fakeCurrentMapBuildableGrid)).
                        toEqual([1, 4]);
                });
            });

            it("如果第二层也没有找到，则返回null", function () {
                fakeTarget = {
                    buildableGrid: [
                        [1]
                    ],
                    gridX: 2,
                    gridY: 2
                };
                setBuildableGridArea(1, [0,0], [4,4]);

                expect(algorithm.findPlaceableGrid(fakeTarget, fakeCurrentMapBuildableGrid)).
                    toBeNull();
            });
        });
    });
});
