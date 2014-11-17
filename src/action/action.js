/**古代战争 自定义动作类
 * 作者：YYC
 * 日期：2014-04-21
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var MoveTo = YYC.Class(YE.ActionInterval, {
    Init: function (destination) {
        this.base();

        this._destination = destination;
    },
    Private: {
        _destination: null,

        _isNotBuildPassGrid: function () {
            return window.mapLayer.passableGridData.length === 0;
        },
        _changeDest: function () {
            var fromGrid = [this.getTarget().gridX, this.getTarget().gridY];
            this._destination = moveAlgorithm.findNearestReplaceGrid(fromGrid, this._destination, mapLayer.passableGridData);
        }
    },
    Public: {
        initWhenCreate: function () {
        },
        onEnter: function () {
            if (this._isNotBuildPassGrid()) {
                mapLayer.buildPassableGrid();
            }

            if (moveAlgorithm.isDestCanNotPass(this._destination)) {
                this._changeDest();
            }
        },
        update: function (time) {
            if (this.getTarget().isNeedStopWhileNearDest(this._destination)) {
                this.getTarget().runGuardAction();
                return;
            }

            this.getTarget().moveToDest(this._destination);
        },
        copy: function () {
            return this;
        },
        reverse: function () {
        }
    },
    Static: {
        create: function (destination) {
            var action = new MoveTo(destination);
            action.initWhenCreate();

            return action;
        }
    }
});

var TowerGuard = YYC.Class(YE.ActionInterval, {
    Init: function () {
        this.base();
    },
    Public: {
        update: function (time) {
            var targets = null;

            targets = combatAlgorithm.findTargetsInAttackRange(this.getTarget());

            if (targets.length > 0) {
                this.getTarget().runAttackAction(this.getTarget().findFirstTarget(targets));
            }
        },
        copy: function () {
            return this;
        },
        reverse: function () {
        }
    },
    Static: {
        create: function () {
            var action = new TowerGuard();

            return action;
        }
    }
});

var UnitGuard = YYC.Class(YE.ActionInterval, {
    Init: function () {
        this.base();
    },
    Public: {
        update: function (time) {
            var targets = null;

            this.getTarget().runStandAnim();
            this.getTarget().stopMove();

            if (!this.getTarget().canAttack) {
                return;
            }

            //寻找可以攻击我的目标
            targets = combatAlgorithm.findTargetsCanAttackMeOrCanAttackInAttackRange(this.getTarget());

            if (targets.length > 0) {
                this.getTarget().runAttackAction(this.getTarget().findFirstTarget(targets));
            }
        },
        copy: function () {
            return this;
        },
        reverse: function () {
        }
    },
    Static: {
        create: function () {
            var action = new UnitGuard();

            return action;
        }
    }
});

(function () {
    var MAX_MELEEATTACKDISTANCE = 3;

    var Attack = YYC.AClass(YE.ActionInterval, {
        Init: function (target) {
            this.base();

            this._attackTarget = target;
        },
        Private: {
            _attackTarget: null
        },
        Protected: {
            Abstract: {
                P_isNotValidateTarget: function (target) {
                },
                P_handleAfterFinishAttack: function () {
                },
                P_handleBeforeDamage: function (target) {
                },
                P_isTimeToDamage: function () {
                },
                P_attackDamage: function (target) {
                }
            },

            P_refreshReloadTime: function () {
                this.getTarget().reloadTimeLeft = this.getTarget().reloadTime;
            },
            P__isTargetCanNotAttack: function (target) {
                return target.canAttack == false;
            },
            P_findFirstTarget: function (targets) {
                return targets[0];
            },
            P_setAttackTarget: function (target) {
                this._attackTarget = target;
            },
            P_getAttackTarget: function () {
                return this._attackTarget;
            }
        },
        Public: {
            copy: function () {
                return this;
            },
            reverse: function () {
            },

            update: function (time) {
                if (this.P_isNotValidateTarget(this._attackTarget)) {
                    this.P_handleAfterFinishAttack();
                    return YE.returnForTest;
                }

                if (this.P_handleBeforeDamage(this._attackTarget) === config.returnFlag) {
                    return YE.returnForTest;
                }

                if (this.P_isTimeToDamage()) {
                    this.P_attackDamage(this._attackTarget);
                }
            }
        }
    });

    var CommonTowerAttack = YYC.Class(Attack, {
        Protected: {
            P_attackDamage: function (target) {
                this.getTarget().playSoundWhenInViewPoint("tower_attack");

                combatAlgorithm.remoteAttack(target, this.getTarget().getAttackPoint(target), this.getTarget().damage);
                this.P_refreshReloadTime();
            },
            P_isTimeToDamage: function () {
                return this.getTarget().reloadTimeLeft === 0;
            },
            P_handleAfterFinishAttack: function () {
                this.getTarget().runGuardAction();
            },
            P_handleBeforeDamage: function (target) {
                //如果箭塔正在攻击建筑物时，有敌方弓箭手进入箭塔射程后，则会转而攻击弓箭手
                if (this.P__isTargetCanNotAttack(target)) {
                    targets = combatAlgorithm.findTargetsCanAttackInAttackRange(this.getTarget());
                    if (targets.length > 0) {
                        this.P_setAttackTarget(this.P_findFirstTarget(targets));

                        return config.returnFlag;
                    }
                }

                if (this.getTarget().reloadTimeLeft > 0) {
                    this.getTarget().reloadTimeLeft -= 1;
                }
            },
            P_isNotValidateTarget: function (target) {
                return !target || target.isDead() || !combatAlgorithm.isInAttackRange(this.getTarget(), target);
            }
        },
        Static: {
            create: function (target) {
                var action = new CommonTowerAttack(target);

                return action;
            }
        }
    });

    var UnitAttack = YYC.AClass(Attack, {
        Private: {
            __last_attackTarget: null,
            __isDamaged: false,

            __isPrepareAttackAnim: function () {
                return this.getTarget().isCurrentAnim("prepareAttack");
            },
            __isAttackAnim: function () {
                return this.getTarget().isCurrentAnim("attack");
            },
            __isCurrentAnimFinish: function () {
                return this.getTarget().getCurrentAnim().isFinish();
            },
            __isCurrentAnimRunnig: function () {
                return this.getTarget().getCurrentAnim().isStart();
            },
            __isAttackAnimFinish: function () {
                return this.__isAttackAnim() && this.__isCurrentAnimFinish();
            },
            __isAttackAnimRuning: function () {
                return this.__isAttackAnim() && this.__isCurrentAnimRunnig();
            },
            __isDamageFrame: function () {
                return this.getTarget().getDisplayFrame().index === this.getTarget().damageFrameIndex;
            },
            __setAttackDirection: function (target) {
                var destination = target.getAttackedPoint();

                this.getTarget().direction = combatAlgorithm.findFireDirection([this.getTarget().gridX, this.getTarget().gridY], destination);
            },
            __isTimeToRunPrepareAttackAnim: function () {
                return this.getTarget().reloadTimeLeft > 0
                    && (this.__isAttackAnimFinish() || !this.__isAttackAnim());
            },
            __runPrepareAttackAnim: function () {
                this.getTarget().runPrepareAttackAnim();
            },
            __runAttackAnim: function () {
                this.getTarget().runAttackAnim();
            },
            __isChangeAttackTarget: function () {
                if (this.__last_attackTarget) {
                    return this.__last_attackTarget.getUid() !== this.P_getAttackTarget().getUid()
                }

                return this.__last_attackTarget !== this.P_getAttackTarget();
            },
            __isAttacking: function () {
                return this.__isAttackAnimRuning();
            },
            __outOfAttackDistance: function (target) {
                return !combatAlgorithm.isInAttackRange(this.getTarget(), target);
            },
            __runAttackOnlyOnce: function (target) {
                if (!this.__isAttackAnimRuning()) {
                    this.__runAttackAnim();

                    this.__last_attackTarget = target;
                    this.__isDamaged = false;
                    this.P_refreshReloadTime();
                }
            }
        },
        Protected: {
            P_isTimeToDamage: function () {
                if (!this.__isDamaged && this.__isDamageFrame()) {
                    return true;
                }

                return false;
            },
            P_attackDamage: function (target) {
                this.getTarget().playSoundWhenInViewPoint(this.getTarget().name + "_attack");

                this.__isDamaged = true;
                this.getTarget().attackDamage(target);
            },
            P_handleBeforeDamage: function (target) {
                this.getTarget().stopMove();

                this.__setAttackDirection(target);

                if (this.__isTimeToRunPrepareAttackAnim()) {
                    this.__runPrepareAttackAnim();
                    this.getTarget().reloadTimeLeft -= 1;

                    return config.returnFlag;
                }

                this.__runAttackOnlyOnce(target);
            },
            P_isNotValidateTarget: function (target) {
                //最后一次攻击动画要播放完
                if (this.__isAttackAnim() && !this.__isCurrentAnimFinish()) {
                    return false;
                }

                return !target || target.isDead();
            },
            P__getAttackDest: function (target) {
                if (tool.isBuildingSprite(target)) {
                    return moveAlgorithm.findNearestGrid(this.getTarget(), target);
                }
                else {
                    return target.getAttackedPoint();
                }
            },
            P__canNotAttack: function (target) {
                return  this.__outOfAttackDistance(target) && (!this.__isAttacking() ||
                    // 判断是否更改了攻击目标
                    // 解决“单位A攻击一个敌方精灵a后（已开始播放攻击动画时），选中A攻击另一个敌方精灵b，
                    // 则A会在原地对a播放完攻击动画后（会对b而不是a造成伤害！），再去攻击b”的bug
                    this.__isChangeAttackTarget())

            }
        }
    });


    var CommonUnitAttack = YYC.Class(UnitAttack, {
        Protected: {
            P_handleBeforeDamage: function (target) {
                if (this.P__canNotAttack(target)) {
                    this.getTarget().moveToDest(this.P__getAttackDest(target));

                    return config.returnFlag;
                }

                this.base(target);
            },
            P_handleAfterFinishAttack: function () {
                this.getTarget().runGuardAction();
            }
        },
        Static: {
            create: function (target) {
                var action = new CommonUnitAttack(target);

                return action;
            }
        }
    });

    var _MoveAndAttack = YYC.Class(UnitAttack, {
        Init: function (target, destGrid) {
            this.base(target);

            this.___attackDestGrid = destGrid;
        },
        Private: {
            ___attackDestGrid: null,

            ___isMeleeAttackType: function () {
                return this.getTarget().attackDistance < MAX_MELEEATTACKDISTANCE;
            }
        },
        Protected: {
            P_handleBeforeDamage: function (target) {
                if (this.P__canNotAttack(target)) {
                    targets = combatAlgorithm.findTargetsCanAttackInAttackRange(this.getTarget());

                    if (targets.length > 0) {
                        this.P_setAttackTarget(this.P_findFirstTarget(targets));

                        return config.returnFlag;
                    }

                    //如果能被target攻击或者自己为近战且攻击的目标为超出攻击距离的建筑
                    if (combatAlgorithm.isInAttackRange(target, this.getTarget()) ||
                        (this.___isMeleeAttackType() && !target.canAttack)) {
                        this.getTarget().moveToDest(this.P__getAttackDest(target));

                        return config.returnFlag;
                    }

                    //否则，继续moveAndAttack
                    this.getTarget().runMoveAndAttackAction(this.___attackDestGrid);
                    return config.returnFlag;
                }

//                如果正在攻击建筑物时，有敌方可攻击的单位进入射程或可被敌方单位攻击，则会转而攻击敌方单位
                if (this.P__isTargetCanNotAttack(target)) {
                    targets = combatAlgorithm.findTargetsCanAttackMeOrCanAttackInAttackRange(this.getTarget());
                    if (targets.length > 0) {
                        this.P_setAttackTarget(this.P_findFirstTarget(targets));

                        return config.returnFlag;
                    }
                }

                this.base(target);
            },
            P_handleAfterFinishAttack: function () {
                this.getTarget().runMoveAndAttackAction(this.___attackDestGrid);
            }
        },
        Static: {
            create: function (target, destGrid) {
                var action = new _MoveAndAttack(target, destGrid);

                return action;
            }
        }
    });


    var MoveAndAttack = YYC.Class(YE.ActionInterval, {
        Init: function (destGrid) {
            this.base();

            this._attackDestGrid = destGrid;
        },
        Private: {
            _attackDestGrid: null,

            _findFirstTarget: function (targets) {
                return targets[0];
            },
            _isMeleeAttackType: function () {
                return this.getTarget().attackDistance < MAX_MELEEATTACKDISTANCE;
            }
        },
        Public: {
            update: function (time) {
                var targets = null;

                if (this._isMeleeAttackType()) {
                    targets = combatAlgorithm.findTargetsCanAttackMeOrInAttackRange(this.getTarget(), MAX_MELEEATTACKDISTANCE);
                }
                else {
                    targets = combatAlgorithm.findTargetsCanAttackMeOrInAttackRange(this.getTarget());
                }

                if (targets.length > 0) {
                    //_MoveAndAttack要保存___attackDestGrid
                    this.getTarget().runOnlyOneAction(_MoveAndAttack.create(this._findFirstTarget(targets), this._attackDestGrid));

                    return;
                }

                if (this.getTarget().isNeedStopWhileNearDest(this._attackDestGrid)) {
                    this.getTarget().runGuardAction();
                    return;
                }

                this.getTarget().moveToDest(this._attackDestGrid);
            },
            copy: function () {
                return this;
            },
            reverse: function () {
            }
        },
        Static: {
            create: function (destGrid) {
                var action = new MoveAndAttack(destGrid);

                return action;
            }
        }
    });


    var _Hunt = YYC.Class(UnitAttack, {
        Protected: {
            P_handleBeforeDamage: function (target) {
                if (this.P__canNotAttack(target)) {
                    this.getTarget().moveToDest(this.P__getAttackDest(target));

                    return config.returnFlag;
                }

                this.base(target);
            },
            P_handleAfterFinishAttack: function () {
                this.getTarget().runHuntAction();
            }
        },
        Public: {
        },
        Static: {
            create: function (target) {
                var action = new _Hunt(target);

                return action;
            }
        }
    });

    var Hunt = YYC.Class(YE.ActionInterval, {
        Private: {
            _findFirstTarget: function (targets) {
                return targets[0];
            }
        },
        Public: {
            update: function (time) {
                var GLOBAL_SEARCH_RANGE = 100;
                var targets = combatAlgorithm.findTargetsInAttackRange(this.getTarget(), GLOBAL_SEARCH_RANGE);

                if (targets.length > 0) {
                    this.getTarget().runOnlyOneAction(_Hunt.create(this._findFirstTarget(targets)));

                    return;
                }
                this.getTarget().runGuardAction();
            },
            copy: function () {
                return this;
            },
            reverse: function () {
            }
        },
        Static: {
            create: function () {
                var action = new Hunt();

                return action;
            }
        }
    });

    window.Attack = Attack;
    window.CommonTowerAttack = CommonTowerAttack;
    window.CommonUnitAttack = CommonUnitAttack;
    window.MoveAndAttack = MoveAndAttack;
    window.Hunt = Hunt;
}());


var ResourceAction = YYC.AClass(YE.ActionInterval, {
    Private: {
    },
    Protected: {
        P_setGuardAction: function () {
            this.getTarget().runGuardAction();
        },
        P_findNearestFoodToGather: function () {
            var newTarget = moveAlgorithm.findNearestSprite(this.getTarget(), FoodSprite, function (sprite) {
                return sprite.total > 0;
            });


            if (newTarget === null) {
                this.P_setGuardAction();
                return;
            }

            this.getTarget().runGatherMeatAction(newTarget);
        }
    }
});


var ReturnMeat = YYC.Class(ResourceAction, {
    Init: function (target) {
        this.base();

        this.__submitTarget = target;
    },
    Private: {
        __submitTarget: null,
        __gather_returnDest: null,

        __submitMeat: function () {
            YE.Director.getInstance().getCurrentScene().meat += this.getTarget().gather_meat;
        },
        __findReturnDestination: function (target) {
            this.__gather_returnDest = moveAlgorithm.findNearestGrid(this.getTarget(), target);
        }
    },
    Public: {
        update: function (time) {
            if (!this.__gather_returnDest) {
                this.P_setGuardAction();
                return;
            }

            if (!moveAlgorithm.isNearBuildableSpriteDest([this.getTarget().gridX, this.getTarget().gridY], this.__gather_returnDest)) {
                this.getTarget().moveToDest(this.__gather_returnDest);

                return;
            }

            this.getTarget().stopMove();

            this.__submitMeat();
            this.getTarget().gather_meat = 0;
            this.P_findNearestFoodToGather();
        },
        copy: function () {
            return this;
        },
        reverse: function () {
        },
        onEnter: function () {
            this.__findReturnDestination(this.__submitTarget);
        }
    },
    Static: {
        create: function (target) {
            var action = new ReturnMeat(target);

            return action;
        }
    }
});


var GatherMeat = YYC.Class(ResourceAction, {
    Init: function (target) {
        this.base();

        this.__resourceTarget = target;
    },
    Private: {
        __resourceTarget: null,
        __gather_meat_temp: 0,

        __isToReturnMeat: function (target) {
            return this.getTarget().gather_meat >= this.getTarget().gather_maxMeat ||
                (this.getTarget().gather_meat !== 0 && target.total === 0);
        },
        __gatherMeat: function (target) {
            this.getTarget().playSoundWhenInViewPoint("farmer_gather");

            this.getTarget().runGatherAnim();

            this.__addMeat(target);

            target.showInfo();
        },
        __addMeat: function (target) {
            this.__gather_meat_temp += this.getTarget().gather_speed;

            if (this.__gather_meat_temp >= 1) {
                this.getTarget().gather_meat += 1;
                target.total -= 1;
                this.__gather_meat_temp = 0;
            }
        },
        __returnToNearestBase: function () {
            var self = this.getTarget(),
                base = null;
//
            base = moveAlgorithm.findNearestSprite(this.getTarget(), BaseSprite, function (sprite) {
                return sprite.team === self.team && !sprite.isBuildState() && !sprite.isDead();
            });

            if (base === null) {
                this.P_setGuardAction();
                return;
            }

            this.getTarget().runReturnMeatAction(base);
        }
    },
    Public: {
        update: function (time) {
            var destination = null,
                target = this.__resourceTarget;

            if (!this.__resourceTarget) {
                this.P_setGuardAction();
                return;
            }

            if (!this.__isToReturnMeat(target)) {
                //如果资源被采集完了，则寻找最近的同类没有被采集完的资源进行采集
                if (target.total <= 0) {
                    this.P_findNearestFoodToGather();
                    return;
                }

                destination = [target.gridX, target.gridY];

                if (!moveAlgorithm.isNearBuildableSpriteDest([this.getTarget().gridX, this.getTarget().gridY], destination)) {
                    this.getTarget().moveToDest(destination);
                    return;
                }

                this.getTarget().stopMove();

                this.__gatherMeat(target);
                return;
            }
            this.__returnToNearestBase();
        },
        copy: function () {
            return this;
        },
        reverse: function () {
        }
    },
    Static: {
        create: function (target) {
            var action = new GatherMeat(target);

            return action;
        }
    }
});


var Build = YYC.Class(YE.ActionInterval, {
    Init: function (target) {
        this.base();

        this._buildingTarget = target;
    },
    Private: {
        _buildingTarget: null,
        _build_temp: 0,

        _build: function (newBuilding) {
            if (this._isDeadWhileBuild(newBuilding)) {
                newBuilding.runDeadAction();
                this.getTarget().runGuardAction();
                return;
            }

            this._addBuildProgress(newBuilding);
            newBuilding.showBuildFrame(this._computeProgressState(newBuilding));
            newBuilding.showInfo();
            this.getTarget().runBuildAnim();
        },
        _isDeadWhileBuild: function (newBuilding) {
            return newBuilding.isDead();
        },
        _addBuildProgress: function (newBuilding) {
            this._build_temp += newBuilding.build_speed;

            if (this._build_temp >= 1) {
                newBuilding.build_progress += 1;
                this._addPercentLife(newBuilding);
                this._build_temp = 0;
            }
        },
        _addPercentLife: function (newBuilding) {
            newBuilding.life += Math.ceil(newBuilding.hitPoints / 100);
        },
        _computeProgressState: function (newBuilding) {
            var progressState = 0;

            if (newBuilding.build_progress <= 33) {
                progressState = 0;
            }
            else if (newBuilding.build_progress <= 66) {
                progressState = 1;
            }
            else {
                progressState = 2;
            }

            return progressState;
        },
        _getNotFinishBuilding: function () {
            var tag = null,
                newBuilding = null;

            tag = this._buildingTarget.gridX.toString() + "-" + this._buildingTarget.gridY.toString();
            newBuilding = this.getTarget().getParent().getChildsByTag(tag)[0];

            return newBuilding;
        },
        _addBuilding: function () {
            var tag = null,
                newBuilding = null;

            tag = this._buildingTarget.gridX.toString() + "-" + this._buildingTarget.gridY.toString();
            newBuilding = this.getTarget().getParent().getChildsByTag(tag)[0];

            if (!newBuilding) {
                //只在第一次建造时执行一次
                newBuilding = this._buildingTarget;
                this._initBuilding(newBuilding);
                this.getTarget().getParent().addChild(newBuilding, 0, ["building", tag]);
                YE.Director.getInstance().getCurrentScene().meat -= newBuilding.cost;
            }

            return newBuilding;
        },
        _initBuilding: function (newBuilding) {
            newBuilding.setBuildState();
            newBuilding.build_progress = 1;
            newBuilding.life = 0;
            newBuilding.team = this.getTarget().team;
            this._addPercentLife(newBuilding);
        },
        _isFinishBuild: function (newBuilding) {
            return newBuilding.build_progress === 100;
        }
    },
    Public: {
        update: function (time) {
            var newBuilding = null,
                destination = null,
                isPlayer = true,
                newBuilding = null;

            if (tool.isEnemySprite(this.getTarget())) {
                isPlayer = false;
            }

            destination = moveAlgorithm.findNearestGrid(this.getTarget(), this._buildingTarget);

            if (!moveAlgorithm.isNearBuildableSpriteDest([this.getTarget().gridX, this.getTarget().gridY], destination)) {
                this.getTarget().moveToDest(destination);
                return;
            }

            newBuilding = this._getNotFinishBuilding();

            if (!newBuilding) {
                if (YE.Director.getInstance().getCurrentScene().isMeatNotEnough(this._buildingTarget.cost)) {
                    this.getTarget().runGuardAction();
                    ui.showMessageBox("肉不足！需要" + this._buildingTarget.cost + "个肉");
                    return;
                }

                newBuilding = this._addBuilding();
            }

            this.getTarget().stopMove();

            if (this._isFinishBuild(newBuilding)) {
                if (isPlayer) {
                    tool.playGlobalSound("farmer_build_ready");
                }

                newBuilding.life = newBuilding.life > newBuilding.hitPoints ? newBuilding.hitPoints : newBuilding.life;
                newBuilding.setNormalState();
                newBuilding.showNormalBuilding();
                newBuilding.runGuardAction();
                this.getTarget().runGuardAction();
                return;
            }

            this.getTarget().direction = moveAlgorithm.findDirection(tool.roundDownGrid([this.getTarget().gridX, this.getTarget().gridY]), destination);

            this._build(newBuilding);
        },
        copy: function () {
            return this;
        },
        reverse: function () {
        }
    },
    Static: {
        create: function (target) {
            var action = new Build(target);

            return action;
        }
    }
});


var Produce = YYC.Class(YE.ActionInterval, {
    Init: function (produceObj) {
        this.base();

        this._produceObj = produceObj;
    },
    Private: {
        _produceObj: null,
        _produce_temp: null,

        _addProgress: function (produceName) {
            this._produce_temp += config.spriteConfig[produceName].produce_speed;

            if (this._produce_temp >= 1) {
                this.getTarget().produce_progress += 1;
                this._produce_temp = 0;
            }
        },
        _isFinish: function () {
            return this.getTarget().produce_progress === 100;
        },
        _waitForPlace: function () {
            //显示信息并等待
            ui.showMessageBox("没有多余的位置来放置生产的单位，请移动附近的单位！");
        },
        _findPlaceableGrid: function () {
            var mapLayer = window.mapLayer;

            mapLayer.buildBuildableGrid();

            return produceAlgorithm.findPlaceableGrid(this.getTarget(), mapLayer.buildableGridData);
        },
        _addNewUnit: function (placeGridPos) {
            var produceClass = this._produceObj.produceClass,
                newUnit = new produceClass({
                    gridX: placeGridPos[0],
                    gridY: placeGridPos[1],
                    team: this.getTarget().team
                });

            this.getTarget().getParent().addChild(newUnit, 1, "unit");
        },
        _hasMoreInQueue: function () {
            return this.getTarget().produce_queue.length > 0;
        }
    },
    Public: {
        update: function (time) {
            var produceName = this._produceObj.produceName,
                placeGridPos = null,
                isPlayer = true;

            this.getTarget().setProduceState();

            if (tool.isEnemySprite(this.getTarget())) {
                isPlayer = false;
            }

            if (this._isFinish()) {
                if (isPlayer) {
                    tool.playGlobalSound("building_produce_ready");
                }

                placeGridPos = this._findPlaceableGrid();
                if (placeGridPos) {
                    this._addNewUnit(placeGridPos);

                    this.getTarget().produce_progress = 0;
                    this.getTarget().produce_queue.shift();

                    if (this._hasMoreInQueue()) {
                        this._produceObj = this.getTarget().produce_queue[0];
                    }
                    else {
                        this.getTarget().setNormalState();
                        this.getTarget().removeAllActions();
                        if (isPlayer) {
                            this.getTarget().showInfo();
                        }
                    }

                    return;
                }
                else {
                    this._waitForPlace();
                    return;
                }
            }

            this._addProgress(produceName);
            if (isPlayer) {
                this.getTarget().showInfo();
            }
        },
        copy: function () {
            return this;
        },
        reverse: function () {
        }
    },
    Static: {
        create: function (produceObj) {
            var action = new Produce(produceObj);

            return action;
        }
    }
});


var Parabola = YYC.Class(YE.ActionInterval, {
    Init: function (destGridPos) {
        this.__destGridPos = destGridPos;
    },
    Private: {
        __destGridPos: null,
        __direction: 0,    //移动方向
        __fireDirection: 0,   //攻击者到目标点的直线方向
        __parabolaCoefficient: null,

        __isLineMove: function () {
            return this.__parabolaCoefficient === null;
        },
        __getLineMovePos: function (directions) {
            var movement = moveAlgorithm.computeParabolaMovement(this.__direction, this.getTarget().speed, this.__parabolaCoefficient, directions);

            return [this.getTarget().getPositionX() + movement[0], this.getTarget().getPositionY() + movement[1]];
        },
        __getParabolaMovePos: function (directions) {
            var movement = null,
                x = null,
                y = null;

            movement = moveAlgorithm.computeMovement(this.__fireDirection, this.getTarget().speed, directions);
            x = this.getTarget().getPositionX() + movement[0];
            y = moveAlgorithm.computeParabolaY(this.__parabolaCoefficient, x);

            return [x, y];
        },
        __isInUpOrDown: function (direction, directions) {
            return moveAlgorithm.isNearDirection(direction, 0, directions) || moveAlgorithm.isNearDirection(direction, directions / 2, directions);
        }
    },
    Public: {
        init: function () {
            var a = 0,
                directions = 16,
                sprite = this.getTarget(),
                from = [sprite.getPositionX(), sprite.getPositionY()],
                destPixPos = tool.convertToPix(this.__destGridPos[0], this.__destGridPos[1]);

            this.__fireDirection = combatAlgorithm.findFireDirection([sprite.gridX, sprite.gridY], this.__destGridPos, directions);
            this.__direction = this.__fireDirection;

            if (this.__isInUpOrDown(this.__fireDirection, directions)) {
                this.__parabolaCoefficient = null;
            }
            else {
                a = -0.003;
                this.__parabolaCoefficient = moveAlgorithm.computeParabolaCoefficient(a, from, destPixPos);
            }
        },
        update: function (time) {
            var from = [this.getTarget().getPositionX(), this.getTarget().getPositionY()];
            var to = tool.convertToPix(this.__destGridPos[0], this.__destGridPos[1]);
            var directions = 16;
            var pos = null;

            if (this.__isLineMove()) {
                pos = this.__getLineMovePos(directions);
            }
            else {
                this.__direction = moveAlgorithm.findAccurateDirectionByParabolaCoefficient(this.__parabolaCoefficient, from[0], from, to, directions);
                pos = this.__getParabolaMovePos(directions);
            }

            this.getTarget().setPosition(pos[0], pos[1]);

            this.getTarget().runFlyAnim(moveAlgorithm.getDirectionRoundNumber(this.__direction, directions));
        },
        copy: function () {
            return this;
        },
        reverse: function () {
        }
    },
    Static: {
        create: function (destGridPos) {
            var action = new Parabola(destGridPos);

            return action;
        }
    }
});