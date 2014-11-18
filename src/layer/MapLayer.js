/**古代战争
 * 作者：YYC
 * 日期：2014-02-01
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var MapLayer = YYC.Class(YE.Layer, {
    Init: function (id, zIndex, position) {
        this.base(id, zIndex, position);
    },
    Private: {
        _buttonPressed: false,
        _mapRoll: null,
        _mapSelect: null,
        _mapBufferCanvas: null,
        _mapBufferCanvas1: null,
        _mapBufferCanvas2: null,
        _mapBufferCanvas3: null,
        _mapBufferCanvas4: null,

        _handleRoll: function () {
            var result = this._mapRoll.handleRoll();

            if (result === "update") {
                this.setStateChange();

                YE.Director.getInstance().getCurrentScene().subject.publishAll(null, "roll");

                return;
            }

            YE.Director.getInstance().getCurrentScene().subject.publishAll(null, "not roll");
        },
        _createMapRoll: function (canvasWidth, canvasHeight, mapBufferCanvasData) {
            return new MapRoll(canvasWidth, canvasHeight, mapBufferCanvasData);
        },
        _isDrag: function () {
            return Math.abs(this.getDragX() - this.getGameX()) > 4
                || Math.abs(this.getDragY() - this.getGameY()) > 4;
        },
        _setBufferCanvasSize: function () {
            var configMap = config.map,
                width = configMap.mapGridWidth * configMap.gridWidth,
                height = configMap.mapGridHeight * configMap.gridHeight;

            //地图的上下左右四个角与画布边缘留出一段距离（pixOffsetX、pixOffsetY）
            this._mapBufferCanvas.width = width + configMap.pixOffsetX * 2;
            this._mapBufferCanvas.height = height + configMap.pixOffsetY * 2;

            this._mapBufferCanvas1.width = this._mapBufferCanvas.width / 2;
            this._mapBufferCanvas1.height = this._mapBufferCanvas.height / 2;

            this._mapBufferCanvas2.width = this._mapBufferCanvas.width / 2;
            this._mapBufferCanvas2.height = this._mapBufferCanvas.height / 2;

            this._mapBufferCanvas3.width = this._mapBufferCanvas.width / 2;
            this._mapBufferCanvas3.height = this._mapBufferCanvas.height / 2;

            this._mapBufferCanvas4.width = this._mapBufferCanvas.width / 2;
            this._mapBufferCanvas4.height = this._mapBufferCanvas.height / 2;
        },
        _createBufferCanvas: function () {
            this._mapBufferCanvas = document.createElement("canvas");

            this._mapBufferCanvas1 = document.createElement("canvas");
            this._mapBufferCanvas2 = document.createElement("canvas");
            this._mapBufferCanvas3 = document.createElement("canvas");
            this._mapBufferCanvas4 = document.createElement("canvas");
        },
        _buildMap: function () {
            this._drawBigBufferCanvas();
            this._copyBigToSmallBufferCanvas();
        },
        _drawBigBufferCanvas: function () {
            var configMap = config.map,
                context = this._mapBufferCanvas.getContext("2d"),
                levelData = LevelManager.getInstance().getLevelData(),
                i = 0,
                j = 0,
                halfSize = tool.computeOnePixSize() / 2;

            for (i = 0; i < configMap.mapGridHeight; i++) {
                for (j = 0; j < configMap.mapGridWidth; j++) {
                    context.drawImage(this.getImgByIndex(levelData.mapElement[i][j]),
                        (j + i) * configMap.gridWidth / 2 + configMap.pixOffsetX - halfSize * i - halfSize * j,
                        (configMap.mapGridWidth - j + i - 1) * configMap.gridHeight / 2 + configMap.pixOffsetY - halfSize * i + halfSize * j,
                        configMap.gridWidth,
                        configMap.gridHeight);
                }
            }
        },
        _copyBigToSmallBufferCanvas: function () {
            var width = this._mapBufferCanvas.width / 2,
                height = this._mapBufferCanvas.height / 2;

            this._mapBufferCanvas1.getContext("2d").drawImage(this._mapBufferCanvas, 0, 0, width, height,
                0, 0, width, height);
            this._mapBufferCanvas2.getContext("2d").drawImage(this._mapBufferCanvas, width, 0, width, height,
                0, 0, width, height);
            this._mapBufferCanvas3.getContext("2d").drawImage(this._mapBufferCanvas, 0, height, width, height,
                0, 0, width, height);
            this._mapBufferCanvas4.getContext("2d").drawImage(this._mapBufferCanvas, width, height, width, height,
                0, 0, width, height);
        },
        _initPassableGrid: function () {
            var levelData = LevelManager.getInstance().getLevelData();

            return YYC.Tool.extend.extendDeep(levelData.terrain);
        },
        _initBuildableGrid: function () {
            var levelData = LevelManager.getInstance().getLevelData();

            this.buildableGridData = YYC.Tool.extend.extendDeep(levelData.terrain);
        },
        _handleRightClick: function (clickItem) {
            var unitItems = [],
                selectItems = this._mapSelect.getSelectItems(),
                entityLayer = window.entityLayer,
                invoker = null,
                command = null;

            window.effectLayer.cancelDeployBuilding();

            invoker = new Invoker();

            selectItems = selectItems.filter(function (item) {
                return tool.isPlayerSprite(item) && !item.isDead();
            });

            if (selectItems.length === 0) {
                return;
            }

            unitItems = selectItems.filter(function (item) {
                return item.hasTag("unit");
            });

            this.rightClickItem = clickItem;

            if (clickItem) {
                if (clickItem.team && clickItem.team !== selectItems[0].team) {
                    command = new AttackCommand(selectItems.filter(function (item) {
                        return !!item.canAttack;
                    }), clickItem);
                }
                else if (clickItem.isInstanceOf(BuildingSprite) && clickItem.isBuildState()) {
                    command = [
                        this._toMove(unitItems.filter(function (item) {
                            return !item.isInstanceOf(FarmerSprite);
                        })),
                        new BuildCommand(unitItems.filter(function (item) {
                            return item.isInstanceOf(FarmerSprite);
                        }), clickItem)
                    ];
                }
                else if (clickItem.isInstanceOf(FoodSprite)) {
                    command = new GatherMeatCommand(unitItems.filter(function (item) {
                        return item.isInstanceOf(FarmerSprite);
                    }), clickItem);
                }
                else if (clickItem.isInstanceOf(BaseSprite)) {
                    command = [
                        this._toMove(unitItems.filter(function (item) {
                            return !item.isInstanceOf(FarmerSprite) || (item.isInstanceOf(FarmerSprite) && item.gather_meat <= 0);
                        })),
                        new ReturnMeatCommand(unitItems.filter(function (item) {
                            return item.isInstanceOf(FarmerSprite) && item.gather_meat > 0;
                        }), clickItem)
                    ];
                }
                else {
                    command = this._toMove(unitItems);
                }
            }
            else {
                command = this._toMove(unitItems);
            }

            if (command) {
                invoker.setCommand(command);
                invoker.action();
            }
        },
        _toMove: function (items) {
            var gridPos = null;


            if (items.length > 0) {
                gridPos = tool.convertToGrid(this.getGameX(), this.getGameY());

                return new MoveCommand(items, gridPos);
            }

            return null;
        },
        _createInstance: function () {
            var canvasData = this.getCanvasData();

            this._mapRoll = this._createMapRoll(canvasData.width, canvasData.height, this.getMapBufferCanvasData());
            this._mapRoll.init();

            this._mapSelect = new MapSelect();
        },
        _initViewPoint: function () {
            var data = LevelManager.getInstance().getLevelData();
            this._mapRoll.offsetX = data.startX;
            this._mapRoll.offsetY = data.startY;
        },
        _drawMap: function (context) {
            if (this._drawMapIfViewPointInOneCanvas(context)) {
                return;
            }

            this._drawMapIfViewPointInMultiCanvas(context);
        },
        _drawMapIfViewPointInOneCanvas: function (context) {
            var viewPointSize = this.getCanvasData(),
                canvas = null,
                x = 0,
                y = 0,
                viewPointPos = this._getViewPointData(0, 0, 0, 0),
                canvasWidth = this._mapBufferCanvas.width / 2,
                canvasHeight = this._mapBufferCanvas.height / 2,
                isInOneCanvas = false;

            if (this._isViewPointInLeftUp(viewPointPos, canvasWidth, canvasHeight)) {
                canvas = this._mapBufferCanvas1;
                x = this.getOffsetX();
                y = this.getOffsetY();
                isInOneCanvas = true;
            }
            else if (this._isViewPointInRightUp(viewPointPos, canvasWidth, canvasHeight)) {
                canvas = this._mapBufferCanvas2;
                x = this.getOffsetX() - canvas.width;
                y = this.getOffsetY();
                isInOneCanvas = true;
            }
            else if (this._isViewPointInLeftDown(viewPointPos, canvasWidth, canvasHeight)) {
                canvas = this._mapBufferCanvas3;
                x = this.getOffsetX();
                y = this.getOffsetY() - canvas.height;
                isInOneCanvas = true;
            }
            else if (this._isViewPointInRightDown(viewPointPos, canvasWidth, canvasHeight)) {
                canvas = this._mapBufferCanvas4;
                x = this.getOffsetX() - canvas.width;
                y = this.getOffsetY() - canvas.height;
                isInOneCanvas = true;
            }

            if (isInOneCanvas) {
                context.drawImage(canvas, x, y,
                    viewPointSize.width, viewPointSize.height,
                    0, 0, viewPointSize.width, viewPointSize.height);
            }

            return isInOneCanvas;
        },
        _drawMapIfViewPointInMultiCanvas: function (context) {
            var viewPointPos = this._getViewPointData(0, 0, 0, 0),
                canvasWidth = this._mapBufferCanvas.width / 2,
                canvasHeight = this._mapBufferCanvas.height / 2;

            if (this._isViewPointInLeftUpAndRightUp(viewPointPos, canvasWidth, canvasHeight)) {
                this._drawMapIfViewPointInLeftUpAndRightUp(context, canvasWidth, canvasHeight);
            }
            else if (this._isViewPointInLeftDownAndRightDown(viewPointPos, canvasWidth, canvasHeight)) {
                this._drawMapIfViewPointInLeftDownAndRightDown(context, canvasWidth, canvasHeight);
            }
            else if (this._isViewPointInLeftUpAndLeftDown(viewPointPos, canvasWidth, canvasHeight)) {
                this._drawMapIfViewPointInLeftUpAndLeftDown(context, canvasWidth, canvasHeight);
            }
            else if (this._isViewPointInRightUpAndRightDown(viewPointPos, canvasWidth, canvasHeight)) {
                this._drawMapIfViewPointInRightUpAndRightDown(context, canvasWidth, canvasHeight);
            }
            else if (this._isViewPointInLeftUpAndLeftDownAndRightUpAndRightDown(viewPointPos, canvasWidth, canvasHeight)) {
                this._drawMapIfViewPointInLeftUpAndLeftDownAndRightUpAndRightDown(context, canvasWidth, canvasHeight);
            }
        },
        _drawMapIfViewPointInLeftUpAndRightUp: function (context, canvasWidth, canvasHeight) {
            var viewPointSize = this.getCanvasData(),
                x = this.getOffsetX(),
                y = this.getOffsetY();

            context.drawImage(this._mapBufferCanvas1,
                x, y,
                canvasWidth - x, viewPointSize.height,
                0, 0, canvasWidth - x, viewPointSize.height);

            context.drawImage(this._mapBufferCanvas2,
                0, y,
                viewPointSize.width - (canvasWidth - x), viewPointSize.height,
                canvasWidth - x, 0, viewPointSize.width - (canvasWidth - x), viewPointSize.height);
        },
        _drawMapIfViewPointInLeftDownAndRightDown: function (context, canvasWidth, canvasHeight) {
            var viewPointSize = this.getCanvasData(),
                x = this.getOffsetX(),
                y = this.getOffsetY();

            context.drawImage(this._mapBufferCanvas3,
                x, y - canvasHeight,
                canvasWidth - x, viewPointSize.height,
                0, 0, canvasWidth - x, viewPointSize.height);

            context.drawImage(this._mapBufferCanvas4,
                0, y - canvasHeight,
                viewPointSize.width - (canvasWidth - x), viewPointSize.height,
                canvasWidth - x, 0, viewPointSize.width - (canvasWidth - x), viewPointSize.height);
        },
        _drawMapIfViewPointInLeftUpAndLeftDown: function (context, canvasWidth, canvasHeight) {
            var viewPointSize = this.getCanvasData(),
                x = this.getOffsetX(),
                y = this.getOffsetY();

            context.drawImage(this._mapBufferCanvas1,
                x, y,
                viewPointSize.width, canvasHeight - y,
                0, 0, viewPointSize.width, canvasHeight - y);

            context.drawImage(this._mapBufferCanvas3,
                x, 0,
                viewPointSize.width, viewPointSize.height - (canvasHeight - y),
                0, canvasHeight - y, viewPointSize.width, viewPointSize.height - (canvasHeight - y));
        },
        _drawMapIfViewPointInRightUpAndRightDown: function (context, canvasWidth, canvasHeight) {
            var viewPointSize = this.getCanvasData(),
                x = this.getOffsetX(),
                y = this.getOffsetY();

            context.drawImage(this._mapBufferCanvas2,
                x - canvasWidth, y,
                viewPointSize.width, canvasHeight - y,
                0, 0, viewPointSize.width, canvasHeight - y);

            context.drawImage(this._mapBufferCanvas4,
                x - canvasWidth, 0,
                viewPointSize.width, viewPointSize.height - (canvasHeight - y),
                0, canvasHeight - y, viewPointSize.width, viewPointSize.height - (canvasHeight - y));
        },
        _drawMapIfViewPointInLeftUpAndLeftDownAndRightUpAndRightDown: function (context, canvasWidth, canvasHeight) {
            var viewPointSize = this.getCanvasData(),
                x = this.getOffsetX(),
                y = this.getOffsetY();

            context.drawImage(this._mapBufferCanvas1,
                x, y,
                canvasWidth - x, canvasHeight - y,
                0, 0, canvasWidth - x, canvasHeight - y);

            context.drawImage(this._mapBufferCanvas2,
                0, y,
                viewPointSize.width - (canvasWidth - x), canvasHeight - y,
                canvasWidth - x, 0, viewPointSize.width - (canvasWidth - x), canvasHeight - y);

            context.drawImage(this._mapBufferCanvas3,
                x, 0,
                canvasWidth - x, viewPointSize.height - (canvasHeight - y),
                0, canvasHeight - y, canvasWidth - x, viewPointSize.height - (canvasHeight - y));

            context.drawImage(this._mapBufferCanvas4,
                0, 0,
                viewPointSize.width - (canvasWidth - x), viewPointSize.height - (canvasHeight - y),
                canvasWidth - x, canvasHeight - y, viewPointSize.width - (canvasWidth - x), viewPointSize.height - (canvasHeight - y));
        },
        _isViewPointInLeftUp: function (viewPointData, canvasWidth, canvasHeight) {
            return viewPointData[1] <= canvasWidth && viewPointData[3] <= canvasHeight;
        },
        _isViewPointInLeftDown: function (viewPointData, canvasWidth, canvasHeight) {
            return viewPointData[1] <= canvasWidth && viewPointData[2] >= canvasHeight;
        },
        _isViewPointInRightUp: function (viewPointData, canvasWidth, canvasHeight) {
            return viewPointData[0] >= canvasWidth && viewPointData[3] <= canvasHeight;
        },
        _isViewPointInRightDown: function (viewPointData, canvasWidth, canvasHeight) {
            return viewPointData[0] >= canvasWidth && viewPointData[2] >= canvasHeight;
        },
        _isViewPointInLeftUpAndRightUp: function (viewPointData, canvasWidth, canvasHeight) {
            return viewPointData[0] < canvasWidth && viewPointData[1] > canvasWidth && viewPointData[3] <= canvasHeight;
        },
        _isViewPointInLeftDownAndRightDown: function (viewPointData, canvasWidth, canvasHeight) {
            return viewPointData[0] < canvasWidth && viewPointData[1] > canvasWidth && viewPointData[2] >= canvasHeight;
        },
        _isViewPointInLeftUpAndLeftDown: function (viewPointData, canvasWidth, canvasHeight) {
            return viewPointData[1] <= canvasWidth && viewPointData[2] < canvasHeight && viewPointData[3] > canvasHeight;
        },
        _isViewPointInRightUpAndRightDown: function (viewPointData, canvasWidth, canvasHeight) {
            return viewPointData[0] >= canvasWidth && viewPointData[2] < canvasHeight && viewPointData[3] > canvasHeight;
        },
        _isViewPointInLeftUpAndLeftDownAndRightUpAndRightDown: function (viewPointData, canvasWidth, canvasHeight) {
            return viewPointData[0] < canvasWidth && viewPointData[1] > canvasWidth
                && viewPointData[2] < canvasHeight && viewPointData[3] > canvasHeight;
        },
        _getViewPointData: function (incrementLeft, incrementUp, incrementRight, incrementDown) {
            var incrementLeft = incrementLeft || 0,
                incrementUp = incrementUp || 0,
                incrementRight = incrementRight || 0,
                incrementDown = incrementDown || 0,
                viewPointSize = this.getCanvasData(),
                x1 = this.getOffsetX() - incrementLeft,
                x2 = this.getOffsetX() + viewPointSize.width + incrementRight,
                y1 = this.getOffsetY() - incrementUp,
                y2 = this.getOffsetY() + viewPointSize.height + incrementDown;

            return  [x1, x2, y1, y2];
        }
    },
    Public: {
        dragSelect: false,
        passableGridData: [],
        buildableGridData: [],
        rightClickItem: null,

        getImgByIndex: function (index) {
            var imgId = null;

            switch (index) {
                case 0:
                    imgId = "grass";
                    break;
                case 1:
                    imgId = "desert";
                    break;
                case 2:
                    imgId = "road";
                    break;
                case 3:
                    imgId = "water";
                    break;
                default :
                    throw new Error(index + "错误");
                    break;
            }

            return YE.ImgLoader.getInstance().get(imgId);
        },
        onclick: function (e) {
            var clickedItem = this._mapSelect.getSelectItem(this.getGameX(), this.getGameY(), window.entityLayer.getChilds());

            this._mapSelect.onclick(e, clickedItem);
            this.dragSelect = false;

            return false;
        },
        onmousemove: function (e) {
            this._mapRoll.onmousemove(e);

            if (this._buttonPressed) {
                if (this._isDrag()) {
                    this.dragSelect = true
                }
            } else {
                this.dragSelect = false;
            }
        },
        onmousedown: function (e) {
            this._mapSelect.onmousedown(e, this.getGameX(), this.getGameY());

            if (e.mouseButton == 0) {
                this._buttonPressed = true;
//                this.dragX = this.getGameX();
//                this.dragY = this.getGameY();
                e.preventDefault();
            }
            return false;
        },
        onmouseup: function (e) {
            this._mapSelect.onmouseup(e, this.dragSelect, this.getGameX(), this.getGameY(), window.entityLayer.getChilds());

            if (e.mouseButton == 0) {
                this._buttonPressed = false;
                this.dragSelect = false;
            }
            return false;
        },
        oncontextmenu: function (e) {
            this._handleRightClick(this._mapSelect.getSelectItem(this.getGameX(), this.getGameY(),
                window.entityLayer.getChilds()));

            e.preventDefault();

            return false;
        },
        draw: function (context) {
            this._drawMap(context);
            this.base(context);
        },
        getOffsetX: function () {
            return tool.roundingNum(this._mapRoll.offsetX);
        },
        getOffsetY: function () {
            return tool.roundingNum(this._mapRoll.offsetY);
        },
        getGameX: function () {
            return this._mapRoll.gameX;
        },
        getGameY: function () {
            return this._mapRoll.gameY;
        },
        getDragX: function () {
            return this._mapSelect.dragX;
        },
        getDragY: function () {
            return this._mapSelect.dragY;
        },
        getX: function () {
            return this._mapRoll.x;
        },
        getY: function () {
            return this._mapRoll.y;
        },
        setOffsetX: function (offsetX) {
            this._mapRoll.offsetX = offsetX;
        },
        setOffsetY: function (offsetY) {
            this._mapRoll.offsetY = offsetY;
        },
        getSelectionBorderColor: function () {
            return this._mapSelect.selectionBorderColor;
        },
        getSelectionFillColor: function () {
            return this._mapSelect.selectionFillColor;
        },
        getLifeBarHeight: function () {
            return this._mapSelect.lifeBarHeight;
        },
        getHealthBarHealthyFillColor: function () {
            return this._mapSelect.healthBarHealthyFillColor;
        },
        getHealthBarDamagedFillColor: function () {
            return this._mapSelect.healthBarDamagedFillColor;
        },
        getMapBufferCanvasData: function () {
            return {
                width: this._mapBufferCanvas.width,
                height: this._mapBufferCanvas.height
            };
        },
        getLeftHalfAngle: function () {
            return Math.atan(config.map.gridHeight / config.map.gridWidth);
        },
        getSmallMapLeftHalfAngle: function () {
            return Math.atan(config.map.smallGridHeight / config.map.smallGridWidth);
        },
        getUpHalfAngle: function () {
            return Math.atan(config.map.gridWidth / config.map.gridHeight);
        },
        isInViewPoint: function (x, y, incrementLeft, incrementUp, incrementRight, incrementDown) {
            var viewPointData = this._getViewPointData(incrementLeft, incrementUp, incrementRight, incrementDown),
                x1 = viewPointData[0],
                x2 = viewPointData[1],
                y1 = viewPointData[2],
                y2 = viewPointData[3];

            return x >= x1 && x <= x2 && y >= y1 && y <= y2;
        },
        isChange: function () {
            return false;
        },
        onStartLoop: function () {
            this._handleRoll();
        },
        onEnter: function () {
            this._createBufferCanvas();
            this._setBufferCanvasSize();
            this._buildMap();

            this._createInstance();

            this._initViewPoint();

            this.setStateChange();
        },
        getUnitPassableGridData: function (uid) {
            var onlyUnitPassableGridData = null,
                items = null,
                x = 0,
                y = 0,
                self = this;

            items = window.entityLayer.getChilds().filter(function (item) {
                if (item.isDead() || item.passableGrid === undefined) {
                    return false;
                }

                return true;
            });

            onlyUnitPassableGridData = this._initPassableGrid();

            items.forEach(function (item) {
                if (item.getUid() === uid
                    || tool.isDestOutOfMap([Math.floor(item.gridY), Math.floor(item.gridX)])) {  //处理精灵被碰撞挤出地图的情况
                    return;
                }
                if (tool.isUnitSprite(item)) {
                    onlyUnitPassableGridData[Math.floor(item.gridY)][Math.floor(item.gridX)] = 1;
                }
                else {
                    for (y = 0; y < item.passableGrid.length; y++) {
                        for (x = 0; x < item.passableGrid[y].length; x++) {
                            if (item.passableGrid[y][x] === 1) {
                                onlyUnitPassableGridData[
                                    Math.floor(item.gridY) + y][Math.floor(item.gridX) + x] = 1;
                            }
                        }
                    }
                }
            });

            return onlyUnitPassableGridData;
        },
        buildPassableGrid: function () {
            var items = null,
                x = 0,
                y = 0,
                self = this;

            items = window.entityLayer.getChildsByTag(["building", "terrain", "resource"])
                .filter(function (item) {
                if (item.isDead()) {
                    return false;
                }

                return true;
            });

            this.passableGridData = this._initPassableGrid();

            items.forEach(function (item) {
                for (y = 0; y < item.passableGrid.length; y++) {
                    for (x = 0; x < item.passableGrid[y].length; x++) {
                        if (item.passableGrid[y][x] === 1) {
                            self.passableGridData[
                                Math.floor(item.gridY) + y][Math.floor(item.gridX) + x] = 1;
                        }
                    }
                }
            });
        },
        buildBuildableGrid: function () {
            var items = window.entityLayer.getChilds();
            var self = this;

            items = items.filter(function (item) {
                if (item.isDead) {
                    return !item.isDead();
                }
                return true;
            });

            this._initBuildableGrid();

            items.forEach(function (item) {
                //处理精灵被碰撞挤出地图的情况
                if (tool.isDestOutOfMap([Math.floor(item.gridY), Math.floor(item.gridX)])) {
                    return;
                }

                if (tool.isUnitSprite(item)) {
                    self.buildableGridData[Math.floor(item.gridY)][Math.floor(item.gridX)] = 1;
                }
                else if (tool.isGridSprite(item)) {
                    for (var y = item.buildableGrid.length - 1; y >= 0; y--) {
                        for (var x = item.buildableGrid[y].length - 1; x >= 0; x--) {
                            if (item.buildableGrid[y][x]) {
                                self.buildableGridData[item.gridY + y][item.gridX + x] = 1;
                            }
                        }
                    }
                }
            });
        },
        getSelectItems: function () {
            return this._mapSelect.getSelectItems();
        },
        notSelectItem: function (item) {
            this._mapSelect.notSelectItem(item);
        }
    }
});