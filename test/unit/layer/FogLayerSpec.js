/**古代战争
 * 作者：YYC
 * 日期：2014-05-13
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("FogLayer", function () {
    var layer = null;
    var sandbox = null;

    beforeEach(function () {
        layer = new FogLayer();
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("_computeFOV", function () {
        function initData() {
            sandbox.stub(config, "map", {
                mapGridWidth: 5,
                mapGridHeight: 5
            });

            layer._initData();
        }

        function buildSprite(sightPointGridPos, sight, team) {
            var sprite = {
                sight: sight,
                getSightPoint: sandbox.stub().returns(sightPointGridPos)
            };

            if (team) {
                sprite.team = team;
            }

            return sprite;
        }

        function changeSpriteSightPoint(sprite, sightPointGridPos) {
            sprite.getSightPoint = sandbox.stub().returns(sightPointGridPos);
        }

        beforeEach(function () {
            sandbox.stub(YE, "Director", {
                getInstance: function () {
                    return {
                        getCurrentScene: sandbox.stub().returns({
                            playerTeam: "blue"
                        })
                    }
                }
            });
        });

        it("fovData沿地图左上和右上边缘往外扩extendEdgeGridSize个方格", function () {
            layer._extendEdgeGridSize = 2;
            initData();
            var sprite1 = buildSprite([0, 0], 2, "blue"),
                sprite2 = buildSprite([4, 1], 1, "blue");
            sandbox.stub(window, "entityLayer", {
                getChilds: sandbox.stub().returns([
                    sprite1, sprite2
                ])
            });

            layer._computeFOV();

            expect(layer._fovData).toEqual([
                [ 2, 2, 2, 0, 0, 0, 0 ],
                [ 2, 2, 2, 0, 0, 0, 0 ],
                [ 2, 2, 2, 2, 2, 2, 0 ],
                [ 2, 2, 2, 2, 2, 2, 0 ],
                [ 2, 2, 2, 2, 2, 2, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0, 0, 0 ]
            ]);
        });
        it("根据己方实体的视线范围（大小为[sightPoint - sight,sightPoint+sight]菱形区域）和地图已探索区域数据，" +
            "计算标志了地图不可见、已探索、可见区域的迷雾数据fovData", function () {
            layer._extendEdgeGridSize = 0;
            initData();
            var sprite1 = buildSprite([0, 0], 2, "blue"),
                sprite2 = buildSprite([3, 3], 1, "blue"),
                sprite3 = buildSprite([2, 1], 1, "blue"),
                sprite4 = buildSprite([2, 3], 2, "red"),
                sprite5 = buildSprite([1, 3], 2);
            sandbox.stub(window, "entityLayer", {
                getChilds: sandbox.stub().returns([
                    sprite1, sprite2, sprite3, sprite4, sprite5
                ])
            });

            layer._computeFOV();

            expect(layer._fovData).toEqual([
                [ 2, 2, 2, 2, 0 ],
                [ 2, 2, 2, 2, 0 ],
                [ 2, 2, 2, 2, 2 ],
                [ 0, 0, 2, 2, 2 ],
                [ 0, 0, 2, 2, 2 ]
            ]);

            changeSpriteSightPoint(sprite1, [3, 0]);
            layer._computeFOV();

            expect(layer._fovData).toEqual([
                [ 1, 2, 2, 2, 2 ],
                [ 1, 2, 2, 2, 2 ],
                [ 1, 2, 2, 2, 2 ],
                [ 0, 0, 2, 2, 2 ],
                [ 0, 0, 2, 2, 2 ]
            ]);

            changeSpriteSightPoint(sprite1, [3, 4]);
            changeSpriteSightPoint(sprite3, [2, 2]);
            layer._computeFOV();

            expect(layer._fovData).toEqual([
                [ 1, 1, 1, 1, 1 ],
                [ 1, 2, 2, 2, 1 ],
                [ 1, 2, 2, 2, 2 ],
                [ 0, 2, 2, 2, 2 ],
                [ 0, 2, 2, 2, 2 ]
            ]);
        });
    });
});
