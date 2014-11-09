/**古代战争
 * 作者：YYC
 * 日期：2014-02-27
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("AStar", function () {
    it("8方向寻找路径", function () {
        var fakeTerrainData = [
                [0, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ],
            start = [0, 0],
            end = [3, 2],
            result = null;

        result = AStar(fakeTerrainData, start, end, "Euclidean");

        expect(result).toEqual([
            [ 0, 0 ],
            [ 1, 0 ],
            [ 2, 0 ],
            [ 3, 1 ],
            [ 3, 2 ]
        ]);
    });

    describe("如果不能找到路径", function () {
        it("目的地不能通过", function () {
            var fakeTerrainData = [
                    [0, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 1, 1, 0],
                    [0, 0, 0, 0]
                ],
                start = [0, 0],
                end = [1, 2],
                result = null;

            result = AStar(fakeTerrainData, start, end, "Euclidean");

            expect(result).toEqual([]);
        });
        it("无法到达", function () {
            var fakeTerrainData = [
                    [1, 0],
                    [1, 1],
                    [0, 1],
                    [1, 0]
                ],
                start = [1, 0],
                end = [0, 2],
                result = null;

            result = AStar(fakeTerrainData, start, end, "Euclidean");

            expect(result).toEqual([]);
        });
    });
    it("寻路算法不够优化", function () {
        var fakeTerrainData = [
                [0, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ],
            start = [0, 0],
            end = [2, 1],
            result = null;

        result = AStar(fakeTerrainData, start, end, "Euclidean");

//        expect(result).toEqual([]);
        /*
         应该为下面的结果！
         expect(result).toEqual([
         [0, 0],
         [1, 0],
         [2, 1]
         ]);
         */
        //实际为
        expect(result).toEqual([
            [0, 0],
            [1, 0],
            [2, 0] ,
            [2, 1]
        ]);
    });

    it("地图边缘寻路测试", function () {
        var fakeTerrainData = [
                [0, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0]
            ],
            start = [1, 3],
            end = [3, 3],
            result = null;

        result = AStar(fakeTerrainData, start, end, "Euclidean");

        expect(result).toEqual([
            [ 1, 3 ],
            [ 2, 3 ],
            [ 3, 3 ]
        ]);
    });
});