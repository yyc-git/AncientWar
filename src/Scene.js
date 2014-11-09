/**古代战争
 * 作者：YYC
 * 日期：2014-02-01
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var Scene = YYC.Class(YE.Scene, {
    Private: {
        _levelData: null,

        _initScene: function () {
            this._addLayer();
            this._setInitResource();
            this._initSubject();
        },
        _setInitResource: function () {
            this.meat = this._levelData.meat;
        },
        _addLayer: function () {
            var smallMapPos = {x: 483, y: 445},
                smallMapFogLayerPos = {x: 481, y: 445};

            window.mapLayer = new MapLayer("mapLayerCanvas", {x: 0, y: 25});

            window.smallMapBackgroundLayer = new SmallMapBackgroundLayer("smallMapBackgroundLayerCanvas", smallMapPos);
            window.smallMapEntityLayer = new SmallMapEntityLayer("smallMapEntityLayerCanvas", smallMapPos);
            window.smallMapFogLayer = new SmallMapFogLayer("smallMapFogLayerCanvas", smallMapFogLayerPos);
            window.smallMapEffectLayer = new SmallMapEffectLayer("smallMapEffectLayerCanvas", smallMapPos);

            window.entityLayer = new EntityLayer("entityLayerCanvas", {x: 0, y: 25});
            window.effectLayer = new EffectLayer("effectLayerCanvas", {x: 0, y: 25});
            window.bulletLayer = YE.Layer.create("bulletLayerCanvas", {x: 0, y: 25});
            window.fogLayer = new FogLayer("fogLayerCanvas", {x: -3, y: 25});   //往左移动一点，然后使绘制的迷雾菱形方格边长变大点，使得迷雾能完全遮挡方格

            // 先加入元素到层中，再将层加入到场景中。
            // 这样可保证layer->onEnter中可访问layer的元素
            this._addElementsToLayers();

            this.addChild(window.mapLayer, 11);
            this.addChild(window.entityLayer, 12);
            this.addChild(window.bulletLayer, 13);
            this.addChild(window.fogLayer, 14);
            this.addChild(window.effectLayer, 15);

            this.addChild(window.smallMapBackgroundLayer, 1);
            this.addChild(window.smallMapEntityLayer, 2);
            this.addChild(window.smallMapFogLayer, 3);
            this.addChild(window.smallMapEffectLayer, 4);
        },
        _addElementsToLayers: function () {
            window.mapLayer.addChilds(
                this._createSprites(
                    this._levelData.items.terrain.plants, PlantsSprite
                )
            );
            window.entityLayer.addChilds(this._createBuildingSprites(), 0, "building");
            window.entityLayer.addChilds(this._createTiles(), 0, "terrain");
            window.entityLayer.addChilds(this._createUnitSprites(), 0, "unit");
            window.entityLayer.addChilds(this._createRourceSprites(), 0, "resource");
        },
        _createTiles: function () {
            var moutain = this._createSprites(
                this._levelData.items.terrain.moutain, MoutainSprite
            );

            return moutain;
        },
        _createBuildingSprites: function () {
            var shootingRangeSprite = this._createSprites(
                this._levelData.items.building.shootingRange, ShootingRangeSprite
            );
            var baseSprite = this._createSprites(
                this._levelData.items.building.base, BaseSprite
            );
            var towerSprite = this._createSprites(
                this._levelData.items.building.tower, TowerSprite
            );

            return shootingRangeSprite.concat(baseSprite, towerSprite);
        },
        _createUnitSprites: function () {
            var ancherSprite = this._createSprites(
                this._levelData.items.unit.archer, ArcherSprite
            );
            var farmerSprite = this._createSprites(
                this._levelData.items.unit.farmer, FarmerSprite
            );

            return ancherSprite.concat(farmerSprite);
        },
        _createRourceSprites: function () {
            var foodSprite = this._createSprites(
                this._levelData.items.resource.food, FoodSprite
            );

            return foodSprite;
        },
        _createSprites: function (items, Class) {
            var i = 0,
                len = 0,
                sprites = [],
                sprite = null;

            for (i = 0, len = items.length; i < len; i++) {
                sprite = new Class(items[i]);
                sprites.push(sprite);
            }

            return sprites;
        },
        _initSubject: function () {
            this.subject = new YYC.Pattern.Subject();
            this.subject.subscribe(window.fogLayer, window.fogLayer.adjustRunInterval);
        },
        _initEvent: function () {
            var effectLayerCanvas = document.getElementById("effectLayerCanvas"),
                smallMapEffectCanvas = document.getElementById("smallMapEffectLayerCanvas");

            var mapLayer = window.mapLayer,
                effectLayer = window.effectLayer,
                smallMapEffectLayer = window.smallMapEffectLayer,
                smallMapBackgroundLayer = window.smallMapBackgroundLayer;

            YE.EventManager.addListener(YE.Event.MOUSE_MOVE, mapLayer.onmousemove, document.getElementById("gameArea"), mapLayer);
            YE.EventManager.addListener(YE.Event.CLICK, effectLayer.onclick, effectLayerCanvas, effectLayer);
            YE.EventManager.addListener(YE.Event.CLICK, mapLayer.onclick, effectLayerCanvas, mapLayer);
            YE.EventManager.addListener(YE.Event.MOUSE_DOWN, mapLayer.onmousedown, effectLayerCanvas, mapLayer);
            YE.EventManager.addListener(YE.Event.CONTEXTMENU, mapLayer.oncontextmenu, effectLayerCanvas, mapLayer);
            YE.EventManager.addListener(YE.Event.MOUSE_UP, mapLayer.onmouseup, effectLayerCanvas, mapLayer);

            YE.EventManager.addListener(YE.Event.CONTEXTMENU, smallMapBackgroundLayer.oncontextmenu, smallMapEffectCanvas, smallMapBackgroundLayer);
            //先触发smallMapBackgroundLayer.onclick，再触发smallMapEffectLayer.onclick
            YE.EventManager.addListener(YE.Event.CLICK, smallMapBackgroundLayer.onclick, smallMapEffectCanvas, smallMapBackgroundLayer);
            YE.EventManager.addListener(YE.Event.CLICK, smallMapEffectLayer.onclick, smallMapEffectCanvas, smallMapEffectLayer);
        }
    },
    Public: {
        meat: 10,
        playerTeam: "blue",
        enemyTeam: "red",
        subject: null,

        isMeatNotEnough: function (cost) {
            return this.meat < cost;
        },
        onStartLoop: function () {
            ui.showResource(this.meat);
        },
        onEnter: function () {
            this._levelData = LevelManager.getInstance().getLevelData();

            this._initScene();
            this._initEvent();

            setInterval(function () {
                ui.showSystemInfo("FPS:" + Math.floor(YE.Director.getInstance().getFps()));
            }, 1000);
        },
        onExit: function () {
            YE.EventManager.removeAllListener();
        }
    }
});
