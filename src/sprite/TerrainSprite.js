/**古代战争
 * 作者：YYC
 * 日期：2014-02-25
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var TerrainSprite = YYC.AClass(Sprite, {
    Init: function (data) {
        this.base(data);

        this.P_createAndSetDisplayTarget("terrain_json", "terrain_image",this.name, this.pixelOffsetX, this.pixelOffsetY);
    },
    Protected: {
    },
    Public: {
    }
});