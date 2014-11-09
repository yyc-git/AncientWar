/**古代战争
 * 作者：YYC
 * 日期：2014-02-12
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var FoodSprite = YYC.Class(ResourceSprite, {
    Init: function (data) {
        this.base(data);

        if(data.total){
            this.total = data.total;
        }
    },
    Protected: {
    },
    Public: {
        name: "food",
        total: 20
    }
});