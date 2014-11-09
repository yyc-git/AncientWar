/**古代战争
 * 作者：YYC
 * 日期：2014-06-05
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("SmallMapFogLayer", function () {
    var layer = null;
    var sandbox = null;

    beforeEach(function () {
        layer = new SmallMapFogLayer();
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("绘制小地图迷雾", function () {
        describe("onenter中将小地图全部隐藏", function () {
            it("onenter中将小地图全部隐藏", function () {
                sandbox.stub(layer, "__hideAllSmallMap");
                layer.stubParentMethod(sandbox, "onEnter");

                layer.onEnter();

                expect(layer.__hideAllSmallMap).toCalledOnce();
            });
            it("测试全部隐藏小地图", function () {
                var fakeGraphics = sandbox.createSpyObj("fillMultipleDiamondBox");
                sandbox.stub(tool, "getSmallDiamondSize").returns(10);
                sandbox.stub(tool, "convertToSmallMapPix", function () {
                    return [1, 1];
                });
                sandbox.stub(window, "mapLayer", {
                    getSmallMapLeftHalfAngle: sandbox.stub().returns(0.1)
                });
                sandbox.stub(layer, "getGraphics").returns(fakeGraphics);
                sandbox.stub(window, "config", {
                    map: {
                        mapGridHeight: 10,
                        mapGridWidth: 10
                    }
                });

                layer.__hideAllSmallMap();

                expect(fakeGraphics.fillMultipleDiamondBox.firstCall.args[1].length).toEqual(10 * 10);
            });
        });
        it("每次主循环不清除画布", function () {
            var fakeContext =     {
                clearRect:sandbox.stub()
            };
            sandbox.stub(layer, "getContext", fakeContext);

            layer.clear();

            expect(fakeContext.clearRect.callCount).toEqual(0);
        });

        describe("显示已探索和可视区域", function () {
            beforeEach(function () {
            });
            afterEach(function () {
            });

            describe("获得新增的已探索和可视区域方格的pix坐标", function () {
                var hide = 0,
                    explore = 1,
                    visible = 2;
                var fovData = null;

                beforeEach(function () {
                    fovData = [
                        [explore, hide],
                        [visible, visible]
                    ];
                    sandbox.stub(window, "fogLayer", {
                        getFOVData: sandbox.stub().returns(fovData),
                        getExtendEdgeGridSize: sandbox.stub().returns(0),
                        getFogState: sandbox.stub().returns({
                            HIDE: hide
                        })
                    });
                    sandbox.stub(tool, "convertToSmallMapPix", function (j, i) {
                        return [i, j];
                    });
                });
                afterEach(function () {
                });

                describe("如果为第一次判断", function () {

                    beforeEach(function () {
                        layer.__lastFOVData = null;
                    });
                    afterEach(function () {
                    });

                    it("跳过超出地图的方格", function () {
                        sandbox.stub(tool, "isFogGridOutOfMap").returns(true);

                        var data = layer.__getAddedExploreOrVisiblePixPos();

                        expect(data.length).toEqual(0);
                    });
                    it("所有初始的已探索和可视区域方格均为新增方格", function () {
                        sandbox.stub(tool, "isFogGridOutOfMap").returns(false);

                        var data = layer.__getAddedExploreOrVisiblePixPos();

                        expect(data).toEqual([
                            [ 0, 0 ],
                            [ 1, 0 ],
                            [ 1, 1 ]
                        ]);
                    });
                    it("保存fovData", function () {
                        sandbox.stub(tool, "isFogGridOutOfMap").returns(false);

                        layer.__getAddedExploreOrVisiblePixPos();

                        expect(layer.__lastFOVData).toEqual(fovData);
                    });
                });

                describe("否则", function () {
                    beforeEach(function () {
                        layer.__getAddedExploreOrVisiblePixPos();
                    });
                    afterEach(function () {
                    });

                    it("跳过超出地图的方格", function () {
                        sandbox.stub(tool, "isFogGridOutOfMap").returns(true);

                        var data = layer.__getAddedExploreOrVisiblePixPos();

                        expect(data.length).toEqual(0);
                    });
                    it("获得新增的已探索和可视区域方格的pix坐标", function () {
                        fovData[0][1] = visible;
                        sandbox.stub(tool, "isFogGridOutOfMap").returns(false);

                        var data = layer.__getAddedExploreOrVisiblePixPos();

                        expect(data).toEqual([
                            [0, 1]
                        ]);
                    });
                });
            });

            it("设置context的模式为destination-out", function () {
            });
            it("绘制已探索和可视区域方格，使其显示出来", function () {
            });
        });
    });
});
