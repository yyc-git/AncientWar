/**古代战争
 * 作者：YYC
 * 日期：2014-02-11
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var FarmerSprite = YYC.Class(CharacterSprite, {
    Init: function (data) {
        this.base(data);
    },
    Private: {
        _____prepareAnim: function () {
            this.P___initAnim("normal_stand");
            this.P___initAnim("normal_move");

            this.P___initAnim("build_build");

            this.P___initAnim("gather_stand");
            this.P___initAnim("gather_move");
            this.P___initAnim("gather_gather");

            this.P___initAnim("attack");

            this.P___initAnim("prepareAttack");


            this.P___initAnim("dead");
            this.P___initAnim("disappear");
        },
        _____hasMeat: function () {
            return this.gather_meat !== 0;
        },
        _____setAnimPrefixWhenMoveOrStand: function () {
            if (this._____hasMeat()) {
                this.animPrefix = "gather_";
            }
            else {
                this.animPrefix = "normal_";
            }
        }
    },
    Protected: {
        P___showMoreInfo: function () {
            this.base();

            ui.show("farmerPanel");
        }
    },
    Public: {
        animPrefix: "normal_",
        name: "farmer",
        direction: 0,
        gather_meat: 0,
        reloadTimeLeft: 0,

        runBuildAction: function (buildingTarget) {
            this.runOnlyOneAction(this.getBuildAction(buildingTarget));
        },
        runReturnMeatAction: function (target) {
            this.runOnlyOneAction(this.getReturnMeatAction(target));
        },
        runGatherMeatAction: function (target) {
            this.runOnlyOneAction(this.getGatherMeatAction(target));
        },
        getBuildAction: function (buildingTarget) {
            return Build.create(buildingTarget);
        },
        getReturnMeatAction: function (target) {
            return ReturnMeat.create(target);
        },
        getGatherMeatAction: function (target) {
            return GatherMeat.create(target);
        },
        runMoveAnim: function () {
            this._____setAnimPrefixWhenMoveOrStand();
            this.runOnlyOneAnim(this.animPrefix + "move_" + moveAlgorithm.getDirectionRoundNumber(this.direction));
        },
        runStandAnim: function () {
            this._____setAnimPrefixWhenMoveOrStand();
            this.runOnlyOneAnim(this.animPrefix + "stand_" + moveAlgorithm.getDirectionRoundNumber(this.direction));
        },
        runGatherAnim: function () {
            this.animPrefix = "gather_";
            this.runOnlyOneAnim(this.animPrefix + "gather_" + moveAlgorithm.getDirectionRoundNumber(this.direction));
        },
        runBuildAnim: function () {
            this.animPrefix = "build_";
            this.runOnlyOneAnim(this.animPrefix + "build_" + moveAlgorithm.getDirectionRoundNumber(this.direction));
        },
        attackDamage: function (target) {
            combatAlgorithm.meleeAttack(target, this.damage);
        },
        gatherMeat: function (target) {
            this.runGatherMeatAction(target);
        },
        returnMeat: function (target) {
            this.runReturnMeatAction(target);
        },
        build: function (args) {
            var deployBuildingClass = null,
                data = null,
                buildingTarget = null;

            if (arguments.length === 1) {
                buildingTarget = arguments[0];
            }
            else {
                deployBuildingClass = arguments[0];
                data = arguments[1];

                data.team = this.team;

                buildingTarget = new deployBuildingClass(data);
            }

            this.runBuildAction(buildingTarget);
        },
        onStartLoop: function () {
            this.base();

            this.P____rangeHeight = this.getHeight();
        },
        onEnter: function () {
            this._____prepareAnim();

            this.base();
        }
    }
});