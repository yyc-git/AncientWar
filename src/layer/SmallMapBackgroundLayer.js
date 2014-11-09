/**古代战争 小地图
 * 作者：YYC
 * 日期：2014-05-12
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var SmallMapBackgroundLayer = YYC.Class(SmallMapLayer, {
    Private: {
        __drawSmallMapBackground: function () {
            var configMap = config.map,
                context = this.getContext(),
                levelData = LevelManager.getInstance().getLevelData(),
                i = 0,
                j = 0,
                halfSize = tool.computeSmallMapOnePixSize() / 2;

            for (i = 0; i < configMap.mapGridHeight; i++) {
                for (j = 0; j < configMap.mapGridWidth; j++) {
                    context.drawImage(window.mapLayer.getImgByIndex(levelData.mapElement[i][j]),
                        (j + i) * configMap.smallGridWidth / 2 + configMap.smallPixOffsetX - halfSize * i - halfSize * j,
                        (configMap.mapGridWidth - j + i - 1) * configMap.smallGridHeight / 2 + configMap.smallPixOffsetY - halfSize * i + halfSize * j,
                        configMap.smallGridWidth,
                        configMap.smallGridHeight);
                }
            }
        },
        __runCommand: function (command) {
            var selectItems = window.mapLayer.getSelectItems(),
                invoker = null;

            invoker = new Invoker();

            selectItems = selectItems.filter(function (item) {
                return tool.isPlayerSprite(item) && !item.isDead();
            });

            if (selectItems.length === 0) {
                return;
            }

            invoker.setCommand(command);
            invoker.action();
        },
        __runMoveCommand: function (e) {
            var selectItems = window.mapLayer.getSelectItems();

            this.__runCommand(this.__toMove(selectItems, e));
        },
        __toMove: function (items, e) {
            var gridPos = null;

            gridPos = tool.convertToSmallMapGrid(tool.computeRelativeMousePixPos(e));

            return new MoveCommand(items, gridPos);
        },
        __runMoveAndAttackCommand: function (e) {
            var selectItems = window.mapLayer.getSelectItems(),
                gridPos = tool.convertToSmallMapGrid(tool.computeRelativeMousePixPos(e));

            if (tool.isDestOutOfMap(gridPos)) {
                return;
            }

            this.__runCommand(new MoveAndAttackCommand(selectItems, gridPos));

            this.isMoveAndAttackCommand = true;
        }
    },
    Public: {
        isMoveAndAttackCommand: false,

        oncontextmenu: function (e) {
            this.__runMoveCommand(e);

            e.preventDefault();

            return false;
        },
        onclick: function (e) {
            var effectLayer = window.effectLayer;

            if (effectLayer.isMoveAndAttackCommand) {
                this.__runMoveAndAttackCommand(e);
                effectLayer.isMoveAndAttackCommand = false;
            }
        },
        isChange: function () {
            return false
        },
        onEnter: function () {
            this.base();

            this.__drawSmallMapBackground();
        }
    }
});