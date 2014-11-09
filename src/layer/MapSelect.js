/**古代战争
 * 作者：YYC
 * 日期：2014-02-05
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var MapSelect = YYC.Class({
    Private: {
        _selectedItems: [],
        _isSelectInDrag: false,

        _selectItem: function (item, shiftPressed) {
            if (shiftPressed) {
                if (item.selected) {
                    this.notSelectItem(item);

                    return;
                }
            }

            if (
                !item.selected && !item.isDead()) {
                item.selected = true;
                this._selectedItems.push(item);
            }
        },
        _isSelected: function (selectRange, gameX, gameY) {
            return tool.isInPolygon([gameX, gameY], selectRange);
        },
        _isInDraggedRectangle: function (item, gameX, gameY) {
            var x1 = Math.min(gameX, this.dragX);
            var y1 = Math.min(gameY, this.dragY);
            var x2 = Math.max(gameX, this.dragX);
            var y2 = Math.max(gameY, this.dragY);

            return  x1 <= item.getPositionX()
                && x2 >= item.getPositionX()
                && y1 <= item.getPositionY()
                && y2 >= item.getPositionY();
        },
        _showInfo: function () {
            var farmer = null;

            ui.clearInfo();

            farmer = this._selectedItems.filter(function (item) {
                return item.isInstanceOf(FarmerSprite);
            });
            if (farmer.length > 0) {
                farmer[0].showInfo();
            }
            else if (
                this._isSelectedItemsAllTarget(BaseSprite)
                    || this._isSelectedItemsAllTarget(ShootingRangeSprite)
                    || this._isSelectedItemsAllTarget(ArcherSprite)
                    || this._selectedItems.length === 1
                ) {
                this._selectedItems[0] && this._selectedItems[0].showInfo();
            }
        },
        _isSelectedItemsAllTarget: function (targetClass) {
            var result = true;

            this._selectedItems.forEach(function (item) {
                if (!item.isInstanceOf(targetClass)) {
                    result = false;
                    return $break;
                }
            });

            return result;
        },
        _playSelectSound: function (selectItems, clickItem) {
            if (selectItems.length === 0 || selectItems.contain(function (sprite) {
                return tool.isEnemySprite(sprite);
            })) {
                return;
            }

            if (clickItem && tool.isBuildingSprite(clickItem)) {
                if (!clickItem.isBuildState() && clickItem.isDamaged()) {
                    tool.playGlobalSound("building_flaming");
                    return;
                }
                if (clickItem.isInstanceOf(BaseSprite)) {
                    tool.playGlobalSound("base_select");
                    return;
                }
                if (clickItem.isInstanceOf(ShootingRangeSprite)) {
                    tool.playGlobalSound("shootingRange_select");
                    return;
                }
                if (clickItem.isInstanceOf(TowerSprite)) {
                    tool.playGlobalSound("tower_select");
                    return;
                }
            }

            tool.playUnitsSound(selectItems, "select");
        }
    },
    Public: {
        //点击鼠标拖动的原点坐标
        dragX: 0,
        dragY: 0,


        selectionBorderColor: "rgba(255,0,0,1)",
        healthBarHealthyFillColor: "rgba(0,255,0,0.5)",
        healthBarDamagedFillColor: "rgba(255,0,0,0.5)",
        lifeBarHeight: 5,

        clearSelection: function () {
            var item = null;

            while (this._selectedItems.length > 0) {
                item = this._selectedItems.pop();
                item.selected = false;
                item.clearInfo();
            }
        },
        onclick: function (e, clickedItem) {
            if (this._isSelectInDrag) {
                this._isSelectInDrag = false;
                this._showInfo();

                this._playSelectSound(this.getSelectItems(), null);

                return "already select";
            }

            var shiftPressed = e.shiftKey;

            if (clickedItem) {
                if (!shiftPressed) {
                    this.clearSelection();
                }
                this._selectItem(clickedItem, shiftPressed);

                this._showInfo(clickedItem);
            }
            else {
                ui.clearInfo();
                this.clearSelection();
            }

            this._playSelectSound(this.getSelectItems(), clickedItem);
        },
        onmousedown: function (e, gameX, gameY) {
            if (e.mouseButton == 0) {
                this.dragX = gameX;
                this.dragY = gameY;
            }
        },
        onmouseup: function (e, dragSelect, gameX, gameY, sprites) {
            var shiftPressed = e.shiftKey;

            if (e.mouseButton == 0) {
                this.selectInDraggedRectangle(dragSelect, shiftPressed, gameX, gameY, sprites);
            }
        },
        getSelectItem: function (gameX, gameY, sprites) {
            var select_item = null,
                i = 0,
                item = null,
                foremostNotUnitItem = null,
                gridPos = tool.convertToGrid(gameX, gameY);

            if (window.fogLayer.isInFog(gridPos[0], gridPos[1])) {
                return null;
            }

            for (i = sprites.length - 1; i >= 0; i--) {
                item = sprites[i];

                if (item.isDead && item.isDead()) {
                    continue;
                }

                if (item.hasTag("building")) {
                    if (foremostNotUnitItem) {
                        continue;
                    }

                    if (item.isBuildState()) {
                        if (this._isSelected(item.diamondRange, gameX, gameY)) {
                            foremostNotUnitItem = item;
                        }
                    }
                    else {
                        if (this._isSelected(item.selectRange, gameX, gameY)) {
                            foremostNotUnitItem = item;
                        }
                    }
                }
                else if (item.hasTag("unit")) {
                    if (this._isSelected(item.selectRange, gameX, gameY)) {
                        select_item = item;
                    }
                }
                else if (item.hasTag("resource")) {
                    if (foremostNotUnitItem) {
                        continue;
                    }

                    if (this._isSelected(item.selectRange, gameX, gameY)) {
                        foremostNotUnitItem = item;
                    }
                }

                if (select_item) {
                    break;
                }
            }

            if (select_item === null) {
                select_item = foremostNotUnitItem;
            }

            return select_item;
        },
        selectInDraggedRectangle: function (dragSelect, shiftPressed, gameX, gameY, sprites) {
            if (!dragSelect) {
                return "not select";
            }

            if (!shiftPressed) {
                this.clearSelection();
            }

            var self = this;

            sprites.forEach(function (item) {
                if (item.hasTag("unit")) {
                    if (
                        tool.isPlayerSprite(item) && self._isInDraggedRectangle(item, gameX, gameY)
                        ) {
                        self._selectItem(item, shiftPressed);
                        self._isSelectInDrag = true;
                    }
                }
            });
        },
        getSelectItems: function () {
            return this._selectedItems;
        },
        notSelectItem: function (item) {
            var i = 0;

            item.selected = false;
            for (i = this._selectedItems.length - 1; i >= 0; i--) {
                if (this._selectedItems[i].getUid() == item.getUid()) {
                    this._selectedItems.splice(i, 1);
                    break;
                }
            }
        }
    }
});

