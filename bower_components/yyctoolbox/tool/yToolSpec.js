describe("YTool.js", function () {
    var tool = YYC.Tool;

    describe("convert.js", function () {
        var convert = tool.convert;

        //describe("strToBool", function () {
        //    it("String转换为Boolean", function () {
        //        expect(convert.strToBool("true")).toBeTruthy();
        //        expect(convert.strToBool("1")).toBeTruthy();

        //        expect(convert.strToBool("false")).toBeFalsy();
        //        expect(convert.strToBool("0")).toBeFalsy();
        //        expect(convert.strToBool("")).toBeFalsy();
        //    });
        //});

        describe("toNumber", function () {
            it("转换为number类型", function () {
                expect(convert.toNumber("")).toEqual(0);
                expect(convert.toNumber("2")).toEqual(2);
                expect(convert.toNumber(true)).toEqual(1);
                expect(convert.toNumber(false)).toEqual(0);

                expect(isNaN(convert.toNumber("aa"))).toBeTruthy();
                expect(isNaN(convert.toNumber(undefined))).toBeTruthy();
                expect(isNaN(convert.toNumber({}))).toBeTruthy();
            });
        });

        describe("toString", function () {
            it("如果参数为Object直接量（如json数据）或者数组，则使用json序列化为字符串", function () {
                expect(convert.toString({ a: 1 })).toEqual('{"a":1}');
                expect(convert.toString([1, "b"])).toEqual('[1,"b"]');
                //expect(convert.toString(new Date(1000))).toEqual('"1970-01-01T00:00:01.000Z"');
            });
            it("jquery对象转换为字符串", function () {
                expect(convert.toString($("<div>a</div>"))).toEqual("<div>a</div>");
            });
            it("转换js代码为字符串", function () {
                var str = convert.toString(function () {
                    var t = "a",
                        m = 'b';

                    return 1 + 2;
                });

                expect(str).toContain('var t');
                expect(str).toContain("m = 'b';");
                expect(str).toContain("return 1 + 2");
            });
            it("其余类型的参数转换为字符串", function () {
                //expect(convert.toNumber("")).toEqual(0);
                //expect(convert.toNumber("2")).toEqual(2);
                //expect(convert.toNumber(true)).toEqual(1);
                //expect(convert.toNumber(false)).toEqual(0);

                //expect(isNaN(convert.toNumber("aa"))).toBeTruthy();
                //expect(isNaN(convert.toNumber(undefined))).toBeTruthy();
                //expect(isNaN(convert.toNumber({}))).toBeTruthy();

                //function blank() {
                //    return /^\s*$/.test(this);
                //}
                //function isJSON(ob) {
                //    //var str = this;
                //    //if (str.blank()) return false;  //开头为空格
                //    str = str.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
                //    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
                //}

                //console.log(is);


                //JSON = {
                //    useHasOwn: ({}.hasOwnProperty ? true : false),
                //    pad: function (n) {
                //        return n < 10 ? "0" + n : n;
                //    },
                //    m: {
                //        "\b": '\\b',
                //        "\t": '\\t',
                //        "\n": '\\n',
                //        "\f": '\\f',
                //        "\r": '\\r',
                //        '"': '\\"',
                //        "\\": '\\\\'
                //    },
                //    encodeString: function (s) {
                //        if (/["\\\x00-\x1f]/.test(s)) {
                //            return '"' + s.replace(/([\x00-\x1f\\"])/g,
                //            function (a, b) {
                //                var c = m[b];
                //                if (c) {
                //                    return c;
                //                }
                //                c = b.charCodeAt();
                //                return "\\u00" + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
                //            }) + '"';
                //        }
                //        return '"' + s + '"';
                //    },
                //    encodeArray: function (o) {
                //        var a = ["["], b, i, l = o.length, v;
                //        for (i = 0; i < l; i += 1) {
                //            v = o[i];
                //            switch (typeof v) {
                //                case "undefined":
                //                case "function":
                //                case "unknown":
                //                    break;
                //                default:
                //                    if (b) {
                //                        a.push(',');
                //                    }
                //                    a.push(v === null ? "null" : this.encode(v));
                //                    b = true;
                //            }
                //        }
                //        a.push("]");
                //        return a.join("");
                //    },
                //    encodeDate: function (o) {
                //        return '"' + o.getFullYear() + "-" + pad(o.getMonth() + 1) + "-" + pad(o.getDate()) + "T" + pad(o.getHours()) + ":" + pad(o.getMinutes()) + ":" + pad(o.getSeconds()) + '"';
                //    },
                //    encode: function (o) {
                //        if (typeof o == "undefined" || o === null) {
                //            return "null";
                //        } else if (o instanceof Array) {
                //            return this.encodeArray(o);
                //        } else if (o instanceof Date) {
                //            return this.encodeDate(o);
                //        } else if (typeof o == "string") {
                //            return this.encodeString(o);
                //        } else if (typeof o == "number") {
                //            return isFinite(o) ? String(o) : "null";
                //        } else if (typeof o == "boolean") {
                //            return String(o);
                //        } else {
                //            var self = this;
                //            var a = ["{"], b, i, v;
                //            for (i in o) {
                //                if (!this.useHasOwn || o.hasOwnProperty(i)) {
                //                    v = o[i];
                //                    switch (typeof v) {
                //                        case "undefined":
                //                        case "function":
                //                        case "unknown":
                //                            break;
                //                        default:
                //                            if (b) {
                //                                a.push(',');
                //                            }
                //                            a.push(self.encode(i), ":", v === null ? "null" : self.encode(v));
                //                            b = true;
                //                    }
                //                }
                //            }
                //            a.push("}");
                //            return a.join("");
                //        }
                //    },
                //    decode: function (json) {
                //        return eval("(" + json + ')');
                //    }
                //};


                //console.log(JSON.encode([1, "a"]));

                //console.log(JSON.decode(JSON.encode([1, "a"]))[0]);


                //console.log(JSON.stringify({"Hello": 123}));

                //console.log([1, "b"].toString());

                //console.log({}.toString());
                //console.log(String({}));
                //console.log(JSON.stringify({ a: 1 }) === '{"a":1}');

                expect(convert.toString(1)).toEqual("1");
                expect(convert.toString("a1")).toEqual("a1");
                expect(convert.toString(true)).toEqual("true");
                expect(convert.toString(null)).toEqual("null");

            });
        });

        describe("toObject", function () {
            it("如果参数不是string，则抛出错误", function () {
                expect(function () {
                    convert.toObject(1);
                }).toThrow();
            });
            it("将json序列化的字符串再序列化为对象（不支持Date对象序列化）", function () {
                expect(convert.toObject('{"a":1}')).toEqual({ a: 1 });
                expect(convert.toObject('[1,"b"]')).toEqual([1, "b"]);
                //expect(convert.toObject('"1970-01-01T00:00:01.000Z"')).toEqual(new Date(1000));
            });
        });

        describe("toBoolean", function () {
            it("转换为布尔型", function () {
                expect(convert.toBoolean("true")).toBeTruthy();
                expect(convert.toBoolean(1)).toBeTruthy();
                expect(convert.toBoolean({})).toBeTruthy();


                expect(convert.toBoolean("false")).toBeFalsy();
                expect(convert.toBoolean("")).toBeFalsy();
                expect(convert.toBoolean(0)).toBeFalsy();
                expect(convert.toBoolean(NaN)).toBeFalsy();
                expect(convert.toBoolean(undefined)).toBeFalsy();
                expect(convert.toBoolean(null)).toBeFalsy();
            });
        });

        describe("toJquery", function () {
//            it("如果参数不是dom元素或jquery对象或string字符串，则抛出错误", function () {
//                expect(function () {
//                    convert.toJquery(1);
//                }).toThrow();
//            });
            it("转换为jquery对象", function () {
                expect(tool.judge.isjQuery(convert.toJquery(document.createElement("div")))).toBeTruthy();
                expect(tool.judge.isjQuery(convert.toJquery("<div>a</div>"))).toBeTruthy();
            });
        });

        describe("toDom", function () {
            it("如果参数不是jquery对象或dom或string字符串，则抛出错误", function () {
                expect(function () {
                    convert.toDom(1);
                }).toThrow();

                expect(function () {
                    convert.toDom(1);
                }).toThrow();
            });
            it("转换为dom对象", function () {
                expect(tool.judge.isDom(convert.toDom(document.createElement("div")))).toBeTruthy();
                expect(tool.judge.isDom(convert.toDom($("div")))).toBeTruthy();
                expect(tool.judge.isDom(convert.toDom("<div>a</div>"))).toBeTruthy();
            });
        });
    });

    describe("date.js", function () {
        var date = tool.date;

        describe("format", function () {
            it("日期格式化", function () {
                expect(date.format(new Date(1372045823), "yyyy-MM-dd HH:mm:ss")).toEqual("1970-01-17 05:07:25");
                expect(date.format(new Date(1372045823), "HH:mm")).toEqual("05:07");
            });
        });

        describe("buildTimeArr", function () {
            it("60分钟要进位）", function () {
                expect(date.buildTimeArr("0055", 5, 3)).toEqual(["00:55", "01:00", "01:05"]);
            });
            it("24小时要复位）", function () {
                expect(date.buildTimeArr("2355", 5, 3)).toEqual(["23:55", "00:00", "00:05"]);
                //   	        	expect(date.buildTimeArr("0557", 5, 2)).toEqual(["23:55", "00:00", "00:05"]);
            });
            //    	       it("测试）", function () {
            //      	        	expect(date.buildTimeArr("0506", 5, 500)).toEqual(["23:55", "00:00", "00:05"]);
            //      	       });
        });

        describe("utc2LocalTime", function () {
            it("utc时间转换为本地时间，并指定格式", function () {
                expect(date.utc2LocalTime(1372003223, "yyyy-MM-dd HH:mm:ss")).toEqual("2013-06-24 00:00:23");
            });
        });

        describe("strDate2Timestamp", function () {
            it("日期字符串（形如2013-09-04 00:00:00）转换为utc时间（以毫秒ms为单位）", function () {
                expect(date.strDate2Timestamp("2013-09-04 00:00:00")).toEqual(1378224000000);
            });
        });
    });

    describe("math.js", function () {
        var math = tool.math;

        describe("getDecimal", function () {
            it("获得小数部分）", function () {
                expect(math.getDecimal("2.22", 2)).toEqual(0.22);
                expect(math.getDecimal("2.2", 2)).toEqual(0.2);
                expect(math.getDecimal("8", 2)).toEqual(0);
            });
        });

        describe("truncateDecimal", function () {
            it("如果指定位置超过了小数最大长度，则返回小数本身", function () {
                expect(math.truncateDecimal(1.267, 4)).toEqual(1.267);
            });
            it("获得指定位置的小数（不四舍五入，直接截断）", function () {
                var num1 = 1.267;
                var num2 = -1.001;
                var num3 = -22.356;

                expect(math.truncateDecimal(num1, 1)).toEqual(1.2);
                expect(math.truncateDecimal(num1, 3)).toEqual(1.267);
                expect(math.truncateDecimal(num2, 1)).toEqual(-1);
                expect(math.truncateDecimal(num3, 2)).toEqual(-22.35);
            });

            /*
             下面测试不会通过，因为result实际上为2.6100000000000003
             这是因为“浮点数在计算机中只能为近似值”造成的

             it("验证确实为小数", function () {
             var num = 1.26666666666666666667;

             var result = math.truncateDecimal(num, 2) + math.truncateDecimal(1.35, 2);

             expect(result).toEqual(2.61);   //不能通过
             });


             将truncateDecimal改写成：
             var str = Tool.convert.toString(decimal);

             if (digit > this.getDecimalNumber(decimal)) {
             return decimal;
             }

             return Tool.convert.toNumber(str.substring(0, str.indexOf(".") + digit + 1));


             该问题依然存在！
             */
        });

        describe("toFixed", function () {
            it("如果指定位置超过了小数最大长度，则返回小数本身", function () {
                expect(math.toFixed(1.267, 4)).toEqual(1.267);
            });
            it("获得指定位置的小数（四舍五入）", function () {
                var num1 = 1.267;
                var num2 = -1.001;
                var num3 = -22.356;

                expect(math.toFixed(num1, 1)).toEqual(1.3);
                expect(math.toFixed(num1, 3)).toEqual(1.267);
                expect(math.toFixed(num2, 1)).toEqual(-1);
                expect(math.toFixed(num3, 2)).toEqual(-22.36);
                expect(math.toFixed(1e-7, 2)).toEqual(0);
                expect(math.toFixed(2.222e2, 2)).toEqual(222.2);
            });
        });

        describe("getDecimalNumber", function () {
            it("如果参数为整数，则返回参数", function () {
                expect(math.getDecimalNumber(12)).toEqual(12);
            });
            it("获得小数位数", function () {
                expect(math.getDecimalNumber(1.23)).toEqual(2);
            });
            it("特殊情况测试", function () {
                expect(math.getDecimalNumber(1e-7)).toBeNaN();
            });
        });
    });

    describe("path.js", function () {
        var path = tool.path;

        describe("getJsDir", function () {
            it("获得指定的js文件的加载目录", function () {
                //resultPath形如"../script/myTool/tool/"

                var resultPath = path.getJsDir("YTool.js");

                expect(resultPath).toBeString();
                expect(resultPath).not.toContain("YTool.js");
            });
        });
    });


    describe("table.js", function () {
        var table = tool.table;

        //beforeEach(function () {
        //    insertDom();
        //});
        //afterEach(function () {
        //    removeDom();
        //});

        describe("hideCol", function () {
            function insertDom() {
                var div = $("<div id='test_div'></div>");

                div.append($(" <table id='test_table'><thead><tr><th>日期</th><th>1</th></tr></thead><tbody><tr><td>日期</td><td>1</td></tr><tr><td>容量计费</td><td>2</td></tr></tbody></table>"));

                $("body").append(div);
            };
            function removeDom() {
                $("#test_div").remove();
            };

            beforeEach(function () {
                insertDom();
            });
            afterEach(function () {
                removeDom();
            });

            describe("参数为2个。第一个参数为table的dom对象，第二个参数为要隐藏的列（1表示第1列，以此类推）", function () {
                it("隐藏表格指定的单列。", function () {
                    table.hideCol(document.getElementById("test_table"), 2);

                    expect($("#test_table td").eq(1).css("display")).toEqual("none");
                    expect($("#test_table td").eq(3).css("display")).toEqual("none");
                });
            });

            describe("参数多于2个。第一个参数为table的dom对象，第二个及以后的参数为要隐藏的列（1表示第1列，以此类推）", function () {
                it("隐藏表格指定的多列。", function () {
                    table.hideCol(document.getElementById("test_table"), 1, 2);

                    expect($("#test_table td").eq(0).css("display")).toEqual("none");
                    expect($("#test_table td").eq(1).css("display")).toEqual("none");
                    expect($("#test_table td").eq(2).css("display")).toEqual("none");
                    expect($("#test_table td").eq(3).css("display")).toEqual("none");
                });
            });
        });

        describe("showCol", function () {
            it("显示表格指定的列，与hideCol对应", function () {
                //insertDom();

                //removeDom();
            });
        });
    });

    describe("extend.js", function () {
        var extend = tool.extend;

        beforeEach(function () {
        });
        afterEach(function () {
        });

        describe("extendExist", function () {
            it("只复制destination有的属性", function () {
                var dest = {
                        duration: 0.1,
                        flipX: false,
                        flipY: false,
                        pixelOffsetX: 0,
                        pixelOffsetY: 0
                    }      ,
                    source = {
                        frames: [1, 2, 3],
                        pixelOffsetX: 10,
                        pixelOffsetY: 20
                    };

                extend.extendExist(dest, source);

                expect(dest).toEqual({
                    duration: 0.1,
                    flipX: false,
                    flipY: false,
                    pixelOffsetX: 10,
                    pixelOffsetY: 20
                });
            });
        });

        describe("extendNoExist", function () {
            it("只复制destination没有的属性", function () {
                var dest = {
                        duration: 0.1,
                        flipX: false,
                        flipY: false,
                        pixelOffsetX: 0,
                        pixelOffsetY: 0
                    }      ,
                    source = {
                        frames: [1, 2, 3],
                        pixelOffsetX: 10,
                        pixelOffsetY: 20
                    };

                extend.extendNoExist(dest, source);

                expect(dest).toEqual({
                    frames: [1, 2, 3],
                    duration: 0.1,
                    flipX: false,
                    flipY: false,
                    pixelOffsetX: 0,
                    pixelOffsetY: 0
                });
            });
        });
    });

    describe("namespace.js", function () {
        function clearNamespace(space, reserveSpace) {
            var i;

            for (i in space) {
                if (space.hasOwnProperty(i)) {
                    if (i === reserveSpace) {
                        continue;
                    }
                    delete space[i];
                }
            }
        };

        describe("register", function () {
            var register = YYC.register;

            it("生成命名空间,并执行相应操作", function () {
                register("YYC.Test.t", function () {
                    YYC.Test.t = {
                        a: 100
                    };
                });

                expect(YYC.Test.t.a).toEqual(100);


            });
        });

        describe("namespace", function () {
            var namespace = YYC.namespace,
                backUp = null;

            beforeEach(function () {
                backUp = YYC.Tool.extend.extendDeep(YYC);
            });
            afterEach(function () {
                YYC = backUp;
            });


            it("测试namespace方法存在", function () {
                expect(YYC.namespace).toBeFunction();
            });

            it("测试命名空间不能为空", function () {
                expect(namespace).toThrow();
            });


            it("测试创建单个命名空间成功", function () {
                namespace("Button");

                expect(YYC.Button).toBeDefined();
            });
            it("测试创建多个命名空间成功", function () {
                namespace("Tool.Button");
                namespace("Tool.Button.Test");

                expect(YYC.Tool.Button).toBeDefined();
                expect(YYC.Tool.Button.Test).toBeDefined();

                clearNamespace(YYC, "Tool");
            });

            it("测试返回命名空间", function () {
                var button = namespace("Button");

                expect(button).toEqual({});

                clearNamespace(YYC, "Button");
            });
            it("测试返回的命名空间可以使用", function () {
                var button = namespace("Tool.Button");

                expect(YYC.Tool.Button.test).not.toBeDefined();

                button.test = function () {
                };

                expect(YYC.Tool.Button.test).toBeFunction();

                clearNamespace(YYC.Tool, "Button");
            });
            it("测试第一个命名空间如果是YYC，则忽略并继续", function () {
                namespace("YYC");

                expect(YYC.YYC).not.toBeDefined();
            });
            it("如果使用namespace创建的命名空间已经存在，则直接返回该命名空间", function () {
                YYC.test = {};
                YYC.test.a = 1;

                namespace("test").b = 2;

                expect(YYC.test.a).toEqual(1);
                expect(YYC.test.b).toEqual(2);
            });
        });
    });

    describe("asyn.js", function () {
    });
});