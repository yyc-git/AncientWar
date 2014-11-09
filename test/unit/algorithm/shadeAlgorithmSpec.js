/**古代战争
 * 作者：YYC
 * 日期：2014-02-13
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("遮挡算法", function () {
    var algorithm = shadeAlgorithm;
    var sandbox = null;

    function buildSingleSprite(x, y) {
        return {
            gridX: x,
            gridY: y
        };
    }

    function buildMutilSprite(x, y) {
        return {
            buildableGrid: [
                [1, 1, 1],
                [1, 1, 1],
                [1, 1, 1]
            ],
            gridX: x,
            gridY: y
        };
    }

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("isShade，判断是否遮挡", function () {
        it("测试“两者都是单个方格的精灵”的判断", function () {
            var targetSprite1 = buildSingleSprite(5, 4),
                targetSprite2 = buildSingleSprite(6, 4),
                targetSprite3 = buildSingleSprite(6, 5),
                targetSprite4 = buildSingleSprite(6, 6),
                targetSprite5 = buildSingleSprite(5, 6),
                targetSprite6 = buildSingleSprite(4, 6),
                targetSprite7 = buildSingleSprite(4, 5),
                targetSprite8 = buildSingleSprite(4, 4);
            var relativeSprite = buildSingleSprite(5, 5);

            expect(algorithm.isShade(targetSprite1, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite2, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite3, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite4, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite5, relativeSprite)).toBeTruthy();
            expect(algorithm.isShade(targetSprite6, relativeSprite)).toBeTruthy();
            expect(algorithm.isShade(targetSprite7, relativeSprite)).toBeTruthy();
            expect(algorithm.isShade(targetSprite8, relativeSprite)).toBeTruthy();
        });
        it("测试“一个是单个方格的精灵，另一个是多个方格精灵”的判断", function () {
            var targetSprite1 = buildSingleSprite(5, 4),
                targetSprite2 = buildSingleSprite(8, 4),
                targetSprite3 = buildSingleSprite(8, 5),
                targetSprite4 = buildSingleSprite(8, 8),
                targetSprite5 = buildSingleSprite(6, 8),
                targetSprite6 = buildSingleSprite(4, 8),
                targetSprite7 = buildSingleSprite(4, 5),
                targetSprite8 = buildSingleSprite(4, 4);
            var relativeSprite = buildMutilSprite(5, 5);

            expect(algorithm.isShade(targetSprite1, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite2, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite3, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite4, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite5, relativeSprite)).toBeTruthy();
            expect(algorithm.isShade(targetSprite6, relativeSprite)).toBeTruthy();
            expect(algorithm.isShade(targetSprite7, relativeSprite)).toBeTruthy();
            expect(algorithm.isShade(targetSprite8, relativeSprite)).toBeTruthy();

            targetSprite1 = buildMutilSprite(3, 2);
            targetSprite2 = buildMutilSprite(6, 2);
            targetSprite3 = buildMutilSprite(6, 5);
            targetSprite4 = buildMutilSprite(6, 6);
            targetSprite5 = buildMutilSprite(3, 6);
            targetSprite6 = buildMutilSprite(2, 6);
            targetSprite7 = buildMutilSprite(2, 5);
            targetSprite8 = buildMutilSprite(2, 2);
            relativeSprite = buildSingleSprite(5, 5);

            expect(algorithm.isShade(targetSprite1, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite2, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite3, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite4, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite5, relativeSprite)).toBeTruthy();
            expect(algorithm.isShade(targetSprite6, relativeSprite)).toBeTruthy();
            expect(algorithm.isShade(targetSprite7, relativeSprite)).toBeTruthy();
            expect(algorithm.isShade(targetSprite8, relativeSprite)).toBeTruthy();
        });
        it("测试“两者都是多个方格的精灵”的判断", function () {
            var targetSprite1 = buildMutilSprite(4, 2),
                targetSprite2 = buildMutilSprite(8, 2),
                targetSprite3 = buildMutilSprite(8, 5),
                targetSprite4 = buildMutilSprite(8, 8),
                targetSprite5 = buildMutilSprite(6, 8),
                targetSprite6 = buildMutilSprite(3, 8),
                targetSprite7 = buildMutilSprite(2, 6),
                targetSprite8 = buildMutilSprite(1, 1);
            var relativeSprite = buildMutilSprite(5, 5);

            expect(algorithm.isShade(targetSprite1, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite2, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite3, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite4, relativeSprite)).toBeFalsy();
            expect(algorithm.isShade(targetSprite5, relativeSprite)).toBeTruthy();
            expect(algorithm.isShade(targetSprite6, relativeSprite)).toBeTruthy();
            expect(algorithm.isShade(targetSprite7, relativeSprite)).toBeTruthy();
            expect(algorithm.isShade(targetSprite8, relativeSprite)).toBeTruthy();
        });
    });

    describe("reSort，根据遮挡关系，按从远到近的顺序重新排列精灵", function () {
        it("测试“都是单个方格的精灵”", function () {
            var targetSprite1 = buildSingleSprite(5, 4),
                targetSprite2 = buildSingleSprite(6, 4),
                targetSprite3 = buildSingleSprite(6, 5),
                targetSprite4 = buildSingleSprite(6, 6);
            var relativeSprite = buildSingleSprite(5, 5);
            var sprites = [relativeSprite, targetSprite4, targetSprite1, targetSprite2, targetSprite3];

            algorithm.reSort(sprites);

            expect(sprites).toEqual([targetSprite2, targetSprite3, targetSprite4, targetSprite1, relativeSprite]);
        });
        it("测试多个单格精灵和一个多格精灵的情况", function () {
            var targetSprite1 = buildSingleSprite(5, 4),
                targetSprite2 = buildSingleSprite(8, 4),
                targetSprite3 = buildSingleSprite(8, 5);
            var relativeSprite = buildMutilSprite(5, 5);

            var sprites = [relativeSprite, targetSprite1, targetSprite3, targetSprite2];

            algorithm.reSort(sprites);

            expect(sprites).toEqual([targetSprite2, targetSprite3, targetSprite1, relativeSprite]);
        });
        it("测试多个多格精灵和一个单格精灵的情况", function () {
            var targetSprite1 = buildSingleSprite(4, 0),
                targetSprite2 = buildMutilSprite(4, 1),
                targetSprite3 = buildMutilSprite(5, 5);

            var sprites = [targetSprite3, targetSprite1, targetSprite2];

            algorithm.reSort(sprites);

            expect(sprites).toEqual([targetSprite1, targetSprite2, targetSprite3]);
        });
    });

    describe("bubbleSort", function () {
        beforeEach(function () {
        });
        afterEach(function () {
        });

        it("冒泡排序", function () {
            var func = function (a, b) {
                if (a.a > b.a) {
                    return 1
                }
                return -1;
            }
//            var arr = [2,1,3,5,4];
            var arr = [
                {a: 2},
                {a: 1},
                {a: 3}
            ];

            algorithm.bubbleSort(func, arr);

            expect(arr).toEqual([
                {a: 1},
                {a: 2},
                {a: 3}
            ]);
        });
    });


//    describe("setZOrder", function () {
//        it("按照精灵的层次顺序，依次设置每个精灵的ZOrder", function () {
//            var fakeLayer = sandbox.createStubObj("reorderChild"),
//                fakeSprite1 = {} ,
//                fakeSprite2 = {a: 1},
//                sprites = [fakeSprite1, fakeSprite2];
//
//            algorithm.setZOrder(sprites, fakeLayer);
//
//            expect(fakeLayer.reorderChild.getCall(0)).toCalledWith(fakeSprite1, 0);
//            expect(fakeLayer.reorderChild.getCall(1)).toCalledWith(fakeSprite2, 1);
//        });
//    });
});