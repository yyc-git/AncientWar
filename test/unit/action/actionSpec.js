/**古代战争
 * 作者：YYC
 * 日期：2014-04-18
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("Attack", function () {
    var action = null;
    var sandbox = null;
    var returnForTest = YE.returnForTest;

    function getInstance(target) {
        var T = YYC.Class(window.Attack, {
            Protected: {
                P_isNotValidateTarget: function (target) {
                },
                P_handleAfterFinishAttack: function () {
                },
                P_handleBeforeDamage: function (target) {
                },
                P_isTimeToDamage: function () {
                },
                P_attackDamage: function (target) {
                }
            }
        });

        return new T(target);
    }

    beforeEach(function () {
        action = getInstance();
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

//    describe("构造函数", function () {
//        it("保存精灵实例", function () {
//            var sprite = {};
//
//            sandbox.stub(action, "getTarget").returns(sprite);
//
//            expect(action.P_sprite).toEqual(sprite);
//        });
//    });

    describe("update", function () {
        describe("如果目标无效", function () {
            beforeEach(function () {
                sandbox.stub(action, "P_isNotValidateTarget").returns(true);
            });

            it("调用P_handleAfterFinishAttack方法并返回", function () {
                var target = {};
                sandbox.spy(action, "P_handleAfterFinishAttack");
                action._attackTarget = target;

                var result = action.update();

                expect(action.P_isNotValidateTarget.firstCall.args[0]).toEqual(target);
                expect(result).toEqual(returnForTest);
            });
        });

        it("调用P_handleBeforeDamage", function () {
            var target = {};
            sandbox.spy(action, "P_handleBeforeDamage");
            action._attackTarget = target;

            action.update();

            expect(action.P_handleBeforeDamage).toCalledWith(target);
        });
        it("如果P_handleBeforeDamage返回returnFlag，则返回", function () {
            sandbox.stub(config, "returnFlag", "returnFlag");
            sandbox.stub(action, "P_handleBeforeDamage").returns(config.returnFlag);

            expect(action.update()).toEqual(returnForTest);
        });

        describe("如果要造成伤害", function () {
            beforeEach(function () {
                sandbox.stub(action, "P_isTimeToDamage").returns(true);
            });

            it("调用P_attackDamage", function () {
                sandbox.spy(action, "P_attackDamage");

                action.update();

                expect(action.P_attackDamage).toCalledOnce();
            });
        });
    });

    describe("P_refreshReloadTime", function () {
        it("刷新精灵的加载时间", function () {
            var sprite = {
                reloadTimeLeft: 0,
                reloadTime: 40
            };
            sandbox.stub(action, "getTarget").returns(sprite);

            action.P_refreshReloadTime();

            expect(sprite.reloadTimeLeft).toEqual(sprite.reloadTime);
        });
    });
});



