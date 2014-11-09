/**古代战争 小地图基类
 * 作者：YYC
 * 日期：2014-05-12
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var SmallMapLayer = YYC.AClass(YE.Layer, {
    Private: {
        _setCanvasSize: function () {
            var bigMapBufferCanvasData = window.mapLayer.getMapBufferCanvasData(),
                smallMapCanvasData = {
                    width: bigMapBufferCanvasData.width / config.map.scale,
                    height: bigMapBufferCanvasData.height / config.map.scale
                };

            this.setWidth(smallMapCanvasData.width);
            this.setHeight(smallMapCanvasData.height);
        }
    },
    Public: {
        onEnter: function () {
            var zIndex = this.getZIndex();

            this._setCanvasSize();  //设置画布大小后，画布所有样式和内容会重置

            this.setZIndex(zIndex);
        }
    }
});