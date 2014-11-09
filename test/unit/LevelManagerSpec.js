/**古代战争
 * 作者：YYC
 * 日期：2014-02-25
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("LevelManager", function () {
    var manager = null;
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        manager = new LevelManager();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("startCurrentLevel", function () {
        beforeEach(function () {
            manager.currentLevel = 0;
            sandbox.stub(window, "levelData", [
                {
                    requirements: {
                        building: "building"
                    }
                }
            ]);
            sandbox.stub(window, "resourceTable", {
                map: [
                    {type: "image", url: "a.png" } ,
                    {type: "image", url: "b.png" }
                ],
                building: [
                    {type: "image", url: "c1.png" },
                    {type: "image", url: "c2.png" },
                    {type: "json", url: "d1.json" },
                    {type: "json", url: "d2.json" }
                ]
            });
        });
        afterEach(function () {
        });

        it("获得本关要加载的资源", function () {
            var fakeLoaderManager = sandbox.createStubObj("preload", "reset");
            sandbox.stub(YE.LoaderManager, "getInstance").returns(fakeLoaderManager);

            manager.startCurrentLevel();

            expect(fakeLoaderManager.preload.firstCall).toCalledWith([
                { type: 'image', url: 'c1.png' } ,
                { type: 'image', url: 'c2.png' },
                { type: 'json', url: 'd1.json' },
                { type: 'json', url: 'd2.json' },
                { type: 'image', url: 'a.png' },
                { type: 'image', url: 'b.png' }
            ]);
        });
    });
});
