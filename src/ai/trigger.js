/**古代战争
 * 作者：YYC
 * 日期：2014-10-28
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var trigger = (function () {
    function _isInRightDown(item) {
        return item.gridX > config.map.mapGridWidth / 2 && item.gridY > config.map.mapGridHeight / 2
    }

    function _produceArcher(num, invoker, enemyShootingRange) {
        var commandArr = [];

        while (num > 0) {
            commandArr.push(new ProduceCommand(enemyShootingRange, "archer", ArcherSprite));

            num -= 1;
        }

        invoker.setCommand(commandArr);
    }

    return {
        firstLevel: {
            showTip: function () {
                return {"type": "timed", "time": 2000,
                    "action": function () {
                        ui.showMessageBox("敌人的基地在地图右下角，勇士们，去摧毁他们吧！<br/>地图右上角和左下角也有敌人的小股部队，消灭他们！", null, 5000);
                    }
                };
            },
            attackPlayer: function () {
                return  {"type": "timed", "time": 20000, "repeat": true, "interval": 180000,
                    "action": function () {
                        var enemy = null,
                            destGrid = [0, 0],
                            invoker = new Invoker();

                        ui.showMessageBox("警告！敌人马上会攻击！");

                        enemy = window.entityLayer.getChildsByTag("unit").filter(function (item) {
                            return !item.isDead() && tool.isEnemySprite(item) && _isInRightDown(item)
                        });

                        //一部分敌人寻找最近的玩家单位进攻，一部分敌人直接往玩家出生点进攻
                        invoker.setCommand([
                            new HuntCommand(enemy.splice(0, 2)),
                            new MoveAndAttackCommand(enemy, destGrid)
                        ]);

                        invoker.action();
                    }
                }
            },
            buildArcher: function () {
                return {"type": "timed", "time": 25000, "repeat": true, "interval": 170000,
                    "action": function () {
                        var invoker = new Invoker(),
                            enemyShootingRange = window.entityLayer.getChildsByTag("building").filter(function (item) {
                                return tool.isEnemySprite(item) && !item.isDead() && item.isInstanceOf(ShootingRangeSprite);
                            });

                        _produceArcher(YYC.Tool.random.nToM(2, 5), invoker, enemyShootingRange);

                        invoker.action();
                    }
                }
            },
            win: function () {
                return {"type": "conditional",
                    "condition": function () {
                        return window.entityLayer.getChildsByTag(["building", "unit"]).contain(function (item) {
                            return tool.isEnemySprite(item) && !item.isDead();
                        }) === false;
                    },
                    "action": function () {
                        ui.showMessageBox("恭喜您顺利完成任务！", function () {
                            LevelManager.getInstance().endLevel(true);
                        });
                    }
                }
            },
            over: function () {
                return  {"type": "conditional",
                    "condition": function () {
                        return window.entityLayer.getChildsByTag(["building", "unit"]).contain(function (item) {
                            return tool.isPlayerSprite(item) && !item.isDead();
                        }) === false;
                    },
                    "action": function () {
                        ui.showMessageBox("很遗憾，任务失败！", function () {
                            LevelManager.getInstance().endLevel(false);
                        });
                    }
                }
            }
        }
    }
}());