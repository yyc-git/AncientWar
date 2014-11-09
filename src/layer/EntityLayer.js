/**古代战争
 * 作者：YYC
 * 日期：2014-02-13
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var EntityLayer = YYC.Class(YE.Layer, {
    Private: {
        _isNotSameClassBuilding: function (buildings) {
            var name = null,
                result = false;

            buildings.forEach(function (building) {
                if (!name) {
                    name = building.name;
                    return;
                }

                if (name !== building.name) {
                    result = true;
                    return $break;
                }
            });

            return result;
        }
    },
    Public: {
        onStartLoop: function () {
            shadeAlgorithm.reSort(this.getChilds());
            this.isSortAllChilds = false;
        },
        draw: function (context) {
            var fogLayer = window.fogLayer,
                mapLayer = window.mapLayer,
                increment = 0;


            this.iterate(function (sprite) {
                increment = Math.max(sprite.getWidth(), sprite.getHeight());
                if (!mapLayer.isInViewPoint(sprite.getPositionX(), sprite.getPositionY(), sprite.getWidth(), sprite.getHeight() / 2, sprite.getWidth() / 2, sprite.getHeight())) {
                    return;
                }

                if (fogLayer.isVisible(sprite)) {
                    if (fogLayer.canBeDetected(sprite)) {
                        sprite.isExplore = true;
                    }
                    sprite.draw(context);
                }
            });
        },
        addChild: function (sprite, zOrder, tag) {
            this.base(sprite, zOrder, tag);

            if (YYC.Tool.judge.isArray(tag)) {
                if (tag.contain("building") || tag.contain("resource")) {
                    window.mapLayer.buildPassableGrid();
                }
            }
            else {
                if (tag === "building" || tag === "resource") {
                    window.mapLayer.buildPassableGrid();
                }
            }
        },
        removeChild: function (sprite) {
            this.base(sprite);

            if (sprite.hasTag("building") || sprite.hasTag("resource")) {
                window.mapLayer.buildPassableGrid();
            }
        },
        produce: function (produceName, produceClass) {
            var buildings = null,
                invoker = null,
                command = null,
                scene = null,
                cost = 0;

            buildings = window.mapLayer.getSelectItems();
            scene = YE.Director.getInstance().getCurrentScene();

            if (this._isNotSameClassBuilding(buildings)) {
                return;
            }

            cost = buildings.length * config.spriteConfig[produceName].cost;

            if (scene.isMeatNotEnough(cost)) {
                ui.showMessageBox("肉不足！需要" + cost + "个肉");
                return;
            }

            scene.meat -= cost;

            invoker = new Invoker();
            command = new ProduceCommand(buildings, produceName, produceClass);

            invoker.setCommand(command);
            invoker.action();
        }
    }
});