/**古代战争 命令模式
 * 作者：YYC
 * 日期：2014-02-26
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
var Invoker = YYC.Class({
    Private: {
        _command: null
    },
    Public: {
        setCommand: function (command) {
            this._command = command;
        },
        action: function () {
            if (YYC.Tool.judge.isArray(this._command)) {
                this._command.map("execute");
            }
            else {
                this._command.execute();
            }
        }
    }
});

var Command = YYC.AClass({
    Protected: {
        P_receivers:null,
        
        P_playGlobalSound: function (soundId) {
            tool.playUnitsSound(this.P_receivers, soundId);
        },
        P_playFarmerGlobalSound: function (soundId) {
            if (this.P_receivers.length === 0 ||tool.isEnemySprite(this.P_receivers[0])) {
                return;
            }

            tool.playGlobalSound(soundId);
        }
    },
    Abstract: {
        execute: function () {
        }
    }
});

var MoveCommand = YYC.Class(Command, {
    Init: function (receivers, destination) {
        this.P_receivers = receivers;
        this.__destination = destination;
    },
    Private: {
        __destination: null
    },
    Public: {
        execute: function () {
            var self = this;

            this.P_playGlobalSound("command_move");

            this.P_receivers.forEach(function (item) {
                item.moveTo(self.__destination);
            });
        }
    }
});

var GatherMeatCommand = YYC.Class(Command, {
    Init: function (receivers, target) {
        this.P_receivers = receivers;
        this.__target = target;
    },
    Private: {
        __target: null
    },
    Public: {
        execute: function () {
            var self = this;

            this.P_playFarmerGlobalSound("farmer_command_gather");

            this.P_receivers.forEach(function (item) {
                item.gatherMeat(self.__target);
            });
        }
    }
});


var ReturnMeatCommand = YYC.Class(Command, {
    Init: function (receivers, target) {
        this.P_receivers = receivers;
        this.__target = target;
    },
    Private: {
        __target: null
    },
    Public: {
        execute: function () {
            var self = this;

            if (this.__target === null || this.__target.isBuildState()) {
                return;
            }

            this.P_receivers.forEach(function (item) {
                item.returnMeat(self.__target);
            });
        }
    }
});

var BuildCommand = YYC.Class(Command, {
    Init: function (receivers, deployBuildingClass, data) {
        this.P_receivers = receivers;
        if (arguments.length === 2) {
            this.__target = arguments[1];
        }
        else {
            this.__deployBuildingClass = deployBuildingClass;
            this.__data = data;
        }
    },
    Private: {
        __deployBuildingClass: null,
        __data: null,
        __target: null
    },
    Public: {
        execute: function () {
            var self = this;

            this.P_playFarmerGlobalSound("farmer_command_build");

            if (this.__target) {
                this.P_receivers.forEach(function (item) {
                    item.build(self.__target);
                });
            }
            else {
                this.P_receivers.forEach(function (item) {
                    item.build(self.__deployBuildingClass, self.__data);
                });
            }
        }
    }
});

var ProduceCommand = YYC.Class(Command, {
    Init: function (receivers, produceName, produceClass) {
        this.P_receivers = receivers;
        this.__produceClass = produceClass;
        this.__produceName = produceName;
    },
    Private: {
        __produceClass: null
    },
    Public: {
        execute: function () {
            var self = this;

            this.P_receivers.forEach(function (item) {
                item.produce(self.__produceName, self.__produceClass);
            });
        }
    }
});

var AttackCommand = YYC.Class(Command, {
    Init: function (receivers, target) {
        this.P_receivers = receivers;
        this.__target = target;
    },
    Private: {
        __target: null
    },
    Public: {
        execute: function () {
            var self = this;

            this.P_playGlobalSound("command_attack");

            this.P_receivers.forEach(function (item) {
                item.attack(self.__target);
            });
        }
    }
});

var MoveAndAttackCommand = YYC.Class(Command, {
    Init: function (receivers, destGrid) {
        this.P_receivers = receivers;
        this.__destGrid = destGrid;
    },
    Private: {
        __destGrid: null
    },
    Public: {
        execute: function () {
            var self = this;

            this.P_playGlobalSound("command_move");

            this.P_receivers.forEach(function (item) {
                item.moveAndAttack(self.__destGrid);
            });
        }
    }
});

var HuntCommand = YYC.Class(Command, {
    Init: function (receivers) {
        this.P_receivers = receivers;
    },
    Private: {
    },
    Public: {
        execute: function () {
            this.P_playGlobalSound("command_attack");

            this.P_receivers.forEach(function (item) {
                item.hunt();
            });
        }
    }
});
