/**古代战争
 * 作者：YYC
 * 日期：2014-02-03
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("tool", function () {
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("坐标转换", function () {
        beforeEach(function () {
            sandbox.stub(config, "map", {
                pixOffsetX: 10,
                pixOffsetY: 5,
                gridWidth: 20,
                gridHeight: 10,
                mapGridWidth: 2,
                mapGridHeight: 2
            });
            sandbox.stub(tool, "computeOnePixSize").returns(2);
        });
        afterEach(function () {
        });

        describe("convertToGrid", function () {
            function floor(grid) {
                return [Math.floor(grid[0]), Math.floor(grid[1])];
            }

            it("pix转换为方格坐标", function () {
                expect(floor(tool.convertToGrid(10, 16))).not.toEqual([0, 0]);

                expect(floor(tool.convertToGrid(15, 14))).toEqual([0, 0]);
                expect(floor(tool.convertToGrid(30, 14))).toEqual([1, 0]);
                expect(floor(tool.convertToGrid(33, 20))).toEqual([0, 1]);
                expect(floor(tool.convertToGrid(40, 15))).toEqual([1, 1]);
            });
            it("参数可为数组", function () {
                expect(floor(tool.convertToGrid([40, 15]))).toEqual([1, 1]);
            });
        });

        describe("convertToPix", function () {
            it("方格坐标转换为方格菱形左角的pix坐标", function () {
                expect(tool.convertToPix(0, 0)).toEqual([10, 15]);
                expect(tool.convertToPix(1, 0)).toEqual([19, 11]);
                expect(tool.convertToPix(0, 1)).toEqual([19, 19]);
                expect(tool.convertToPix(1, 1)).toEqual([28, 15]);

            });
            it("参数可为数组", function () {
                expect(tool.convertToPix([1, 1])).toEqual([28, 15]);
            });
        });
    });

    describe("convertToGridSize", function () {
        it("将pix转换为方格大小", function () {
            sandbox.stub(config, "map", {
                gridWidth: 10,
                gridHeight: 20
            });

            expect(tool.convertToGridSize(10)).toEqual(10 * 2 / (10 + 20));
        });
    });

    describe("convertToSmallMapPixSize", function () {
        it("将大地图的pix大小转换小地图pix大小", function () {
            var bigMapPixSize = 10;
            sandbox.stub(config, "map", {
                scale: 10
            });

            var result = tool.convertToSmallMapPixSize(bigMapPixSize);

            expect(result).toEqual(1);
        });
    });

    describe("isInPolygon，判断点是否在多边形内", function () {
        beforeEach(function () {
        });
        afterEach(function () {
        });

        it("如果点在多边形内，则返回true", function () {
            var point = [3, 3];

            var p1 = [1, 4],
                p2 = [1, 2],
                p3 = [3, 1],
                p4 = [4, 2],
                p5 = [4, 3];
            var polygon = [p1, p2, p3, p4, p5];

            expect(tool.isInPolygon(point, polygon)).toBeTruthy();
        });
        it("如果一侧割线穿过多边形的结点且点在多边形内，则返回true", function () {
            var point = [10, 20];

            var polygon = [
                [5, 20],
                [10, 15],
                [15, 20],
                [10, 25]
            ];

            expect(tool.isInPolygon(point, polygon)).toBeTruthy();
        });
        it("如果一侧割线穿过多边形的结点且点不在多边形内，则返回false", function () {
            var point = [12, 15];

            var polygon = [
                [5, 20],
                [10, 15],
                [15, 20],
                [10, 25]
            ];

            expect(tool.isInPolygon(point, polygon)).toBeFalsy();
        });
    });

    describe("isIntersect，判断两个多边形是否相交", function () {
        beforeEach(function () {
        });
        afterEach(function () {
        });

        it("若相交，返回true", function () {
            var polygon1 = [
                    [5, 20],
                    [10, 20],
                    [10, 30],
                    [5, 30]
                ],
                polygon2 = [
                    [8, 25],
                    [12, 25],
                    [12, 28],
                    [8, 28]
                ];

            expect(tool.isIntersect(polygon1, polygon2)).toBeTruthy()
        });
        it("若不相交，返回false", function () {
            var polygon1 = [
                    [5, 20],
                    [10, 20],
                    [10, 30],
                    [5, 30]
                ],
                polygon2 = [
                    [18, 25],
                    [22, 25],
                    [22, 28],
                    [18, 28]
                ];

            expect(tool.isIntersect(polygon1, polygon2)).toBeFalsy()
        });
    });

    describe("isInCircleRange", function () {
        beforeEach(function () {
        });
        afterEach(function () {
        });

        it("判断两点是否相差radius距离", function () {
            var point1 = [1, 1],
                point2 = [3, 1];

            expect(tool.isInCircleRange(point1, point2, 1)).toBeFalsy();
            expect(tool.isInCircleRange(point1, point2, 3)).toBeTruthy();
        });
    });

    describe("isInPointToDiamondBoxEdgeDistance，判断点到菱形方块的距离是否小于distance", function () {
        var distance = 0,
            point = null,
            diamondBoxLeftUpVertex = null;

        function judge(point1, point2) {
            expect(tool.isInPointToDiamondBoxEdgeDistance(point1, diamondBoxLeftUpVertex, distance)).toBeFalsy();
            expect(tool.isInPointToDiamondBoxEdgeDistance(point2, diamondBoxLeftUpVertex, distance)).toBeTruthy();
        }

        beforeEach(function () {
            distance = 1;
            diamondBoxLeftUpVertex = [2, 2];
        });

        it("点在菱形方块上方", function () {
            judge([2.5, 1], [2.5, 1.1]);
        });
        it("点在菱形方块下方", function () {
            judge([2.5, 4], [2.5, 3.9]);
        });
        it("点在菱形方块左方", function () {
            judge([1, 2.5], [1.1, 2.5]);
        });
        it("点在菱形方块右方", function () {
            judge([4, 2.5], [3.9, 2.5]);
        });
        it("点在菱形方块左上方", function () {
            judge([1 , 1], [1.5, 1.5]);
        });
        it("点在菱形方块右上方", function () {
            judge([4 , 1], [3.5, 1.5]);
        });
        it("点在菱形方块右下方", function () {
            judge([4 , 4], [3.5, 3.5]);
        });
        it("点在菱形方块左下方", function () {
            judge([1 , 4], [1.5, 3.5]);
        });
    });

    describe("roundDownGrid", function () {
        beforeEach(function () {
        });
        afterEach(function () {
        });

        it("对方格坐标向下取整并返回", function () {
            var grid = [1.1, 2.8];

            expect(tool.roundDownGrid(grid)).toEqual([1, 2]);
        });
    });

    describe("roundingNum", function () {
        it("对数字进行四舍五入", function () {
            var num1 = 1.3,
                num2 = 1.75;

            expect(tool.roundingNum(num1)).toEqual(1);
            expect(tool.roundingNum(num2)).toEqual(2);
        });
    });

});
