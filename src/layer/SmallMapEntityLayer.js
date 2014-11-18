/**古代战争 小地图
 * 作者：YYC
 * 日期：2014-05-12
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
(function () {
    var SpriteColor = {
        SELECT: "#ffffff",   //白色
        RESOURCE: "#EE00EE",  //紫色
        PLAYER: "#00FF00",    //绿色
        ENEMY: "#CD0000",     //红色
        MOUTAIN: "#8B4726"    //灰色
    };

    var SmallMapEntityLayer = YYC.Class(SmallMapLayer, {
        Private: {
            __drawSprite: function () {
                var sprites = window.entityLayer.getChilds(),
                    fogLayer = window.fogLayer,
                    fillStyle = null,
                    self = this,
                    graphics = this.getGraphics();

                sprites.forEach(function (sprite) {
                    if ((sprite.isDead && sprite.isDead())
                        || !fogLayer.isVisible(sprite)
                        || sprite.isInstanceOf(PlantsSprite)
                        || (tool.isResourceSprite(sprite) && sprite.total <= 0)) {
                        return;
                    }

                    fillStyle = self.__getFillStyle(sprite);

                    if (tool.isGridSprite(sprite)) {
                        self.__drawGridSprite(sprite, fillStyle, graphics);
                    }
                    else {
                        self.__drawUnit(sprite, fillStyle, graphics);
                    }
                });
            },
            __getFillStyle: function (sprite) {
                var fillStyle = null;

                if (tool.isResourceSprite(sprite)) {
                    fillStyle = SpriteColor.RESOURCE;
                }
                else if (sprite.isInstanceOf(MoutainSprite)) {
                    fillStyle = SpriteColor.MOUTAIN;
                }
                else if (tool.isPlayerSprite(sprite)) {
                    if (this.__isSelected(sprite)) {
                        fillStyle = SpriteColor.SELECT;
                    }
                    else {
                        fillStyle = SpriteColor.PLAYER;
                    }
                }
                else if (tool.isEnemySprite(sprite)) {
                    fillStyle = SpriteColor.ENEMY;
                }

                return fillStyle;
            },
            __isSelected: function (sprite) {
                var result = false,
                    uid = sprite.getUid();

                window.mapLayer.getSelectItems().forEach(function (item) {
                    if (item.getUid() === uid) {
                        result = true;
                        return $break;
                    }
                });

                return result;
            },
            __drawGridSprite: function (sprite, fillStyle, graphics) {
                var diamondSize = 0,
                    singleDiamondSize = tool.getSmallDiamondSize(),
                    leftHalfAngle = window.mapLayer.getSmallMapLeftHalfAngle();

                if (tool.isLargeSprite(sprite)) {
                    diamondSize = singleDiamondSize * 3;
                }
                else if (tool.isMiddleSprite(sprite)) {
                    diamondSize = singleDiamondSize * 2;
                }
                else {
                    diamondSize = singleDiamondSize;
                }

                graphics.fillDiamondBox(fillStyle, tool.convertToSmallMapPix(sprite.gridX, sprite.gridY), leftHalfAngle, diamondSize);
            },
            __drawUnit: function (sprite, fillStyle, graphics) {
                var pixPos = tool.convertToSmallMapPix(sprite.gridX, sprite.gridY);

                //半径放大两倍，从而在小地图上显示得更明显
                graphics.fillCircle(fillStyle, pixPos[0], pixPos[1], sprite.smallMapRadius);
            }
        },
        Public: {
            draw: function (context) {
                this.__drawSprite();
                //在第一次主循环中先绘制出初始的画面，然后再降低调用频率，防止画面抖动
                this.setRunInterval(0.5);
            }
        }
    });

    window.SmallMapEntityLayer = SmallMapEntityLayer;
}());