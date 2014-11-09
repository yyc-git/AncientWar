/**古代战争
 * 作者：YYC
 * 日期：2014-02-02
 * 电子邮箱：395976266@qq.com
 * QQ: 395976266
 * 博客：http://www.cnblogs.com/chaogex/
 */
describe("MapRoll", function () {
    var roll = null;
//    var canvasWidth = 20,
//        canvasHeight = 10;
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("构造函数", function () {
        it("传入canvasWidth, canvasHeight", function () {
        });
    });

    describe("handleRoll", function () {
        var canvasWidth = 20,
            canvasHeight = 10,
            imgWidth = 100,
            imgHeight = 50,
            panningSpeed = 2,
            panningThreshold = 3,
            panningSpeedX = 0,
            panningSpeedY = 0;

        var halfHeight = imgHeight / 2;
        var halfWidth = imgWidth / 2;
        //左角的一半的三角函数
        var tan1 = imgHeight / imgWidth;
        var cos1 = halfWidth /
            Math.sqrt(halfHeight * halfHeight + halfWidth * halfWidth);
        var sin1 = halfHeight /
            Math.sqrt(halfHeight * halfHeight + halfWidth * halfWidth);

        panningSpeedY = panningSpeed * sin1;
        panningSpeedX = panningSpeed * cos1;

//        function computePanningSpeed(){
//            panningSpeedY = panningSpeed * sin1;
//            panningSpeedX = panningSpeed * cos1;
//
//        }
        function judgeUpdate() {
//            it("基于offset，计算鼠标的坐标", function () {
//                sandbox.stub(roll, "calculateGameCoordinates");
//
//                roll.handleRoll();
//
//                expect(roll.calculateGameCoordinates).toCalled();
//            });
//            it("画布标志为change", function () {
//                sandbox.stub(roll, "setStateChange");
//
//                roll.handleRoll();
//
//                expect(roll.setStateChange).toCalled();
//
//            });
            it("返回update字符串", function () {
                expect(roll.handleRoll()).toEqual("update");
            });
        }

        function judgeLeftUpEdge(offsetX, offsetY) {
            describe("如果视口中心位于地图左上的边缘", function () {
                beforeEach(function () {
                    roll.offsetX = 30;
                    roll.offsetY = 10;
                });

                it("沿着与边缘平行的方向滚动", function () {
                    roll.handleRoll();

                    expect(roll.offsetX).toEqual(offsetX);
                    expect(roll.offsetY).toEqual(offsetY);
                });
                judgeUpdate();
            });
        }

        function judgeLeftDownEdge(offsetX, offsetY) {
            beforeEach(function () {
                roll.offsetX = 20;
                roll.offsetY = 25;
            });

            it("沿着与边缘平行的方向滚动", function () {
                roll.handleRoll();

                expect(roll.offsetX).toEqual(offsetX);
                expect(roll.offsetY).toEqual(offsetY);
            });
            judgeUpdate();
        }

        function judgeRightUpEdge(offsetX, offsetY) {
            describe("如果视口中心位于地图右上的边缘", function () {
                beforeEach(function () {
                    roll.offsetX = 60;
                    roll.offsetY = 15;
                });

                it("沿着与边缘平行的方向滚动", function () {
                    roll.handleRoll();

                    expect(roll.offsetX).toEqual(offsetX);
                    expect(roll.offsetY).toEqual(offsetY);
                });
                judgeUpdate();
            });
        }

        function judgeRightDownEdge(offsetX, offsetY) {
            describe("如果视口中心位于地图右下的边缘", function () {
                beforeEach(function () {
                    roll.offsetX = 60;
                    roll.offsetY = 25;
                });

                it("沿着与边缘平行的方向滚动", function () {
                    roll.handleRoll();

                    expect(roll.offsetX).toEqual(offsetX);
                    expect(roll.offsetY).toEqual(offsetY);
                });
                judgeUpdate();
            });
        }

        beforeEach(function () {
            roll = new MapRoll(canvasWidth, canvasHeight, {
                width: imgWidth,
                height: imgHeight
            });

            roll._panningThreshold = panningThreshold;
            roll._panningSpeed = panningSpeed;

            sandbox.stub(config, "map", {
                pixOffsetX: 10,
                pixOffsetY: 10
            });
            sandbox.stub(ui, "getGameAreaSize").returns({
                width: canvasWidth,
                height: canvasHeight
            });
            roll.init();
        });
        afterEach(function () {
        });

//        it("如果鼠标在画布外面，则返回", function () {
//            roll._insideCanvas = false;
//
//            expect(roll.handleRoll()).toEqual("not in canvas");
//        });

        describe("否则", function () {
            beforeEach(function () {
                roll._insideCanvas = true;
            });

            it("获得视口中心坐标", function () {
                roll.offsetX = 30;
                roll.offsetY = 20;
                roll.handleRoll();

                expect(roll._viewPointX).toEqual(30 + canvasWidth / 2);
                expect(roll._viewPointY).toEqual(20 + canvasHeight / 2);
            });


            describe("如果往左滚动", function () {
                beforeEach(function () {
                    roll.x = panningThreshold - 1;
                    roll.y = panningThreshold + 1;
                });

//                it("如果滚动到尽头，则返回", function () {
//                    roll.offsetX = panningSpeed - 1;
//
//                    expect(roll.handleRoll()).toEqual("not roll");
//                });

                describe("否则", function () {
                    beforeEach(function () {
                        roll.offsetX = panningSpeed + 1;
                    });

                    describe("如果视口中心位于地图右半部分", function () {
                        beforeEach(function () {
                            roll.offsetX = 50;
                        });

                        it("直接往左滚动_panningSpeed的距离", function () {
                            roll.handleRoll();

                            expect(roll.offsetX).toEqual(50 - panningSpeed);
                        });
                        judgeUpdate();
                    });

                    judgeLeftUpEdge(30 - panningSpeedX, 10 + panningSpeedY);
                    judgeLeftDownEdge(20 - panningSpeedX, 25 - panningSpeedY);

                    describe("如果视口中心位于地图内部", function () {
                        beforeEach(function () {
                            roll.offsetX = 40;
                            roll.offsetY = 30;
                        });

                        it("往左滚动", function () {
                            roll.handleRoll();

                            expect(roll.offsetX).toEqual(40 - panningSpeed);
                        });
                        judgeUpdate();
                    });
                });
            });

            describe("如果往右滚动", function () {
                beforeEach(function () {
                    roll.x = canvasWidth - panningThreshold;
                    roll.y = panningThreshold + 1;
                });

//                it("如果滚动到尽头，则返回", function () {
//                    roll.offsetX = imgWidth - 1;
//
//                    expect(roll.handleRoll()).toEqual("not roll");
//                });

                describe("否则", function () {
                    beforeEach(function () {
                        roll.offsetX = panningSpeed + 1;
                    });

                    describe("如果视口中心位于地图左半部分", function () {
                        beforeEach(function () {
                            roll.offsetX = 10;
                        });

                        it("直接往右滚动_panningSpeed的距离", function () {
                            roll.handleRoll();

                            expect(roll.offsetX).toEqual(10 + panningSpeed);
                        });
                        judgeUpdate();
                    });

                    judgeRightUpEdge(60 + panningSpeedX, 15 + panningSpeedY);
                    judgeRightDownEdge(60 + panningSpeedX, 25 - panningSpeedY);

                    describe("如果视口中心位于地图内部", function () {
                        beforeEach(function () {
                            roll.offsetX = 20;
                            roll.offsetY = 30;
                        });

                        it("滚动", function () {
                            roll.handleRoll();

                            expect(roll.offsetX).toEqual(20 + panningSpeed);
                        });
                        judgeUpdate();
                    });
                });
            });

            describe("如果往上滚动", function () {
                beforeEach(function () {
                    roll.x = panningThreshold + 1;
                    roll.y = panningThreshold - 1;
                });

//                it("如果滚动到尽头，则返回", function () {
//                    roll.offsetY = panningSpeed - 1;
//
//                    expect(roll.handleRoll()).toEqual("not roll");
//                });

                describe("否则", function () {
                    beforeEach(function () {
                        roll.offsetY = panningSpeed + 1;
                    });

                    describe("如果视口中心位于地图下半部分", function () {
                        beforeEach(function () {
                            roll.offsetY = 30;
                        });

                        it("直接往上滚动_panningSpeed的距离", function () {
                            roll.handleRoll();

                            expect(roll.offsetY).toEqual(30 - panningSpeed);
                        });
                        judgeUpdate();
                    });

                    judgeLeftUpEdge(30 + panningSpeedX, 10 - panningSpeedY);
                    judgeRightUpEdge(60 - panningSpeedX, 15 - panningSpeedY);

                    describe("如果视口中心位于地图内部", function () {
                        beforeEach(function () {
                            roll.offsetX = 40;
                            roll.offsetY = 30;
                        });

                        it("往左滚动", function () {
                            roll.handleRoll();

                            expect(roll.offsetY).toEqual(30 - panningSpeed);
                        });
                        judgeUpdate();
                    });
                });
            });

            describe("如果往下滚动", function () {
                beforeEach(function () {
                    roll.x = panningThreshold + 1;
                    roll.y = canvasWidth - panningThreshold;
                });

//                it("如果滚动到尽头，则返回", function () {
//                    roll.offsetY = imgWidth - 1;
//
//                    expect(roll.handleRoll()).toEqual("not roll");
//                });

                describe("否则", function () {
                    beforeEach(function () {
                        roll.offsetY = panningSpeed + 1;
                    });

                    describe("如果视口中心位于地图上半部分", function () {
                        beforeEach(function () {
                            roll.offsetY = 10;
                        });

                        it("直接往下滚动_panningSpeed的距离", function () {
                            roll.handleRoll();

                            expect(roll.offsetY).toEqual(10 + panningSpeed);
                        });
                        judgeUpdate();
                    });

                    judgeLeftDownEdge(20 + panningSpeedX, 25 + panningSpeedY);
                    judgeRightDownEdge(60 - panningSpeedX, 25 + panningSpeedY);

                    describe("如果视口中心位于地图内部", function () {
                        beforeEach(function () {
                            roll.offsetX = 40;
                            roll.offsetY = 30;
                        });

                        it("往左滚动", function () {
                            roll.handleRoll();

                            expect(roll.offsetY).toEqual(30 + panningSpeed);
                        });
                        judgeUpdate();
                    });
                });
            });
        });
    });
});
