/**古代战争
 * 作者：YYC
 * 日期：2014-02-03
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("MapSelect", function () {
    var select = null;
    var sandbox = null;

    function createFakeHasTag(sprite, tag) {
        sprite.hasTag = function (t) {
            return t === tag;
        }
    }

    beforeEach(function () {
        select = new MapSelect();
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("getSelectItem", function () {
        it("如果点击的区域被迷雾覆盖，则不能选中", function () {
            sandbox.stub(window, "fogLayer", {
                isInFog: function () {
                    return true;
                }
            });

            expect(select.getSelectItem()).toBeNull();
        });

        describe("否则", function () {
            var sprite1 = null,
                sprite2 = null;

            function buildFakeBuildingSprite(selectRange, diamondRange, isBuildingState, isDead) {
                var sprite = buildFakeSprite(selectRange, isDead);

                sprite.isBuildState = function () {
                    return isBuildingState || false
                };
                sprite.diamondRange = diamondRange;

                createFakeHasTag(sprite, "building");

                return sprite;
            }

            function buildFakeUnitSprite(selectRange, isDead) {
                var sprite = buildFakeSprite(selectRange, isDead);
                createFakeHasTag(sprite, "unit");

                return sprite;
            }

            function buildFakeResourceSprite(selectRange, isDead) {
                var sprite = buildFakeSprite(selectRange, isDead);
                createFakeHasTag(sprite, "resource");

                return sprite;
            }

            function buildFakeSprite(selectRange, isDead) {
                return {
                    selectRange: selectRange,
                    isDead: function () {
                        return isDead || false;
                    }
                }
            }

            beforeEach(function () {
                sandbox.stub(window, "fogLayer", {
                    isInFog: function () {
                        return false;
                    }
                });
            });
            afterEach(function () {
            });

            it("如果精灵已经死亡，则不选中它", function () {
                sprite1 = buildFakeSprite(null, true);
                sprite2 = buildFakeSprite(null, true);
                sandbox.stub(tool, "isInPolygon").returns(true);

                expect(select.getSelectItem(10, 10, [sprite1, sprite2])).toBeNull();
            });
            it("倒序遍历精灵，这样可优先判断最前面的单位（ZOrder最大的）", function () {
                sprite1 = buildFakeBuildingSprite();
                sprite2 = buildFakeBuildingSprite();
                sandbox.stub(tool, "isInPolygon").returns(true);

                expect(select.getSelectItem(0, 0, [sprite1, sprite2])).toEqual(sprite2);
            });

            it("如果同时选中了单位精灵和其它精灵，返回最上面的单位精灵", function () {
                sprite1 = buildFakeUnitSprite();
                sprite2 = buildFakeBuildingSprite();
                sandbox.stub(tool, "isInPolygon").returns(true);

                expect(select.getSelectItem(0, 0, [sprite1, sprite2])).toEqual(sprite1);
            });

            describe("如果选中建筑", function () {
                beforeEach(function () {
                    sprite1 = buildFakeBuildingSprite();
                });

                it("如果建筑正在建造，则它的选中范围用diamondRange来判断", function () {
                    sprite2 = buildFakeBuildingSprite([
                        [1, 2],
                        [2, 3]
                    ], [
                        [10, 11],
                        [12, 13]
                    ], true);
                    sandbox.stub(tool, "isInPolygon").returns(true);

                    expect(select.getSelectItem(10, 10, [sprite1, sprite2])).toEqual(sprite2);
                    expect(tool.isInPolygon.getCall(0).args).toEqual([
                        [10, 10],
                        sprite2.diamondRange
                    ]);
                });
                it("否则，如果鼠标位于该精灵选中范围（selectRange），则返回该精灵", function () {
                    sprite2 = buildFakeBuildingSprite([
                        [1, 2],
                        [2, 3]
                    ]);
                    sandbox.stub(tool, "isInPolygon").returns(true);

                    expect(select.getSelectItem(10, 10, [sprite1, sprite2])).toEqual(sprite2);
                    expect(tool.isInPolygon.getCall(0).args).toEqual([
                        [10, 10],
                        sprite2.selectRange
                    ]);
                });
            });

            describe("如果选中单位", function () {
                beforeEach(function () {
                    sprite1 = buildFakeUnitSprite();
                });

                it("如果鼠标位于该单位范围内，则返回该精灵", function () {
                    sprite2 = buildFakeUnitSprite();
                    sandbox.stub(tool, "isInPolygon").returns(true);

                    expect(select.getSelectItem(10, 10, [sprite1, sprite2])).toEqual(sprite2);
                    expect(tool.isInPolygon.getCall(0).args).toEqual([
                        [10, 10],
                        sprite2.selectRange
                    ]);
                });
            });

            describe("如果选中资源", function () {
                beforeEach(function () {
                    sprite1 = buildFakeResourceSprite();
                });

                it("如果鼠标位于该单位范围内，则返回该精灵", function () {
                    sprite2 = buildFakeResourceSprite();
                    sandbox.stub(tool, "isInPolygon").returns(true);

                    expect(select.getSelectItem(10, 10, [sprite1, sprite2])).toEqual(sprite2);
                    expect(tool.isInPolygon.getCall(0).args).toEqual([
                        [10, 10],
                        sprite2.selectRange
                    ]);
                });
            });
        });
    });

    describe("selectInDraggedRectangle，选中拖动框中的单位", function () {
        it("如果没有拖动鼠标框选，则返回", function () {
            expect(select.selectInDraggedRectangle(false)).toEqual("not select");
        });

        describe("否则", function () {
            var sprite1 = null,
                sprite2 = null,
                sprites = [];

            beforeEach(function () {
                select.dragSelect = true;

                sprite1 = sandbox.createStubObj("getPositionX", "getPositionY", "hasTag");
                sprite2 = sandbox.createStubObj("getPositionX", "getPositionY", "hasTag");
                sprites = [sprite1, sprite2];

                sandbox.stub(select, "clearSelection");
            });

            it("如果没有按下shift键，则清除选中实体", function () {
                select.selectInDraggedRectangle(true, false, 0, 0, sprites);

                expect(select.clearSelection).toCalled();
            });

            describe("如果拖动框中包含单位", function () {
                var playerTeam = null;

                beforeEach(function () {
                    playerTeam = "blue";

                    sandbox.stub(YE, "Director", {
                        getInstance: function () {
                            return {
                                getCurrentScene: function () {
                                    return {
                                        playerTeam: playerTeam
                                    }
                                }
                            }
                        }
                    });
                    sandbox.stub(select, "_selectItem");
                });
                afterEach(function () {
                });

                it("如果单位为敌人，则不选中该单位", function () {
                    sprite1.team = "red";
                    sprite2.team = "red";

                    select.selectInDraggedRectangle(true, true, 0, 0, sprites);

                    expect(select._selectItem).not.toCalled();
                });
                it("否则，如果单位精灵坐标位于框选框中，则选中该单位，置标志位为true", function () {
                    sprite1.team = "blue";
                    sprite2.team = "blue";
                    select.dragX = 10;
                    select.dragY = 10;
                    createFakeHasTag(sprite1, "unit");
                    createFakeHasTag(sprite2, "unit");
                    sprite1.getPositionX.returns(5);
                    sprite1.getPositionY.returns(5);
                    sprite2.getPositionX.returns(15);
                    sprite2.getPositionY.returns(15);

                    select.selectInDraggedRectangle(true, true, 20, 20, sprites);

                    expect(select._selectItem).toCalledWith(sprite2, true);
                    expect(select._selectItem).toCalledOnce();
                    expect(select._isSelectInDrag).toBeTruthy();
                });
            });
        });
    });

    describe("clearSelection", function () {
        var sprite = null;

        beforeEach(function () {
            sprite = sandbox.createStubObj("clearInfo");
            select._selectedItems.push(sprite);
        });

        it("清除选中项，并置原来的选中项的selected标志为false", function () {
            sprite.selected = true;

            select.clearSelection();

            expect(sprite.selected).toBeFalsy();
            expect(select._selectedItems.length).toEqual(0);
        });
        it("隐藏界面中选中项的信息", function () {
            select.clearSelection();

            expect(sprite.clearInfo).toCalled();
        });
    });

    describe("_selectItem", function () {
        var sprite = null;

        beforeEach(function () {
            sprite = {};
        });

        it("如果按下了shift键，且该实体已经被选中了，则不再选中该实体", function () {
            sprite.selected = true;
            sandbox.stub(select, "notSelectItem");

            select._selectItem(sprite, true);

            expect(select.notSelectItem).toCalled();
        });

        it("否则，如果实体没有死亡且没有被选中，则选中该实体", function () {
            sprite.selected = false;
            sprite.isDead = function () {
                return false;
            };

            select._selectItem(sprite, false);

            expect(select._selectedItems[0]).toEqual(sprite);
        });
    });

    describe("notSelectItem", function () {
        var sprite = null;

        beforeEach(function () {
            sprite = {
                selected: true,
                getUid: function () {
                }
            };
        });
        afterEach(function () {
        });

        it("置该实体的selected标志为false", function () {
            select.notSelectItem(sprite);

            expect(sprite.selected).toBeFalsy();
        });
        it("通过uid来确定是否已选中该实体，如果选中则从选中项中删除它", function () {
            sandbox.stub(sprite, "getUid").returns(1);
            select._selectedItems.push(sprite);

            select.notSelectItem(sprite);

            expect(select._selectedItems.length).toEqual(0);
        });
    });
});
