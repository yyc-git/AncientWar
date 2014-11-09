/**古代战争
 * 作者：YYC
 * 日期：2014-03-12
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("combatAlgorithm", function () {
    var algorithm = combatAlgorithm;
    var sandbox = null;

    function buildFakeItem(uid, gridX, gridY, canAttack, isDead, radius) {
        return {
            getUid: function () {
                return uid;
            },
            getAttackedPoint: function () {
                return [gridX, gridY];
            },
            getAttackPoint: function () {
                return [gridX, gridY];
            },
            gridX: gridX,
            gridY: gridY,
            isDead: function () {
                return isDead || false;
            },
            team: "red",
            canAttack: canAttack || false,
            radius: radius || 0
        }
    }

    function buildFakeAttacker(uid, gridX, gridY, attackDistance, canAttack) {
        var canAttack = canAttack === undefined ? true : canAttack;
        var attacker = buildFakeItem(uid, gridX, gridY, canAttack);

        attacker.attackDistance = attackDistance;
        attacker.team = "blue";

        return attacker;
    }

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("寻找目标", function () {
        var sandbox = null;

        beforeEach(function () {
            sandbox = sinon.sandbox.create();
            sandbox.stub(window, "entityLayer", {
                getChilds: function () {
                }
            });
            sandbox.stub(algorithm, "isInAttackRange");
            sandbox.stub(tool, "isBuildingSprite").returns(true);
            sandbox.stub(tool, "isUnitSprite").returns(true);
        });
        afterEach(function () {
            sandbox.restore();
        });

        describe("findTargetsInAttackRange", function () {
            it("返回视线内所有有效的攻击目标", function () {
                var item1 = buildFakeItem(1, 1, 2),
                    item2 = buildFakeItem(2, 5, 3);
//                item3 = buildFakeItem(3, 4, 4),
//                item4 = buildFakeItem(4, 4, 4, false, true);
                var attacker = buildFakeAttacker(4, 5, 5, 5);
                sandbox.stub(window.entityLayer, "getChilds").returns(
                    [item1, item2, attacker]
                );
                algorithm.isInAttackRange.onCall(0).returns(false);
                algorithm.isInAttackRange.onCall(1).returns(true);

                var targets = algorithm.findTargetsInAttackRange(attacker);

                expect(targets.length).toEqual(1);
            });
            it("进行排序，可以攻击的目标排在前面，然后再按距离从进到远排序", function () {
                var item1 = buildFakeItem(1, 5, 4, false),
                    item2 = buildFakeItem(2, 5, 3, true),
                    item3 = buildFakeItem(3, 4, 4, false),
                    item4 = buildFakeItem(4, 5, 4, true);
                var attacker = buildFakeAttacker(5, 5, 5, 5);
                sandbox.stub(window.entityLayer, "getChilds").returns(
                    [item1, item2, item3, item4, attacker]
                );
                algorithm.isInAttackRange.onCall(0).returns(true);
                algorithm.isInAttackRange.onCall(1).returns(true);
                algorithm.isInAttackRange.onCall(2).returns(true);
                algorithm.isInAttackRange.onCall(3).returns(true);

                var targets = algorithm.findTargetsInAttackRange(attacker);

                expect(targets).toEqual([item4, item2, item1, item3]);
            });
            it("可以增加视线范围", function () {
                var item1 = buildFakeItem(1, 1, 2);
//                item2 = buildFakeItem(2, 5, 3),
//                item3 = buildFakeItem(3, 4, 4);
                var attacker = buildFakeAttacker(4, 7, 7, 2);
                sandbox.stub(window.entityLayer, "getChilds").returns(
                    [item1, attacker]
                );
                algorithm.isInAttackRange.onCall(0).returns(true);

                var targets = algorithm.findTargetsInAttackRange(attacker, 10);

                expect(algorithm.isInAttackRange.firstCall.args[2]).toEqual(10);
            });
        });

        describe("findTargetsCanAttackInAttackRange", function () {
            it("返回攻击范围内所有有效的可以攻击的攻击目标", function () {
                var item1 = buildFakeItem(1, 5, 4, false),
                    item2 = buildFakeItem(2, 5, 2, true),
                    item3 = buildFakeItem(3, 4, 4, true);
                var attacker = buildFakeAttacker(4, 5, 5, 5);
                sandbox.stub(window.entityLayer, "getChilds").returns(
                    [item1, item2, item3, attacker]
                );
                algorithm.isInAttackRange.onCall(0).returns(true);
                algorithm.isInAttackRange.onCall(1).returns(true);
                algorithm.isInAttackRange.onCall(2).returns(true);

                var targets = algorithm.findTargetsCanAttackInAttackRange(attacker);

                expect(targets).toEqual([item3, item2]);
            });
        });

        describe("findTargetsCanAttackMe", function () {
            it("返回能攻击我的目标", function () {
                var item = buildFakeItem(1, 5, 5),
                    attacker1 = buildFakeAttacker(2, 5, 2, 2),
                    attacker2 = buildFakeAttacker(3, 4, 3, 3),
                    attacker3 = buildFakeAttacker(3, 4, 4, 2);
                sandbox.stub(window.entityLayer, "getChilds").returns(
                    [item, attacker1, attacker2, attacker3]
                );
                algorithm.isInAttackRange.onCall(0).returns(false);
                algorithm.isInAttackRange.onCall(1).returns(true);
                algorithm.isInAttackRange.onCall(2).returns(true);

                var targets = algorithm.findTargetsCanAttackMe(item);

                expect(targets).toEqual([attacker3, attacker2]);
            });
        });

        describe("findTargetsCanAttackMeOrInAttackRange", function () {
            it("返回能攻击我的目标和攻击范围内所有有效的攻击目标", function () {
                var item = buildFakeItem(1, 5, 5),
                    attacker1 = buildFakeAttacker(2, 5, 2, 2),
                    attacker2 = buildFakeAttacker(3, 4, 3, 3),
                    attacker3 = buildFakeAttacker(4, 4, 4, 2);
                sandbox.stub(window.entityLayer, "getChilds").returns(
                    [item, attacker1, attacker2, attacker3]
                );
                algorithm.isInAttackRange.withArgs(item).onCall(0).returns(false);
                algorithm.isInAttackRange.withArgs(attacker1).onCall(0).returns(false);

                algorithm.isInAttackRange.withArgs(item).onCall(1).returns(true);

                algorithm.isInAttackRange.withArgs(item).onCall(2).returns(false);
                algorithm.isInAttackRange.withArgs(attacker3).onCall(0).returns(true);


                var targets = algorithm.findTargetsCanAttackMeOrInAttackRange(item);

                expect(targets).toEqual([attacker3, attacker2]);
            });
            it("进行排序，可以攻击的目标排在前面，然后再按距离从进到远排序", function () {
                var item = buildFakeItem(1, 5, 5),
                    attacker1 = buildFakeAttacker(2, 5, 2, 2, false),
                    attacker2 = buildFakeAttacker(3, 4, 3, 3),
                    attacker3 = buildFakeAttacker(4, 4, 4, 2),
                    attacker4 = buildFakeAttacker(5, 4, 4, 2, false);
                sandbox.stub(window.entityLayer, "getChilds").returns(
                    [item, attacker1, attacker2, attacker3, attacker4]
                );
                algorithm.isInAttackRange.returns(true);

                var targets = algorithm.findTargetsCanAttackMeOrInAttackRange(item);

                expect(targets).toEqual([attacker3, attacker2, attacker4, attacker1]);
            });
            it("判断“攻击范围内所有有效的攻击目标”，可以增加视线范围", function () {
                var item1 = buildFakeItem(1, 1, 2);
                var attacker = buildFakeAttacker(2, 7, 7, 2);
                sandbox.stub(window.entityLayer, "getChilds").returns(
                    [item1, attacker]
                );
                algorithm.isInAttackRange.onCall(0).returns(true);

                var targets = algorithm.findTargetsCanAttackMeOrInAttackRange(attacker, 10);

                expect(algorithm.isInAttackRange.firstCall.args[2]).toEqual(10);
            });
        });
    });

    describe("findTargetsCanAttackMeOrCanAttackInAttackRange", function () {
        it("返回能攻击我的目标和攻击范围内所有有效的可以攻击的攻击目标", function () {
        });
    });


    describe("isInAttackRange", function () {
        describe("如果目标为建筑精灵", function () {
            it("目标的判断基点为离攻击者最近的方格的坐标，攻击者的判断基点为攻击者的坐标", function () {
                var item = buildFakeItem(1, 1, 2),
                    attacker = buildFakeAttacker(4, 5, 5, 5),
                    targetGridPos = [1, 2];
                sandbox.stub(tool, "isBuildingSprite").returns(true);
                sandbox.stub(moveAlgorithm, "findNearestGrid").returns(targetGridPos);
                sandbox.stub(moveAlgorithm, "isInBuildableSpriteRange");

                algorithm.isInAttackRange(attacker, item);

                expect(moveAlgorithm.isInBuildableSpriteRange.firstCall).toCalledWith([5, 5], targetGridPos, 5);
            });
        });

        describe("如果目标为单位精灵", function () {
            it("目标的判断基点为目标的被攻击点，攻击者的判断基点为攻击者的坐标", function () {
                var item = buildFakeItem(1, 1, 2),
                    attacker = buildFakeAttacker(4, 5, 5, 5);
                sandbox.stub(tool, "isBuildingSprite").returns(false);
                sandbox.spy(item, "getAttackedPoint");
                sandbox.stub(tool, "isInCircleRange");

                algorithm.isInAttackRange(attacker, item);

                expect(item.getAttackedPoint).toCalled();
                expect(tool.isInCircleRange).toCalledWith([5, 5], [1, 2], 5);
            });
            it("判断的范围为以攻击者的attackDistance加上目标的半径radius", function () {
                var item = buildFakeItem(1, 1, 2, false, false, 3),
                    attacker = buildFakeAttacker(4, 5, 5, 5);
                sandbox.stub(tool, "isBuildingSprite").returns(false);
                sandbox.stub(tool, "isInCircleRange");
                sandbox.stub(tool, "convertToGridSize", function (num) {
                    return num;
                });

                algorithm.isInAttackRange(attacker, item);

                expect(tool.isInCircleRange).toCalledWith([5, 5], [1, 2], 5 + 3);
            });
        });

        it("可以增加攻击距离范围", function () {
            var item1 = buildFakeItem(2, 5, 3);
            var attacker = buildFakeAttacker(4, 5, 8, 2);
            sandbox.stub(tool, "isBuildingSprite").returns(false);

            expect(algorithm.isInAttackRange(attacker, item1, 2)).toBeFalsy();
            expect(algorithm.isInAttackRange(attacker, item1, 4)).toBeTruthy();
        });
    });

    describe("remoteAttack", function () {
        describe("创建弓箭", function () {
            it("创建弓箭实例，传入起点坐标、目标、伤害值", function () {
                var target = {};
                var attackerGridPos = [1, 2];
                var damage = 10;
                sandbox.spy(ArrowSprite, "create");

                var arrow = combatAlgorithm._createArrow(target,attackerGridPos,damage);

                expect(arrow).toBeInstanceOf(ArrowSprite);
                expect(ArrowSprite.create).toCalledWith({
                    gridX: attackerGridPos[0],
                    gridY: attackerGridPos[1],
                    target: target,
                    damage: damage
                });
            });
        });

        describe("设置目的地", function () {
            var arrow = null,
                dest = null;

            beforeEach(function () {
                dest = [1, 2];
                sandbox.stub(moveAlgorithm, "computeInterceptPos").returns(dest);
            });

            it("计算拦截目的地", function () {
                sandbox.stub(tool, "isDestOutOfMap").returns(false);
                sandbox.stub(tool, "convertToGrid", function () {
                    return [arguments[0], arguments[1]];
                });

                expect(combatAlgorithm._computeArrowDest(arrow, {})).toEqual(dest);
            });
            it("如果目的地在地图外，则目的地为目标的被攻击点", function () {
                var target = {
                    getAttackedPoint: sandbox.stub().returns(dest)
                };
                sandbox.stub(tool, "isDestOutOfMap").returns(true);

                expect(combatAlgorithm._computeArrowDest({}, target)).toEqual(dest);
            });
        });

        it("加入弓箭到层中", function () {
            var arrow = {};
            sandbox.stub(window, "bulletLayer", {
                addChild: sandbox.spy()
            });

            combatAlgorithm._addArrow(arrow);

            expect(window.bulletLayer.addChild).toCalledWith(arrow);
        });
    });

    describe("meleeAttack", function () {
        var target = null;

        beforeEach(function () {
            target = {
                life: 10,
                showInfo: sandbox.stub()
            };
        });

        it("目标受到伤害", function () {
            var damage = 1;
            target.isDead = sandbox.stub().returns(false);

            combatAlgorithm.meleeAttack(target, damage);

            expect(target.life).toEqual(9);
        });
//        it("如果目标死亡，则调用目标的dead动作，并设置命令标志", function () {
//            target.isDead = sandbox.stub().returns(true);
//            target.runDeadAction = sandbox.stub();
//
//            combatAlgorithm.meleeAttack(target);
//
//            expect(target.runDeadAction).toCalledOnce();
//        });
        it("显示目标信息", function () {
            target.isDead = sandbox.stub().returns(false);

            combatAlgorithm.meleeAttack(target);

            expect(target.showInfo).toCalledOnce();
        });
    });
});
