(function (win, doc, $) {

    function CusScrollBar(options) {
        this._init(options);
    }
    $.extend(CusScrollBar.prototype, {
        _init: function (options) {
            var self = this;
            console.info(this)
            self.options = {
                scrollDir: "y",//滚动方向
                contSelector: "",//滚动内容区选择器
                barSelector: "",//滚动条选择器
                sliderSelector: "",//滚动滑块选择器  
                tabItemSelector: ".tab-item",//标签选择器
                tabActiveClass: "tab-active",//选中标签类名
                anchorSelector: ".anchor",//锚点选择器
                wheelStep: 30,//滚轮步长
                correctSelector: ".correct-bot",//校正元素
                articleSelector: ".scroll-ol"

            }
            $.extend(true, self.options, options || {});//深拷贝
            self._initDomEvent();
            return self;
        },
        /**
         * 初始化DOM引用
         * @method _initDomEvent
         * @return {CusScrollBar}
         */
        _initDomEvent: function () {
            var opts = this.options;
            //滚动内容区对象，必须项
            this.$cont = $(opts.contSelector);
            //滚动条滑块对象，必须项
            this.$slider = $(opts.sliderSelector);
            //滚动条对象
            this.$bar = opts.barSelector ? $(opts.barSelector) : self.$slider.parent();
            //标签项
            this.$tabItem = $(opts.tabItemSelector);
            //锚点项
            this.$anchor = $(opts.anchorSelector);
            //获取文档对象
            //正文
            this.$article = $(opts.articleSelector);
            //校正元素对象
            this.$correct = $(opts.correctSelector)
            this.$doc = $(doc);
            this._initSliderDragEvent()
                ._initArticleHeight()
                ._initTabEvent()
                ._bindMousewheel()
                ._bindContScroll();

        },
        /**
         * 初始化文档高度
         * @return{[object]} [this]
         */
        _initArticleHeight: function () {
            var self = this;
            lastArticle = self.$article.last();
            var lastArticleHeight = lastArticle.height(),
                contHeight = self.$cont.height();
            if (lastArticleHeight < contHeight) {
                self.$correct[0].style.height = contHeight - lastArticleHeight - self.$anchor.outerHeight() + "px";
            }
            return self;
        },
        /**
         * 初始化滑块拖动功能
         * @return {[object]} [this]
         */
        _initSliderDragEvent: function () {
            console.info(this)
            var self = this,
                slider = self.$slider,
                sliderEl = slider[0];
            if (sliderEl) {
                var doc = self.$doc, dragStartPagePosition, dragStartScrollPosition, dragContBarRate;
                function mousemoveHandler(e) {
                    e.preventDefault();
                    console.info("mousemove");
                    if (dragStartPagePosition == null) {
                        return;

                    }

                    self.scrollTo((e.pageY - dragStartPagePosition) * dragContBarRate);
                }

                slider.on("mousedown", function (e) {
                    e.preventDefault();
                    console.info("mousedown");

                    dragStartPagePosition = e.pageY;
                    dragStartScrollPosition = self.$cont[0].scrollTop;


                    dragContBarRate = self.getMaxScrollPosition() / self.getMaxSliderPosition();
                    console.info(dragContBarRate)
                    doc.on("mousemove.scroll", mousemoveHandler)
                        .on("mouseup.scroll", function (e) {
                            console.info("mouseup");
                            doc.off(".scroll")
                        });
                })
            }
            return self;
        },
        /**
         * 初始化标签切换功能
         * @return {[object]} [this]
         */
        _initTabEvent: function () {
            var self = this;
            self.$tabItem.on("click", function (e) {
                e.preventDefault();
                var index = $(this).index();
                console.info(index)
                self.changeTabSelect(index);
                //已经滚出可以去的内容高度
                //+指定锚点与内容容器的距离

                self.scrollTo(self.$cont[0].scrollTop + self.getAnchorPosition(index));
            });
            return self;
        },
        //切换标签的选中
        changeTabSelect: function (index) {
            var self = this;
            active = self.options.tabActiveClass;
            console.info(active)
            console.info(index)
            return self.$tabItem.eq(index).addClass(active).siblings().removeClass(active);

        },
        //监听内容的滚动，同步滑块的位置
        _bindContScroll: function () {
            var self = this;
            self.$cont.on("scroll", function () {
                var sliderEl = self.$slider && self.$slider[0];
                if (sliderEl) {
                    sliderEl.style.top = self.getSliderPosition() + "px";
                }
            });
            return self;
        },
        _bindMousewheel: function () {
            var self = this;
            self.$cont.on("mousewheel DOMMouseScroll",
                function (e) {
                    e.preventDefault();
                    var oEv = e.originalEvent,
                        wheelRange = oEv.wheelDelta ? -oEv.wheelDelta / 120 : (oEv.detail || 0) / 3;
                    self.scrollTo(self.$cont[0].scrollTop + wheelRange * self.options.wheelStep);
                });
            return self;
        },
        //获取指定锚点到上边界的像素数
        getAnchorPosition: function (index) {
            return this.$anchor.eq(index).position().top;
        },
        //获取每个锚点位置信息的数组
        getAllAnchorPosition: function () {
            var self = this;
            allPositionArr = [];
            for (var i = 0; i < self.$anchor.length; i++) {
                allPositionArr.push(self.$cont[0].scrollTop + self.getAnchorPosition(i));
            };
            return allPositionArr;
        },
        //计算滑块的当前位置
        getSliderPosition: function () {
            var self = this;
            MaxSliderPosition = self.getMaxSliderPosition();
            return Math.min(MaxSliderPosition, MaxSliderPosition * self.$cont[0].scrollTop /
                self.getMaxScrollPosition());
        },
        //内容可滚动的高度
        getMaxScrollPosition: function () {
            var self = this;
            console.info(self.$cont.height())
            console.info(self.$cont[0].scrollHeight)
            return Math.max(self.$cont.height(), self.$cont[0].scrollHeight) - self.$cont.height();
        },
        //滑块可移动的距离
        getMaxSliderPosition: function () {
            var self = this;
            return self.$bar.height() - self.$slider.height();
        },
        scrollTo: function (positionVal) {
            var self = this;
            var posArr = self.getAllAnchorPosition();
            function getIndex(positionVal) {
                for (var i = posArr.length - 1; i >= 0; i--) {
                    if (positionVal >= posArr[i]) {
                        return i;
                    } else {
                        continue;
                    }
                }
            };
            //锚点数与标签数相同
            if(posArr.length==self.$tabItem.length){
                self.changeTabSelect(getIndex(positionVal));
            }

            self.$cont.scrollTop(positionVal);
        },



    });
    win.CusScrollBar = CusScrollBar;
})(window, document, jQuery);
//  new CusScrollBar(
//     {
//         contSelector: ".scroll-wrap",//滚动内容区选择器
//         barSelector: ".scroll-bar",//滚动条选择器
//         sliderSelector: ".scroll-slider"//滚动滑块选择器  
//     }
// );

var scroll = new CusScrollBar(
    {
        contSelector: ".scroll-cont",//滚动内容区选择器
        barSelector: ".scroll-bar",//滚动条选择器
        sliderSelector: ".scroll-slider"//滚动滑块选择器  
    }
);
// var scroll2 = new CusScrollBar(
//     {
//         contSelector: ".scroll-wrap-2",//滚动内容区选择器
//         barSelector: ".scroll-bar-2",//滚动条选择器
//         sliderSelector: ".scroll-slider-2"//滚动滑块选择器  
//     }
// );
// console.info(scroll);
// console.info(scroll2);
