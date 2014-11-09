/**古代战争
 * 作者：YYC
 * 日期：2014-02-03
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("MapLayer", function () {
    var layer = null;
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        layer = new MapLayer();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("_createBufferCanvas", function () {
        it("创建离屏canvas", function () {
            layer._createBufferCanvas();

            expect(layer._mapBufferCanvas).toBeCanvas();
            expect(layer._mapBufferCanvas1).toBeCanvas();
            expect(layer._mapBufferCanvas2).toBeCanvas();
            expect(layer._mapBufferCanvas3).toBeCanvas();
            expect(layer._mapBufferCanvas4).toBeCanvas();
        });
    });

    describe("_setBufferCanvasSize", function () {
        var configMap = null,
            width = 0,
            height = 0;

        beforeEach(function () {
            layer._createBufferCanvas();
            sandbox.stub(layer, "getCanvasData").returns({
                width: 100,
                height: 100
            });
            configMap = {
                gridWidth: 60,
                gridHeight: 30,
                mapGridWidth: 60,
                mapGridHeight: 60,
                pixOffsetX: 300,
                pixOffsetY: 300
            };
            sandbox.stub(config, "map", configMap);
            width = configMap.mapGridWidth * configMap.gridWidth;
            height = configMap.mapGridHeight * configMap.gridHeight;
        });
        it("设置大的离屏canvas的大小，使画布的上下左右四个角与画布边缘留出一段距离（pixOffsetX、pixOffsetY）", function () {
            layer._setBufferCanvasSize();

            expect(layer.getMapBufferCanvasData().width).toEqual(width + configMap.pixOffsetX * 2);
            expect(layer.getMapBufferCanvasData().height).toEqual(height + configMap.pixOffsetY * 2);
        });
        it("设置四个小的离屏canvas的大小，大小为大的离屏canvas的1/4", function () {
            var w = (width + configMap.pixOffsetX * 2) / 2,
                h = (height + configMap.pixOffsetY * 2) / 2;

            layer._setBufferCanvasSize();

            expect(layer._mapBufferCanvas1.width).toEqual(w);
            expect(layer._mapBufferCanvas1.height).toEqual(h);
            expect(layer._mapBufferCanvas2.width).toEqual(w);
            expect(layer._mapBufferCanvas2.height).toEqual(h);
            expect(layer._mapBufferCanvas3.width).toEqual(w);
            expect(layer._mapBufferCanvas3.height).toEqual(h);
            expect(layer._mapBufferCanvas4.width).toEqual(w);
            expect(layer._mapBufferCanvas4.height).toEqual(h);
        });
//        it("如果离屏canvas的大小小于地图画布大小，则令其等于地图画布大小", function () {
//            var configMap = {
//                gridWidth: 1,
//                gridHeight: 1,
//                mapGridWidth: 1,
//                mapGridHeight: 1,
//                pixOffsetX: 1,
//                pixOffsetY: 1
//            };
//            sandbox.stub(config, "map", configMap);
//
//            layer._setBufferCanvasSize();
//
//            expect(layer.getMapBufferCanvasData().width).toEqual(100);
//            expect(layer.getMapBufferCanvasData().height).toEqual(100);
//        });
    });

    describe("_buildMap", function () {
        describe("绘制整个地图到大的离屏canvas中", function () {
            var context = null;

            function buildFakeImgLoader() {
                sandbox.stub(window, "imgLoader", {
                    get: function () {
                        return null;
                    }
                });
            }

            function buildFakeConfig() {
                sandbox.stub(config, "map", {
                    gridWidth: 60,
                    gridHeight: 30,
                    mapGridWidth: 3,
                    mapGridHeight: 2,
                    pixOffsetX: 300,
                    pixOffsetY: 300
                });
            }

            function buildFakeImg() {
                var mapElement = [];

                for (var i = 0; i < config.map.mapGridHeight; i++) {
                    mapElement[i] = [];

                    for (var j = 0; j < config.map.mapGridWidth; j++) {
                        mapElement[i][j] = 0;
                    }
                }

                sandbox.stub(LevelManager, "getInstance").returns({
                    getLevelData: sandbox.stub().returns({
                        mapElement: mapElement
                    })
                });
            }

            beforeEach(function () {
                layer._createBufferCanvas();
                context = sandbox.createStubObj("drawImage");
                sandbox.stub(layer._mapBufferCanvas, "getContext").returns(context);

                buildFakeImgLoader();
                buildFakeConfig();
                buildFakeImg();
            });
            afterEach(function () {
            });

            it("根据levelData.mapElement来绘制对应的地图元素", function () {
                sandbox.stub(layer, "getImgByIndex").returns("desert");

                layer._buildMap();

                expect(context.drawImage.getCall(2).args[0]).toEqual("desert");
            });
            it("创建菱形地图。由矩形图片叠加而成，并加上pixOffset，从而使地图四个角与画布边缘留出一段距离", function () {
                sandbox.stub(tool, "computeOnePixSize").returns(0);

                layer._buildMap();

                //第1行
                expect(
                    [context.drawImage.getCall(0).args[1], context.drawImage.getCall(0).args[2]]
                ).toEqual([300, 330]);
                expect(
                    [context.drawImage.getCall(1).args[1], context.drawImage.getCall(1).args[2]]
                ).toEqual([ 330, 315]);
                expect(
                    [context.drawImage.getCall(2).args[1], context.drawImage.getCall(2).args[2]]
                ).toEqual([ 360, 300]);
                //第2行
                expect(
                    [context.drawImage.getCall(3).args[1], context.drawImage.getCall(3).args[2]]
                ).toEqual([330, 345]);
                expect(
                    [context.drawImage.getCall(4).args[1], context.drawImage.getCall(4).args[2]]
                ).toEqual([ 360, 330]);
                expect(
                    [context.drawImage.getCall(5).args[1], context.drawImage.getCall(5).args[2]]
                ).toEqual([ 390, 315]);
            });
//        it("增加单个地形图片的显示的大小（增加0.5），从而相邻地形图片间通过覆盖来解决空隙的问题", function () {
//            layer._buildMap();
//
//            expect(context.drawImage.getCall(0).args[3]).toEqual(60.5);
//            expect(context.drawImage.getCall(0).args[4]).toEqual(30.5);
//        });
            it("移动矩形图片，使其重叠，从而解决空隙问题", function () {
                sandbox.stub(tool, "computeOnePixSize").returns(2);

                layer._buildMap();

                expect(
                    [context.drawImage.getCall(2).args[1], context.drawImage.getCall(2).args[2]]
                ).toEqual([ 358, 302 ]);
            });
        });

        it("将大的离屏canvas的地图拷贝到4个小的离屏canvas中", function () {
            var context = sandbox.createSpyObj("drawImage"),
                width = 100,
                height = 200,
                fakeBigCanvas = {
                    width: width,
                    height: height
                };
            layer._createBufferCanvas();
            sandbox.stub(layer, "_mapBufferCanvas", fakeBigCanvas);
            sandbox.stub(layer._mapBufferCanvas1, "getContext").returns(context);
            sandbox.stub(layer._mapBufferCanvas2, "getContext").returns(context);
            sandbox.stub(layer._mapBufferCanvas3, "getContext").returns(context);
            sandbox.stub(layer._mapBufferCanvas4, "getContext").returns(context);

            layer._copyBigToSmallBufferCanvas();

            expect(context.drawImage.callCount).toEqual(4);
            expect(context.drawImage.args).toEqual([
                [
                    fakeBigCanvas,
                    0,
                    0,
                    50,
                    100,
                    0,
                    0,
                    50,
                    100
                ],
                [
                    fakeBigCanvas,
                    50,
                    0,
                    50,
                    100,
                    0,
                    0,
                    50,
                    100
                ],
                [
                    fakeBigCanvas,
                    0,
                    100,
                    50,
                    100,
                    0,
                    0,
                    50,
                    100
                ],
                [
                    fakeBigCanvas,
                    50,
                    100,
                    50,
                    100,
                    0,
                    0,
                    50,
                    100
                ]
            ]);
        });
    });

    describe("_handleRoll", function () {
        var fakeSubject = null;

        function buildFakeMapRoll() {
            layer._mapRoll = {
                handleRoll: sandbox.stub()
            };
        }

        beforeEach(function () {
            sandbox.stub(layer, "getCanvasData").returns({
                width: 10,
                height: 20
            });
            layer._createBufferCanvas();
            buildFakeMapRoll();

            fakeSubject = sandbox.createSpyObj("publishAll");
            sandbox.stub(YE.Director, "getInstance").returns({
                getCurrentScene: sandbox.stub().returns({
                    subject: fakeSubject
                })
            });
        });

        it("调用mapRoll的hanleRoll方法", function () {
            layer._handleRoll();

            expect(layer._mapRoll.handleRoll).toCalledOnce();
        });

        describe("如果地图正在滚动", function () {
            beforeEach(function () {
                layer._mapRoll.handleRoll.returns("update");
            });

            it("画布标志为change", function () {
                sandbox.stub(layer, "setStateChange");

                layer._handleRoll();

                expect(layer.setStateChange).toCalledOnce();
            });
            it("触发观察者，传入“roll”参数", function () {
                layer._handleRoll();

                expect(fakeSubject.publishAll).toCalledWith(null, "roll");
            });
        });

        it("否则，触发观察者，传入“not roll”参数", function () {
            layer._mapRoll.handleRoll.returns("not roll");

            layer._handleRoll();

            expect(fakeSubject.publishAll).toCalledWith(null, "not roll");
        });
    });

    describe("获得地图数据", function () {
        beforeEach(function () {
            sandbox.stub(config, "map", {
                gridWidth: 20,
                gridHeight: 10
            });
        });

        describe("getLeftHalfAngle", function () {
            it("获得地图左角的一半的角度值", function () {
                expect(layer.getLeftHalfAngle()).toEqual(Math.atan(0.5));
            });
        });

        describe("getUpHalfAngle", function () {
            it("获得地图上角的一半的角度值", function () {
                expect(layer.getUpHalfAngle()).toEqual(Math.atan(2));
            });
        });
    });

    describe("_initPassableGrid", function () {
        var terrainData = null;

        function buildInitGrid() {
            sandbox.stub(LevelManager, "getInstance").returns({
                getLevelData: sandbox.stub().returns({
                    terrain: terrainData
                })
            });

            sandbox.stub(YYC.Tool.extend, "extendDeep");
        }

        beforeEach(function () {
            terrainData = [
                []
            ];
            buildInitGrid();
        });

        it("关卡数据中的地形数据为初始的currentMapPassableGridWithUnit或currentMapPassableGrid数组", function () {
            layer._initPassableGrid();
            layer._initPassableGrid(true);

            expect(YYC.Tool.extend.extendDeep).toCalledTwice();
            expect(YYC.Tool.extend.extendDeep.firstCall).toCalledWith(terrainData);
            expect(YYC.Tool.extend.extendDeep.secondCall).toCalledWith(terrainData);
        });
    });

    describe("buildPassableGrid", function () {
        var terrainData = null;

        function buildInitGrid() {
            sandbox.stub(LevelManager, "getInstance").returns({
                getLevelData: sandbox.stub().returns({
                    terrain: terrainData
                })
            });

            sandbox.stub(YYC.Tool.extend, "extendDeep").returns([
                [ 0, 0, 0, 0 ],
                [ 0, 0, 0, 0 ],
                [ 0, 0, 0, 0 ]
            ]);
        }

        beforeEach(function () {
            terrainData = [
                []
            ];
            buildInitGrid();
        });

        describe("如果参数isWithUnit为true，则设置currentMapPassableGridWithUnit数组", function () {
            function buildFakeItem(passableGrid, gridX, gridY, tag, uid, isDead) {
                return {
                    passableGrid: passableGrid,
                    gridX: gridX,
                    gridY: gridY,
                    hasTag: function (t) {
                        tag = tag || "resource";
                        return t === tag;
                    },
                    getUid: function () {
                        return uid;
                    },
                    isDead: function () {
                        return isDead || false;
                    }
                }
            }

            it("如果精灵已死亡，则精灵所在方格为可通过", function () {
                var item = buildFakeItem(null, 0, 0, "unit", 1, true);
                sandbox.stub(window, "entityLayer", {
                    getChilds: function () {
                        return [item];
                    }
                });

                layer.buildPassableGrid(true);

                expect(layer.onlyUnitPassableGridData).toEqual([
                    [0, 0, 0, 0] ,
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ]);
            });
            it("如果精灵不是方格精灵，则精灵所在方格为可通过", function () {
                sandbox.stub(tool, "isGridSprite").returns(false);
                sandbox.stub(window, "entityLayer", {
                    getChilds: function () {
                        return [
                            {}
                        ];
                    }
                });

                layer.buildPassableGrid(true);

                expect(layer.onlyUnitPassableGridData).toEqual([
                    [0, 0, 0, 0] ,
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ]);
            });

            describe("否则", function () {
                beforeEach(function () {
                    sandbox.stub(tool, "isGridSprite").returns(true);
                });
                afterEach(function () {
                });

                it("当前单位精灵所在方格可通过，其余单位精灵所在方格为不可通过；其余精灵则根据其passableGrid设置地形数据，0为可通过，1为不可通过", function () {
                    var item1 = buildFakeItem(null, 0, 0, "unit", 1),
                        item2 = buildFakeItem([
                            [1, 0, 1]
                        ], 0, 1
                            , 2) ,
                        item3 = buildFakeItem([
                            [0, 0, 1]
                        ], 1, 2
                            , 3);
                    sandbox.stub(window, "entityLayer", {
                        getChilds: function () {
                            return [item1, item2, item3];
                        }
                    });

                    layer.buildPassableGrid(true, 4);

                    expect(layer.onlyUnitPassableGridData).toEqual([
                        [1, 0, 0, 0] ,
                        [1, 0, 1, 0],
                        [0, 0, 0, 1]
                    ]);
                });
            });
        });

        describe("否则，则设置currentMapPassableGrid数组", function () {
            function buildFakeItem(passableGrid, gridX, gridY, tag, isBuildState, isDead) {
                return {
                    passableGrid: passableGrid,
                    gridX: gridX,
                    gridY: gridY,
                    hasTag: function (t) {
                        tag = tag || "resource";
                        return t === tag;
                    },
                    isBuildState: function () {
                        return  isBuildState || false;
                    },
                    isDead: function () {
                        return isDead || false;
                    }
                }
            }

            it("如果精灵已死亡，则精灵所在方格为可通过", function () {
                var item = buildFakeItem([1, 1], 0, 0, "building", false, true);
                sandbox.stub(window, "entityLayer", {
                    getChildsByTag: function () {
                        return [item];
                    }
                });

                layer.buildPassableGrid();

                expect(layer.passableGridData).toEqual([
                    [0, 0, 0, 0] ,
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ]);
            });
            it("根据精灵的passableGrid设置地形数据，0为可通过，1为不可通过", function () {
                var item1 = buildFakeItem([
                        [1, 0, 1]
                    ], 0, 1) ,
                    item2 = buildFakeItem([
                        [0, 0, 1]
                    ], 1, 2);
                sandbox.stub(window, "entityLayer", {
                    getChildsByTag: function () {
                        return [item1, item2];
                    }
                });

                layer.buildPassableGrid();

                expect(layer.passableGridData).toEqual([
                    [0, 0, 0, 0] ,
                    [1, 0, 1, 0],
                    [0, 0, 0, 1]
                ]);
            });
        });
    });

});
