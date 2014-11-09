/**YEngine2D
 * 作者：YYC
 * 日期：2014-01-17
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */


var EffectLayer = YYC.Class(YE.Layer, {
    Private: {
        _canDeployBuilding: false,
        _placementGrid: null,
        _deployBuildingName: null,
        _deployBuildingClass: null,

        _drawDragSelect: function () {
            var mapLayer = window.mapLayer,
                gameX = mapLayer.getGameX(),
                gameY = mapLayer.getGameY(),
                dragX = mapLayer.getDragX(),
                dragY = mapLayer.getDragY(),
                offsetX = mapLayer.getOffsetX(),
                offsetY = mapLayer.getOffsetY();


            if (mapLayer.dragSelect) {
                var x = Math.min(gameX, dragX);
                var y = Math.min(gameY, dragY);
                var width = Math.abs(gameX - dragX);
                var height = Math.abs(gameY - dragY);

                var context = this.getContext();

                context.strokeStyle = 'white';
                context.strokeRect(x - offsetX, y - offsetY, width, height);
            }
        },
        _drawBuildingDeploy: function () {
            var mapLayer = window.mapLayer,
                offsetX = mapLayer.getOffsetX(),
                offsetY = mapLayer.getOffsetY(),
                gridSize = tool.getDiamondSize(),
                mouseGridPos = null;

            var placementGrid = this._placementGrid;
            var fillStyle = null;
            var originPoint = null;

            mouseGridPos = this._getMouseFloorGridPos();

            for (var i = placementGrid.length - 1; i >= 0; i--) {
                for (var j = placementGrid[i].length - 1; j >= 0; j--) {
                    if (placementGrid[i][j]) {
                        fillStyle = "rgba(0,0,255,0.3)";
                    }
                    else {
                        fillStyle = "rgba(255,0,0,0.6)";
                    }
                    originPoint = tool.convertToPix(mouseGridPos[0] + j, mouseGridPos[1] + i);
                    this.getGraphics().fillDiamondBox(fillStyle,
                        [originPoint[0] - offsetX, originPoint[1] - offsetY], mapLayer.getLeftHalfAngle(),
                        gridSize);
                }
            }
//            }
        },
        _getBuildableGrid: function () {
            return YYC.Tool.extend.extendDeep(config.spriteConfig[this._deployBuildingName].buildableGrid);
        },
        _setFlagAndPlacementGrid: function (gameGridPos) {
            var mapLayer = window.mapLayer;

            this._placementGrid = this._getBuildableGrid();
            this._canDeployBuilding = true;

            for (var i = 0; i < this._placementGrid.length; i++) {
                for (var j = 0; j < this._placementGrid[i].length; j++) {
                    if (tool.isDestOutOfMap([gameGridPos[0] + j, gameGridPos[1] + i]) ||
                        mapLayer.buildableGridData[gameGridPos[1] + i][gameGridPos[0] + j] === 1 ||
                        this._isInFog(gameGridPos, i, j)) {
                        this._canDeployBuilding = false;
                        this._placementGrid[i][j] = 0;
                    }
                    else {
                        this._placementGrid[i][j] = 1;
                    }
                }
            }
        },
        _isInFog: function (gameGridPos, i, j) {
            return window.fogLayer.isInFog(gameGridPos[0] + j, gameGridPos[1] + i);
        },
        _getMouseFloorGridPos: function () {
            var gameX = mapLayer.getGameX(),
                gameY = mapLayer.getGameY(),
                mouseGridPos = tool.convertToGrid(gameX, gameY);

            return [Math.floor(mouseGridPos[0]), Math.floor(mouseGridPos[1])];
        },
        _buildData: function () {
            var gridPos = this._getMouseFloorGridPos();

            return {
                //适用于findNearestGrid
                gridX: gridPos[0],
                gridY: gridPos[1]
            };
        },
        _setBuildCommand: function () {
            var invoker = null,
                command = null,
                mapLayer = window.mapLayer,

                farmers = null;
            //获得农民
            farmers = mapLayer.getSelectItems().filter(function (item) {
                return item.isInstanceOf(FarmerSprite);
            });

            invoker = new Invoker();

            command = new BuildCommand(farmers, this._deployBuildingClass, this._buildData());

            invoker.setCommand(command);
            invoker.action();
        },
        _setMoveAndAttackCommand: function () {
            var invoker = null,
                command = null,
                mapLayer = window.mapLayer,
                gameGridPos = tool.convertToGrid(mapLayer.getGameX(), mapLayer.getGameY()),
                selectUnits = null;

            if (tool.isDestOutOfMap(gameGridPos)) {
                return;
            }

            selectUnits = window.mapLayer.getSelectItems().filter(function (item) {
                return tool.isUnitSprite(item);
            });
            invoker = new Invoker();
            command = new MoveAndAttackCommand(selectUnits, gameGridPos);

            invoker.setCommand(command);
            invoker.action();
        },
        _initBuildingDeploy: function () {
            var mouseGridPos = this._getMouseFloorGridPos();

            if (tool.isDestOutOfMap(mouseGridPos)) {
                this._canDeployBuilding = false;
            }
            else {
                this._canDeployBuilding = true;
            }

            mapLayer.buildBuildableGrid();

            this._setFlagAndPlacementGrid(mouseGridPos);
        }
    },
    Public: {
        isMoveAndAttackCommand: false,

        draw: function () {
            this._drawDragSelect();

            if (this._deployBuildingName) {
                this._drawBuildingDeploy();
            }
        },
        build: function (buildingName, buildingClass) {
            //判断资源是否足够
            if (this.getParent().meat < config.spriteConfig[buildingName].cost) {
                ui.showMessageBox("meat不足！需要" + config.spriteConfig[buildingName].cost + "个meat");
                return;
            }


            this._deployBuildingName = buildingName;
            this._deployBuildingClass = buildingClass;
        },
        cancelDeployBuilding: function () {
            this._deployBuildingName = null;
            this._deployBuildingClass = null;
            this._canDeployBuilding = false;
        },
        isChange: function () {
            return false;
        },
        moveAndAttack: function () {
            this.isMoveAndAttackCommand = true;
        },
        onclick: function () {
            if (this._canDeployBuilding) {
                this._setBuildCommand();
                this.cancelDeployBuilding();
                return;
            }

            this.cancelDeployBuilding();

            if (this.isMoveAndAttackCommand) {
                this._setMoveAndAttackCommand();
                this.isMoveAndAttackCommand = false;
            }
        },
        onStartLoop: function () {
            if (this._deployBuildingName) {
                this._initBuildingDeploy();
            }
        },
        onEndLoop: function () {
            if (window.mapLayer.dragSelect || this._deployBuildingName) {
                this.setStateChange();
            }
        }
    }
});