/**古代战争
 * 作者：YYC
 * 日期：2014-05-06
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("pool", function () {
    var pool = null,
        fakeCache = null,
        fakeAnim = null,
        copyAnim = null;
    var sandbox = null;

    function setContainer(container) {
        pool._poolContainer = container;
    }

    function getContainer() {
        return pool._poolContainer;
    }

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        copyAnim = {};
        fakeAnim = {
            copy: sandbox.stub().returns(copyAnim)
        };
        fakeCache = {
            getAnim: sandbox.stub().returns(fakeAnim)
        };
        sandbox.stub(YE.AnimationCache, "getInstance").returns(fakeCache);

        pool = new AnimPool();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("getAnim", function () {
        function clearContainer() {
            setContainer({});
        }

        beforeEach(function () {
            clearContainer();
        });

        it("从池中获得动画时，如果池中没有该动画，则从AnimationCache中获得该动画的副本，并加入size个动画到池中", function () {
            var size = 10;
            sandbox.stub(pool, "size", size);
            jasmine.clock().install();

            var anim = pool.getAnim("a");

            expect(anim).toEqual(copyAnim);

            jasmine.clock().tick(2000 * size);

            expect(getContainer().a.length).toEqual(size);

            jasmine.clock().uninstall();
        });
        it("如果池中已有该动画，则直接获得该动画", function () {
            var size = 5,
                fakeAnim = {};
            pool.addAnim("a", fakeAnim);
            pool.addAnim("a", fakeAnim);
            sandbox.stub(pool, "size", size);
            sandbox.stub(pool, "minInstanceNum", 1);

            var anim = pool.getAnim("a");
            expect(anim).toEqual(fakeAnim);
        });
        it("如果池中动画数小于设定的minInstanceNum，则加入size个动画到池中", function () {
            var size = 5;
            pool.addAnim("a", {});
            pool.addAnim("a", {});
            jasmine.clock().install();
            sandbox.stub(pool, "size", size);
            sandbox.stub(pool, "minInstanceNum", 2);

            pool.getAnim("a");
            jasmine.clock().tick(2000 * size);

            expect(getContainer().a.length).toEqual(size + 1);

            jasmine.clock().uninstall();
        });
    });

    describe("移除精灵时回收它的被重置后的动画实例到池中", function () {
        var sprite = null;

        beforeEach(function () {
            var T = YYC.Class(Sprite, {
            });
            sprite = new T();
            sandbox.stub(sprite, "getParent").returns(sandbox.createSpyObj("removeChild"));
        });

        it("测试Sprite->removeSprite", function () {
            var fakeAnim1 = {
                    reset: sandbox.stub()
                },
                fakeAnim2 = {
                    a: 1,
                    reset: sandbox.stub()
                },
                fakeAnims = {
                    "anim1": fakeAnim1,
                    "anim2": fakeAnim2
                };
            var fakePool = sandbox.createSpyObj("addAnim");
            sandbox.stub(sprite, "changeToAnimNameInAnimPool", function (animName) {
                return animName;
            });
            sandbox.stub(sprite, "getAnimationFrameManager").returns({
                getAnims: sandbox.stub().returns(fakeAnims)
            });
            sandbox.stub(window.AnimPool, "getInstance").returns(fakePool);

            sprite.removeSprite();

            expect(fakePool.addAnim.callCount).toEqual(2);
            expect(fakePool.addAnim.firstCall).toCalledWith("anim1", fakeAnim1);
            expect(fakePool.addAnim.secondCall).toCalledWith("anim2", fakeAnim2);
            expect(fakeAnim1.reset).toCalled();
            expect(fakeAnim2.reset).toCalled();
        });
    });


    describe("initWithFile", function () {
        it("从JsonLoader中获得动画json文件", function () {
            var jsonFilePath = "aa.json",
                fakeJsonLoader = {
                    get: sandbox.stub()
                };
            sandbox.stub(YE.JsonLoader, "getInstance").returns(fakeJsonLoader);

            pool.initWithFile(jsonFilePath);

            expect(fakeJsonLoader.get).toCalledWith(jsonFilePath);
        });
        it("遍历动画文件，每个动画加入size个到池中", function () {
            var fakeJsonLoader = {
                get: sandbox.stub().returns({
                    "a": {},
                    "b": {}
                })
            };
            sandbox.stub(YE.JsonLoader, "getInstance").returns(fakeJsonLoader);
            sandbox.stub(pool, "size", 10);

            pool.initWithFile("");

            expect(getContainer().a.length).toEqual(10);
            expect(getContainer().b.length).toEqual(10);
        });
    });

});
