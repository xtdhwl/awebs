
// minifier: path aliases

enyo.path.addPaths({layout: "../lib/layout/",
    onyx: "../lib/onyx/",
    onyx: "../lib/onyx/source/",
    g11n: "../lib/g11n/",
    canvas: "../lib/canvas/"});

// FittableLayout.js

enyo.kind({
    name: "enyo.FittableLayout",
    kind: "Layout",
    calcFitIndex: function() {
        for (var e = 0, t = this.container.children, n; n = t[e]; e++)
            if (n.fit && n.showing)
                return e;
    },
    getFitControl: function() {
        var e = this.container.children, t = e[this.fitIndex];
        return t && t.fit && t.showing || (this.fitIndex = this.calcFitIndex(), t = e[this.fitIndex]), t;
    },
    getLastControl: function() {
        var e = this.container.children, t = e.length - 1, n = e[t];
        while ((n = e[t]) && !n.showing)
            t--;
        return n;
    },
    _reflow: function(e, t, n, r) {
        this.container.addRemoveClass("enyo-stretch", !this.container.noStretch);
        var i = this.getFitControl();
        if (!i)
            return;
        var s = 0, o = 0, u = 0, a, f = this.container.hasNode();
        f && (a = enyo.dom.calcPaddingExtents(f), s = f[t] - (a[n] + a[r]));
        var l = i.getBounds();
        o = l[n] - (a && a[n] || 0);
        var c = this.getLastControl();
        if (c) {
            var h = enyo.dom.getComputedBoxValue(c.hasNode(), "margin", r) || 0;
            if (c != i) {
                var p = c.getBounds(), d = l[n] + l[e], v = p[n] + p[e] + h;
                u = v - d;
            } else
                u = h;
        }
        var m = s - (o + u);
        i.applyStyle(e, m + "px");
    },
    reflow: function() {
        this.orient == "h" ? this._reflow("width", "clientWidth", "left", "right") : this._reflow("height", "clientHeight", "top", "bottom");
    }
}), enyo.kind({
    name: "enyo.FittableColumnsLayout",
    kind: "FittableLayout",
    orient: "h",
    layoutClass: "enyo-fittable-columns-layout"
}), enyo.kind({
    name: "enyo.FittableRowsLayout",
    kind: "FittableLayout",
    layoutClass: "enyo-fittable-rows-layout",
    orient: "v"
});

// FittableRows.js

enyo.kind({
    name: "enyo.FittableRows",
    layoutKind: "FittableRowsLayout",
    noStretch: !1
});

// FittableColumns.js

enyo.kind({
    name: "enyo.FittableColumns",
    layoutKind: "FittableColumnsLayout",
    noStretch: !1
});

// FlyweightRepeater.js

enyo.kind({
    name: "enyo.FlyweightRepeater",
    published: {
        count: 0,
        noSelect: !1,
        multiSelect: !1,
        toggleSelected: !1,
        clientClasses: "",
        clientStyle: "",
        rowOffset: 0
    },
    events: {
        onSetupItem: "",
        onRenderRow: ""
    },
    bottomUp: !1,
    components: [{
            kind: "Selection",
            onSelect: "selectDeselect",
            onDeselect: "selectDeselect"
        }, {
            name: "client"
        }],
    create: function() {
        this.inherited(arguments), this.noSelectChanged(), this.multiSelectChanged(), this.clientClassesChanged(), this.clientStyleChanged();
    },
    noSelectChanged: function() {
        this.noSelect && this.$.selection.clear();
    },
    multiSelectChanged: function() {
        this.$.selection.setMulti(this.multiSelect);
    },
    clientClassesChanged: function() {
        this.$.client.setClasses(this.clientClasses);
    },
    clientStyleChanged: function() {
        this.$.client.setStyle(this.clientStyle);
    },
    setupItem: function(e) {
        this.doSetupItem({
            index: e,
            selected: this.isSelected(e)
        });
    },
    generateChildHtml: function() {
        var e = "";
        this.index = null;
        for (var t = 0, n = 0; t < this.count; t++)
            n = this.rowOffset + (this.bottomUp ? this.count - t - 1 : t), this.setupItem(n), this.$.client.setAttribute("data-enyo-index", n), e += this.inherited(arguments), this.$.client.teardownRender();
        return e;
    },
    previewDomEvent: function(e) {
        var t = this.index = this.rowForEvent(e);
        e.rowIndex = e.index = t, e.flyweight = this;
    },
    decorateEvent: function(e, t, n) {
        var r = t && t.index != null ? t.index : this.index;
        t && r != null && (t.index = r, t.flyweight = this), this.inherited(arguments);
    },
    tap: function(e, t) {
        if (this.noSelect || t.index === -1)
            return;
        this.toggleSelected ? this.$.selection.toggle(t.index) : this.$.selection.select(t.index);
    },
    selectDeselect: function(e, t) {
        this.renderRow(t.key);
    },
    getSelection: function() {
        return this.$.selection;
    },
    isSelected: function(e) {
        return this.getSelection().isSelected(e);
    },
    renderRow: function(e) {
        if (e < this.rowOffset || e >= this.count + this.rowOffset)
            return;
        this.setupItem(e);
        var t = this.fetchRowNode(e);
        t && (enyo.dom.setInnerHtml(t, this.$.client.generateChildHtml()), this.$.client.teardownChildren(), this.doRenderRow({
            rowIndex: e
        }));
    },
    fetchRowNode: function(e) {
        if (this.hasNode())
            return this.node.querySelector('[data-enyo-index="' + e + '"]');
    },
    rowForEvent: function(e) {
        if (!this.hasNode())
            return -1;
        var t = e.target;
        while (t && t !== this.node) {
            var n = t.getAttribute && t.getAttribute("data-enyo-index");
            if (n !== null)
                return Number(n);
            t = t.parentNode;
        }
        return -1;
    },
    prepareRow: function(e) {
        if (e < 0 || e >= this.count)
            return;
        this.setupItem(e);
        var t = this.fetchRowNode(e);
        enyo.FlyweightRepeater.claimNode(this.$.client, t);
    },
    lockRow: function() {
        this.$.client.teardownChildren();
    },
    performOnRow: function(e, t, n) {
        if (e < 0 || e >= this.count)
            return;
        t && (this.prepareRow(e), enyo.call(n || null, t), this.lockRow());
    },
    statics: {
        claimNode: function(e, t) {
            var n;
            t && (t.id !== e.id ? n = t.querySelector("#" + e.id) : n = t), e.generated = Boolean(n || !e.tag), e.node = n, e.node && e.rendered();
            for (var r = 0, i = e.children, s; s = i[r]; r++)
                this.claimNode(s, t);
        }
    }
});

// List.js

enyo.kind({
    name: "enyo.List",
    kind: "Scroller",
    classes: "enyo-list",
    published: {
        count: 0,
        rowsPerPage: 50,
        bottomUp: !1,
        noSelect: !1,
        multiSelect: !1,
        toggleSelected: !1,
        fixedHeight: !1,
        reorderable: !1,
        centerReorderContainer: !0,
        reorderComponents: [],
        pinnedReorderComponents: [],
        swipeableComponents: [],
        enableSwipe: !1,
        persistSwipeableItem: !1
    },
    events: {
        onSetupItem: "",
        onSetupReorderComponents: "",
        onSetupPinnedReorderComponents: "",
        onReorder: "",
        onSetupSwipeItem: "",
        onSwipeDrag: "",
        onSwipe: "",
        onSwipeComplete: ""
    },
    handlers: {
        onAnimateFinish: "animateFinish",
        onRenderRow: "rowRendered",
        ondragstart: "dragstart",
        ondrag: "drag",
        ondragfinish: "dragfinish",
        onup: "up",
        onholdpulse: "holdpulse"
    },
    rowHeight: 0,
    listTools: [{
            name: "port",
            classes: "enyo-list-port enyo-border-box",
            components: [{
                    name: "generator",
                    kind: "FlyweightRepeater",
                    canGenerate: !1,
                    components: [{
                            tag: null,
                            name: "client"
                        }]
                }, {
                    name: "holdingarea",
                    allowHtml: !0,
                    classes: "enyo-list-holdingarea"
                }, {
                    name: "page0",
                    allowHtml: !0,
                    classes: "enyo-list-page"
                }, {
                    name: "page1",
                    allowHtml: !0,
                    classes: "enyo-list-page"
                }, {
                    name: "placeholder"
                }, {
                    name: "swipeableComponents",
                    style: "position:absolute; display:block; top:-1000px; left:0;"
                }]
        }],
    reorderHoldTimeMS: 600,
    draggingRowIndex: -1,
    draggingRowNode: null,
    placeholderRowIndex: -1,
    dragToScrollThreshold: .1,
    prevScrollTop: 0,
    autoScrollTimeoutMS: 20,
    autoScrollTimeout: null,
    autoscrollPageY: 0,
    pinnedReorderMode: !1,
    initialPinPosition: -1,
    itemMoved: !1,
    currentPageNumber: -1,
    completeReorderTimeout: null,
    swipeIndex: null,
    swipeDirection: null,
    persistentItemVisible: !1,
    persistentItemOrigin: null,
    swipeComplete: !1,
    completeSwipeTimeout: null,
    completeSwipeDelayMS: 500,
    normalSwipeSpeedMS: 200,
    fastSwipeSpeedMS: 100,
    percentageDraggedThreshold: .2,
    importProps: function(e) {
        e && e.reorderable && (this.touch = !0), this.inherited(arguments);
    },
    create: function() {
        this.pageHeights = [], this.inherited(arguments), this.getStrategy().translateOptimized = !0, this.bottomUpChanged(), this.noSelectChanged(), this.multiSelectChanged(), this.toggleSelectedChanged(), this.$.generator.setRowOffset(0), this.$.generator.setCount(this.count);
    },
    initComponents: function() {
        this.createReorderTools(), this.inherited(arguments), this.createSwipeableComponents();
    },
    createReorderTools: function() {
        this.createComponent({
            name: "reorderContainer",
            classes: "enyo-list-reorder-container",
            ondown: "sendToStrategy",
            ondrag: "sendToStrategy",
            ondragstart: "sendToStrategy",
            ondragfinish: "sendToStrategy",
            onflick: "sendToStrategy"
        });
    },
    createStrategy: function() {
        this.controlParentName = "strategy", this.inherited(arguments), this.createChrome(this.listTools), this.controlParentName = "client", this.discoverControlParent();
    },
    createSwipeableComponents: function() {
        for (var e = 0; e < this.swipeableComponents.length; e++)
            this.$.swipeableComponents.createComponent(this.swipeableComponents[e], {
                owner: this.owner
            });
    },
    rendered: function() {
        this.inherited(arguments), this.$.generator.node = this.$.port.hasNode(), this.$.generator.generated = !0, this.reset();
    },
    resizeHandler: function() {
        this.inherited(arguments), this.refresh();
    },
    bottomUpChanged: function() {
        this.$.generator.bottomUp = this.bottomUp, this.$.page0.applyStyle(this.pageBound, null), this.$.page1.applyStyle(this.pageBound, null), this.pageBound = this.bottomUp ? "bottom" : "top", this.hasNode() && this.reset();
    },
    noSelectChanged: function() {
        this.$.generator.setNoSelect(this.noSelect);
    },
    multiSelectChanged: function() {
        this.$.generator.setMultiSelect(this.multiSelect);
    },
    toggleSelectedChanged: function() {
        this.$.generator.setToggleSelected(this.toggleSelected);
    },
    countChanged: function() {
        this.hasNode() && this.updateMetrics();
    },
    sendToStrategy: function(e, t) {
        this.$.strategy.dispatchEvent("on" + t.type, t, e);
    },
    updateMetrics: function() {
        this.defaultPageHeight = this.rowsPerPage * (this.rowHeight || 100), this.pageCount = Math.ceil(this.count / this.rowsPerPage), this.portSize = 0;
        for (var e = 0; e < this.pageCount; e++)
            this.portSize += this.getPageHeight(e);
        this.adjustPortSize();
    },
    holdpulse: function(e, t) {
        if (!this.getReorderable() || this.isReordering())
            return;
        if (t.holdTime >= this.reorderHoldTimeMS && this.shouldStartReordering(e, t))
            return t.preventDefault(), this.startReordering(t), !1;
    },
    dragstart: function(e, t) {
        if (this.isReordering())
            return !0;
        if (this.isSwipeable())
            return this.swipeDragStart(e, t);
    },
    drag: function(e, t) {
        if (this.shouldDoReorderDrag(t))
            return t.preventDefault(), this.reorderDrag(t), !0;
        if (this.isSwipeable())
            return t.preventDefault(), this.swipeDrag(e, t), !0;
    },
    dragfinish: function(e, t) {
        this.isReordering() ? this.finishReordering(e, t) : this.isSwipeable() && this.swipeDragFinish(e, t);
    },
    up: function(e, t) {
        this.isReordering() && this.finishReordering(e, t);
    },
    generatePage: function(e, t) {
        this.page = e;
        var n = this.rowsPerPage * this.page;
        this.$.generator.setRowOffset(n);
        var r = Math.min(this.count - n, this.rowsPerPage);
        this.$.generator.setCount(r);
        var i = this.$.generator.generateChildHtml();
        t.setContent(i), this.getReorderable() && this.draggingRowIndex > -1 && this.hideReorderingRow();
        var s = t.getBounds().height;
        !this.rowHeight && s > 0 && (this.rowHeight = Math.floor(s / r), this.updateMetrics());
        if (!this.fixedHeight) {
            var o = this.getPageHeight(e);
            this.pageHeights[e] = s, this.portSize += s - o;
        }
    },
    pageForRow: function(e) {
        return Math.floor(e / this.rowsPerPage);
    },
    preserveDraggingRowNode: function(e) {
        this.draggingRowNode && this.pageForRow(this.draggingRowIndex) === e && (this.$.holdingarea.hasNode().appendChild(this.draggingRowNode), this.draggingRowNode = null, this.removedInitialPage = !0);
    },
    update: function(e) {
        var t = !1, n = this.positionToPageInfo(e), r = n.pos + this.scrollerHeight / 2, i = Math.floor(r / Math.max(n.height, this.scrollerHeight) + .5) + n.no, s = i % 2 === 0 ? i : i - 1;
        this.p0 != s && this.isPageInRange(s) && (this.preserveDraggingRowNode(this.p0), this.generatePage(s, this.$.page0), this.positionPage(s, this.$.page0), this.p0 = s, t = !0, this.p0RowBounds = this.getPageRowHeights(this.$.page0)), s = i % 2 === 0 ? Math.max(1, i - 1) : i, this.p1 != s && this.isPageInRange(s) && (this.preserveDraggingRowNode(this.p1), this.generatePage(s, this.$.page1), this.positionPage(s, this.$.page1), this.p1 = s, t = !0, this.p1RowBounds = this.getPageRowHeights(this.$.page1)), t && (this.$.generator.setRowOffset(0), this.$.generator.setCount(this.count), this.fixedHeight || (this.adjustBottomPage(), this.adjustPortSize()));
    },
    getPageRowHeights: function(e) {
        var t = {}, n = e.hasNode().querySelectorAll("div[data-enyo-index]");
        for (var r = 0, i, s; r < n.length; r++)
            i = n[r].getAttribute("data-enyo-index"), i !== null && (s = enyo.dom.getBounds(n[r]), t[parseInt(i, 10)] = {
                height: s.height,
                width: s.width
            });
        return t;
    },
    updateRowBounds: function(e) {
        this.p0RowBounds[e] ? this.updateRowBoundsAtIndex(e, this.p0RowBounds, this.$.page0) : this.p1RowBounds[e] && this.updateRowBoundsAtIndex(e, this.p1RowBounds, this.$.page1);
    },
    updateRowBoundsAtIndex: function(e, t, n) {
        var r = n.hasNode().querySelector('div[data-enyo-index="' + e + '"]'), i = enyo.dom.getBounds(r);
        t[e].height = i.height, t[e].width = i.width;
    },
    updateForPosition: function(e) {
        this.update(this.calcPos(e));
    },
    calcPos: function(e) {
        return this.bottomUp ? this.portSize - this.scrollerHeight - e : e;
    },
    adjustBottomPage: function() {
        var e = this.p0 >= this.p1 ? this.$.page0 : this.$.page1;
        this.positionPage(e.pageNo, e);
    },
    adjustPortSize: function() {
        this.scrollerHeight = this.getBounds().height;
        var e = Math.max(this.scrollerHeight, this.portSize);
        this.$.port.applyStyle("height", e + "px");
    },
    positionPage: function(e, t) {
        t.pageNo = e;
        var n = this.pageToPosition(e);
        t.applyStyle(this.pageBound, n + "px");
    },
    pageToPosition: function(e) {
        var t = 0, n = e;
        while (n > 0)
            n--, t += this.getPageHeight(n);
        return t;
    },
    positionToPageInfo: function(e) {
        var t = -1, n = this.calcPos(e), r = this.defaultPageHeight;
        while (n >= 0)
            t++, r = this.getPageHeight(t), n -= r;
        return t = Math.max(t, 0), {
            no: t,
            height: r,
            pos: n + r,
            startRow: t * this.rowsPerPage,
            endRow: Math.min((t + 1) * this.rowsPerPage - 1, this.count - 1)
        };
    },
    isPageInRange: function(e) {
        return e == Math.max(0, Math.min(this.pageCount - 1, e));
    },
    getPageHeight: function(e) {
        var t = this.pageHeights[e];
        if (!t) {
            var n = this.rowsPerPage * e, r = Math.min(this.count - n, this.rowsPerPage);
            t = this.defaultPageHeight * (r / this.rowsPerPage);
        }
        return Math.max(1, t);
    },
    invalidatePages: function() {
        this.p0 = this.p1 = null, this.p0RowBounds = {}, this.p1RowBounds = {}, this.$.page0.setContent(""), this.$.page1.setContent("");
    },
    invalidateMetrics: function() {
        this.pageHeights = [], this.rowHeight = 0, this.updateMetrics();
    },
    scroll: function(e, t) {
        var n = this.inherited(arguments), r = this.getScrollTop();
        return this.lastPos === r ? n : (this.lastPos = r, this.update(r), this.pinnedReorderMode && this.reorderScroll(e, t), n);
    },
    setScrollTop: function(e) {
        this.update(e), this.inherited(arguments), this.twiddle();
    },
    getScrollPosition: function() {
        return this.calcPos(this.getScrollTop());
    },
    setScrollPosition: function(e) {
        this.setScrollTop(this.calcPos(e));
    },
    scrollToBottom: function() {
        this.update(this.getScrollBounds().maxTop), this.inherited(arguments);
    },
    scrollToRow: function(e) {
        var t = this.pageForRow(e), n = e % this.rowsPerPage, r = this.pageToPosition(t);
        this.updateForPosition(r), r = this.pageToPosition(t), this.setScrollPosition(r);
        if (t == this.p0 || t == this.p1) {
            var i = this.$.generator.fetchRowNode(e);
            if (i) {
                var s = i.offsetTop;
                this.bottomUp && (s = this.getPageHeight(t) - i.offsetHeight - s);
                var o = this.getScrollPosition() + s;
                this.setScrollPosition(o);
            }
        }
    },
    scrollToStart: function() {
        this[this.bottomUp ? "scrollToBottom" : "scrollToTop"]();
    },
    scrollToEnd: function() {
        this[this.bottomUp ? "scrollToTop" : "scrollToBottom"]();
    },
    refresh: function() {
        this.invalidatePages(), this.update(this.getScrollTop()), this.stabilize(), enyo.platform.android === 4 && this.twiddle();
    },
    reset: function() {
        this.getSelection().clear(), this.invalidateMetrics(), this.invalidatePages(), this.stabilize(), this.scrollToStart();
    },
    getSelection: function() {
        return this.$.generator.getSelection();
    },
    select: function(e, t) {
        return this.getSelection().select(e, t);
    },
    deselect: function(e) {
        return this.getSelection().deselect(e);
    },
    isSelected: function(e) {
        return this.$.generator.isSelected(e);
    },
    renderRow: function(e) {
        this.$.generator.renderRow(e);
    },
    rowRendered: function(e, t) {
        this.updateRowBounds(t.rowIndex);
    },
    prepareRow: function(e) {
        this.$.generator.prepareRow(e);
    },
    lockRow: function() {
        this.$.generator.lockRow();
    },
    performOnRow: function(e, t, n) {
        this.$.generator.performOnRow(e, t, n);
    },
    animateFinish: function(e) {
        return this.twiddle(), !0;
    },
    twiddle: function() {
        var e = this.getStrategy();
        enyo.call(e, "twiddle");
    },
    pageForPageNumber: function(e, t) {
        return e % 2 === 0 ? !t || e === this.p0 ? this.$.page0 : null : !t || e === this.p1 ? this.$.page1 : null;
    },
    shouldStartReordering: function(e, t) {
        return !!this.getReorderable() && t.rowIndex >= 0 && !this.pinnedReorderMode && e === this.$.strategy && t.index >= 0 ? !0 : !1;
    },
    startReordering: function(e) {
        this.$.strategy.listReordering = !0, this.buildReorderContainer(), this.doSetupReorderComponents(e), this.styleReorderContainer(e), this.draggingRowIndex = this.placeholderRowIndex = e.rowIndex, this.draggingRowNode = e.target, this.removedInitialPage = !1, this.itemMoved = !1, this.initialPageNumber = this.currentPageNumber = this.pageForRow(e.rowIndex), this.prevScrollTop = this.getScrollTop(), this.replaceNodeWithPlaceholder(e.rowIndex);
    },
    buildReorderContainer: function() {
        this.$.reorderContainer.destroyClientControls();
        for (var e = 0; e < this.reorderComponents.length; e++)
            this.$.reorderContainer.createComponent(this.reorderComponents[e], {
                owner: this.owner
            });
        this.$.reorderContainer.render();
    },
    styleReorderContainer: function(e) {
        this.setItemPosition(this.$.reorderContainer, e.rowIndex), this.setItemBounds(this.$.reorderContainer, e.rowIndex), this.$.reorderContainer.setShowing(!0), this.centerReorderContainer && this.centerReorderContainerOnPointer(e);
    },
    appendNodeToReorderContainer: function(e) {
        this.$.reorderContainer.createComponent({
            allowHtml: !0,
            content: e.innerHTML
        }).render();
    },
    centerReorderContainerOnPointer: function(e) {
        var t = enyo.dom.calcNodePosition(this.hasNode()), n = e.pageX - t.left - parseInt(this.$.reorderContainer.domStyles.width, 10) / 2, r = e.pageY - t.top + this.getScrollTop() - parseInt(this.$.reorderContainer.domStyles.height, 10) / 2;
        this.getStrategyKind() != "ScrollStrategy" && (n -= this.getScrollLeft(), r -= this.getScrollTop()), this.positionReorderContainer(n, r);
    },
    positionReorderContainer: function(e, t) {
        this.$.reorderContainer.addClass("enyo-animatedTopAndLeft"), this.$.reorderContainer.addStyles("left:" + e + "px;top:" + t + "px;"), this.setPositionReorderContainerTimeout();
    },
    setPositionReorderContainerTimeout: function() {
        this.clearPositionReorderContainerTimeout(), this.positionReorderContainerTimeout = setTimeout(enyo.bind(this, function() {
            this.$.reorderContainer.removeClass("enyo-animatedTopAndLeft"), this.clearPositionReorderContainerTimeout();
        }), 100);
    },
    clearPositionReorderContainerTimeout: function() {
        this.positionReorderContainerTimeout && (clearTimeout(this.positionReorderContainerTimeout), this.positionReorderContainerTimeout = null);
    },
    shouldDoReorderDrag: function() {
        return !this.getReorderable() || this.draggingRowIndex < 0 || this.pinnedReorderMode ? !1 : !0;
    },
    reorderDrag: function(e) {
        this.positionReorderNode(e), this.checkForAutoScroll(e), this.updatePlaceholderPosition(e.pageY);
    },
    updatePlaceholderPosition: function(e) {
        var t = this.getRowIndexFromCoordinate(e);
        t !== -1 && (t >= this.placeholderRowIndex ? this.movePlaceholderToIndex(Math.min(this.count, t + 1)) : this.movePlaceholderToIndex(t));
    },
    positionReorderNode: function(e) {
        var t = this.$.reorderContainer.getBounds(), n = t.left + e.ddx, r = t.top + e.ddy;
        r = this.getStrategyKind() == "ScrollStrategy" ? r + (this.getScrollTop() - this.prevScrollTop) : r, this.$.reorderContainer.addStyles("top: " + r + "px ; left: " + n + "px"), this.prevScrollTop = this.getScrollTop();
    },
    checkForAutoScroll: function(e) {
        var t = enyo.dom.calcNodePosition(this.hasNode()), n = this.getBounds(), r;
        this.autoscrollPageY = e.pageY, e.pageY - t.top < n.height * this.dragToScrollThreshold ? (r = 100 * (1 - (e.pageY - t.top) / (n.height * this.dragToScrollThreshold)), this.scrollDistance = -1 * r) : e.pageY - t.top > n.height * (1 - this.dragToScrollThreshold) ? (r = 100 * ((e.pageY - t.top - n.height * (1 - this.dragToScrollThreshold)) / (n.height - n.height * (1 - this.dragToScrollThreshold))), this.scrollDistance = 1 * r) : this.scrollDistance = 0, this.scrollDistance === 0 ? this.stopAutoScrolling() : this.autoScrollTimeout || this.startAutoScrolling();
    },
    stopAutoScrolling: function() {
        this.autoScrollTimeout && (clearTimeout(this.autoScrollTimeout), this.autoScrollTimeout = null);
    },
    startAutoScrolling: function() {
        this.autoScrollTimeout = setInterval(enyo.bind(this, this.autoScroll), this.autoScrollTimeoutMS);
    },
    autoScroll: function() {
        this.scrollDistance === 0 ? this.stopAutoScrolling() : this.autoScrollTimeout || this.startAutoScrolling(), this.setScrollPosition(this.getScrollPosition() + this.scrollDistance), this.positionReorderNode({
            ddx: 0,
            ddy: 0
        }), this.updatePlaceholderPosition(this.autoscrollPageY);
    },
    movePlaceholderToIndex: function(e) {
        var t, n;
        if (e < 0)
            return;
        e >= this.count ? (t = null, n = this.pageForPageNumber(this.pageForRow(this.count - 1)).hasNode()) : (t = this.$.generator.fetchRowNode(e), n = t.parentNode);
        var r = this.pageForRow(e);
        r >= this.pageCount && (r = this.currentPageNumber), n.insertBefore(this.placeholderNode, t), this.currentPageNumber !== r && (this.updatePageHeight(this.currentPageNumber), this.updatePageHeight(r), this.updatePagePositions(r)), this.placeholderRowIndex = e, this.currentPageNumber = r, this.itemMoved = !0;
    },
    finishReordering: function(e, t) {
        if (!this.isReordering() || this.pinnedReorderMode || this.completeReorderTimeout)
            return;
        return this.stopAutoScrolling(), this.$.strategy.listReordering = !1, this.moveReorderedContainerToDroppedPosition(t), this.completeReorderTimeout = setTimeout(enyo.bind(this, this.completeFinishReordering, t), 100), t.preventDefault(), !0;
    },
    moveReorderedContainerToDroppedPosition: function() {
        var e = this.getRelativeOffset(this.placeholderNode, this.hasNode()), t = this.getStrategyKind() == "ScrollStrategy" ? e.top : e.top - this.getScrollTop(), n = e.left - this.getScrollLeft();
        this.positionReorderContainer(n, t);
    },
    completeFinishReordering: function(e) {
        this.completeReorderTimeout = null, this.placeholderRowIndex > this.draggingRowIndex && (this.placeholderRowIndex = Math.max(0, this.placeholderRowIndex - 1));
        if (this.draggingRowIndex == this.placeholderRowIndex && this.pinnedReorderComponents.length && !this.pinnedReorderMode && !this.itemMoved) {
            this.beginPinnedReorder(e);
            return;
        }
        this.removeDraggingRowNode(), this.removePlaceholderNode(), this.emptyAndHideReorderContainer(), this.pinnedReorderMode = !1, this.reorderRows(e), this.draggingRowIndex = this.placeholderRowIndex = -1, this.refresh();
    },
    beginPinnedReorder: function(e) {
        this.buildPinnedReorderContainer(), this.doSetupPinnedReorderComponents(enyo.mixin(e, {
            index: this.draggingRowIndex
        })), this.pinnedReorderMode = !0, this.initialPinPosition = e.pageY;
    },
    emptyAndHideReorderContainer: function() {
        this.$.reorderContainer.destroyComponents(), this.$.reorderContainer.setShowing(!1);
    },
    buildPinnedReorderContainer: function() {
        this.$.reorderContainer.destroyClientControls();
        for (var e = 0; e < this.pinnedReorderComponents.length; e++)
            this.$.reorderContainer.createComponent(this.pinnedReorderComponents[e], {
                owner: this.owner
            });
        this.$.reorderContainer.render();
    },
    reorderRows: function(e) {
        this.doReorder(this.makeReorderEvent(e)), this.positionReorderedNode(), this.updateListIndices();
    },
    makeReorderEvent: function(e) {
        return e.reorderFrom = this.draggingRowIndex, e.reorderTo = this.placeholderRowIndex, e;
    },
    positionReorderedNode: function() {
        if (!this.removedInitialPage) {
            var e = this.$.generator.fetchRowNode(this.placeholderRowIndex);
            e && (e.parentNode.insertBefore(this.hiddenNode, e), this.showNode(this.hiddenNode)), this.hiddenNode = null;
            if (this.currentPageNumber != this.initialPageNumber) {
                var t, n, r = this.pageForPageNumber(this.currentPageNumber), i = this.pageForPageNumber(this.currentPageNumber + 1);
                this.initialPageNumber < this.currentPageNumber ? (t = r.hasNode().firstChild, i.hasNode().appendChild(t)) : (t = r.hasNode().lastChild, n = i.hasNode().firstChild, i.hasNode().insertBefore(t, n)), this.correctPageHeights(), this.updatePagePositions(this.initialPageNumber);
            }
        }
    },
    updateListIndices: function() {
        if (this.shouldDoRefresh()) {
            this.refresh(), this.correctPageHeights();
            return;
        }
        var e = Math.min(this.draggingRowIndex, this.placeholderRowIndex), t = Math.max(this.draggingRowIndex, this.placeholderRowIndex), n = this.draggingRowIndex - this.placeholderRowIndex > 0 ? 1 : -1, r, i, s, o;
        if (n === 1) {
            r = this.$.generator.fetchRowNode(this.draggingRowIndex), r && r.setAttribute("data-enyo-index", "reordered");
            for (i = t - 1, s = t; i >= e; i--) {
                r = this.$.generator.fetchRowNode(i);
                if (!r)
                    continue;
                o = parseInt(r.getAttribute("data-enyo-index"), 10), s = o + 1, r.setAttribute("data-enyo-index", s);
            }
            r = this.hasNode().querySelector('[data-enyo-index="reordered"]'), r.setAttribute("data-enyo-index", this.placeholderRowIndex);
        } else {
            r = this.$.generator.fetchRowNode(this.draggingRowIndex), r && r.setAttribute("data-enyo-index", this.placeholderRowIndex);
            for (i = e + 1, s = e; i <= t; i++) {
                r = this.$.generator.fetchRowNode(i);
                if (!r)
                    continue;
                o = parseInt(r.getAttribute("data-enyo-index"), 10), s = o - 1, r.setAttribute("data-enyo-index", s);
            }
        }
    },
    shouldDoRefresh: function() {
        return Math.abs(this.initialPageNumber - this.currentPageNumber) > 1;
    },
    getNodeStyle: function(e) {
        var t = this.$.generator.fetchRowNode(e);
        if (!t)
            return;
        var n = this.getRelativeOffset(t, this.hasNode()), r = enyo.dom.getBounds(t);
        return {
            h: r.height,
            w: r.width,
            left: n.left,
            top: n.top
        };
    },
    getRelativeOffset: function(e, t) {
        var n = {
            top: 0,
            left: 0
        };
        if (e !== t && e.parentNode)
            do
                n.top += e.offsetTop || 0, n.left += e.offsetLeft || 0, e = e.offsetParent;
            while (e && e !== t);
        return n;
    },
    replaceNodeWithPlaceholder: function(e) {
        var t = this.$.generator.fetchRowNode(e);
        if (!t) {
            enyo.log("No node - " + e);
            return;
        }
        this.placeholderNode = this.createPlaceholderNode(t), this.hiddenNode = this.hideNode(t);
        var n = this.pageForPageNumber(this.currentPageNumber);
        n.hasNode().insertBefore(this.placeholderNode, this.hiddenNode);
    },
    createPlaceholderNode: function(e) {
        var t = this.$.placeholder.hasNode().cloneNode(!0), n = enyo.dom.getBounds(e);
        return t.style.height = n.height + "px", t.style.width = n.width + "px", t;
    },
    removePlaceholderNode: function() {
        this.removeNode(this.placeholderNode), this.placeholderNode = null;
    },
    removeDraggingRowNode: function() {
        this.draggingRowNode = null;
        var e = this.$.holdingarea.hasNode();
        e.innerHTML = "";
    },
    removeNode: function(e) {
        if (!e || !e.parentNode)
            return;
        e.parentNode.removeChild(e);
    },
    updatePageHeight: function(e) {
        if (e < 0)
            return;
        var t = this.pageForPageNumber(e, !0);
        if (t) {
            var n = this.pageHeights[e], r = Math.max(1, t.getBounds().height);
            this.pageHeights[e] = r, this.portSize += r - n;
        }
    },
    updatePagePositions: function(e) {
        this.positionPage(this.currentPageNumber, this.pageForPageNumber(this.currentPageNumber)), this.positionPage(e, this.pageForPageNumber(e));
    },
    correctPageHeights: function() {
        this.updatePageHeight(this.currentPageNumber), this.initialPageNumber != this.currentPageNumber && this.updatePageHeight(this.initialPageNumber);
    },
    hideNode: function(e) {
        return e.style.display = "none", e;
    },
    showNode: function(e) {
        return e.style.display = "block", e;
    },
    dropPinnedRow: function(e) {
        this.moveReorderedContainerToDroppedPosition(e), this.completeReorderTimeout = setTimeout(enyo.bind(this, this.completeFinishReordering, e), 100);
        return;
    },
    cancelPinnedMode: function(e) {
        this.placeholderRowIndex = this.draggingRowIndex, this.dropPinnedRow(e);
    },
    getRowIndexFromCoordinate: function(e) {
        var t = this.getScrollTop() + e - enyo.dom.calcNodePosition(this.hasNode()).top;
        if (t < 0)
            return -1;
        var n = this.positionToPageInfo(t), r = n.no == this.p0 ? this.p0RowBounds : this.p1RowBounds;
        if (!r)
            return this.count;
        var i = n.pos, s = this.placeholderNode ? enyo.dom.getBounds(this.placeholderNode).height : 0, o = 0;
        for (var u = n.startRow; u <= n.endRow; ++u) {
            if (u === this.placeholderRowIndex) {
                o += s;
                if (o >= i)
                    return -1;
            }
            if (u !== this.draggingRowIndex) {
                o += r[u].height;
                if (o >= i)
                    return u;
            }
        }
        return u;
    },
    getIndexPosition: function(e) {
        return enyo.dom.calcNodePosition(this.$.generator.fetchRowNode(e));
    },
    setItemPosition: function(e, t) {
        var n = this.getNodeStyle(t), r = this.getStrategyKind() == "ScrollStrategy" ? n.top : n.top - this.getScrollTop(), i = "top:" + r + "px; left:" + n.left + "px;";
        e.addStyles(i);
    },
    setItemBounds: function(e, t) {
        var n = this.getNodeStyle(t), r = "width:" + n.w + "px; height:" + n.h + "px;";
        e.addStyles(r);
    },
    reorderScroll: function(e, t) {
        this.getStrategyKind() == "ScrollStrategy" && this.$.reorderContainer.addStyles("top:" + (this.initialPinPosition + this.getScrollTop() - this.rowHeight) + "px;"), this.updatePlaceholderPosition(this.initialPinPosition);
    },
    hideReorderingRow: function() {
        var e = this.hasNode().querySelector('[data-enyo-index="' + this.draggingRowIndex + '"]');
        e && (this.hiddenNode = this.hideNode(e));
    },
    isReordering: function() {
        return this.draggingRowIndex > -1;
    },
    isSwiping: function() {
        return this.swipeIndex != null && !this.swipeComplete && this.swipeDirection != null;
    },
    swipeDragStart: function(e, t) {
        return t.index == null || t.vertical ? !0 : (this.completeSwipeTimeout && this.completeSwipe(t), this.swipeComplete = !1, this.swipeIndex != t.index && (this.clearSwipeables(), this.swipeIndex = t.index), this.swipeDirection = t.xDirection, this.persistentItemVisible || this.startSwipe(t), this.draggedXDistance = 0, this.draggedYDistance = 0, !0);
    },
    swipeDrag: function(e, t) {
        return this.persistentItemVisible ? (this.dragPersistentItem(t), this.preventDragPropagation) : this.isSwiping() ? (this.dragSwipeableComponents(this.calcNewDragPosition(t.ddx)), this.draggedXDistance = t.dx, this.draggedYDistance = t.dy, !0) : !1;
    },
    swipeDragFinish: function(e, t) {
        if (this.persistentItemVisible)
            this.dragFinishPersistentItem(t);
        else {
            if (!this.isSwiping())
                return !1;
            var n = this.calcPercentageDragged(this.draggedXDistance);
            n > this.percentageDraggedThreshold && t.xDirection === this.swipeDirection ? this.swipe(this.fastSwipeSpeedMS) : this.backOutSwipe(t);
        }
        return this.preventDragPropagation;
    },
    isSwipeable: function() {
        return this.enableSwipe && this.$.swipeableComponents.controls.length !== 0 && !this.isReordering() && !this.pinnedReorderMode;
    },
    positionSwipeableContainer: function(e, t) {
        var n = this.$.generator.fetchRowNode(e);
        if (!n)
            return;
        var r = this.getRelativeOffset(n, this.hasNode()), i = enyo.dom.getBounds(n), s = t == 1 ? -1 * i.width : i.width;
        this.$.swipeableComponents.addStyles("top: " + r.top + "px; left: " + s + "px; height: " + i.height + "px; width: " + i.width + "px;");
    },
    calcNewDragPosition: function(e) {
        var t = this.$.swipeableComponents.getBounds(), n = t.left, r = this.$.swipeableComponents.getBounds(), i = this.swipeDirection == 1 ? 0 : -1 * r.width, s = this.swipeDirection == 1 ? n + e > i ? i : n + e : n + e < i ? i : n + e;
        return s;
    },
    dragSwipeableComponents: function(e) {
        this.$.swipeableComponents.applyStyle("left", e + "px");
    },
    startSwipe: function(e) {
        e.index = this.swipeIndex, this.positionSwipeableContainer(this.swipeIndex, e.xDirection), this.$.swipeableComponents.setShowing(!0), this.setPersistentItemOrigin(e.xDirection), this.doSetupSwipeItem(e);
    },
    dragPersistentItem: function(e) {
        var t = 0, n = this.persistentItemOrigin == "right" ? Math.max(t, t + e.dx) : Math.min(t, t + e.dx);
        this.$.swipeableComponents.applyStyle("left", n + "px");
    },
    dragFinishPersistentItem: function(e) {
        var t = this.calcPercentageDragged(e.dx) > .2, n = e.dx > 0 ? "right" : e.dx < 0 ? "left" : null;
        this.persistentItemOrigin == n ? t ? this.slideAwayItem() : this.bounceItem(e) : this.bounceItem(e);
    },
    setPersistentItemOrigin: function(e) {
        this.persistentItemOrigin = e == 1 ? "left" : "right";
    },
    calcPercentageDragged: function(e) {
        return Math.abs(e / this.$.swipeableComponents.getBounds().width);
    },
    swipe: function(e) {
        this.swipeComplete = !0, this.animateSwipe(0, e);
    },
    backOutSwipe: function(e) {
        var t = this.$.swipeableComponents.getBounds(), n = this.swipeDirection == 1 ? -1 * t.width : t.width;
        this.animateSwipe(n, this.fastSwipeSpeedMS), this.swipeDirection = null;
    },
    bounceItem: function(e) {
        var t = this.$.swipeableComponents.getBounds();
        t.left != t.width && this.animateSwipe(0, this.normalSwipeSpeedMS);
    },
    slideAwayItem: function() {
        var e = this.$.swipeableComponents, t = e.getBounds().width, n = this.persistentItemOrigin == "left" ? -1 * t : t;
        this.animateSwipe(n, this.normalSwipeSpeedMS), this.persistentItemVisible = !1, this.setPersistSwipeableItem(!1);
    },
    clearSwipeables: function() {
        this.$.swipeableComponents.setShowing(!1), this.persistentItemVisible = !1, this.setPersistSwipeableItem(!1);
    },
    completeSwipe: function(e) {
        this.completeSwipeTimeout && (clearTimeout(this.completeSwipeTimeout), this.completeSwipeTimeout = null), this.getPersistSwipeableItem() ? this.persistentItemVisible = !0 : (this.$.swipeableComponents.setShowing(!1), this.swipeComplete && this.doSwipeComplete({
            index: this.swipeIndex,
            xDirection: this.swipeDirection
        })), this.swipeIndex = null, this.swipeDirection = null;
    },
    animateSwipe: function(e, t) {
        var n = enyo.now(), r = 0, i = this.$.swipeableComponents, s = parseInt(i.domStyles.left, 10), o = e - s;
        this.stopAnimateSwipe();
        var u = enyo.bind(this, function() {
            var e = enyo.now() - n, r = e / t, a = s + o * Math.min(r, 1);
            i.applyStyle("left", a + "px"), this.job = enyo.requestAnimationFrame(u), e / t >= 1 && (this.stopAnimateSwipe(), this.completeSwipeTimeout = setTimeout(enyo.bind(this, function() {
                this.completeSwipe();
            }), this.completeSwipeDelayMS));
        });
        this.job = enyo.requestAnimationFrame(u);
    },
    stopAnimateSwipe: function() {
        this.job && (this.job = enyo.cancelRequestAnimationFrame(this.job));
    }
});

// PulldownList.js

enyo.kind({
    name: "enyo.PulldownList",
    kind: "List",
    touch: !0,
    pully: null,
    pulldownTools: [{
            name: "pulldown",
            classes: "enyo-list-pulldown",
            components: [{
                    name: "puller",
                    kind: "Puller"
                }]
        }],
    events: {
        onPullStart: "",
        onPullCancel: "",
        onPull: "",
        onPullRelease: "",
        onPullComplete: ""
    },
    handlers: {
        onScrollStart: "scrollStartHandler",
        onScrollStop: "scrollStopHandler",
        ondragfinish: "dragfinish"
    },
    pullingMessage: "Pull down to refresh...",
    pulledMessage: "Release to refresh...",
    loadingMessage: "Loading...",
    pullingIconClass: "enyo-puller-arrow enyo-puller-arrow-down",
    pulledIconClass: "enyo-puller-arrow enyo-puller-arrow-up",
    loadingIconClass: "",
    create: function() {
        var e = {
            kind: "Puller",
            showing: !1,
            text: this.loadingMessage,
            iconClass: this.loadingIconClass,
            onCreate: "setPully"
        };
        this.listTools.splice(0, 0, e), this.inherited(arguments), this.setPulling();
    },
    initComponents: function() {
        this.createChrome(this.pulldownTools), this.accel = enyo.dom.canAccelerate(), this.translation = this.accel ? "translate3d" : "translate", this.strategyKind = this.resetStrategyKind(), this.inherited(arguments);
    },
    resetStrategyKind: function() {
        return enyo.platform.android >= 3 ? "TranslateScrollStrategy" : "TouchScrollStrategy";
    },
    setPully: function(e, t) {
        this.pully = t.originator;
    },
    scrollStartHandler: function() {
        this.firedPullStart = !1, this.firedPull = !1, this.firedPullCancel = !1;
    },
    scroll: function(e, t) {
        var n = this.inherited(arguments);
        this.completingPull && this.pully.setShowing(!1);
        var r = this.getStrategy().$.scrollMath || this.getStrategy(), i = -1 * this.getScrollTop();
        return r.isInOverScroll() && i > 0 && (enyo.dom.transformValue(this.$.pulldown, this.translation, "0," + i + "px" + (this.accel ? ",0" : "")), this.firedPullStart || (this.firedPullStart = !0, this.pullStart(), this.pullHeight = this.$.pulldown.getBounds().height), i > this.pullHeight && !this.firedPull && (this.firedPull = !0, this.firedPullCancel = !1, this.pull()), this.firedPull && !this.firedPullCancel && i < this.pullHeight && (this.firedPullCancel = !0, this.firedPull = !1, this.pullCancel())), n;
    },
    scrollStopHandler: function() {
        this.completingPull && (this.completingPull = !1, this.doPullComplete());
    },
    dragfinish: function() {
        if (this.firedPull) {
            var e = this.getStrategy().$.scrollMath || this.getStrategy();
            e.setScrollY(-1 * this.getScrollTop() - this.pullHeight), this.pullRelease();
        }
    },
    completePull: function() {
        this.completingPull = !0;
        var e = this.getStrategy().$.scrollMath || this.getStrategy();
        e.setScrollY(this.pullHeight), e.start();
    },
    pullStart: function() {
        this.setPulling(), this.pully.setShowing(!1), this.$.puller.setShowing(!0), this.doPullStart();
    },
    pull: function() {
        this.setPulled(), this.doPull();
    },
    pullCancel: function() {
        this.setPulling(), this.doPullCancel();
    },
    pullRelease: function() {
        this.$.puller.setShowing(!1), this.pully.setShowing(!0), this.doPullRelease();
    },
    setPulling: function() {
        this.$.puller.setText(this.pullingMessage), this.$.puller.setIconClass(this.pullingIconClass);
    },
    setPulled: function() {
        this.$.puller.setText(this.pulledMessage), this.$.puller.setIconClass(this.pulledIconClass);
    }
}), enyo.kind({
    name: "enyo.Puller",
    classes: "enyo-puller",
    published: {
        text: "",
        iconClass: ""
    },
    events: {
        onCreate: ""
    },
    components: [{
            name: "icon"
        }, {
            name: "text",
            tag: "span",
            classes: "enyo-puller-text"
        }],
    create: function() {
        this.inherited(arguments), this.doCreate(), this.textChanged(), this.iconClassChanged();
    },
    textChanged: function() {
        this.$.text.setContent(this.text);
    },
    iconClassChanged: function() {
        this.$.icon.setClasses(this.iconClass);
    }
});

// AroundList.js

enyo.kind({
    name: "enyo.AroundList",
    kind: "enyo.List",
    listTools: [{
            name: "port",
            classes: "enyo-list-port enyo-border-box",
            components: [{
                    name: "aboveClient"
                }, {
                    name: "generator",
                    kind: "FlyweightRepeater",
                    canGenerate: !1,
                    components: [{
                            tag: null,
                            name: "client"
                        }]
                }, {
                    name: "holdingarea",
                    allowHtml: !0,
                    classes: "enyo-list-holdingarea"
                }, {
                    name: "page0",
                    allowHtml: !0,
                    classes: "enyo-list-page"
                }, {
                    name: "page1",
                    allowHtml: !0,
                    classes: "enyo-list-page"
                }, {
                    name: "belowClient"
                }, {
                    name: "placeholder"
                }, {
                    name: "swipeableComponents",
                    style: "position:absolute; display:block; top:-1000px; left:0px;"
                }]
        }],
    aboveComponents: null,
    initComponents: function() {
        this.inherited(arguments), this.aboveComponents && this.$.aboveClient.createComponents(this.aboveComponents, {
            owner: this.owner
        }), this.belowComponents && this.$.belowClient.createComponents(this.belowComponents, {
            owner: this.owner
        });
    },
    updateMetrics: function() {
        this.defaultPageHeight = this.rowsPerPage * (this.rowHeight || 100), this.pageCount = Math.ceil(this.count / this.rowsPerPage), this.aboveHeight = this.$.aboveClient.getBounds().height, this.belowHeight = this.$.belowClient.getBounds().height, this.portSize = this.aboveHeight + this.belowHeight;
        for (var e = 0; e < this.pageCount; e++)
            this.portSize += this.getPageHeight(e);
        this.adjustPortSize();
    },
    positionPage: function(e, t) {
        t.pageNo = e;
        var n = this.pageToPosition(e), r = this.bottomUp ? this.belowHeight : this.aboveHeight;
        n += r, t.applyStyle(this.pageBound, n + "px");
    },
    scrollToContentStart: function() {
        var e = this.bottomUp ? this.belowHeight : this.aboveHeight;
        this.setScrollPosition(e);
    }
});

// Slideable.js

enyo.kind({
    name: "enyo.Slideable",
    kind: "Control",
    published: {
        axis: "h",
        value: 0,
        unit: "px",
        min: 0,
        max: 0,
        accelerated: "auto",
        overMoving: !0,
        draggable: !0
    },
    events: {
        onAnimateFinish: "",
        onChange: ""
    },
    preventDragPropagation: !1,
    tools: [{
            kind: "Animator",
            onStep: "animatorStep",
            onEnd: "animatorComplete"
        }],
    handlers: {
        ondragstart: "dragstart",
        ondrag: "drag",
        ondragfinish: "dragfinish"
    },
    kDragScalar: 1,
    dragEventProp: "dx",
    unitModifier: !1,
    canTransform: !1,
    create: function() {
        this.inherited(arguments), this.acceleratedChanged(), this.transformChanged(), this.axisChanged(), this.valueChanged(), this.addClass("enyo-slideable");
    },
    initComponents: function() {
        this.createComponents(this.tools), this.inherited(arguments);
    },
    rendered: function() {
        this.inherited(arguments), this.canModifyUnit(), this.updateDragScalar();
    },
    resizeHandler: function() {
        this.inherited(arguments), this.updateDragScalar();
    },
    canModifyUnit: function() {
        if (!this.canTransform) {
            var e = this.getInitialStyleValue(this.hasNode(), this.boundary);
            e.match(/px/i) && this.unit === "%" && (this.unitModifier = this.getBounds()[this.dimension]);
        }
    },
    getInitialStyleValue: function(e, t) {
        var n = enyo.dom.getComputedStyle(e);
        return n ? n.getPropertyValue(t) : e && e.currentStyle ? e.currentStyle[t] : "0";
    },
    updateBounds: function(e, t) {
        var n = {};
        n[this.boundary] = e, this.setBounds(n, this.unit), this.setInlineStyles(e, t);
    },
    updateDragScalar: function() {
        if (this.unit == "%") {
            var e = this.getBounds()[this.dimension];
            this.kDragScalar = e ? 100 / e : 1, this.canTransform || this.updateBounds(this.value, 100);
        }
    },
    transformChanged: function() {
        this.canTransform = enyo.dom.canTransform();
    },
    acceleratedChanged: function() {
        enyo.platform.android > 2 || enyo.dom.accelerate(this, this.accelerated);
    },
    axisChanged: function() {
        var e = this.axis == "h";
        this.dragMoveProp = e ? "dx" : "dy", this.shouldDragProp = e ? "horizontal" : "vertical", this.transform = e ? "translateX" : "translateY", this.dimension = e ? "width" : "height", this.boundary = e ? "left" : "top";
    },
    setInlineStyles: function(e, t) {
        var n = {};
        this.unitModifier ? (n[this.boundary] = this.percentToPixels(e, this.unitModifier), n[this.dimension] = this.unitModifier, this.setBounds(n)) : (t ? n[this.dimension] = t : n[this.boundary] = e, this.setBounds(n, this.unit));
    },
    valueChanged: function(e) {
        var t = this.value;
        this.isOob(t) && !this.isAnimating() && (this.value = this.overMoving ? this.dampValue(t) : this.clampValue(t)), enyo.platform.android > 2 && (this.value ? (e === 0 || e === undefined) && enyo.dom.accelerate(this, this.accelerated) : enyo.dom.accelerate(this, !1)), this.canTransform ? enyo.dom.transformValue(this, this.transform, this.value + this.unit) : this.setInlineStyles(this.value, !1), this.doChange();
    },
    getAnimator: function() {
        return this.$.animator;
    },
    isAtMin: function() {
        return this.value <= this.calcMin();
    },
    isAtMax: function() {
        return this.value >= this.calcMax();
    },
    calcMin: function() {
        return this.min;
    },
    calcMax: function() {
        return this.max;
    },
    clampValue: function(e) {
        var t = this.calcMin(), n = this.calcMax();
        return Math.max(t, Math.min(e, n));
    },
    dampValue: function(e) {
        return this.dampBound(this.dampBound(e, this.min, 1), this.max, -1);
    },
    dampBound: function(e, t, n) {
        var r = e;
        return r * n < t * n && (r = t + (r - t) / 4), r;
    },
    percentToPixels: function(e, t) {
        return Math.floor(t / 100 * e);
    },
    pixelsToPercent: function(e) {
        var t = this.unitModifier ? this.getBounds()[this.dimension] : this.container.getBounds()[this.dimension];
        return e / t * 100;
    },
    shouldDrag: function(e) {
        return this.draggable && e[this.shouldDragProp];
    },
    isOob: function(e) {
        return e > this.calcMax() || e < this.calcMin();
    },
    dragstart: function(e, t) {
        if (this.shouldDrag(t))
            return t.preventDefault(), this.$.animator.stop(), t.dragInfo = {}, this.dragging = !0, this.drag0 = this.value, this.dragd0 = 0, this.preventDragPropagation;
    },
    drag: function(e, t) {
        if (this.dragging) {
            t.preventDefault();
            var n = this.canTransform ? t[this.dragMoveProp] * this.kDragScalar : this.pixelsToPercent(t[this.dragMoveProp]), r = this.drag0 + n, i = n - this.dragd0;
            return this.dragd0 = n, i && (t.dragInfo.minimizing = i < 0), this.setValue(r), this.preventDragPropagation;
        }
    },
    dragfinish: function(e, t) {
        if (this.dragging)
            return this.dragging = !1, this.completeDrag(t), t.preventTap(), this.preventDragPropagation;
    },
    completeDrag: function(e) {
        this.value !== this.calcMax() && this.value != this.calcMin() && this.animateToMinMax(e.dragInfo.minimizing);
    },
    isAnimating: function() {
        return this.$.animator.isAnimating();
    },
    play: function(e, t) {
        this.$.animator.play({
            startValue: e,
            endValue: t,
            node: this.hasNode()
        });
    },
    animateTo: function(e) {
        this.play(this.value, e);
    },
    animateToMin: function() {
        this.animateTo(this.calcMin());
    },
    animateToMax: function() {
        this.animateTo(this.calcMax());
    },
    animateToMinMax: function(e) {
        e ? this.animateToMin() : this.animateToMax();
    },
    animatorStep: function(e) {
        return this.setValue(e.value), !0;
    },
    animatorComplete: function(e) {
        return this.doAnimateFinish(e), !0;
    },
    toggleMinMax: function() {
        this.animateToMinMax(!this.isAtMin());
    }
});

// Arranger.js

enyo.kind({
    name: "enyo.Arranger",
    kind: "Layout",
    layoutClass: "enyo-arranger",
    accelerated: "auto",
    dragProp: "ddx",
    dragDirectionProp: "xDirection",
    canDragProp: "horizontal",
    incrementalPoints: !1,
    destroy: function() {
        var e = this.container.getPanels();
        for (var t = 0, n; n = e[t]; t++)
            n._arranger = null;
        this.inherited(arguments);
    },
    arrange: function(e, t) {
    },
    size: function() {
    },
    start: function() {
        var e = this.container.fromIndex, t = this.container.toIndex, n = this.container.transitionPoints = [e];
        if (this.incrementalPoints) {
            var r = Math.abs(t - e) - 2, i = e;
            while (r >= 0)
                i += t < e ? -1 : 1, n.push(i), r--;
        }
        n.push(this.container.toIndex);
    },
    finish: function() {
    },
    calcArrangementDifference: function(e, t, n, r) {
    },
    canDragEvent: function(e) {
        return e[this.canDragProp];
    },
    calcDragDirection: function(e) {
        return e[this.dragDirectionProp];
    },
    calcDrag: function(e) {
        return e[this.dragProp];
    },
    drag: function(e, t, n, r, i) {
        var s = this.measureArrangementDelta(-e, t, n, r, i);
        return s;
    },
    measureArrangementDelta: function(e, t, n, r, i) {
        var s = this.calcArrangementDifference(t, n, r, i), o = s ? e / Math.abs(s) : 0;
        return o *= this.container.fromIndex > this.container.toIndex ? -1 : 1, o;
    },
    _arrange: function(e) {
        this.containerBounds || this.reflow();
        var t = this.getOrderedControls(e);
        this.arrange(t, e);
    },
    arrangeControl: function(e, t) {
        e._arranger = enyo.mixin(e._arranger || {}, t);
    },
    flow: function() {
        this.c$ = [].concat(this.container.getPanels()), this.controlsIndex = 0;
        for (var e = 0, t = this.container.getPanels(), n; n = t[e]; e++) {
            enyo.dom.accelerate(n, this.accelerated);
            if (enyo.platform.safari) {
                var r = n.children;
                for (var i = 0, s; s = r[i]; i++)
                    enyo.dom.accelerate(s, this.accelerated);
            }
        }
    },
    reflow: function() {
        var e = this.container.hasNode();
        this.containerBounds = e ? {
            width: e.clientWidth,
            height: e.clientHeight
        } : {}, this.size();
    },
    flowArrangement: function() {
        var e = this.container.arrangement;
        if (e)
            for (var t = 0, n = this.container.getPanels(), r; r = n[t]; t++)
                this.flowControl(r, e[t]);
    },
    flowControl: function(e, t) {
        enyo.Arranger.positionControl(e, t);
        var n = t.opacity;
        n != null && enyo.Arranger.opacifyControl(e, n);
    },
    getOrderedControls: function(e) {
        var t = Math.floor(e), n = t - this.controlsIndex, r = n > 0, i = this.c$ || [];
        for (var s = 0; s < Math.abs(n); s++)
            r ? i.push(i.shift()) : i.unshift(i.pop());
        return this.controlsIndex = t, i;
    },
    statics: {
        positionControl: function(e, t, n) {
            var r = n || "px";
            if (!this.updating)
                if (enyo.dom.canTransform() && !enyo.platform.android && enyo.platform.ie !== 10) {
                    var i = t.left, s = t.top;
                    i = enyo.isString(i) ? i : i && i + r, s = enyo.isString(s) ? s : s && s + r, enyo.dom.transform(e, {
                        translateX: i || null,
                        translateY: s || null
                    });
                } else
                    e.setBounds(t, n);
        },
        opacifyControl: function(e, t) {
            var n = t;
            n = n > .99 ? 1 : n < .01 ? 0 : n, enyo.platform.ie < 9 ? e.applyStyle("filter", "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + n * 100 + ")") : e.applyStyle("opacity", n);
        }
    }
});

// CardArranger.js

enyo.kind({
    name: "enyo.CardArranger",
    kind: "Arranger",
    layoutClass: "enyo-arranger enyo-arranger-fit",
    calcArrangementDifference: function(e, t, n, r) {
        return this.containerBounds.width;
    },
    arrange: function(e, t) {
        for (var n = 0, r, i, s; r = e[n]; n++)
            s = n === 0 ? 1 : 0, this.arrangeControl(r, {
                opacity: s
            });
    },
    start: function() {
        this.inherited(arguments);
        var e = this.container.getPanels();
        for (var t = 0, n; n = e[t]; t++) {
            var r = n.showing;
            n.setShowing(t == this.container.fromIndex || t == this.container.toIndex), n.showing && !r && n.resized();
        }
    },
    finish: function() {
        this.inherited(arguments);
        var e = this.container.getPanels();
        for (var t = 0, n; n = e[t]; t++)
            n.setShowing(t == this.container.toIndex);
    },
    destroy: function() {
        var e = this.container.getPanels();
        for (var t = 0, n; n = e[t]; t++)
            enyo.Arranger.opacifyControl(n, 1), n.showing || n.setShowing(!0);
        this.inherited(arguments);
    }
});

// CardSlideInArranger.js

enyo.kind({
    name: "enyo.CardSlideInArranger",
    kind: "CardArranger",
    start: function() {
        var e = this.container.getPanels();
        for (var t = 0, n; n = e[t]; t++) {
            var r = n.showing;
            n.setShowing(t == this.container.fromIndex || t == this.container.toIndex), n.showing && !r && n.resized();
        }
        var i = this.container.fromIndex;
        t = this.container.toIndex, this.container.transitionPoints = [t + "." + i + ".s", t + "." + i + ".f"];
    },
    finish: function() {
        this.inherited(arguments);
        var e = this.container.getPanels();
        for (var t = 0, n; n = e[t]; t++)
            n.setShowing(t == this.container.toIndex);
    },
    arrange: function(e, t) {
        var n = t.split("."), r = n[0], i = n[1], s = n[2] == "s", o = this.containerBounds.width;
        for (var u = 0, a = this.container.getPanels(), f, l; f = a[u]; u++)
            l = o, i == u && (l = s ? 0 : -o), r == u && (l = s ? o : 0), i == u && i == r && (l = 0), this.arrangeControl(f, {
                left: l
            });
    },
    destroy: function() {
        var e = this.container.getPanels();
        for (var t = 0, n; n = e[t]; t++)
            enyo.Arranger.positionControl(n, {
                left: null
            });
        this.inherited(arguments);
    }
});

// CarouselArranger.js

enyo.kind({
    name: "enyo.CarouselArranger",
    kind: "Arranger",
    size: function() {
        var e = this.container.getPanels(), t = this.containerPadding = this.container.hasNode() ? enyo.dom.calcPaddingExtents(this.container.node) : {}, n = this.containerBounds, r, i, s, o, u;
        n.height -= t.top + t.bottom, n.width -= t.left + t.right;
        var a;
        for (r = 0, s = 0; u = e[r]; r++)
            o = enyo.dom.calcMarginExtents(u.hasNode()), u.width = u.getBounds().width, u.marginWidth = o.right + o.left, s += (u.fit ? 0 : u.width) + u.marginWidth, u.fit && (a = u);
        if (a) {
            var f = n.width - s;
            a.width = f >= 0 ? f : a.width;
        }
        for (r = 0, i = t.left; u = e[r]; r++)
            u.setBounds({
                top: t.top,
                bottom: t.bottom,
                width: u.fit ? u.width : null
            });
    },
    arrange: function(e, t) {
        this.container.wrap ? this.arrangeWrap(e, t) : this.arrangeNoWrap(e, t);
    },
    arrangeNoWrap: function(e, t) {
        var n, r, i, s, o = this.container.getPanels(), u = this.container.clamp(t), a = this.containerBounds.width;
        for (n = u, i = 0; s = o[n]; n++) {
            i += s.width + s.marginWidth;
            if (i > a)
                break;
        }
        var f = a - i, l = 0;
        if (f > 0) {
            var c = u;
            for (n = u - 1, r = 0; s = o[n]; n--) {
                r += s.width + s.marginWidth;
                if (f - r <= 0) {
                    l = f - r, u = n;
                    break;
                }
            }
        }
        var h, p;
        for (n = 0, p = this.containerPadding.left + l; s = o[n]; n++)
            h = s.width + s.marginWidth, n < u ? this.arrangeControl(s, {
                left: -h
            }) : (this.arrangeControl(s, {
                left: Math.floor(p)
            }), p += h);
    },
    arrangeWrap: function(e, t) {
        for (var n = 0, r = this.containerPadding.left, i, s; s = e[n]; n++)
            this.arrangeControl(s, {
                left: r
            }), r += s.width + s.marginWidth;
    },
    calcArrangementDifference: function(e, t, n, r) {
        var i = Math.abs(e % this.c$.length);
        return t[i].left - r[i].left;
    },
    destroy: function() {
        var e = this.container.getPanels();
        for (var t = 0, n; n = e[t]; t++)
            enyo.Arranger.positionControl(n, {
                left: null,
                top: null
            }), n.applyStyle("top", null), n.applyStyle("bottom", null), n.applyStyle("left", null), n.applyStyle("width", null);
        this.inherited(arguments);
    }
});

// CollapsingArranger.js

enyo.kind({
    name: "enyo.CollapsingArranger",
    kind: "CarouselArranger",
    peekWidth: 0,
    size: function() {
        this.clearLastSize(), this.inherited(arguments);
    },
    clearLastSize: function() {
        for (var e = 0, t = this.container.getPanels(), n; n = t[e]; e++)
            n._fit && e != t.length - 1 && (n.applyStyle("width", null), n._fit = null);
    },
    constructor: function() {
        this.inherited(arguments), this.peekWidth = this.container.peekWidth != null ? this.container.peekWidth : this.peekWidth;
    },
    arrange: function(e, t) {
        var n = this.container.getPanels();
        for (var r = 0, i = this.containerPadding.left, s, o, u = 0; o = n[r]; r++)
            o.getShowing() ? (this.arrangeControl(o, {
                left: i + u * this.peekWidth
            }), r >= t && (i += o.width + o.marginWidth - this.peekWidth), u++) : (this.arrangeControl(o, {
                left: i
            }), r >= t && (i += o.width + o.marginWidth)), r == n.length - 1 && t < 0 && this.arrangeControl(o, {
                left: i - t
            });
    },
    calcArrangementDifference: function(e, t, n, r) {
        var i = this.container.getPanels().length - 1;
        return Math.abs(r[i].left - t[i].left);
    },
    flowControl: function(e, t) {
        this.inherited(arguments);
        if (this.container.realtimeFit) {
            var n = this.container.getPanels(), r = n.length - 1, i = n[r];
            e == i && this.fitControl(e, t.left);
        }
    },
    finish: function() {
        this.inherited(arguments);
        if (!this.container.realtimeFit && this.containerBounds) {
            var e = this.container.getPanels(), t = this.container.arrangement, n = e.length - 1, r = e[n];
            this.fitControl(r, t[n].left);
        }
    },
    fitControl: function(e, t) {
        e._fit = !0, e.applyStyle("width", this.containerBounds.width - t + "px"), e.resized();
    }
});

// DockRightArranger.js

enyo.kind({
    name: "enyo.DockRightArranger",
    kind: "Arranger",
    basePanel: !1,
    overlap: 0,
    layoutWidth: 0,
    constructor: function() {
        this.inherited(arguments), this.overlap = this.container.overlap != null ? this.container.overlap : this.overlap, this.layoutWidth = this.container.layoutWidth != null ? this.container.layoutWidth : this.layoutWidth;
    },
    size: function() {
        var e = this.container.getPanels(), t = this.containerPadding = this.container.hasNode() ? enyo.dom.calcPaddingExtents(this.container.node) : {}, n = this.containerBounds, r, i, s;
        n.width -= t.left + t.right;
        var o = n.width, u = e.length;
        this.container.transitionPositions = {};
        for (r = 0; s = e[r]; r++)
            s.width = r === 0 && this.container.basePanel ? o : s.getBounds().width;
        for (r = 0; s = e[r]; r++) {
            r === 0 && this.container.basePanel && s.setBounds({
                width: o
            }), s.setBounds({
                top: t.top,
                bottom: t.bottom
            });
            for (j = 0; s = e[j]; j++) {
                var a;
                if (r === 0 && this.container.basePanel)
                    a = 0;
                else if (j < r)
                    a = o;
                else {
                    if (r !== j)
                        break;
                    var f = o > this.layoutWidth ? this.overlap : 0;
                    a = o - e[r].width + f;
                }
                this.container.transitionPositions[r + "." + j] = a;
            }
            if (j < u) {
                var l = !1;
                for (k = r + 1; k < u; k++) {
                    var f = 0;
                    if (l)
                        f = 0;
                    else if (e[r].width + e[k].width - this.overlap > o)
                        f = 0, l = !0;
                    else {
                        f = e[r].width - this.overlap;
                        for (i = r; i < k; i++) {
                            var c = f + e[i + 1].width - this.overlap;
                            if (!(c < o)) {
                                f = o;
                                break;
                            }
                            f = c;
                        }
                        f = o - f;
                    }
                    this.container.transitionPositions[r + "." + k] = f;
                }
            }
        }
    },
    arrange: function(e, t) {
        var n, r, i = this.container.getPanels(), s = this.container.clamp(t);
        for (n = 0; r = i[n]; n++) {
            var o = this.container.transitionPositions[n + "." + s];
            this.arrangeControl(r, {
                left: o
            });
        }
    },
    calcArrangementDifference: function(e, t, n, r) {
        var i = this.container.getPanels(), s = e < n ? i[n].width : i[e].width;
        return s;
    },
    destroy: function() {
        var e = this.container.getPanels();
        for (var t = 0, n; n = e[t]; t++)
            enyo.Arranger.positionControl(n, {
                left: null,
                top: null
            }), n.applyStyle("top", null), n.applyStyle("bottom", null), n.applyStyle("left", null), n.applyStyle("width", null);
        this.inherited(arguments);
    }
});

// OtherArrangers.js

enyo.kind({
    name: "enyo.LeftRightArranger",
    kind: "Arranger",
    margin: 40,
    axisSize: "width",
    offAxisSize: "height",
    axisPosition: "left",
    constructor: function() {
        this.inherited(arguments), this.margin = this.container.margin != null ? this.container.margin : this.margin;
    },
    size: function() {
        var e = this.container.getPanels(), t = this.containerBounds[this.axisSize], n = t - this.margin - this.margin;
        for (var r = 0, i, s; s = e[r]; r++)
            i = {}, i[this.axisSize] = n, i[this.offAxisSize] = "100%", s.setBounds(i);
    },
    start: function() {
        this.inherited(arguments);
        var e = this.container.fromIndex, t = this.container.toIndex, n = this.getOrderedControls(t), r = Math.floor(n.length / 2);
        for (var i = 0, s; s = n[i]; i++)
            e > t ? i == n.length - r ? s.applyStyle("z-index", 0) : s.applyStyle("z-index", 1) : i == n.length - 1 - r ? s.applyStyle("z-index", 0) : s.applyStyle("z-index", 1);
    },
    arrange: function(e, t) {
        var n, r, i, s;
        if (this.container.getPanels().length == 1) {
            s = {}, s[this.axisPosition] = this.margin, this.arrangeControl(this.container.getPanels()[0], s);
            return;
        }
        var o = Math.floor(this.container.getPanels().length / 2), u = this.getOrderedControls(Math.floor(t) - o), a = this.containerBounds[this.axisSize] - this.margin - this.margin, f = this.margin - a * o;
        for (n = 0; r = u[n]; n++)
            s = {}, s[this.axisPosition] = f, this.arrangeControl(r, s), f += a;
    },
    calcArrangementDifference: function(e, t, n, r) {
        if (this.container.getPanels().length == 1)
            return 0;
        var i = Math.abs(e % this.c$.length);
        return t[i][this.axisPosition] - r[i][this.axisPosition];
    },
    destroy: function() {
        var e = this.container.getPanels();
        for (var t = 0, n; n = e[t]; t++)
            enyo.Arranger.positionControl(n, {
                left: null,
                top: null
            }), enyo.Arranger.opacifyControl(n, 1), n.applyStyle("left", null), n.applyStyle("top", null), n.applyStyle("height", null), n.applyStyle("width", null);
        this.inherited(arguments);
    }
}), enyo.kind({
    name: "enyo.TopBottomArranger",
    kind: "LeftRightArranger",
    dragProp: "ddy",
    dragDirectionProp: "yDirection",
    canDragProp: "vertical",
    axisSize: "height",
    offAxisSize: "width",
    axisPosition: "top"
}), enyo.kind({
    name: "enyo.SpiralArranger",
    kind: "Arranger",
    incrementalPoints: !0,
    inc: 20,
    size: function() {
        var e = this.container.getPanels(), t = this.containerBounds, n = this.controlWidth = t.width / 3, r = this.controlHeight = t.height / 3;
        for (var i = 0, s; s = e[i]; i++)
            s.setBounds({
                width: n,
                height: r
            });
    },
    arrange: function(e, t) {
        var n = this.inc;
        for (var r = 0, i = e.length, s; s = e[r]; r++) {
            var o = Math.cos(r / i * 2 * Math.PI) * r * n + this.controlWidth, u = Math.sin(r / i * 2 * Math.PI) * r * n + this.controlHeight;
            this.arrangeControl(s, {
                left: o,
                top: u
            });
        }
    },
    start: function() {
        this.inherited(arguments);
        var e = this.getOrderedControls(this.container.toIndex);
        for (var t = 0, n; n = e[t]; t++)
            n.applyStyle("z-index", e.length - t);
    },
    calcArrangementDifference: function(e, t, n, r) {
        return this.controlWidth;
    },
    destroy: function() {
        var e = this.container.getPanels();
        for (var t = 0, n; n = e[t]; t++)
            n.applyStyle("z-index", null), enyo.Arranger.positionControl(n, {
                left: null,
                top: null
            }), n.applyStyle("left", null), n.applyStyle("top", null), n.applyStyle("height", null), n.applyStyle("width", null);
        this.inherited(arguments);
    }
}), enyo.kind({
    name: "enyo.GridArranger",
    kind: "Arranger",
    incrementalPoints: !0,
    colWidth: 100,
    colHeight: 100,
    size: function() {
        var e = this.container.getPanels(), t = this.colWidth, n = this.colHeight;
        for (var r = 0, i; i = e[r]; r++)
            i.setBounds({
                width: t,
                height: n
            });
    },
    arrange: function(e, t) {
        var n = this.colWidth, r = this.colHeight, i = Math.max(1, Math.floor(this.containerBounds.width / n)), s;
        for (var o = 0, u = 0; u < e.length; o++)
            for (var a = 0; a < i && (s = e[u]); a++, u++)
                this.arrangeControl(s, {
                    left: n * a,
                    top: r * o
                });
    },
    flowControl: function(e, t) {
        this.inherited(arguments), enyo.Arranger.opacifyControl(e, t.top % this.colHeight !== 0 ? .25 : 1);
    },
    calcArrangementDifference: function(e, t, n, r) {
        return this.colWidth;
    },
    destroy: function() {
        var e = this.container.getPanels();
        for (var t = 0, n; n = e[t]; t++)
            enyo.Arranger.positionControl(n, {
                left: null,
                top: null
            }), n.applyStyle("left", null), n.applyStyle("top", null), n.applyStyle("height", null), n.applyStyle("width", null);
        this.inherited(arguments);
    }
});

// Panels.js

enyo.kind({
    name: "enyo.Panels",
    classes: "enyo-panels",
    published: {
        index: 0,
        draggable: !0,
        animate: !0,
        wrap: !1,
        arrangerKind: "CardArranger",
        narrowFit: !0
    },
    events: {
        onTransitionStart: "",
        onTransitionFinish: ""
    },
    handlers: {
        ondragstart: "dragstart",
        ondrag: "drag",
        ondragfinish: "dragfinish",
        onscroll: "domScroll"
    },
    tools: [{
            kind: "Animator",
            onStep: "step",
            onEnd: "completed"
        }],
    fraction: 0,
    create: function() {
        this.transitionPoints = [], this.inherited(arguments), this.arrangerKindChanged(), this.narrowFitChanged(), this.indexChanged();
    },
    rendered: function() {
        this.inherited(arguments), enyo.makeBubble(this, "scroll");
    },
    domScroll: function(e, t) {
        this.hasNode() && this.node.scrollLeft > 0 && (this.node.scrollLeft = 0);
    },
    initComponents: function() {
        this.createChrome(this.tools), this.inherited(arguments);
    },
    arrangerKindChanged: function() {
        this.setLayoutKind(this.arrangerKind);
    },
    narrowFitChanged: function() {
        this.addRemoveClass("enyo-panels-fit-narrow", this.narrowFit);
    },
    destroy: function() {
        this.destroying = !0, this.inherited(arguments);
    },
    removeControl: function(e) {
        this.inherited(arguments), this.destroying && this.controls.length > 0 && this.isPanel(e) && (this.setIndex(Math.max(this.index - 1, 0)), this.flow(), this.reflow());
    },
    isPanel: function() {
        return !0;
    },
    flow: function() {
        this.arrangements = [], this.inherited(arguments);
    },
    reflow: function() {
        this.arrangements = [], this.inherited(arguments), this.refresh();
    },
    getPanels: function() {
        var e = this.controlParent || this;
        return e.children;
    },
    getActive: function() {
        var e = this.getPanels(), t = this.index % e.length;
        return t < 0 && (t += e.length), e[t];
    },
    getAnimator: function() {
        return this.$.animator;
    },
    setIndex: function(e) {
        this.setPropertyValue("index", e, "indexChanged");
    },
    setIndexDirect: function(e) {
        this.setIndex(e), this.completed();
    },
    previous: function() {
        this.setIndex(this.index - 1);
    },
    next: function() {
        this.setIndex(this.index + 1);
    },
    clamp: function(e) {
        var t = this.getPanels().length - 1;
        return this.wrap ? e : Math.max(0, Math.min(e, t));
    },
    indexChanged: function(e) {
        this.lastIndex = e, this.index = this.clamp(this.index), !this.dragging && this.$.animator && (this.$.animator.isAnimating() && this.completed(), this.$.animator.stop(), this.hasNode() && (this.animate ? (this.startTransition(), this.$.animator.play({
            startValue: this.fraction
        })) : this.refresh()));
    },
    step: function(e) {
        this.fraction = e.value, this.stepTransition();
    },
    completed: function() {
        this.$.animator.isAnimating() && this.$.animator.stop(), this.fraction = 1, this.stepTransition(), this.finishTransition();
    },
    dragstart: function(e, t) {
        if (this.draggable && this.layout && this.layout.canDragEvent(t))
            return t.preventDefault(), this.dragstartTransition(t), this.dragging = !0, this.$.animator.stop(), !0;
    },
    drag: function(e, t) {
        this.dragging && (t.preventDefault(), this.dragTransition(t));
    },
    dragfinish: function(e, t) {
        this.dragging && (this.dragging = !1, t.preventTap(), this.dragfinishTransition(t));
    },
    dragstartTransition: function(e) {
        if (!this.$.animator.isAnimating()) {
            var t = this.fromIndex = this.index;
            this.toIndex = t - (this.layout ? this.layout.calcDragDirection(e) : 0);
        } else
            this.verifyDragTransition(e);
        this.fromIndex = this.clamp(this.fromIndex), this.toIndex = this.clamp(this.toIndex), this.fireTransitionStart(), this.layout && this.layout.start();
    },
    dragTransition: function(e) {
        var t = this.layout ? this.layout.calcDrag(e) : 0, n = this.transitionPoints, r = n[0], i = n[n.length - 1], s = this.fetchArrangement(r), o = this.fetchArrangement(i), u = this.layout ? this.layout.drag(t, r, s, i, o) : 0, a = t && !u;
        a, this.fraction += u;
        var f = this.fraction;
        if (f > 1 || f < 0 || a)
            (f > 0 || a) && this.dragfinishTransition(e), this.dragstartTransition(e), this.fraction = 0;
        this.stepTransition();
    },
    dragfinishTransition: function(e) {
        this.verifyDragTransition(e), this.setIndex(this.toIndex), this.dragging && this.fireTransitionFinish();
    },
    verifyDragTransition: function(e) {
        var t = this.layout ? this.layout.calcDragDirection(e) : 0, n = Math.min(this.fromIndex, this.toIndex), r = Math.max(this.fromIndex, this.toIndex);
        if (t > 0) {
            var i = n;
            n = r, r = i;
        }
        n != this.fromIndex && (this.fraction = 1 - this.fraction), this.fromIndex = n, this.toIndex = r;
    },
    refresh: function() {
        this.$.animator && this.$.animator.isAnimating() && this.$.animator.stop(), this.startTransition(), this.fraction = 1, this.stepTransition(), this.finishTransition();
    },
    startTransition: function() {
        this.fromIndex = this.fromIndex != null ? this.fromIndex : this.lastIndex || 0, this.toIndex = this.toIndex != null ? this.toIndex : this.index, this.layout && this.layout.start(), this.fireTransitionStart();
    },
    finishTransition: function() {
        this.layout && this.layout.finish(), this.transitionPoints = [], this.fraction = 0, this.fromIndex = this.toIndex = null, this.fireTransitionFinish();
    },
    fireTransitionStart: function() {
        var e = this.startTransitionInfo;
        this.hasNode() && (!e || e.fromIndex != this.fromIndex || e.toIndex != this.toIndex) && (this.startTransitionInfo = {
            fromIndex: this.fromIndex,
            toIndex: this.toIndex
        }, this.doTransitionStart(enyo.clone(this.startTransitionInfo)));
    },
    fireTransitionFinish: function() {
        var e = this.finishTransitionInfo;
        this.hasNode() && (!e || e.fromIndex != this.lastIndex || e.toIndex != this.index) && (this.finishTransitionInfo = {
            fromIndex: this.lastIndex,
            toIndex: this.index
        }, this.doTransitionFinish(enyo.clone(this.finishTransitionInfo))), this.lastIndex = this.index;
    },
    stepTransition: function() {
        if (this.hasNode()) {
            var e = this.transitionPoints, t = (this.fraction || 0) * (e.length - 1), n = Math.floor(t);
            t -= n;
            var r = e[n], i = e[n + 1], s = this.fetchArrangement(r), o = this.fetchArrangement(i);
            this.arrangement = s && o ? enyo.Panels.lerp(s, o, t) : s || o, this.arrangement && this.layout && this.layout.flowArrangement();
        }
    },
    fetchArrangement: function(e) {
        return e != null && !this.arrangements[e] && this.layout && (this.layout._arrange(e), this.arrangements[e] = this.readArrangement(this.getPanels())), this.arrangements[e];
    },
    readArrangement: function(e) {
        var t = [];
        for (var n = 0, r = e, i; i = r[n]; n++)
            t.push(enyo.clone(i._arranger));
        return t;
    },
    statics: {
        isScreenNarrow: function() {
            return enyo.dom.getWindowWidth() <= 800;
        },
        lerp: function(e, t, n) {
            var r = [];
            for (var i = 0, s = enyo.keys(e), o; o = s[i]; i++)
                r.push(this.lerpObject(e[o], t[o], n));
            return r;
        },
        lerpObject: function(e, t, n) {
            var r = enyo.clone(e), i, s;
            if (t)
                for (var o in e)
                    i = e[o], s = t[o], i != s && (r[o] = i - (i - s) * n);
            return r;
        }
    }
});

// Node.js

enyo.kind({
    name: "enyo.Node",
    published: {
        expandable: !1,
        expanded: !1,
        icon: "",
        onlyIconExpands: !1,
        selected: !1
    },
    style: "padding: 0 0 0 16px;",
    content: "Node",
    defaultKind: "Node",
    classes: "enyo-node",
    components: [{
            name: "icon",
            kind: "Image",
            showing: !1
        }, {
            kind: "Control",
            name: "caption",
            Xtag: "span",
            style: "display: inline-block; padding: 4px;",
            allowHtml: !0
        }, {
            kind: "Control",
            name: "extra",
            tag: "span",
            allowHtml: !0
        }],
    childClient: [{
            kind: "Control",
            name: "box",
            classes: "enyo-node-box",
            Xstyle: "border: 1px solid orange;",
            components: [{
                    kind: "Control",
                    name: "client",
                    classes: "enyo-node-client",
                    Xstyle: "border: 1px solid lightblue;"
                }]
        }],
    handlers: {
        ondblclick: "dblclick"
    },
    events: {
        onNodeTap: "nodeTap",
        onNodeDblClick: "nodeDblClick",
        onExpand: "nodeExpand",
        onDestroyed: "nodeDestroyed"
    },
    create: function() {
        this.inherited(arguments), this.selectedChanged(), this.iconChanged();
    },
    destroy: function() {
        this.doDestroyed(), this.inherited(arguments);
    },
    initComponents: function() {
        this.expandable && (this.kindComponents = this.kindComponents.concat(this.childClient)), this.inherited(arguments);
    },
    contentChanged: function() {
        this.$.caption.setContent(this.content);
    },
    iconChanged: function() {
        this.$.icon.setSrc(this.icon), this.$.icon.setShowing(Boolean(this.icon));
    },
    selectedChanged: function() {
        this.addRemoveClass("enyo-selected", this.selected);
    },
    rendered: function() {
        this.inherited(arguments), this.expandable && !this.expanded && this.quickCollapse();
    },
    addNodes: function(e) {
        this.destroyClientControls();
        for (var t = 0, n; n = e[t]; t++)
            this.createComponent(n);
        this.$.client.render();
    },
    addTextNodes: function(e) {
        this.destroyClientControls();
        for (var t = 0, n; n = e[t]; t++)
            this.createComponent({
                content: n
            });
        this.$.client.render();
    },
    tap: function(e, t) {
        return this.onlyIconExpands ? t.target == this.$.icon.hasNode() ? this.toggleExpanded() : this.doNodeTap() : (this.toggleExpanded(), this.doNodeTap()), !0;
    },
    dblclick: function(e, t) {
        return this.doNodeDblClick(), !0;
    },
    toggleExpanded: function() {
        this.setExpanded(!this.expanded);
    },
    quickCollapse: function() {
        this.removeClass("enyo-animate"), this.$.box.applyStyle("height", "0");
        var e = this.$.client.getBounds().height;
        this.$.client.setBounds({
            top: -e
        });
    },
    _expand: function() {
        this.addClass("enyo-animate");
        var e = this.$.client.getBounds().height;
        this.$.box.setBounds({
            height: e
        }), this.$.client.setBounds({
            top: 0
        }), setTimeout(enyo.bind(this, function() {
            this.expanded && (this.removeClass("enyo-animate"), this.$.box.applyStyle("height", "auto"));
        }), 225);
    },
    _collapse: function() {
        this.removeClass("enyo-animate");
        var e = this.$.client.getBounds().height;
        this.$.box.setBounds({
            height: e
        }), setTimeout(enyo.bind(this, function() {
            this.addClass("enyo-animate"), this.$.box.applyStyle("height", "0"), this.$.client.setBounds({
                top: -e
            });
        }), 25);
    },
    expandedChanged: function(e) {
        if (!this.expandable)
            this.expanded = !1;
        else {
            var t = {
                expanded: this.expanded
            };
            this.doExpand(t), t.wait || this.effectExpanded();
        }
    },
    effectExpanded: function() {
        this.$.client && (this.expanded ? this._expand() : this._collapse());
    }
});

// ImageViewPin.js

enyo.kind({
    name: "enyo.ImageViewPin",
    kind: "enyo.Control",
    published: {
        highlightAnchorPoint: !1,
        anchor: {
            top: 0,
            left: 0
        },
        position: {
            top: 0,
            left: 0
        }
    },
    style: "position:absolute;z-index:1000;width:0px;height:0px;",
    handlers: {
        onPositionPin: "reAnchor"
    },
    create: function() {
        this.inherited(arguments), this.styleClientControls(), this.positionClientControls(), this.highlightAnchorPointChanged(), this.anchorChanged();
    },
    styleClientControls: function() {
        var e = this.getClientControls();
        for (var t = 0; t < e.length; t++)
            e[t].applyStyle("position", "absolute");
    },
    positionClientControls: function() {
        var e = this.getClientControls();
        for (var t = 0; t < e.length; t++)
            for (var n in this.position)
                e[t].applyStyle(n, this.position[n] + "px");
    },
    highlightAnchorPointChanged: function() {
        this.addRemoveClass("pinDebug", this.highlightAnchorPoint);
    },
    anchorChanged: function() {
        var e = null, t = null;
        for (t in this.anchor) {
            e = this.anchor[t].toString().match(/^(\d+(?:\.\d+)?)(.*)$/);
            if (!e)
                continue;
            this.anchor[t + "Coords"] = {
                value: e[1],
                units: e[2] || "px"
            };
        }
    },
    reAnchor: function(e, t) {
        var n = t.scale, r = t.bounds, i = this.anchor.right ? this.anchor.rightCoords.units == "px" ? r.width + r.x - this.anchor.rightCoords.value * n : r.width * (100 - this.anchor.rightCoords.value) / 100 + r.x : this.anchor.leftCoords.units == "px" ? this.anchor.leftCoords.value * n + r.x : r.width * this.anchor.leftCoords.value / 100 + r.x, s = this.anchor.bottom ? this.anchor.bottomCoords.units == "px" ? r.height + r.y - this.anchor.bottomCoords.value * n : r.height * (100 - this.anchor.bottomCoords.value) / 100 + r.y : this.anchor.topCoords.units == "px" ? this.anchor.topCoords.value * n + r.y : r.height * this.anchor.topCoords.value / 100 + r.y;
        this.applyStyle("left", i + "px"), this.applyStyle("top", s + "px");
    }
});

// ImageView.js

enyo.kind({
    name: "enyo.ImageView",
    kind: enyo.Scroller,
    touchOverscroll: !1,
    thumb: !1,
    animate: !0,
    verticalDragPropagation: !0,
    horizontalDragPropagation: !0,
    published: {
        scale: "auto",
        disableZoom: !1,
        src: undefined
    },
    events: {
        onZoom: ""
    },
    touch: !0,
    preventDragPropagation: !1,
    handlers: {
        ondragstart: "dragPropagation"
    },
    components: [{
            name: "animator",
            kind: "Animator",
            onStep: "zoomAnimationStep",
            onEnd: "zoomAnimationEnd"
        }, {
            name: "viewport",
            style: "overflow:hidden;min-height:100%;min-width:100%;",
            classes: "enyo-fit",
            ongesturechange: "gestureTransform",
            ongestureend: "saveState",
            ontap: "singleTap",
            ondblclick: "doubleClick",
            onmousewheel: "mousewheel",
            components: [{
                    kind: "Image",
                    ondown: "down"
                }]
        }],
    create: function() {
        this.inherited(arguments), this.canTransform = enyo.dom.canTransform(), this.canTransform || this.$.image.applyStyle("position", "relative"), this.canAccelerate = enyo.dom.canAccelerate(), this.bufferImage = new Image, this.bufferImage.onload = enyo.bind(this, "imageLoaded"), this.bufferImage.onerror = enyo.bind(this, "imageError"), this.srcChanged(), this.getStrategy().setDragDuringGesture(!1), this.getStrategy().$.scrollMath && this.getStrategy().$.scrollMath.start();
    },
    down: function(e, t) {
        t.preventDefault();
    },
    dragPropagation: function(e, t) {
        var n = this.getStrategy().getScrollBounds(), r = n.top === 0 && t.dy > 0 || n.top >= n.maxTop - 2 && t.dy < 0, i = n.left === 0 && t.dx > 0 || n.left >= n.maxLeft - 2 && t.dx < 0;
        return !(r && this.verticalDragPropagation || i && this.horizontalDragPropagation);
    },
    mousewheel: function(e, t) {
        t.pageX |= t.clientX + t.target.scrollLeft, t.pageY |= t.clientY + t.target.scrollTop;
        var n = (this.maxScale - this.minScale) / 10, r = this.scale;
        if (t.wheelDelta > 0 || t.detail < 0)
            this.scale = this.limitScale(this.scale + n);
        else if (t.wheelDelta < 0 || t.detail > 0)
            this.scale = this.limitScale(this.scale - n);
        return this.eventPt = this.calcEventLocation(t), this.transformImage(this.scale), r != this.scale && this.doZoom({
            scale: this.scale
        }), this.ratioX = this.ratioY = null, t.preventDefault(), !0;
    },
    srcChanged: function() {
        this.src && this.src.length > 0 && this.bufferImage && this.src != this.bufferImage.src && (this.bufferImage.src = this.src);
    },
    imageLoaded: function(e) {
        this.originalWidth = this.bufferImage.width, this.originalHeight = this.bufferImage.height, this.scaleChanged(), this.$.image.setSrc(this.bufferImage.src), enyo.dom.transformValue(this.getStrategy().$.client, "translate3d", "0px, 0px, 0"), this.positionClientControls(this.scale), this.alignImage();
    },
    resizeHandler: function() {
        this.inherited(arguments), this.$.image.src && this.scaleChanged();
    },
    scaleChanged: function() {
        var e = this.hasNode();
        if (e) {
            this.containerWidth = e.clientWidth, this.containerHeight = e.clientHeight;
            var t = this.containerWidth / this.originalWidth, n = this.containerHeight / this.originalHeight;
            this.minScale = Math.min(t, n), this.maxScale = this.minScale * 3 < 1 ? 1 : this.minScale * 3, this.scale == "auto" ? this.scale = this.minScale : this.scale == "width" ? this.scale = t : this.scale == "height" ? this.scale = n : this.scale == "fit" ? (this.fitAlignment = "center", this.scale = Math.max(t, n)) : (this.maxScale = Math.max(this.maxScale, this.scale), this.scale = this.limitScale(this.scale));
        }
        this.eventPt = this.calcEventLocation(), this.transformImage(this.scale);
    },
    imageError: function(e) {
        enyo.error("Error loading image: " + this.src), this.bubble("onerror", e);
    },
    alignImage: function() {
        if (this.fitAlignment && this.fitAlignment === "center") {
            var e = this.getScrollBounds();
            this.setScrollLeft(e.maxLeft / 2), this.setScrollTop(e.maxTop / 2);
        }
    },
    gestureTransform: function(e, t) {
        this.eventPt = this.calcEventLocation(t), this.transformImage(this.limitScale(this.scale * t.scale));
    },
    calcEventLocation: function(e) {
        var t = {
            x: 0,
            y: 0
        };
        if (e && this.hasNode()) {
            var n = this.node.getBoundingClientRect();
            t.x = Math.round(e.pageX - n.left - this.imageBounds.x), t.x = Math.max(0, Math.min(this.imageBounds.width, t.x)), t.y = Math.round(e.pageY - n.top - this.imageBounds.y), t.y = Math.max(0, Math.min(this.imageBounds.height, t.y));
        }
        return t;
    },
    transformImage: function(e) {
        this.tapped = !1;
        var t = this.imageBounds || this.innerImageBounds(e);
        this.imageBounds = this.innerImageBounds(e), this.scale > this.minScale ? this.$.viewport.applyStyle("cursor", "move") : this.$.viewport.applyStyle("cursor", null), this.$.viewport.setBounds({
            width: this.imageBounds.width + "px",
            height: this.imageBounds.height + "px"
        }), this.ratioX = this.ratioX || (this.eventPt.x + this.getScrollLeft()) / t.width, this.ratioY = this.ratioY || (this.eventPt.y + this.getScrollTop()) / t.height;
        var n, r;
        this.$.animator.ratioLock ? (n = this.$.animator.ratioLock.x * this.imageBounds.width - this.containerWidth / 2, r = this.$.animator.ratioLock.y * this.imageBounds.height - this.containerHeight / 2) : (n = this.ratioX * this.imageBounds.width - this.eventPt.x, r = this.ratioY * this.imageBounds.height - this.eventPt.y), n = Math.max(0, Math.min(this.imageBounds.width - this.containerWidth, n)), r = Math.max(0, Math.min(this.imageBounds.height - this.containerHeight, r));
        if (this.canTransform) {
            var i = {
                scale: e
            };
            this.canAccelerate ? i = enyo.mixin({
                translate3d: Math.round(this.imageBounds.left) + "px, " + Math.round(this.imageBounds.top) + "px, 0px"
            }, i) : i = enyo.mixin({
                translate: this.imageBounds.left + "px, " + this.imageBounds.top + "px"
            }, i), enyo.dom.transform(this.$.image, i);
        } else
            this.$.image.setBounds({
                width: this.imageBounds.width + "px",
                height: this.imageBounds.height + "px",
                left: this.imageBounds.left + "px",
                top: this.imageBounds.top + "px"
            });
        this.setScrollLeft(n), this.setScrollTop(r), this.positionClientControls(e);
    },
    limitScale: function(e) {
        return this.disableZoom ? e = this.scale : e > this.maxScale ? e = this.maxScale : e < this.minScale && (e = this.minScale), e;
    },
    innerImageBounds: function(e) {
        var t = this.originalWidth * e, n = this.originalHeight * e, r = {
            x: 0,
            y: 0,
            transX: 0,
            transY: 0
        };
        return t < this.containerWidth && (r.x += (this.containerWidth - t) / 2), n < this.containerHeight && (r.y += (this.containerHeight - n) / 2), this.canTransform && (r.transX -= (this.originalWidth - t) / 2, r.transY -= (this.originalHeight - n) / 2), {
            left: r.x + r.transX,
            top: r.y + r.transY,
            width: t,
            height: n,
            x: r.x,
            y: r.y
        };
    },
    saveState: function(e, t) {
        var n = this.scale;
        this.scale *= t.scale, this.scale = this.limitScale(this.scale), n != this.scale && this.doZoom({
            scale: this.scale
        }), this.ratioX = this.ratioY = null;
    },
    doubleClick: function(e, t) {
        enyo.platform.ie == 8 && (this.tapped = !0, t.pageX = t.clientX + t.target.scrollLeft, t.pageY = t.clientY + t.target.scrollTop, this.singleTap(e, t), t.preventDefault());
    },
    singleTap: function(e, t) {
        setTimeout(enyo.bind(this, function() {
            this.tapped = !1;
        }), 300), this.tapped ? (this.tapped = !1, this.smartZoom(e, t)) : this.tapped = !0;
    },
    smartZoom: function(e, t) {
        var n = this.hasNode(), r = this.$.image.hasNode();
        if (n && r && this.hasNode() && !this.disableZoom) {
            var i = this.scale;
            this.scale != this.minScale ? this.scale = this.minScale : this.scale = this.maxScale, this.eventPt = this.calcEventLocation(t);
            if (this.animate) {
                var s = {
                    x: (this.eventPt.x + this.getScrollLeft()) / this.imageBounds.width,
                    y: (this.eventPt.y + this.getScrollTop()) / this.imageBounds.height
                };
                this.$.animator.play({
                    duration: 350,
                    ratioLock: s,
                    baseScale: i,
                    deltaScale: this.scale - i
                });
            } else
                this.transformImage(this.scale), this.doZoom({
                    scale: this.scale
                });
        }
    },
    zoomAnimationStep: function(e, t) {
        var n = this.$.animator.baseScale + this.$.animator.deltaScale * this.$.animator.value;
        this.transformImage(n);
    },
    zoomAnimationEnd: function(e, t) {
        this.doZoom({
            scale: this.scale
        }), this.$.animator.ratioLock = undefined;
    },
    positionClientControls: function(e) {
        this.waterfallDown("onPositionPin", {
            scale: e,
            bounds: this.imageBounds
        });
    }
});

// ImageCarousel.js

enyo.kind({
    name: "enyo.ImageCarousel",
    kind: enyo.Panels,
    arrangerKind: "enyo.CarouselArranger",
    defaultScale: "auto",
    disableZoom: !1,
    lowMemory: !1,
    published: {
        images: []
    },
    handlers: {
        onTransitionStart: "transitionStart",
        onTransitionFinish: "transitionFinish"
    },
    create: function() {
        this.inherited(arguments), this.imageCount = this.images.length, this.images.length > 0 && (this.initContainers(), this.loadNearby());
    },
    initContainers: function() {
        for (var e = 0; e < this.images.length; e++)
            this.$["container" + e] || (this.createComponent({
                name: "container" + e,
                style: "height:100%; width:100%;"
            }), this.$["container" + e].render());
        for (e = this.images.length; e < this.imageCount; e++)
            this.$["image" + e] && this.$["image" + e].destroy(), this.$["container" + e].destroy();
        this.imageCount = this.images.length;
    },
    loadNearby: function() {
        var e = this.getBufferRange();
        for (var t in e)
            this.loadImageView(e[t]);
    },
    getBufferRange: function() {
        var e = [];
        if (this.layout.containerBounds) {
            var t = 1, n = this.layout.containerBounds, r, i, s, o, u, a;
            o = this.index - 1, u = 0, a = n.width * t;
            while (o >= 0 && u <= a)
                s = this.$["container" + o], u += s.width + s.marginWidth, e.unshift(o), o--;
            o = this.index, u = 0, a = n.width * (t + 1);
            while (o < this.images.length && u <= a)
                s = this.$["container" + o], u += s.width + s.marginWidth, e.push(o), o++;
        }
        return e;
    },
    reflow: function() {
        this.inherited(arguments), this.loadNearby();
    },
    loadImageView: function(e) {
        return this.wrap && (e = (e % this.images.length + this.images.length) % this.images.length), e >= 0 && e <= this.images.length - 1 && (this.$["image" + e] ? this.$["image" + e].src != this.images[e] && (this.$["image" + e].setSrc(this.images[e]), this.$["image" + e].setScale(this.defaultScale), this.$["image" + e].setDisableZoom(this.disableZoom)) : (this.$["container" + e].createComponent({
            name: "image" + e,
            kind: "ImageView",
            scale: this.defaultScale,
            disableZoom: this.disableZoom,
            src: this.images[e],
            verticalDragPropagation: !1,
            style: "height:100%; width:100%;"
        }, {
            owner: this
        }), this.$["image" + e].render())), this.$["image" + e];
    },
    setImages: function(e) {
        this.setPropertyValue("images", e, "imagesChanged");
    },
    imagesChanged: function() {
        this.initContainers(), this.loadNearby();
    },
    indexChanged: function() {
        this.loadNearby(), this.lowMemory && this.cleanupMemory(), this.inherited(arguments);
    },
    transitionStart: function(e, t) {
        if (t.fromIndex == t.toIndex)
            return !0;
    },
    transitionFinish: function(e, t) {
        this.loadNearby(), this.lowMemory && this.cleanupMemory();
    },
    getActiveImage: function() {
        return this.getImageByIndex(this.index);
    },
    getImageByIndex: function(e) {
        return this.$["image" + e] || this.loadImageView(e);
    },
    cleanupMemory: function() {
        var e = getBufferRange();
        for (var t = 0; t < this.images.length; t++)
            enyo.indexOf(t, e) === -1 && this.$["image" + t] && this.$["image" + t].destroy();
    }
});

// Icon.js

enyo.kind({
    name: "onyx.Icon",
    published: {
        src: "",
        disabled: !1
    },
    classes: "onyx-icon",
    create: function() {
        this.inherited(arguments), this.src && this.srcChanged(), this.disabledChanged();
    },
    disabledChanged: function() {
        this.addRemoveClass("disabled", this.disabled);
    },
    srcChanged: function() {
        this.applyStyle("background-image", "url(" + enyo.path.rewrite(this.src) + ")");
    }
});

// Button.js

enyo.kind({
    name: "onyx.Button",
    kind: "enyo.Button",
    classes: "onyx-button enyo-unselectable",
    create: function() {
        enyo.platform.firefoxOS && (this.handlers.ondown = "down", this.handlers.onleave = "leave"), this.inherited(arguments);
    },
    down: function(e, t) {
        this.addClass("pressed");
    },
    leave: function(e, t) {
        this.removeClass("pressed");
    }
});

// IconButton.js

enyo.kind({
    name: "onyx.IconButton",
    kind: "onyx.Icon",
    published: {
        active: !1
    },
    classes: "onyx-icon-button",
    create: function() {
        enyo.platform.firefoxOS && (this.handlers.ondown = "down", this.handlers.onleave = "leave"), this.inherited(arguments);
    },
    down: function(e, t) {
        this.addClass("pressed");
    },
    leave: function(e, t) {
        this.removeClass("pressed");
    },
    rendered: function() {
        this.inherited(arguments), this.activeChanged();
    },
    tap: function() {
        if (this.disabled)
            return !0;
        this.setActive(!0);
    },
    activeChanged: function() {
        this.bubble("onActivate");
    }
});

// Checkbox.js

enyo.kind({
    name: "onyx.Checkbox",
    classes: "onyx-checkbox",
    kind: enyo.Checkbox,
    tag: "div",
    handlers: {
        onclick: ""
    },
    tap: function(e, t) {
        return this.disabled || (this.setChecked(!this.getChecked()), this.bubble("onchange")), !this.disabled;
    },
    dragstart: function() {
    }
});

// Drawer.js

enyo.kind({
    name: "onyx.Drawer",
    published: {
        open: !0,
        orient: "v",
        animated: !0
    },
    style: "overflow: hidden; position: relative;",
    tools: [{
            kind: "Animator",
            onStep: "animatorStep",
            onEnd: "animatorEnd"
        }, {
            name: "client",
            style: "position: relative;",
            classes: "enyo-border-box"
        }],
    create: function() {
        this.inherited(arguments), this.animatedChanged(), this.openChanged();
    },
    initComponents: function() {
        this.createChrome(this.tools), this.inherited(arguments);
    },
    animatedChanged: function() {
        !this.animated && this.hasNode() && this.$.animator.isAnimating() && (this.$.animator.stop(), this.animatorEnd());
    },
    openChanged: function() {
        this.$.client.show();
        if (this.hasNode())
            if (this.$.animator.isAnimating())
                this.$.animator.reverse();
            else {
                var e = this.orient == "v", t = e ? "height" : "width", n = e ? "top" : "left";
                this.applyStyle(t, null);
                var r = this.hasNode()[e ? "scrollHeight" : "scrollWidth"];
                this.animated ? this.$.animator.play({
                    startValue: this.open ? 0 : r,
                    endValue: this.open ? r : 0,
                    dimension: t,
                    position: n
                }) : this.animatorEnd();
            }
        else
            this.$.client.setShowing(this.open);
    },
    animatorStep: function(e) {
        if (this.hasNode()) {
            var t = e.dimension;
            this.node.style[t] = this.domStyles[t] = e.value + "px";
        }
        var n = this.$.client.hasNode();
        if (n) {
            var r = e.position, i = this.open ? e.endValue : e.startValue;
            n.style[r] = this.$.client.domStyles[r] = e.value - i + "px";
        }
        this.container && this.container.resized();
    },
    animatorEnd: function() {
        if (!this.open)
            this.$.client.hide();
        else {
            this.$.client.domCssText = enyo.Control.domStylesToCssText(this.$.client.domStyles);
            var e = this.orient == "v", t = e ? "height" : "width", n = e ? "top" : "left", r = this.$.client.hasNode();
            r && (r.style[n] = this.$.client.domStyles[n] = null), this.node && (this.node.style[t] = this.domStyles[t] = null);
        }
        this.container && this.container.resized();
    }
});

// Grabber.js

enyo.kind({
    name: "onyx.Grabber",
    classes: "onyx-grabber"
});

// Groupbox.js

enyo.kind({
    name: "onyx.Groupbox",
    classes: "onyx-groupbox"
}), enyo.kind({
    name: "onyx.GroupboxHeader",
    classes: "onyx-groupbox-header"
});

// Input.js

enyo.kind({
    name: "onyx.Input",
    kind: "enyo.Input",
    classes: "onyx-input"
});

// Popup.js

enyo.kind({
    name: "onyx.Popup",
    kind: "Popup",
    classes: "onyx-popup",
    published: {
        scrimWhenModal: !0,
        scrim: !1,
        scrimClassName: ""
    },
    statics: {
        count: 0
    },
    defaultZ: 120,
    showingChanged: function() {
        this.showing ? (onyx.Popup.count++, this.applyZIndex()) : onyx.Popup.count > 0 && onyx.Popup.count--, this.showHideScrim(this.showing), this.inherited(arguments);
    },
    showHideScrim: function(e) {
        if (this.floating && (this.scrim || this.modal && this.scrimWhenModal)) {
            var t = this.getScrim();
            if (e) {
                var n = this.getScrimZIndex();
                this._scrimZ = n, t.showAtZIndex(n);
            } else
                t.hideAtZIndex(this._scrimZ);
            enyo.call(t, "addRemoveClass", [this.scrimClassName, t.showing]);
        }
    },
    getScrimZIndex: function() {
        return this.findZIndex() - 1;
    },
    getScrim: function() {
        return this.modal && this.scrimWhenModal && !this.scrim ? onyx.scrimTransparent.make() : onyx.scrim.make();
    },
    applyZIndex: function() {
        this._zIndex = onyx.Popup.count * 2 + this.findZIndex() + 1, this.applyStyle("z-index", this._zIndex);
    },
    findZIndex: function() {
        var e = this.defaultZ;
        return this._zIndex ? e = this._zIndex : this.hasNode() && (e = Number(enyo.dom.getComputedStyleValue(this.node, "z-index")) || e), this._zIndex = e;
    }
});

// TextArea.js

enyo.kind({
    name: "onyx.TextArea",
    kind: "enyo.TextArea",
    classes: "onyx-textarea"
});

// RichText.js

enyo.kind({
    name: "onyx.RichText",
    kind: "enyo.RichText",
    classes: "onyx-richtext"
});

// InputDecorator.js

enyo.kind({
    name: "onyx.InputDecorator",
    kind: "enyo.ToolDecorator",
    tag: "label",
    classes: "onyx-input-decorator",
    published: {
        alwaysLooksFocused: !1
    },
    handlers: {
        onDisabledChange: "disabledChange",
        onfocus: "receiveFocus",
        onblur: "receiveBlur"
    },
    create: function() {
        this.inherited(arguments), this.updateFocus(!1);
    },
    alwaysLooksFocusedChanged: function(e) {
        this.updateFocus(this.focus);
    },
    updateFocus: function(e) {
        this.focused = e, this.addRemoveClass("onyx-focused", this.alwaysLooksFocused || this.focused);
    },
    receiveFocus: function() {
        this.updateFocus(!0);
    },
    receiveBlur: function() {
        this.updateFocus(!1);
    },
    disabledChange: function(e, t) {
        this.addRemoveClass("onyx-disabled", t.originator.disabled);
    }
});

// Tooltip.js

enyo.kind({
    name: "onyx.Tooltip",
    kind: "onyx.Popup",
    classes: "onyx-tooltip below left-arrow",
    autoDismiss: !1,
    showDelay: 500,
    defaultLeft: -6,
    handlers: {
        onRequestShowTooltip: "requestShow",
        onRequestHideTooltip: "requestHide"
    },
    requestShow: function() {
        return this.showJob = setTimeout(enyo.bind(this, "show"), this.showDelay), !0;
    },
    cancelShow: function() {
        clearTimeout(this.showJob);
    },
    requestHide: function() {
        return this.cancelShow(), this.inherited(arguments);
    },
    showingChanged: function() {
        this.cancelShow(), this.adjustPosition(!0), this.inherited(arguments);
    },
    applyPosition: function(e) {
        var t = "";
        for (var n in e)
            t += n + ":" + e[n] + (isNaN(e[n]) ? "; " : "px; ");
        this.addStyles(t);
    },
    adjustPosition: function(e) {
        if (this.showing && this.hasNode()) {
            var t = this.node.getBoundingClientRect();
            t.top + t.height > window.innerHeight ? (this.addRemoveClass("below", !1), this.addRemoveClass("above", !0)) : (this.addRemoveClass("above", !1), this.addRemoveClass("below", !0)), t.left + t.width > window.innerWidth && (this.applyPosition({
                "margin-left": -t.width,
                bottom: "auto"
            }), this.addRemoveClass("left-arrow", !1), this.addRemoveClass("right-arrow", !0));
        }
    },
    resizeHandler: function() {
        this.applyPosition({
            "margin-left": this.defaultLeft,
            bottom: "auto"
        }), this.addRemoveClass("left-arrow", !0), this.addRemoveClass("right-arrow", !1), this.adjustPosition(!0), this.inherited(arguments);
    }
});

// TooltipDecorator.js

enyo.kind({
    name: "onyx.TooltipDecorator",
    defaultKind: "onyx.Button",
    classes: "onyx-popup-decorator",
    handlers: {
        onenter: "enter",
        onleave: "leave"
    },
    enter: function() {
        this.requestShowTooltip();
    },
    leave: function() {
        this.requestHideTooltip();
    },
    tap: function() {
        this.requestHideTooltip();
    },
    requestShowTooltip: function() {
        this.waterfallDown("onRequestShowTooltip");
    },
    requestHideTooltip: function() {
        this.waterfallDown("onRequestHideTooltip");
    }
});

// MenuDecorator.js

enyo.kind({
    name: "onyx.MenuDecorator",
    kind: "onyx.TooltipDecorator",
    defaultKind: "onyx.Button",
    classes: "onyx-popup-decorator enyo-unselectable",
    handlers: {
        onActivate: "activated",
        onHide: "menuHidden"
    },
    activated: function(e, t) {
        this.requestHideTooltip(), t.originator.active && (this.menuActive = !0, this.activator = t.originator, this.activator.addClass("active"), this.requestShowMenu());
    },
    requestShowMenu: function() {
        this.waterfallDown("onRequestShowMenu", {
            activator: this.activator
        });
    },
    requestHideMenu: function() {
        this.waterfallDown("onRequestHideMenu");
    },
    menuHidden: function() {
        this.menuActive = !1, this.activator && (this.activator.setActive(!1), this.activator.removeClass("active"));
    },
    enter: function(e) {
        this.menuActive || this.inherited(arguments);
    },
    leave: function(e, t) {
        this.menuActive || this.inherited(arguments);
    }
});

// Menu.js

enyo.kind({
    name: "onyx.Menu",
    kind: "onyx.Popup",
    modal: !0,
    defaultKind: "onyx.MenuItem",
    classes: "onyx-menu",
    published: {
        maxHeight: 200,
        scrolling: !0
    },
    handlers: {
        onActivate: "itemActivated",
        onRequestShowMenu: "requestMenuShow",
        onRequestHideMenu: "requestHide"
    },
    childComponents: [{
            name: "client",
            kind: "enyo.Scroller",
            strategyKind: "TouchScrollStrategy"
        }],
    showOnTop: !1,
    scrollerName: "client",
    create: function() {
        this.inherited(arguments), this.maxHeightChanged();
    },
    initComponents: function() {
        this.scrolling && this.createComponents(this.childComponents, {
            isChrome: !0
        }), this.inherited(arguments);
    },
    getScroller: function() {
        return this.$[this.scrollerName];
    },
    maxHeightChanged: function() {
        this.scrolling && this.getScroller().setMaxHeight(this.maxHeight + "px");
    },
    itemActivated: function(e, t) {
        return t.originator.setActive(!1), !0;
    },
    showingChanged: function() {
        this.inherited(arguments), this.scrolling && this.getScroller().setShowing(this.showing), this.adjustPosition(!0);
    },
    requestMenuShow: function(e, t) {
        if (this.floating) {
            var n = t.activator.hasNode();
            if (n) {
                var r = this.activatorOffset = this.getPageOffset(n);
                this.applyPosition({
                    top: r.top + (this.showOnTop ? 0 : r.height),
                    left: r.left,
                    width: r.width
                });
            }
        }
        return this.show(), !0;
    },
    applyPosition: function(e) {
        var t = "";
        for (var n in e)
            t += n + ":" + e[n] + (isNaN(e[n]) ? "; " : "px; ");
        this.addStyles(t);
    },
    getPageOffset: function(e) {
        var t = e.getBoundingClientRect(), n = window.pageYOffset === undefined ? document.documentElement.scrollTop : window.pageYOffset, r = window.pageXOffset === undefined ? document.documentElement.scrollLeft : window.pageXOffset, i = t.height === undefined ? t.bottom - t.top : t.height, s = t.width === undefined ? t.right - t.left : t.width;
        return {
            top: t.top + n,
            left: t.left + r,
            height: i,
            width: s
        };
    },
    adjustPosition: function() {
        if (this.showing && this.hasNode()) {
            this.scrolling && !this.showOnTop && this.getScroller().setMaxHeight(this.maxHeight + "px"), this.removeClass("onyx-menu-up"), this.floating || this.applyPosition({
                left: "auto"
            });
            var e = this.node.getBoundingClientRect(), t = e.height === undefined ? e.bottom - e.top : e.height, n = window.innerHeight === undefined ? document.documentElement.clientHeight : window.innerHeight, r = window.innerWidth === undefined ? document.documentElement.clientWidth : window.innerWidth;
            this.menuUp = e.top + t > n && n - e.bottom < e.top - t, this.addRemoveClass("onyx-menu-up", this.menuUp);
            if (this.floating) {
                var i = this.activatorOffset;
                this.menuUp ? this.applyPosition({
                    top: i.top - t + (this.showOnTop ? i.height : 0),
                    bottom: "auto"
                }) : e.top < i.top && i.top + (this.showOnTop ? 0 : i.height) + t < n && this.applyPosition({
                    top: i.top + (this.showOnTop ? 0 : i.height),
                    bottom: "auto"
                });
            }
            e.right > r && (this.floating ? this.applyPosition({
                left: r - e.width
            }) : this.applyPosition({
                left: -(e.right - r)
            })), e.left < 0 && (this.floating ? this.applyPosition({
                left: 0,
                right: "auto"
            }) : this.getComputedStyleValue("right") == "auto" ? this.applyPosition({
                left: -e.left
            }) : this.applyPosition({
                right: e.left
            }));
            if (this.scrolling && !this.showOnTop) {
                e = this.node.getBoundingClientRect();
                var s;
                this.menuUp ? s = this.maxHeight < e.bottom ? this.maxHeight : e.bottom : s = e.top + this.maxHeight < n ? this.maxHeight : n - e.top, this.getScroller().setMaxHeight(s + "px");
            }
        }
    },
    resizeHandler: function() {
        this.inherited(arguments), this.adjustPosition();
    },
    requestHide: function() {
        this.setShowing(!1);
    }
});

// MenuItem.js

enyo.kind({
    name: "onyx.MenuItem",
    kind: "enyo.Button",
    events: {
        onSelect: "",
        onItemContentChange: ""
    },
    classes: "onyx-menu-item",
    tag: "div",
    create: function() {
        this.inherited(arguments), this.active && this.bubble("onActivate");
    },
    tap: function(e) {
        this.inherited(arguments), this.bubble("onRequestHideMenu"), this.doSelect({
            selected: this,
            content: this.content
        });
    },
    contentChanged: function(e) {
        this.inherited(arguments), this.doItemContentChange({
            content: this.content
        });
    }
});

// PickerDecorator.js

enyo.kind({
    name: "onyx.PickerDecorator",
    kind: "onyx.MenuDecorator",
    classes: "onyx-picker-decorator",
    defaultKind: "onyx.PickerButton",
    handlers: {
        onChange: "change"
    },
    change: function(e, t) {
        this.waterfallDown("onChange", t);
    }
});

// PickerButton.js

enyo.kind({
    name: "onyx.PickerButton",
    kind: "onyx.Button",
    handlers: {
        onChange: "change"
    },
    change: function(e, t) {
        t.content !== undefined && this.setContent(t.content);
    }
});

// Picker.js

enyo.kind({
    name: "onyx.Picker",
    kind: "onyx.Menu",
    classes: "onyx-picker enyo-unselectable",
    published: {
        selected: null
    },
    events: {
        onChange: ""
    },
    handlers: {
        onItemContentChange: "itemContentChange"
    },
    floating: !0,
    showOnTop: !0,
    initComponents: function() {
        this.setScrolling(!0), this.inherited(arguments);
    },
    showingChanged: function() {
        this.getScroller().setShowing(this.showing), this.inherited(arguments), this.showing && this.selected && this.scrollToSelected();
    },
    scrollToSelected: function() {
        this.getScroller().scrollToControl(this.selected, !this.menuUp);
    },
    itemActivated: function(e, t) {
        return this.processActivatedItem(t.originator), this.inherited(arguments);
    },
    processActivatedItem: function(e) {
        e.active && this.setSelected(e);
    },
    selectedChanged: function(e) {
        e && e.removeClass("selected"), this.selected && (this.selected.addClass("selected"), this.doChange({
            selected: this.selected,
            content: this.selected.content
        }));
    },
    itemContentChange: function(e, t) {
        t.originator == this.selected && this.doChange({
            selected: this.selected,
            content: this.selected.content
        });
    },
    resizeHandler: function() {
        this.inherited(arguments), this.adjustPosition();
    }
});

// FlyweightPicker.js

enyo.kind({
    name: "onyx.FlyweightPicker",
    kind: "onyx.Picker",
    classes: "onyx-flyweight-picker",
    published: {
        count: 0
    },
    events: {
        onSetupItem: "",
        onSelect: ""
    },
    handlers: {
        onSelect: "itemSelect"
    },
    components: [{
            name: "scroller",
            kind: "enyo.Scroller",
            strategyKind: "TouchScrollStrategy",
            components: [{
                    name: "flyweight",
                    kind: "FlyweightRepeater",
                    ontap: "itemTap"
                }]
        }],
    scrollerName: "scroller",
    initComponents: function() {
        this.controlParentName = "flyweight", this.inherited(arguments), this.$.flyweight.$.client.children[0].setActive(!0);
    },
    create: function() {
        this.inherited(arguments), this.countChanged();
    },
    rendered: function() {
        this.inherited(arguments), this.selectedChanged();
    },
    scrollToSelected: function() {
        var e = this.$.flyweight.fetchRowNode(this.selected);
        this.getScroller().scrollToNode(e, !this.menuUp);
    },
    countChanged: function() {
        this.$.flyweight.count = this.count;
    },
    processActivatedItem: function(e) {
        this.item = e;
    },
    selectedChanged: function(e) {
        if (!this.item)
            return;
        e !== undefined && (this.item.removeClass("selected"), this.$.flyweight.renderRow(e)), this.item.addClass("selected"), this.$.flyweight.renderRow(this.selected), this.item.removeClass("selected");
        var t = this.$.flyweight.fetchRowNode(this.selected);
        this.doChange({
            selected: this.selected,
            content: t && t.textContent || this.item.content
        });
    },
    itemTap: function(e, t) {
        this.setSelected(t.rowIndex), this.doSelect({
            selected: this.item,
            content: this.item.content
        });
    },
    itemSelect: function(e, t) {
        if (t.originator != this)
            return !0;
    }
});

// DatePicker.js

enyo.kind({
    name: "onyx.DatePicker",
    classes: "onyx-toolbar-inline",
    published: {
        disabled: !1,
        locale: "en_us",
        dayHidden: !1,
        monthHidden: !1,
        yearHidden: !1,
        minYear: 1900,
        maxYear: 2099,
        value: null
    },
    events: {
        onSelect: ""
    },
    create: function() {
        this.inherited(arguments), enyo.g11n && (this.locale = enyo.g11n.currentLocale().getLocale()), this.initDefaults();
    },
    initDefaults: function() {
        var e = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        enyo.g11n && (this._tf = new enyo.g11n.Fmts({
            locale: this.locale
        }), e = this._tf.getMonthFields()), this.setupPickers(this._tf ? this._tf.getDateFieldOrder() : "mdy"), this.dayHiddenChanged(), this.monthHiddenChanged(), this.yearHiddenChanged();
        var t = this.value = this.value || new Date;
        for (var n = 0, r; r = e[n]; n++)
            this.$.monthPicker.createComponent({
                content: r,
                value: n,
                active: n == t.getMonth()
            });
        var i = t.getFullYear();
        this.$.yearPicker.setSelected(i - this.minYear);
        for (n = 1; n <= this.monthLength(t.getYear(), t.getMonth()); n++)
            this.$.dayPicker.createComponent({
                content: n,
                value: n,
                active: n == t.getDate()
            });
    },
    monthLength: function(e, t) {
        return 32 - (new Date(e, t, 32)).getDate();
    },
    setupYear: function(e, t) {
        this.$.year.setContent(this.minYear + t.index);
    },
    setupPickers: function(e) {
        var t = e.split(""), n, r, i;
        for (r = 0, i = t.length; r < i; r++) {
            n = t[r];
            switch (n) {
                case "d":
                    this.createDay();
                    break;
                case "m":
                    this.createMonth();
                    break;
                case "y":
                    this.createYear();
                    break;
                default:
            }
        }
    },
    createYear: function() {
        var e = this.maxYear - this.minYear;
        this.createComponent({
            kind: "onyx.PickerDecorator",
            onSelect: "updateYear",
            components: [{
                    classes: "onyx-datepicker-year",
                    name: "yearPickerButton",
                    disabled: this.disabled
                }, {
                    name: "yearPicker",
                    kind: "onyx.FlyweightPicker",
                    count: ++e,
                    onSetupItem: "setupYear",
                    components: [{
                            name: "year"
                        }]
                }]
        });
    },
    createMonth: function() {
        this.createComponent({
            kind: "onyx.PickerDecorator",
            onSelect: "updateMonth",
            components: [{
                    classes: "onyx-datepicker-month",
                    name: "monthPickerButton",
                    disabled: this.disabled
                }, {
                    name: "monthPicker",
                    kind: "onyx.Picker"
                }]
        });
    },
    createDay: function() {
        this.createComponent({
            kind: "onyx.PickerDecorator",
            onSelect: "updateDay",
            components: [{
                    classes: "onyx-datepicker-day",
                    name: "dayPickerButton",
                    disabled: this.disabled
                }, {
                    name: "dayPicker",
                    kind: "onyx.Picker"
                }]
        });
    },
    localeChanged: function() {
        this.refresh();
    },
    dayHiddenChanged: function() {
        this.$.dayPicker.getParent().setShowing(this.dayHidden ? !1 : !0);
    },
    monthHiddenChanged: function() {
        this.$.monthPicker.getParent().setShowing(this.monthHidden ? !1 : !0);
    },
    yearHiddenChanged: function() {
        this.$.yearPicker.getParent().setShowing(this.yearHidden ? !1 : !0);
    },
    minYearChanged: function() {
        this.refresh();
    },
    maxYearChanged: function() {
        this.refresh();
    },
    valueChanged: function() {
        this.refresh();
    },
    disabledChanged: function() {
        this.$.yearPickerButton.setDisabled(this.disabled), this.$.monthPickerButton.setDisabled(this.disabled), this.$.dayPickerButton.setDisabled(this.disabled);
    },
    updateDay: function(e, t) {
        var n = this.calcDate(this.value.getFullYear(), this.value.getMonth(), t.selected.value);
        return this.doSelect({
            name: this.name,
            value: n
        }), this.setValue(n), !0;
    },
    updateMonth: function(e, t) {
        var n = this.calcDate(this.value.getFullYear(), t.selected.value, this.value.getDate());
        return this.doSelect({
            name: this.name,
            value: n
        }), this.setValue(n), !0;
    },
    updateYear: function(e, t) {
        if (t.originator.selected != -1) {
            var n = this.calcDate(this.minYear + t.originator.selected, this.value.getMonth(), this.value.getDate());
            this.doSelect({
                name: this.name,
                value: n
            }), this.setValue(n);
        }
        return !0;
    },
    calcDate: function(e, t, n) {
        return new Date(e, t, n, this.value.getHours(), this.value.getMinutes(), this.value.getSeconds(), this.value.getMilliseconds());
    },
    refresh: function() {
        this.destroyClientControls(), this.initDefaults(), this.render();
    }
});

// TimePicker.js

enyo.kind({
    name: "onyx.TimePicker",
    classes: "onyx-toolbar-inline",
    published: {
        disabled: !1,
        locale: "en_us",
        is24HrMode: null,
        value: null
    },
    events: {
        onSelect: ""
    },
    create: function() {
        this.inherited(arguments), enyo.g11n && (this.locale = enyo.g11n.currentLocale().getLocale()), this.initDefaults();
    },
    initDefaults: function() {
        var e = "AM", t = "PM";
        this.is24HrMode == null && (this.is24HrMode = !1), enyo.g11n && (this._tf = new enyo.g11n.Fmts({
            locale: this.locale
        }), e = this._tf.getAmCaption(), t = this._tf.getPmCaption(), this.is24HrMode == null && (this.is24HrMode = !this._tf.isAmPm())), this.setupPickers(this._tf ? this._tf.getTimeFieldOrder() : "hma");
        var n = this.value = this.value || new Date, r;
        if (!this.is24HrMode) {
            var i = n.getHours();
            i = i === 0 ? 12 : i;
            for (r = 1; r <= 12; r++)
                this.$.hourPicker.createComponent({
                    content: r,
                    value: r,
                    active: r == (i > 12 ? i % 12 : i)
                });
        } else
            for (r = 0; r < 24; r++)
                this.$.hourPicker.createComponent({
                    content: r,
                    value: r,
                    active: r == n.getHours()
                });
        for (r = 0; r <= 59; r++)
            this.$.minutePicker.createComponent({
                content: r < 10 ? "0" + r : r,
                value: r,
                active: r == n.getMinutes()
            });
        n.getHours() >= 12 ? this.$.ampmPicker.createComponents([{
                content: e
            }, {
                content: t,
                active: !0
            }]) : this.$.ampmPicker.createComponents([{
                content: e,
                active: !0
            }, {
                content: t
            }]), this.$.ampmPicker.getParent().setShowing(!this.is24HrMode);
    },
    setupPickers: function(e) {
        var t = e.split(""), n, r, i;
        for (r = 0, i = t.length; r < i; r++) {
            n = t[r];
            switch (n) {
                case "h":
                    this.createHour();
                    break;
                case "m":
                    this.createMinute();
                    break;
                case "a":
                    this.createAmPm();
                    break;
                default:
            }
        }
    },
    createHour: function() {
        this.createComponent({
            kind: "onyx.PickerDecorator",
            onSelect: "updateHour",
            components: [{
                    classes: "onyx-timepicker-hour",
                    name: "hourPickerButton",
                    disabled: this.disabled
                }, {
                    name: "hourPicker",
                    kind: "onyx.Picker"
                }]
        });
    },
    createMinute: function() {
        this.createComponent({
            kind: "onyx.PickerDecorator",
            onSelect: "updateMinute",
            components: [{
                    classes: "onyx-timepicker-minute",
                    name: "minutePickerButton",
                    disabled: this.disabled
                }, {
                    name: "minutePicker",
                    kind: "onyx.Picker"
                }]
        });
    },
    createAmPm: function() {
        this.createComponent({
            kind: "onyx.PickerDecorator",
            onSelect: "updateAmPm",
            components: [{
                    classes: "onyx-timepicker-ampm",
                    name: "ampmPickerButton",
                    disabled: this.disabled
                }, {
                    name: "ampmPicker",
                    kind: "onyx.Picker"
                }]
        });
    },
    disabledChanged: function() {
        this.$.hourPickerButton.setDisabled(this.disabled), this.$.minutePickerButton.setDisabled(this.disabled), this.$.ampmPickerButton.setDisabled(this.disabled);
    },
    localeChanged: function() {
        this.is24HrMode = null, this.refresh();
    },
    is24HrModeChanged: function() {
        this.refresh();
    },
    valueChanged: function() {
        this.refresh();
    },
    updateHour: function(e, t) {
        var n = t.selected.value;
        if (!this.is24HrMode) {
            var r = this.$.ampmPicker.getParent().controlAtIndex(0).content;
            n = n + (n == 12 ? -12 : 0) + (this.isAm(r) ? 0 : 12);
        }
        return this.value = this.calcTime(n, this.value.getMinutes()), this.doSelect({
            name: this.name,
            value: this.value
        }), !0;
    },
    updateMinute: function(e, t) {
        return this.value = this.calcTime(this.value.getHours(), t.selected.value), this.doSelect({
            name: this.name,
            value: this.value
        }), !0;
    },
    updateAmPm: function(e, t) {
        var n = this.value.getHours();
        return this.is24HrMode || (n += n > 11 ? this.isAm(t.content) ? -12 : 0 : this.isAm(t.content) ? 0 : 12), this.value = this.calcTime(n, this.value.getMinutes()), this.doSelect({
            name: this.name,
            value: this.value
        }), !0;
    },
    calcTime: function(e, t) {
        return new Date(this.value.getFullYear(), this.value.getMonth(), this.value.getDate(), e, t, this.value.getSeconds(), this.value.getMilliseconds());
    },
    isAm: function(e) {
        var t, n, r;
        try {
            t = this._tf.getAmCaption(), n = this._tf.getPmCaption();
        } catch (i) {
            t = "AM", n = "PM";
        }
        return e == t ? !0 : !1;
    },
    refresh: function() {
        this.destroyClientControls(), this.initDefaults(), this.render();
    }
});

// RadioButton.js

enyo.kind({
    name: "onyx.RadioButton",
    kind: "Button",
    classes: "onyx-radiobutton"
});

// RadioGroup.js

enyo.kind({
    name: "onyx.RadioGroup",
    kind: "Group",
    defaultKind: "onyx.RadioButton",
    highlander: !0
});

// ToggleButton.js

enyo.kind({
    name: "onyx.ToggleButton",
    classes: "onyx-toggle-button",
    published: {
        active: !1,
        value: !1,
        onContent: "On",
        offContent: "Off",
        disabled: !1
    },
    events: {
        onChange: ""
    },
    handlers: {
        ondragstart: "dragstart",
        ondrag: "drag",
        ondragfinish: "dragfinish"
    },
    components: [{
            name: "contentOn",
            classes: "onyx-toggle-content on"
        }, {
            name: "contentOff",
            classes: "onyx-toggle-content off"
        }, {
            classes: "onyx-toggle-button-knob"
        }],
    create: function() {
        this.inherited(arguments), this.value = Boolean(this.value || this.active), this.onContentChanged(), this.offContentChanged(), this.disabledChanged();
    },
    rendered: function() {
        this.inherited(arguments), this.updateVisualState();
    },
    updateVisualState: function() {
        this.addRemoveClass("off", !this.value), this.$.contentOn.setShowing(this.value), this.$.contentOff.setShowing(!this.value), this.setActive(this.value);
    },
    valueChanged: function() {
        this.updateVisualState(), this.doChange({
            value: this.value
        });
    },
    activeChanged: function() {
        this.setValue(this.active), this.bubble("onActivate");
    },
    onContentChanged: function() {
        this.$.contentOn.setContent(this.onContent || ""), this.$.contentOn.addRemoveClass("empty", !this.onContent);
    },
    offContentChanged: function() {
        this.$.contentOff.setContent(this.offContent || ""), this.$.contentOff.addRemoveClass("empty", !this.onContent);
    },
    disabledChanged: function() {
        this.addRemoveClass("disabled", this.disabled);
    },
    updateValue: function(e) {
        this.disabled || this.setValue(e);
    },
    tap: function() {
        this.updateValue(!this.value);
    },
    dragstart: function(e, t) {
        if (t.horizontal)
            return t.preventDefault(), this.dragging = !0, this.dragged = !1, !0;
    },
    drag: function(e, t) {
        if (this.dragging) {
            var n = t.dx;
            return Math.abs(n) > 10 && (this.updateValue(n > 0), this.dragged = !0), !0;
        }
    },
    dragfinish: function(e, t) {
        this.dragging = !1, this.dragged && t.preventTap();
    }
});

// ToggleIconButton.js

enyo.kind({
    name: "onyx.ToggleIconButton",
    kind: "onyx.Icon",
    published: {
        active: !1,
        value: !1
    },
    events: {
        onChange: ""
    },
    classes: "onyx-icon-button onyx-icon-toggle",
    activeChanged: function() {
        this.addRemoveClass("active", this.value), this.bubble("onActivate");
    },
    updateValue: function(e) {
        this.disabled || (this.setValue(e), this.doChange({
            value: this.value
        }));
    },
    tap: function() {
        this.updateValue(!this.value);
    },
    valueChanged: function() {
        this.setActive(this.value);
    },
    create: function() {
        this.inherited(arguments), this.value = Boolean(this.value || this.active);
    },
    rendered: function() {
        this.inherited(arguments), this.valueChanged(), this.removeClass("onyx-icon");
    }
});

// Toolbar.js

enyo.kind({
    name: "onyx.Toolbar",
    classes: "onyx onyx-toolbar onyx-toolbar-inline",
    create: function() {
        this.inherited(arguments), this.hasClass("onyx-menu-toolbar") && enyo.platform.android >= 4 && this.applyStyle("position", "static");
    }
});

// Tooltip.js

enyo.kind({
    name: "onyx.Tooltip",
    kind: "onyx.Popup",
    classes: "onyx-tooltip below left-arrow",
    autoDismiss: !1,
    showDelay: 500,
    defaultLeft: -6,
    handlers: {
        onRequestShowTooltip: "requestShow",
        onRequestHideTooltip: "requestHide"
    },
    requestShow: function() {
        return this.showJob = setTimeout(enyo.bind(this, "show"), this.showDelay), !0;
    },
    cancelShow: function() {
        clearTimeout(this.showJob);
    },
    requestHide: function() {
        return this.cancelShow(), this.inherited(arguments);
    },
    showingChanged: function() {
        this.cancelShow(), this.adjustPosition(!0), this.inherited(arguments);
    },
    applyPosition: function(e) {
        var t = "";
        for (var n in e)
            t += n + ":" + e[n] + (isNaN(e[n]) ? "; " : "px; ");
        this.addStyles(t);
    },
    adjustPosition: function(e) {
        if (this.showing && this.hasNode()) {
            var t = this.node.getBoundingClientRect();
            t.top + t.height > window.innerHeight ? (this.addRemoveClass("below", !1), this.addRemoveClass("above", !0)) : (this.addRemoveClass("above", !1), this.addRemoveClass("below", !0)), t.left + t.width > window.innerWidth && (this.applyPosition({
                "margin-left": -t.width,
                bottom: "auto"
            }), this.addRemoveClass("left-arrow", !1), this.addRemoveClass("right-arrow", !0));
        }
    },
    resizeHandler: function() {
        this.applyPosition({
            "margin-left": this.defaultLeft,
            bottom: "auto"
        }), this.addRemoveClass("left-arrow", !0), this.addRemoveClass("right-arrow", !1), this.adjustPosition(!0), this.inherited(arguments);
    }
});

// TooltipDecorator.js

enyo.kind({
    name: "onyx.TooltipDecorator",
    defaultKind: "onyx.Button",
    classes: "onyx-popup-decorator",
    handlers: {
        onenter: "enter",
        onleave: "leave"
    },
    enter: function() {
        this.requestShowTooltip();
    },
    leave: function() {
        this.requestHideTooltip();
    },
    tap: function() {
        this.requestHideTooltip();
    },
    requestShowTooltip: function() {
        this.waterfallDown("onRequestShowTooltip");
    },
    requestHideTooltip: function() {
        this.waterfallDown("onRequestHideTooltip");
    }
});

// ProgressBar.js

enyo.kind({
    name: "onyx.ProgressBar",
    classes: "onyx-progress-bar",
    published: {
        progress: 0,
        min: 0,
        max: 100,
        barClasses: "",
        showStripes: !0,
        animateStripes: !0,
        increment: 0
    },
    events: {
        onAnimateProgressFinish: ""
    },
    components: [{
            name: "progressAnimator",
            kind: "Animator",
            onStep: "progressAnimatorStep",
            onEnd: "progressAnimatorComplete"
        }, {
            name: "bar",
            classes: "onyx-progress-bar-bar"
        }],
    create: function() {
        this.inherited(arguments), this.progressChanged(), this.barClassesChanged(), this.showStripesChanged(), this.animateStripesChanged();
    },
    barClassesChanged: function(e) {
        this.$.bar.removeClass(e), this.$.bar.addClass(this.barClasses);
    },
    showStripesChanged: function() {
        this.$.bar.addRemoveClass("striped", this.showStripes);
    },
    animateStripesChanged: function() {
        this.$.bar.addRemoveClass("animated", this.animateStripes);
    },
    progressChanged: function() {
        this.progress = this.clampValue(this.min, this.max, this.progress);
        var e = this.calcPercent(this.progress);
        this.updateBarPosition(e);
    },
    calcIncrement: function(e) {
        return Math.round(e / this.increment) * this.increment;
    },
    clampValue: function(e, t, n) {
        return Math.max(e, Math.min(n, t));
    },
    calcRatio: function(e) {
        return (e - this.min) / (this.max - this.min);
    },
    calcPercent: function(e) {
        return this.calcRatio(e) * 100;
    },
    updateBarPosition: function(e) {
        this.$.bar.applyStyle("width", e + "%");
    },
    animateProgressTo: function(e) {
        this.$.progressAnimator.play({
            startValue: this.progress,
            endValue: e,
            node: this.hasNode()
        });
    },
    progressAnimatorStep: function(e) {
        return this.setProgress(e.value), !0;
    },
    progressAnimatorComplete: function(e) {
        return this.doAnimateProgressFinish(e), !0;
    }
});

// ProgressButton.js

enyo.kind({
    name: "onyx.ProgressButton",
    kind: "onyx.ProgressBar",
    classes: "onyx-progress-button",
    events: {
        onCancel: ""
    },
    components: [{
            name: "progressAnimator",
            kind: "Animator",
            onStep: "progressAnimatorStep",
            onEnd: "progressAnimatorComplete"
        }, {
            name: "bar",
            classes: "onyx-progress-bar-bar onyx-progress-button-bar"
        }, {
            name: "client",
            classes: "onyx-progress-button-client"
        }, {
            kind: "onyx.Icon",
            src: "$lib/onyx/images/progress-button-cancel.png",
            classes: "onyx-progress-button-icon",
            ontap: "cancelTap"
        }],
    cancelTap: function() {
        this.doCancel();
    }
});

// Scrim.js

enyo.kind({
    name: "onyx.Scrim",
    showing: !1,
    classes: "onyx-scrim enyo-fit",
    floating: !1,
    create: function() {
        this.inherited(arguments), this.zStack = [], this.floating && this.setParent(enyo.floatingLayer);
    },
    showingChanged: function() {
        this.floating && this.showing && !this.hasNode() && this.render(), this.inherited(arguments);
    },
    addZIndex: function(e) {
        enyo.indexOf(e, this.zStack) < 0 && this.zStack.push(e);
    },
    removeZIndex: function(e) {
        enyo.remove(e, this.zStack);
    },
    showAtZIndex: function(e) {
        this.addZIndex(e), e !== undefined && this.setZIndex(e), this.show();
    },
    hideAtZIndex: function(e) {
        this.removeZIndex(e);
        if (!this.zStack.length)
            this.hide();
        else {
            var t = this.zStack[this.zStack.length - 1];
            this.setZIndex(t);
        }
    },
    setZIndex: function(e) {
        this.zIndex = e, this.applyStyle("z-index", e);
    },
    make: function() {
        return this;
    }
}), enyo.kind({
    name: "onyx.scrimSingleton",
    kind: null,
    constructor: function(e, t) {
        this.instanceName = e, enyo.setObject(this.instanceName, this), this.props = t || {};
    },
    make: function() {
        var e = new onyx.Scrim(this.props);
        return enyo.setObject(this.instanceName, e), e;
    },
    showAtZIndex: function(e) {
        var t = this.make();
        t.showAtZIndex(e);
    },
    hideAtZIndex: enyo.nop,
    show: function() {
        var e = this.make();
        e.show();
    }
}), new onyx.scrimSingleton("onyx.scrim", {
    floating: !0,
    classes: "onyx-scrim-translucent"
}), new onyx.scrimSingleton("onyx.scrimTransparent", {
    floating: !0,
    classes: "onyx-scrim-transparent"
});

// Slider.js

enyo.kind({
    name: "onyx.Slider",
    kind: "onyx.ProgressBar",
    classes: "onyx-slider",
    published: {
        value: 0,
        lockBar: !0,
        tappable: !0
    },
    events: {
        onChange: "",
        onChanging: "",
        onAnimateFinish: ""
    },
    showStripes: !1,
    handlers: {
        ondragstart: "dragstart",
        ondrag: "drag",
        ondragfinish: "dragfinish"
    },
    moreComponents: [{
            kind: "Animator",
            onStep: "animatorStep",
            onEnd: "animatorComplete"
        }, {
            classes: "onyx-slider-taparea"
        }, {
            name: "knob",
            classes: "onyx-slider-knob"
        }],
    create: function() {
        this.inherited(arguments), enyo.platform.firefoxOS && (this.moreComponents[2].ondown = "down", this.moreComponents[2].onleave = "leave"), this.createComponents(this.moreComponents), this.valueChanged();
    },
    valueChanged: function() {
        this.value = this.clampValue(this.min, this.max, this.value);
        var e = this.calcPercent(this.value);
        this.updateKnobPosition(e), this.lockBar && this.setProgress(this.value);
    },
    updateKnobPosition: function(e) {
        this.$.knob.applyStyle("left", e + "%");
    },
    calcKnobPosition: function(e) {
        var t = e.clientX - this.hasNode().getBoundingClientRect().left;
        return t / this.getBounds().width * (this.max - this.min) + this.min;
    },
    dragstart: function(e, t) {
        if (t.horizontal)
            return t.preventDefault(), this.dragging = !0, !0;
    },
    drag: function(e, t) {
        if (this.dragging) {
            var n = this.calcKnobPosition(t);
            return n = this.increment ? this.calcIncrement(n) : n, this.setValue(n), this.doChanging({
                value: this.value
            }), !0;
        }
    },
    dragfinish: function(e, t) {
        return this.dragging = !1, t.preventTap(), this.doChange({
            value: this.value
        }), !0;
    },
    tap: function(e, t) {
        if (this.tappable) {
            var n = this.calcKnobPosition(t);
            return n = this.increment ? this.calcIncrement(n) : n, this.tapped = !0, this.animateTo(n), !0;
        }
    },
    down: function(e, t) {
        this.addClass("pressed");
    },
    leave: function(e, t) {
        this.removeClass("pressed");
    },
    animateTo: function(e) {
        this.$.animator.play({
            startValue: this.value,
            endValue: e,
            node: this.hasNode()
        });
    },
    animatorStep: function(e) {
        return this.setValue(e.value), !0;
    },
    animatorComplete: function(e) {
        return this.tapped && (this.tapped = !1, this.doChange({
            value: this.value
        })), this.doAnimateFinish(e), !0;
    }
});

// RangeSlider.js

enyo.kind({
    name: "onyx.RangeSlider",
    kind: "onyx.ProgressBar",
    classes: "onyx-slider",
    published: {
        rangeMin: 0,
        rangeMax: 100,
        rangeStart: 0,
        rangeEnd: 100,
        beginValue: 0,
        endValue: 0
    },
    events: {
        onChange: "",
        onChanging: ""
    },
    showStripes: !1,
    showLabels: !1,
    handlers: {
        ondragstart: "dragstart",
        ondrag: "drag",
        ondragfinish: "dragfinish",
        ondown: "down"
    },
    moreComponents: [{
            name: "startKnob",
            classes: "onyx-slider-knob"
        }, {
            name: "endKnob",
            classes: "onyx-slider-knob onyx-range-slider-knob"
        }],
    create: function() {
        this.inherited(arguments), this.createComponents(this.moreComponents), this.initControls();
    },
    rendered: function() {
        this.inherited(arguments);
        var e = this.calcPercent(this.beginValue);
        this.updateBarPosition(e);
    },
    initControls: function() {
        this.$.bar.applyStyle("position", "relative"), this.refreshRangeSlider(), this.showLabels && (this.$.startKnob.createComponent({
            name: "startLabel",
            kind: "onyx.RangeSliderKnobLabel"
        }), this.$.endKnob.createComponent({
            name: "endLabel",
            kind: "onyx.RangeSliderKnobLabel"
        }));
    },
    refreshRangeSlider: function() {
        this.beginValue = this.calcKnobPercent(this.rangeStart), this.endValue = this.calcKnobPercent(this.rangeEnd), this.beginValueChanged(), this.endValueChanged();
    },
    calcKnobRatio: function(e) {
        return (e - this.rangeMin) / (this.rangeMax - this.rangeMin);
    },
    calcKnobPercent: function(e) {
        return this.calcKnobRatio(e) * 100;
    },
    beginValueChanged: function(e) {
        if (e === undefined) {
            var t = this.calcPercent(this.beginValue);
            this.updateKnobPosition(t, this.$.startKnob);
        }
    },
    endValueChanged: function(e) {
        if (e === undefined) {
            var t = this.calcPercent(this.endValue);
            this.updateKnobPosition(t, this.$.endKnob);
        }
    },
    calcKnobPosition: function(e) {
        var t = e.clientX - this.hasNode().getBoundingClientRect().left;
        return t / this.getBounds().width * (this.max - this.min) + this.min;
    },
    updateKnobPosition: function(e, t) {
        t.applyStyle("left", e + "%"), this.updateBarPosition();
    },
    updateBarPosition: function() {
        if (this.$.startKnob !== undefined && this.$.endKnob !== undefined) {
            var e = this.calcKnobPercent(this.rangeStart), t = this.calcKnobPercent(this.rangeEnd) - e;
            this.$.bar.applyStyle("left", e + "%"), this.$.bar.applyStyle("width", t + "%");
        }
    },
    calcRangeRatio: function(e) {
        return e / 100 * (this.rangeMax - this.rangeMin) + this.rangeMin - this.increment / 2;
    },
    swapZIndex: function(e) {
        e === "startKnob" ? (this.$.startKnob.applyStyle("z-index", 1), this.$.endKnob.applyStyle("z-index", 0)) : e === "endKnob" && (this.$.startKnob.applyStyle("z-index", 0), this.$.endKnob.applyStyle("z-index", 1));
    },
    down: function(e, t) {
        this.swapZIndex(e.name);
    },
    dragstart: function(e, t) {
        if (t.horizontal)
            return t.preventDefault(), this.dragging = !0, !0;
    },
    drag: function(e, t) {
        if (this.dragging) {
            var n = this.calcKnobPosition(t), r, i, s;
            if (e.name === "startKnob" && n >= 0) {
                if (!(n <= this.endValue && t.xDirection === -1 || n <= this.endValue))
                    return this.drag(this.$.endKnob, t);
                this.setBeginValue(n), r = this.calcRangeRatio(this.beginValue), i = this.increment ? this.calcIncrement(r + .5 * this.increment) : r, s = this.calcKnobPercent(i), this.updateKnobPosition(s, this.$.startKnob), this.setRangeStart(i), this.doChanging({
                    value: i
                });
            } else if (e.name === "endKnob" && n <= 100) {
                if (!(n >= this.beginValue && t.xDirection === 1 || n >= this.beginValue))
                    return this.drag(this.$.startKnob, t);
                this.setEndValue(n), r = this.calcRangeRatio(this.endValue), i = this.increment ? this.calcIncrement(r + .5 * this.increment) : r, s = this.calcKnobPercent(i), this.updateKnobPosition(s, this.$.endKnob), this.setRangeEnd(i), this.doChanging({
                    value: i
                });
            }
            return !0;
        }
    },
    dragfinish: function(e, t) {
        this.dragging = !1, t.preventTap();
        var n;
        return e.name === "startKnob" ? (n = this.calcRangeRatio(this.beginValue), this.doChange({
            value: n,
            startChanged: !0
        })) : e.name === "endKnob" && (n = this.calcRangeRatio(this.endValue), this.doChange({
            value: n,
            startChanged: !1
        })), !0;
    },
    rangeMinChanged: function() {
        this.refreshRangeSlider();
    },
    rangeMaxChanged: function() {
        this.refreshRangeSlider();
    },
    rangeStartChanged: function() {
        this.refreshRangeSlider();
    },
    rangeEndChanged: function() {
        this.refreshRangeSlider();
    },
    setStartLabel: function(e) {
        this.$.startKnob.waterfallDown("onSetLabel", e);
    },
    setEndLabel: function(e) {
        this.$.endKnob.waterfallDown("onSetLabel", e);
    }
}), enyo.kind({
    name: "onyx.RangeSliderKnobLabel",
    classes: "onyx-range-slider-label",
    handlers: {
        onSetLabel: "setLabel"
    },
    setLabel: function(e, t) {
        this.setContent(t);
    }
});

// Item.js

enyo.kind({
    name: "onyx.Item",
    classes: "onyx-item",
    tapHighlight: !0,
    handlers: {
        onhold: "hold",
        onrelease: "release"
    },
    hold: function(e, t) {
        this.tapHighlight && onyx.Item.addRemoveFlyweightClass(this.controlParent || this, "onyx-highlight", !0, t);
    },
    release: function(e, t) {
        this.tapHighlight && onyx.Item.addRemoveFlyweightClass(this.controlParent || this, "onyx-highlight", !1, t);
    },
    statics: {
        addRemoveFlyweightClass: function(e, t, n, r, i) {
            var s = r.flyweight;
            if (s) {
                var o = i !== undefined ? i : r.index;
                s.performOnRow(o, function() {
                    e.addRemoveClass(t, n);
                });
            }
        }
    }
});

// Spinner.js

enyo.kind({
    name: "onyx.Spinner",
    classes: "onyx-spinner",
    stop: function() {
        this.setShowing(!1);
    },
    start: function() {
        this.setShowing(!0);
    },
    toggle: function() {
        this.setShowing(!this.getShowing());
    }
});

// MoreToolbar.js

enyo.kind({
    name: "onyx.MoreToolbar",
    classes: "onyx-toolbar onyx-more-toolbar",
    menuClass: "",
    movedClass: "",
    layoutKind: "FittableColumnsLayout",
    noStretch: !0,
    handlers: {
        onHide: "reflow"
    },
    published: {
        clientLayoutKind: "FittableColumnsLayout"
    },
    tools: [{
            name: "client",
            noStretch: !0,
            fit: !0,
            classes: "onyx-toolbar-inline"
        }, {
            name: "nard",
            kind: "onyx.MenuDecorator",
            showing: !1,
            onActivate: "activated",
            components: [{
                    kind: "onyx.IconButton",
                    classes: "onyx-more-button"
                }, {
                    name: "menu",
                    kind: "onyx.Menu",
                    scrolling: !1,
                    classes: "onyx-more-menu"
                }]
        }],
    initComponents: function() {
        this.menuClass && this.menuClass.length > 0 && !this.$.menu.hasClass(this.menuClass) && this.$.menu.addClass(this.menuClass), this.createChrome(this.tools), this.inherited(arguments), this.$.client.setLayoutKind(this.clientLayoutKind);
    },
    clientLayoutKindChanged: function() {
        this.$.client.setLayoutKind(this.clientLayoutKind);
    },
    reflow: function() {
        this.inherited(arguments), this.isContentOverflowing() ? (this.$.nard.show(), this.popItem() && this.reflow()) : this.tryPushItem() ? this.reflow() : this.$.menu.children.length || (this.$.nard.hide(), this.$.menu.hide());
    },
    activated: function(e, t) {
        this.addRemoveClass("active", t.originator.active);
    },
    popItem: function() {
        var e = this.findCollapsibleItem();
        if (e) {
            this.movedClass && this.movedClass.length > 0 && !e.hasClass(this.movedClass) && e.addClass(this.movedClass), this.$.menu.addChild(e, null);
            var t = this.$.menu.hasNode();
            return t && e.hasNode() && e.insertNodeInParent(t), !0;
        }
    },
    pushItem: function() {
        var e = this.$.menu.children, t = e[0];
        if (t) {
            this.movedClass && this.movedClass.length > 0 && t.hasClass(this.movedClass) && t.removeClass(this.movedClass), this.$.client.addChild(t);
            var n = this.$.client.hasNode();
            if (n && t.hasNode()) {
                var r, i;
                for (var s = 0; s < this.$.client.children.length; s++) {
                    var o = this.$.client.children[s];
                    if (o.toolbarIndex !== undefined && o.toolbarIndex != s) {
                        r = o, i = s;
                        break;
                    }
                }
                if (r && r.hasNode()) {
                    t.insertNodeInParent(n, r.node);
                    var u = this.$.client.children.pop();
                    this.$.client.children.splice(i, 0, u);
                } else
                    t.appendNodeToParent(n);
            }
            return !0;
        }
    },
    tryPushItem: function() {
        if (this.pushItem()) {
            if (!this.isContentOverflowing())
                return !0;
            this.popItem();
        }
    },
    isContentOverflowing: function() {
        if (this.$.client.hasNode()) {
            var e = this.$.client.children, t = e[e.length - 1].hasNode();
            if (t)
                return this.$.client.reflow(), t.offsetLeft + t.offsetWidth > this.$.client.node.clientWidth;
        }
    },
    findCollapsibleItem: function() {
        var e = this.$.client.children;
        for (var t = e.length - 1; c = e[t]; t--) {
            if (!c.unmoveable)
                return c;
            c.toolbarIndex === undefined && (c.toolbarIndex = t);
        }
    }
});

// IntegerPicker.js

enyo.kind({
    name: "onyx.IntegerPicker",
    kind: "onyx.Picker",
    published: {
        value: 0,
        min: 0,
        max: 9
    },
    create: function() {
        this.inherited(arguments), this.rangeChanged();
    },
    minChanged: function() {
        this.destroyClientControls(), this.rangeChanged(), this.render();
    },
    maxChanged: function() {
        this.destroyClientControls(), this.rangeChanged(), this.render();
    },
    rangeChanged: function() {
        for (var e = this.min; e <= this.max; e++)
            this.createComponent({
                content: e,
                active: e === this.value ? !0 : !1
            });
    },
    valueChanged: function(e) {
        var t = this.getClientControls(), n = t.length;
        this.value = this.value >= this.min && this.value <= this.max ? this.value : this.min;
        for (var r = 0; r < n; r++)
            if (this.value === parseInt(t[r].content)) {
                this.setSelected(t[r]);
                break;
            }
    },
    selectedChanged: function(e) {
        e && e.removeClass("selected"), this.selected && (this.selected.addClass("selected"), this.doChange({
            selected: this.selected,
            content: this.selected.content
        })), this.value = parseInt(this.selected.content);
    }
});

// ContextualPopup.js

enyo.kind({
    name: "onyx.ContextualPopup",
    kind: "enyo.Popup",
    modal: !0,
    autoDismiss: !0,
    floating: !1,
    classes: "onyx-contextual-popup enyo-unselectable",
    published: {
        maxHeight: 100,
        scrolling: !0,
        title: undefined,
        actionButtons: []
    },
    vertFlushMargin: 60,
    horizFlushMargin: 50,
    widePopup: 200,
    longPopup: 200,
    horizBuffer: 16,
    events: {
        onTap: ""
    },
    handlers: {
        onActivate: "itemActivated",
        onRequestShowMenu: "requestShow",
        onRequestHideMenu: "requestHide"
    },
    components: [{
            name: "title",
            classes: "onyx-contextual-popup-title"
        }, {
            classes: "onyx-contextual-popup-scroller",
            components: [{
                    name: "client",
                    kind: "enyo.Scroller",
                    vertical: "auto",
                    classes: "enyo-unselectable",
                    thumb: !1,
                    strategyKind: "TouchScrollStrategy"
                }]
        }, {
            name: "actionButtons",
            classes: "onyx-contextual-popup-action-buttons"
        }],
    scrollerName: "client",
    create: function() {
        this.inherited(arguments), this.maxHeightChanged(), this.titleChanged(), this.actionButtonsChanged();
    },
    getScroller: function() {
        return this.$[this.scrollerName];
    },
    titleChanged: function() {
        this.$.title.setContent(this.title);
    },
    actionButtonsChanged: function() {
        for (var e = 0; e < this.actionButtons.length; e++)
            this.$.actionButtons.createComponent({
                kind: "onyx.Button",
                content: this.actionButtons[e].content,
                classes: this.actionButtons[e].classes + " onyx-contextual-popup-action-button",
                name: this.actionButtons[e].name ? this.actionButtons[e].name : "ActionButton" + e,
                index: e,
                tap: enyo.bind(this, this.tapHandler)
            });
    },
    tapHandler: function(e, t) {
        return t.actionButton = !0, t.popup = this, this.bubble("ontap", t), !0;
    },
    maxHeightChanged: function() {
        this.scrolling && this.getScroller().setMaxHeight(this.maxHeight + "px");
    },
    itemActivated: function(e, t) {
        return t.originator.setActive(!1), !0;
    },
    showingChanged: function() {
        this.inherited(arguments), this.scrolling && this.getScroller().setShowing(this.showing), this.adjustPosition();
    },
    requestShow: function(e, t) {
        var n = t.activator.hasNode();
        return n && (this.activatorOffset = this.getPageOffset(n)), this.show(), !0;
    },
    applyPosition: function(e) {
        var t = "";
        for (var n in e)
            t += n + ":" + e[n] + (isNaN(e[n]) ? "; " : "px; ");
        this.addStyles(t);
    },
    getPageOffset: function(e) {
        var t = this.getBoundingRect(e), n = window.pageYOffset === undefined ? document.documentElement.scrollTop : window.pageYOffset, r = window.pageXOffset === undefined ? document.documentElement.scrollLeft : window.pageXOffset, i = t.height === undefined ? t.bottom - t.top : t.height, s = t.width === undefined ? t.right - t.left : t.width;
        return {
            top: t.top + n,
            left: t.left + r,
            height: i,
            width: s
        };
    },
    adjustPosition: function() {
        if (this.showing && this.hasNode()) {
            this.resetPositioning();
            var e = this.getViewWidth(), t = this.getViewHeight(), n = this.vertFlushMargin, r = t - this.vertFlushMargin, i = this.horizFlushMargin, s = e - this.horizFlushMargin;
            if (this.activatorOffset.top + this.activatorOffset.height < n || this.activatorOffset.top > r) {
                if (this.applyVerticalFlushPositioning(i, s))
                    return;
                if (this.applyHorizontalFlushPositioning(i, s))
                    return;
                if (this.applyVerticalPositioning())
                    return;
            } else if (this.activatorOffset.left + this.activatorOffset.width < i || this.activatorOffset.left > s)
                if (this.applyHorizontalPositioning())
                    return;
            var o = this.getBoundingRect(this.node);
            if (o.width > this.widePopup) {
                if (this.applyVerticalPositioning())
                    return;
            } else if (o.height > this.longPopup && this.applyHorizontalPositioning())
                return;
            if (this.applyVerticalPositioning())
                return;
            if (this.applyHorizontalPositioning())
                return;
        }
    },
    initVerticalPositioning: function() {
        this.resetPositioning(), this.addClass("vertical");
        var e = this.getBoundingRect(this.node), t = this.getViewHeight();
        return this.floating ? this.activatorOffset.top < t / 2 ? (this.applyPosition({
            top: this.activatorOffset.top + this.activatorOffset.height,
            bottom: "auto"
        }), this.addClass("below")) : (this.applyPosition({
            top: this.activatorOffset.top - e.height,
            bottom: "auto"
        }), this.addClass("above")) : e.top + e.height > t && t - e.bottom < e.top - e.height ? this.addClass("above") : this.addClass("below"), e = this.getBoundingRect(this.node), e.top + e.height > t || e.top < 0 ? !1 : !0;
    },
    applyVerticalPositioning: function() {
        if (!this.initVerticalPositioning())
            return !1;
        var e = this.getBoundingRect(this.node), t = this.getViewWidth();
        if (this.floating) {
            var n = this.activatorOffset.left + this.activatorOffset.width / 2 - e.width / 2;
            n + e.width > t ? (this.applyPosition({
                left: this.activatorOffset.left + this.activatorOffset.width - e.width
            }), this.addClass("left")) : n < 0 ? (this.applyPosition({
                left: this.activatorOffset.left
            }), this.addClass("right")) : this.applyPosition({
                left: n
            });
        } else {
            var r = this.activatorOffset.left + this.activatorOffset.width / 2 - e.left - e.width / 2;
            e.right + r > t ? (this.applyPosition({
                left: this.activatorOffset.left + this.activatorOffset.width - e.right
            }), this.addRemoveClass("left", !0)) : e.left + r < 0 ? this.addRemoveClass("right", !0) : this.applyPosition({
                left: r
            });
        }
        return !0;
    },
    applyVerticalFlushPositioning: function(e, t) {
        if (!this.initVerticalPositioning())
            return !1;
        var n = this.getBoundingRect(this.node), r = this.getViewWidth();
        return this.activatorOffset.left + this.activatorOffset.width / 2 < e ? (this.activatorOffset.left + this.activatorOffset.width / 2 < this.horizBuffer ? this.applyPosition({
            left: this.horizBuffer + (this.floating ? 0 : -n.left)
        }) : this.applyPosition({
            left: this.activatorOffset.width / 2 + (this.floating ? this.activatorOffset.left : 0)
        }), this.addClass("right"), this.addClass("corner"), !0) : this.activatorOffset.left + this.activatorOffset.width / 2 > t ? (this.activatorOffset.left + this.activatorOffset.width / 2 > r - this.horizBuffer ? this.applyPosition({
            left: r - this.horizBuffer - n.right
        }) : this.applyPosition({
            left: this.activatorOffset.left + this.activatorOffset.width / 2 - n.right
        }), this.addClass("left"), this.addClass("corner"), !0) : !1;
    },
    initHorizontalPositioning: function() {
        this.resetPositioning();
        var e = this.getBoundingRect(this.node), t = this.getViewWidth();
        return this.floating ? this.activatorOffset.left + this.activatorOffset.width < t / 2 ? (this.applyPosition({
            left: this.activatorOffset.left + this.activatorOffset.width
        }), this.addRemoveClass("left", !0)) : (this.applyPosition({
            left: this.activatorOffset.left - e.width
        }), this.addRemoveClass("right", !0)) : this.activatorOffset.left - e.width > 0 ? (this.applyPosition({
            left: this.activatorOffset.left - e.left - e.width
        }), this.addRemoveClass("right", !0)) : (this.applyPosition({
            left: this.activatorOffset.width
        }), this.addRemoveClass("left", !0)), this.addRemoveClass("horizontal", !0), e = this.getBoundingRect(this.node), e.left < 0 || e.left + e.width > t ? !1 : !0;
    },
    applyHorizontalPositioning: function() {
        if (!this.initHorizontalPositioning())
            return !1;
        var e = this.getBoundingRect(this.node), t = this.getViewHeight(), n = this.activatorOffset.top + this.activatorOffset.height / 2;
        return this.floating ? n >= t / 2 - .05 * t && n <= t / 2 + .05 * t ? this.applyPosition({
            top: this.activatorOffset.top + this.activatorOffset.height / 2 - e.height / 2,
            bottom: "auto"
        }) : this.activatorOffset.top + this.activatorOffset.height < t / 2 ? (this.applyPosition({
            top: this.activatorOffset.top - this.activatorOffset.height,
            bottom: "auto"
        }), this.addRemoveClass("high", !0)) : (this.applyPosition({
            top: this.activatorOffset.top - e.height + this.activatorOffset.height * 2,
            bottom: "auto"
        }), this.addRemoveClass("low", !0)) : n >= t / 2 - .05 * t && n <= t / 2 + .05 * t ? this.applyPosition({
            top: (this.activatorOffset.height - e.height) / 2
        }) : this.activatorOffset.top + this.activatorOffset.height < t / 2 ? (this.applyPosition({
            top: -this.activatorOffset.height
        }), this.addRemoveClass("high", !0)) : (this.applyPosition({
            top: e.top - e.height - this.activatorOffset.top + this.activatorOffset.height
        }), this.addRemoveClass("low", !0)), !0;
    },
    applyHorizontalFlushPositioning: function(e, t) {
        if (!this.initHorizontalPositioning())
            return !1;
        var n = this.getBoundingRect(this.node), r = this.getViewWidth();
        return this.floating ? this.activatorOffset.top < innerHeight / 2 ? (this.applyPosition({
            top: this.activatorOffset.top + this.activatorOffset.height / 2
        }), this.addRemoveClass("high", !0)) : (this.applyPosition({
            top: this.activatorOffset.top + this.activatorOffset.height / 2 - n.height
        }), this.addRemoveClass("low", !0)) : n.top + n.height > innerHeight && innerHeight - n.bottom < n.top - n.height ? (this.applyPosition({
            top: n.top - n.height - this.activatorOffset.top - this.activatorOffset.height / 2
        }), this.addRemoveClass("low", !0)) : (this.applyPosition({
            top: this.activatorOffset.height / 2
        }), this.addRemoveClass("high", !0)), this.activatorOffset.left + this.activatorOffset.width < e ? (this.addClass("left"), this.addClass("corner"), !0) : this.activatorOffset.left > t ? (this.addClass("right"), this.addClass("corner"), !0) : !1;
    },
    getBoundingRect: function(e) {
        var t = e.getBoundingClientRect();
        return !t.width || !t.height ? {
            left: t.left,
            right: t.right,
            top: t.top,
            bottom: t.bottom,
            width: t.right - t.left,
            height: t.bottom - t.top
        } : t;
    },
    getViewHeight: function() {
        return window.innerHeight === undefined ? document.documentElement.clientHeight : window.innerHeight;
    },
    getViewWidth: function() {
        return window.innerWidth === undefined ? document.documentElement.clientWidth : window.innerWidth;
    },
    resetPositioning: function() {
        this.removeClass("right"), this.removeClass("left"), this.removeClass("high"), this.removeClass("low"), this.removeClass("corner"), this.removeClass("below"), this.removeClass("above"), this.removeClass("vertical"), this.removeClass("horizontal"), this.applyPosition({
            left: "auto"
        }), this.applyPosition({
            top: "auto"
        });
    },
    resizeHandler: function() {
        this.inherited(arguments), this.adjustPosition();
    },
    requestHide: function() {
        this.setShowing(!1);
    }
});

// javascript/g11n.js

if (!this.enyo) {
    this.enyo = {};
    var empty = {};
    enyo.mixin = function(e, t) {
        e = e || {};
        if (t) {
            var n, r;
            for (n in t)
                r = t[n], empty[n] !== r && (e[n] = r);
        }
        return e;
    };
}

"trim" in String.prototype || (String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
}), enyo.g11n = function() {
}, enyo.g11n._init = function() {
    if (!enyo.g11n._initialized) {
        typeof window != "undefined" ? (enyo.g11n._platform = "browser", enyo.g11n._enyoAvailable = !0) : (enyo.g11n._platform = "node", enyo.g11n._enyoAvailable = !1);
        if (navigator) {
            var t = (navigator.language || navigator.userLanguage).replace(/-/g, "_").toLowerCase();
            enyo.g11n._locale = new enyo.g11n.Locale(t), enyo.g11n._formatLocale = enyo.g11n._locale, enyo.g11n._phoneLocale = enyo.g11n._locale;
        }
        enyo.g11n._locale === undefined && (enyo.warn("enyo.g11n._init: could not find current locale, so using default of en_us."), enyo.g11n._locale = new enyo.g11n.Locale("en_us")), enyo.g11n._formatLocale === undefined && (enyo.warn("enyo.g11n._init: could not find current formats locale, so using default of us."), enyo.g11n._formatLocale = new enyo.g11n.Locale("en_us")), enyo.g11n._phoneLocale === undefined && (enyo.warn("enyo.g11n._init: could not find current phone locale, so defaulting to the same thing as the formats locale."), enyo.g11n._phoneLocale = enyo.g11n._formatLocale), enyo.g11n._sourceLocale === undefined && (enyo.g11n._sourceLocale = new enyo.g11n.Locale("en_us")), enyo.g11n._initialized = !0;
    }
}, enyo.g11n.getPlatform = function() {
    return enyo.g11n._platform || enyo.g11n._init(), enyo.g11n._platform;
}, enyo.g11n.isEnyoAvailable = function() {
    return enyo.g11n._enyoAvailable || enyo.g11n._init(), enyo.g11n._enyoAvailable;
}, enyo.g11n.currentLocale = function() {
    return enyo.g11n._locale || enyo.g11n._init(), enyo.g11n._locale;
}, enyo.g11n.formatLocale = function() {
    return enyo.g11n._formatLocale || enyo.g11n._init(), enyo.g11n._formatLocale;
}, enyo.g11n.phoneLocale = function() {
    return enyo.g11n._phoneLocale || enyo.g11n._init(), enyo.g11n._phoneLocale;
}, enyo.g11n.sourceLocale = function() {
    return enyo.g11n._sourceLocale || enyo.g11n._init(), enyo.g11n._sourceLocale;
}, enyo.g11n.setLocale = function(t) {
    t && (enyo.g11n._init(), t.uiLocale && (enyo.g11n._locale = new enyo.g11n.Locale(t.uiLocale)), t.formatLocale && (enyo.g11n._formatLocale = new enyo.g11n.Locale(t.formatLocale)), t.phoneLocale && (enyo.g11n._phoneLocale = new enyo.g11n.Locale(t.phoneLocale)), t.sourceLocale && (enyo.g11n._sourceLocale = new enyo.g11n.Locale(t.sourceLocale)), enyo.g11n._enyoAvailable && enyo.reloadG11nResources());
};

// javascript/fmts.js

enyo.g11n.Fmts = function(t) {
    var n;
    typeof t == "undefined" || !t.locale ? this.locale = enyo.g11n.formatLocale() : typeof t.locale == "string" ? this.locale = new enyo.g11n.Locale(t.locale) : this.locale = t.locale, this.dateTimeFormatHash = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/formats",
        locale: this.locale,
        type: "region"
    }), this.dateTimeHash = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/datetime_data",
        locale: this.locale
    }), this.dateTimeHash || (this.dateTimeHash = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/datetime_data",
        locale: enyo.g11n.currentLocale()
    })), this.dateTimeHash || (this.dateTimeHash = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/datetime_data",
        locale: new enyo.g11n.Locale("en_us")
    }));
}, enyo.g11n.Fmts.prototype.isAmPm = function() {
    return typeof this.twelveHourFormat == "undefined" && (this.twelveHourFormat = this.dateTimeFormatHash.is12HourDefault), this.twelveHourFormat;
}, enyo.g11n.Fmts.prototype.isAmPmDefault = function() {
    return this.dateTimeFormatHash.is12HourDefault;
}, enyo.g11n.Fmts.prototype.getFirstDayOfWeek = function() {
    return this.dateTimeFormatHash.firstDayOfWeek;
}, enyo.g11n.Fmts.prototype.getDateFieldOrder = function() {
    return this.dateTimeFormatHash ? this.dateTimeFormatHash.dateFieldOrder : (enyo.warn("Failed to load date time format hash"), "mdy");
}, enyo.g11n.Fmts.prototype.getTimeFieldOrder = function() {
    return this.dateTimeFormatHash ? this.dateTimeFormatHash.timeFieldOrder : (enyo.warn("Failed to load date time format hash"), "hma");
}, enyo.g11n.Fmts.prototype.getMonthFields = function() {
    return this.dateTimeHash ? this.dateTimeHash.medium.month : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
}, enyo.g11n.Fmts.prototype.getAmCaption = function() {
    return this.dateTimeHash ? this.dateTimeHash.am : (enyo.error("Failed to load dateTimeHash."), "AM");
}, enyo.g11n.Fmts.prototype.getPmCaption = function() {
    return this.dateTimeHash ? this.dateTimeHash.pm : (enyo.error("Failed to load dateTimeHash."), "PM");
}, enyo.g11n.Fmts.prototype.getMeasurementSystem = function() {
    return this.dateTimeFormatHash && this.dateTimeFormatHash.measurementSystem || "metric";
}, enyo.g11n.Fmts.prototype.getDefaultPaperSize = function() {
    return this.dateTimeFormatHash && this.dateTimeFormatHash.defaultPaperSize || "A4";
}, enyo.g11n.Fmts.prototype.getDefaultPhotoSize = function() {
    return this.dateTimeFormatHash && this.dateTimeFormatHash.defaultPhotoSize || "10X15CM";
}, enyo.g11n.Fmts.prototype.getDefaultTimeZone = function() {
    return this.dateTimeFormatHash && this.dateTimeFormatHash.defaultTimeZone || "Europe/London";
}, enyo.g11n.Fmts.prototype.isAsianScript = function() {
    return this.dateTimeFormatHash && typeof this.dateTimeFormatHash.asianScript != "undefined" ? this.dateTimeFormatHash.asianScript : !1;
}, enyo.g11n.Fmts.prototype.isHanTraditional = function() {
    return this.dateTimeFormatHash && typeof this.dateTimeFormatHash.scriptStyle != "undefined" ? this.dateTimeFormatHash.scriptStyle === "traditional" : !1;
}, enyo.g11n.Fmts.prototype.textDirection = function() {
    return this.dateTimeFormatHash && this.dateTimeFormatHash.scriptDirection || "ltr";
};

// javascript/locale.js

enyo.g11n.Locale = function(t) {
    var n = t ? t.split(/_/) : [];
    return this.locale = t, this.language = n[0] || undefined, this.region = n[1] ? n[1].toLowerCase() : undefined, this.variant = n[2] ? n[2].toLowerCase() : undefined, this;
}, enyo.g11n.Locale.prototype.getLocale = function() {
    return this.locale;
}, enyo.g11n.Locale.prototype.getLanguage = function() {
    return this.language;
}, enyo.g11n.Locale.prototype.getRegion = function() {
    return this.region;
}, enyo.g11n.Locale.prototype.getVariant = function() {
    return this.variant;
}, enyo.g11n.Locale.prototype.toString = function() {
    return this.locale || (this.locale = this.language + "_" + this.region, this.variant && (this.locale = this.locale + "_" + this.variant)), this.locale;
}, enyo.g11n.Locale.prototype.toISOString = function() {
    var e = this.language || "";
    return this.region && (e += "_" + this.region.toUpperCase()), this.variant && (e += "_" + this.variant.toUpperCase()), e;
}, enyo.g11n.Locale.prototype.isMatch = function(e) {
    return e.language && e.region ? (!this.language || this.language === e.language) && (!this.region || this.region === e.region) : e.language ? !this.language || this.language === e.language : !this.region || this.region === e.region;
}, enyo.g11n.Locale.prototype.equals = function(e) {
    return this.language === e.language && this.region === e.region && this.variant === e.variant;
}, enyo.g11n.Locale.prototype.useDefaultLang = function() {
    var e, t, n;
    this.language || (e = enyo.g11n.Utils.getNonLocaleFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/formats/defLangs.json"
    }), t = e && e[this.region], t || (n = enyo.g11n.currentLocale(), t = n.language), this.language = t || "en", this.locale = this.language + "_" + this.region);
};

// javascript/loadfile.js

enyo.g11n.Utils = enyo.g11n.Utils || function() {
}, enyo.g11n.Utils._fileCache = {}, enyo.g11n.Utils._getBaseURL = function(e) {
    if ("baseURI" in e)
        return e.baseURI;
    var t = e.getElementsByTagName("base");
    return t.length > 0 ? t[0].href : window.location.href;
}, enyo.g11n.Utils._fetchAppRootPath = function() {
    var e = window.document, t = enyo.g11n.Utils._getBaseURL(e).match(new RegExp(".*://[^#]*/"));
    if (t)
        return t[0];
}, enyo.g11n.Utils._setRoot = function(t) {
    var n = t;
    return !t && enyo.g11n.isEnyoAvailable() ? n = enyo.g11n.Utils._fetchAppRootPath() + "assets" : n = ".", enyo.g11n.root = n;
}, enyo.g11n.Utils._getRoot = function() {
    return enyo.g11n.root || enyo.g11n.Utils._setRoot();
}, enyo.g11n.Utils._getEnyoRoot = function(t) {
    var n = "";
    return !enyo.g11n.isEnyoAvailable() && t && (n = t), n + enyo.path.paths.enyo + "/../lib/g11n/source";
}, enyo.g11n.Utils._loadFile = function(t) {
    var n, r, i = enyo.g11n.getPlatform();
    if (i === "node")
        try {
            this.fs || (this.fs = IMPORTS.require("fs")), r = this.fs.readFileSync(t, "utf8"), r && (n = JSON.parse(r));
        } catch (s) {
            n = undefined;
        }
    else
        try {
            n = JSON.parse(enyo.xhr.request({
                url: t,
                sync: !0
            }).responseText);
        } catch (o) {
        }
    return n;
}, enyo.g11n.Utils.getNonLocaleFile = function(t) {
    var n, r, i;
    if (!t || !t.path)
        return undefined;
    t.path.charAt(0) !== "/" ? (r = t.root || this._getRoot(), i = r + "/" + t.path) : i = t.path;
    if (enyo.g11n.Utils._fileCache[i] !== undefined)
        n = enyo.g11n.Utils._fileCache[i].json;
    else {
        n = enyo.g11n.Utils._loadFile(i);
        if (t.cache === undefined || t.cache !== !1)
            enyo.g11n.Utils._fileCache[i] = {
                path: i,
                json: n,
                locale: undefined,
                timestamp: new Date
            }, this.oldestStamp === undefined && (this.oldestStamp = enyo.g11n.Utils._fileCache[i].timestamp);
    }
    return n;
}, enyo.g11n.Utils.getJsonFile = function(t) {
    var n, r, i, s, o, u, a, f, l;
    if (!t || !t.path || !t.locale)
        return undefined;
    i = t.path.charAt(0) !== "/" ? t.root || this._getRoot() : "", i.slice(-1) !== "/" && (i += "/"), t.path ? (s = t.path, s.slice(-1) !== "/" && (s += "/")) : s = "", s += t.prefix || "", i += s, l = i + t.locale.toString() + ".json";
    if (enyo.g11n.Utils._fileCache[l] !== undefined)
        n = enyo.g11n.Utils._fileCache[l].json;
    else {
        t.merge ? (t.locale.language && (r = i + t.locale.language + ".json", o = this._loadFile(r)), t.locale.region && (r = i + t.locale.language + "_" + t.locale.region + ".json", u = this._loadFile(r), t.locale.language !== t.locale.region && (r = i + t.locale.region + ".json", a = this._loadFile(r))), t.locale.variant && (r = i + t.locale.language + "_" + t.locale.region + "_" + t.locale.variant + ".json", f = this._loadFile(r)), n = this._merge([o, a, u, f])) : (r = i + t.locale.toString() + ".json", n = this._loadFile(r), !n && t.type !== "region" && t.locale.language && (r = i + t.locale.language + ".json", n = this._loadFile(r)), !n && t.type !== "language" && t.locale.region && (r = i + t.locale.region + ".json", n = this._loadFile(r)), !n && t.type !== "language" && t.locale.region && (r = i + "_" + t.locale.region + ".json", n = this._loadFile(r)));
        if (t.cache === undefined || t.cache !== !1)
            enyo.g11n.Utils._fileCache[l] = {
                path: l,
                json: n,
                locale: t.locale,
                timestamp: new Date
            }, this.oldestStamp === undefined && (this.oldestStamp = enyo.g11n.Utils._fileCache[l].timestamp);
    }
    return n;
}, enyo.g11n.Utils._merge = function(t) {
    var n, r, i = {};
    for (n = 0, r = t.length; n < r; n++)
        i = enyo.mixin(i, t[n]);
    return i;
}, enyo.g11n.Utils.releaseAllJsonFiles = function(t, n) {
    var r = new Date, i = [], s, o, u, a;
    t = t || 6e4;
    if (this.oldestStamp !== undefined && this.oldestStamp.getTime() + t < r.getTime()) {
        s = r;
        for (o in enyo.g11n.Utils._fileCache)
            o && enyo.g11n.Utils._fileCache[o] && (a = enyo.g11n.Utils._fileCache[o], !a.locale || n || !enyo.g11n.currentLocale().isMatch(a.locale) && !enyo.g11n.formatLocale().isMatch(a.locale) && !enyo.g11n.phoneLocale().isMatch(a.locale) ? a.timestamp.getTime() + t < r.getTime() ? i.push(a.path) : a.timestamp.getTime() < s.getTime() && (s = a.timestamp) : a.timestamp.getTime() < s.getTime() && (s = a.timestamp));
        this.oldestStamp = s.getTime() < r.getTime() ? s : undefined;
        for (u = 0; u < i.length; u++)
            enyo.g11n.Utils._fileCache[i[u]] = undefined;
    }
    return i.length;
}, enyo.g11n.Utils._cacheSize = function() {
    var t = 0, n;
    for (n in enyo.g11n.Utils._fileCache)
        enyo.g11n.Utils._fileCache[n] && t++;
    return t;
};

// javascript/template.js

enyo.g11n.Template = function(e, t) {
    this.template = e, this.pattern = t || /(.?)(#\{(.*?)\})/;
}, enyo.g11n.Template.prototype._evalHelper = function(e, t) {
    function s(e) {
        return e === undefined || e === null ? "" : e;
    }
    function o(e, n, r) {
        var i = t, o, u;
        e = s(e);
        if (e === "\\")
            return n;
        o = r.split("."), u = o.shift();
        while (i && u) {
            i = i[u], u = o.shift();
            if (!u)
                return e + s(i) || e || "";
        }
        return e || "";
    }
    var n = [], r = this.pattern, i;
    if (!t || !e)
        return "";
    while (e.length)
        i = e.match(r), i ? (n.push(e.slice(0, i.index)), n.push(o(i[1], i[2], i[3])), e = e.slice(i.index + i[0].length)) : (n.push(e), e = "");
    return n.join("");
}, enyo.g11n.Template.prototype.evaluate = function(e) {
    return this._evalHelper(this.template, e);
}, enyo.g11n.Template.prototype.formatChoice = function(e, t) {
    try {
        var n = this.template ? this.template.split("|") : [], r = [], i = [], s = "", o;
        t = t || {};
        for (o = 0; o < n.length; o++) {
            var u = enyo.indexOf("#", n[o]);
            if (u !== -1) {
                r[o] = n[o].substring(0, u), i[o] = n[o].substring(u + 1);
                if (e == r[o])
                    return this._evalHelper(i[o], t);
                r[o] === "" && (s = i[o]);
            }
        }
        for (o = 0; o < r.length; o++) {
            var a = r[o];
            if (a) {
                var f = a.charAt(a.length - 1), l = parseFloat(a);
                if (f === "<" && e < l || f === ">" && e > l)
                    return this._evalHelper(i[o], t);
            }
        }
        return this._evalHelper(s, t);
    } catch (c) {
        return enyo.error("formatChoice error : ", c), "";
    }
};

// javascript/resources.js

$L = function(e) {
    return $L._resources || ($L._resources = new enyo.g11n.Resources), $L._resources.$L(e);
}, $L._resources = null, enyo.g11n.Resources = function(e) {
    e && e.root && (this.root = typeof window != "undefined" ? enyo.path.rewrite(e.root) : e.root), this.root = this.root || enyo.g11n.Utils._getRoot(), this.resourcePath = this.root + "/resources/", e && e.locale ? this.locale = typeof e.locale == "string" ? new enyo.g11n.Locale(e.locale) : e.locale : this.locale = enyo.g11n.currentLocale(), this.$L = this.locale.toString() === "en_pl" ? this._pseudo : this._$L, this.localizedResourcePath = this.resourcePath + this.locale.locale + "/", this.languageResourcePath = this.resourcePath + (this.locale.language ? this.locale.language + "/" : ""), this.regionResourcePath = this.languageResourcePath + (this.locale.region ? this.locale.region + "/" : ""), this.carrierResourcePath = this.regionResourcePath + (this.locale.variant ? this.locale.variant + "/" : "");
}, enyo.g11n.Resources.prototype.getResource = function(e) {
    var t;
    if (this.carrierResourcePath)
        try {
            t = enyo.g11n.Utils.getNonLocaleFile({
                path: this.carrierResourcePath + e
            });
        } catch (n) {
            t = undefined;
        }
    if (!t)
        try {
            t = enyo.g11n.Utils.getNonLocaleFile({
                path: this.regionResourcePath + e
            });
        } catch (r) {
            t = undefined;
        }
    if (!t)
        try {
            t = enyo.g11n.Utils.getNonLocaleFile({
                path: this.languageResourcePath + e
            });
        } catch (i) {
            t = undefined;
        }
    if (!t)
        try {
            t = enyo.g11n.Utils.getNonLocaleFile({
                path: this.resourcePath + "en/" + e
            });
        } catch (s) {
            t = undefined;
        }
    if (!t)
        try {
            t = enyo.g11n.Utils.getNonLocaleFile({
                path: this.root + "/" + e
            });
        } catch (o) {
            t = undefined;
        }
    return t;
}, enyo.g11n.Resources.prototype.$L = function(e) {
}, enyo.g11n.Resources.prototype._$L = function(e) {
    var t, n;
    return e ? this.locale.equals(enyo.g11n.sourceLocale()) ? typeof e == "string" ? e : e.value : (this.strings || this._loadStrings(), typeof e == "string" ? (t = e, n = e) : (t = e.key, n = e.value), this.strings && typeof this.strings[t] != "undefined" ? this.strings[t] : n) : "";
}, enyo.g11n.Resources.prototype._pseudo = function(e) {
    var t, n;
    if (!e)
        return "";
    n = "";
    for (t = 0; t < e.length; t++)
        if (e.charAt(t) === "#" && t + 1 < e.length && e.charAt(t + 1) === "{") {
            while (e.charAt(t) !== "}" && t < e.length)
                n += e.charAt(t++);
            t < e.length && (n += e.charAt(t));
        } else if (e.charAt(t) === "<") {
            while (e.charAt(t) !== ">" && t < e.length)
                n += e.charAt(t++);
            t < e.length && (n += e.charAt(t));
        } else if (e.charAt(t) === "&" && t + 1 < e.length && !enyo.g11n.Char.isSpace(e.charAt(t + 1))) {
            while (e.charAt(t) !== ";" && !enyo.g11n.Char.isSpace(e.charAt(t)) && t < e.length)
                n += e.charAt(t++);
            t < e.length && (n += e.charAt(t));
        } else
            n += enyo.g11n.Resources._pseudoMap[e.charAt(t)] || e.charAt(t);
    return n;
}, enyo.g11n.Resources.prototype._loadStrings = function() {
    this.strings = enyo.g11n.Utils.getJsonFile({
        root: this.root,
        path: "resources",
        locale: this.locale,
        merge: !0
    }), enyo.g11n.Utils.releaseAllJsonFiles();
}, enyo.g11n.Resources._pseudoMap = {
    a: "\u00e1",
    e: "\u00e8",
    i: "\u00ef",
    o: "\u00f5",
    u: "\u00fb",
    c: "\u00e7",
    A: "\u00c5",
    E: "\u00cb",
    I: "\u00ce",
    O: "\u00d5",
    U: "\u00db",
    C: "\u00c7",
    B: "\u00df",
    y: "\u00ff",
    Y: "\u00dd",
    D: "\u010e",
    d: "\u0111",
    g: "\u011d",
    G: "\u011c",
    H: "\u0124",
    h: "\u0125",
    J: "\u0134",
    j: "\u0135",
    K: "\u0136",
    k: "\u0137",
    N: "\u00d1",
    n: "\u00f1",
    S: "\u015e",
    s: "\u015f",
    T: "\u0164",
    t: "\u0165",
    W: "\u0174",
    w: "\u0175",
    Z: "\u0179",
    z: "\u017a"
};

// javascript/character.js

enyo.g11n.Char = enyo.g11n.Char || {}, enyo.g11n.Char._strTrans = function(t, n) {
    var r = "", i, s;
    for (s = 0; s < t.length; s++)
        i = n[t.charAt(s)], r += i || t.charAt(s);
    return r;
}, enyo.g11n.Char._objectIsEmpty = function(e) {
    var t;
    for (t in e)
        return !1;
    return !0;
}, enyo.g11n.Char._isIdeoLetter = function(e) {
    return e >= 19968 && e <= 40907 || e >= 63744 && e <= 64217 || e >= 13312 && e <= 19893 || e >= 12353 && e <= 12447 || e >= 12449 && e <= 12543 || e >= 65382 && e <= 65437 || e >= 12784 && e <= 12799 || e >= 12549 && e <= 12589 || e >= 12704 && e <= 12727 || e >= 12593 && e <= 12686 || e >= 65440 && e <= 65500 || e >= 44032 && e <= 55203 || e >= 40960 && e <= 42124 || e >= 4352 && e <= 4607 || e >= 43360 && e <= 43388 || e >= 55216 && e <= 55291 ? !0 : !1;
}, enyo.g11n.Char._isIdeoOther = function(e) {
    return e >= 42125 && e <= 42191 || e >= 12544 && e <= 12548 || e >= 12590 && e <= 12591 || e >= 64218 && e <= 64255 || e >= 55292 && e <= 55295 || e >= 40908 && e <= 40959 || e >= 43389 && e <= 43391 || e >= 12800 && e <= 13055 || e >= 13056 && e <= 13183 || e >= 13184 && e <= 13311 || e === 12592 || e === 12687 || e === 12448 || e === 12352 || e === 12294 || e === 12348 ? !0 : !1;
}, enyo.g11n.Char.isIdeo = function(t) {
    var n;
    return !t || t.length < 1 ? !1 : (n = t.charCodeAt(0), enyo.g11n.Char._isIdeoLetter(n) || enyo.g11n.Char._isIdeoOther(n));
}, enyo.g11n.Char.isPunct = function(t) {
    var n, r;
    return !t || t.length < 1 ? !1 : (n = enyo.g11n.Utils.getNonLocaleFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/character_data/chartype.punct.json"
    }), r = n && t.charAt(0) in n, enyo.g11n.Utils.releaseAllJsonFiles(), r);
}, enyo.g11n.Char._space = {
    9: 1,
    10: 1,
    11: 1,
    12: 1,
    13: 1,
    32: 1,
    133: 1,
    160: 1,
    5760: 1,
    6158: 1,
    8192: 1,
    8193: 1,
    8194: 1,
    8195: 1,
    8196: 1,
    8197: 1,
    8198: 1,
    8199: 1,
    8200: 1,
    8201: 1,
    8202: 1,
    8232: 1,
    8233: 1,
    8239: 1,
    8287: 1,
    12288: 1
}, enyo.g11n.Char.isSpace = function(t) {
    var n;
    return !t || t.length < 1 ? !1 : (n = t.charCodeAt(0), n in enyo.g11n.Char._space);
}, enyo.g11n.Char.toUpper = function(t, n) {
    var r;
    if (!t)
        return undefined;
    n || (n = enyo.g11n.currentLocale()), r = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/character_data",
        locale: n
    });
    if (!r || !r.upperMap)
        r = enyo.g11n.Utils.getJsonFile({
            root: enyo.g11n.Utils._getEnyoRoot(),
            path: "base/character_data",
            locale: new enyo.g11n.Locale("en")
        });
    return r && r.upperMap !== undefined ? enyo.g11n.Char._strTrans(t, r.upperMap) : (enyo.g11n.Utils.releaseAllJsonFiles(), t);
}, enyo.g11n.Char.isLetter = function(t) {
    var n, r, i, s;
    return !t || t.length < 1 ? !1 : (n = t.charAt(0), r = t.charCodeAt(0), i = enyo.g11n.Utils.getNonLocaleFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/character_data/chartype.letter.json"
    }), s = i && n in i || enyo.g11n.Char._isIdeoLetter(r), enyo.g11n.Utils.releaseAllJsonFiles(), s);
}, enyo.g11n.Char.getIndexChars = function(t) {
    var n, r, i, s, o = [];
    t ? typeof t == "string" ? r = new enyo.g11n.Locale(t) : r = t : r = enyo.g11n.currentLocale(), enyo.g11n.Char._resources || (enyo.g11n.Char._resources = {}), enyo.g11n.Char._resources[r.locale] || (enyo.g11n.Char._resources[r.locale] = new enyo.g11n.Resources({
        root: enyo.g11n.Utils._getEnyoRoot() + "/base",
        locale: r
    })), i = enyo.g11n.Char._resources[r.locale], n = enyo.g11n.Char._resources[r.locale].$L({
        key: "indexChars",
        value: "ABCDEFGHIJKLMNOPQRSTUVWXYZ#"
    });
    for (s = 0; s < n.length; s++)
        o.push(n[s]);
    return o;
}, enyo.g11n.Char.getBaseString = function(t, n) {
    var r, i;
    if (!t)
        return undefined;
    n ? typeof n == "string" ? i = new enyo.g11n.Locale(n) : i = n : i = enyo.g11n.currentLocale(), r = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/character_data",
        locale: i
    });
    if (!r || enyo.g11n.Char._objectIsEmpty(r))
        r = enyo.g11n.Utils.getJsonFile({
            root: enyo.g11n.Utils._getEnyoRoot(),
            path: "base/character_data",
            locale: new enyo.g11n.Locale("en")
        });
    return r && r.baseChars !== undefined && (t = enyo.g11n.Char._strTrans(t, r.baseChars)), enyo.g11n.Utils.releaseAllJsonFiles(), t;
};

// javascript/timezone.js

enyo.g11n._TZ = enyo.g11n._TZ || {}, enyo.g11n.TzFmt = function(e) {
    return this.setTZ(), e !== undefined && e.TZ !== undefined && this.setCurrentTimeZone(e.TZ), enyo.g11n.Utils.releaseAllJsonFiles(), this;
}, enyo.g11n.TzFmt.prototype = {
    toString: function() {
        return this.TZ !== undefined ? this.TZ : this._TZ;
    },
    setTZ: function() {
        var e = (new Date).toString(), t = enyo.indexOf("(", e), n = enyo.indexOf(")", e), r = e.slice(t + 1, n);
        r !== undefined ? this.setCurrentTimeZone(r) : this.setDefaultTimeZone();
    },
    getCurrentTimeZone: function() {
        return this.TZ !== undefined ? this.TZ : this._TZ !== undefined ? this._TZ : "unknown";
    },
    setCurrentTimeZone: function(e) {
        this._TZ = e, this.TZ = e;
    },
    setDefaultTimeZone: function() {
        var e = (new Date).toString().match(/\(([A-Z]+)\)/);
        this._TZ = e && e[1] || "PST";
    }
};

// javascript/datetime.js

enyo.g11n.DateFmt = function(e) {
    var t, n, r, i, s;
    s = this, s._normalizedComponents = {
        date: {
            dm: "DM",
            md: "DM",
            my: "MY",
            ym: "MY",
            d: "D",
            dmy: "",
            dym: "",
            mdy: "",
            myd: "",
            ydm: "",
            ymd: ""
        },
        time: {
            az: "AZ",
            za: "AZ",
            a: "A",
            z: "Z",
            "": ""
        },
        timeLength: {
            "short": "small",
            medium: "small",
            "long": "big",
            full: "big"
        }
    }, s._normalizeDateTimeFormatComponents = function(e) {
        var t = e.dateComponents, n = e.timeComponents, r, i, o, u = e.time;
        return e.date && t && (r = s._normalizedComponents.date[t], r === undefined && (enyo.log("date component error: '" + t + "'"), r = "")), u && n !== undefined && (o = s._normalizedComponents.timeLength[u], o === undefined && (enyo.log("time format error: " + u), o = "small"), i = s._normalizedComponents.time[n], i === undefined && enyo.log("time component error: '" + n + "'")), e.dateComponents = r, e.timeComponents = i, e;
    }, s._finalDateTimeFormat = function(e, t, n) {
        var r = s.dateTimeFormatHash.dateTimeFormat || s.defaultFormats.dateTimeFormat;
        return e && t ? s._buildDateTimeFormat(r, "dateTime", {
            TIME: t,
            DATE: e
        }) : t || e || "M/d/yy h:mm a";
    }, s._buildDateTimeFormat = function(e, t, n) {
        var r, i, o = [], u = s._getTokenizedFormat(e, t), a;
        for (r = 0, i = u.length; r < i && u[r] !== undefined; ++r)
            a = n[u[r]], a ? o.push(a) : o.push(u[r]);
        return o.join("");
    }, s._getDateFormat = function(e, t) {
        var n = s._formatFetch(e, t.dateComponents, "Date");
        if (e !== "full" && t.weekday) {
            var r = s._formatFetch(t.weekday === !0 ? e : t.weekday, "", "Weekday");
            n = s._buildDateTimeFormat(s.dateTimeFormatHash.weekDateFormat || s.defaultFormats.weekDateFormat, "weekDate", {
                WEEK: r,
                DATE: n
            });
        }
        return n;
    }, s._getTimeFormat = function(e, t) {
        var n = s._formatFetch(e, "", s.twelveHourFormat ? "Time12" : "Time24");
        if (t.timeComponents) {
            var r = "time" + t.timeComponents, i = r + "Format";
            return s._buildDateTimeFormat(s.dateTimeFormatHash[i] || s.defaultFormats[i], r, {
                TIME: n,
                AM: "a",
                ZONE: "zzz"
            });
        }
        return n;
    }, s.ParserChunks = {
        full: "('[^']+'|y{2,4}|M{1,4}|d{1,2}|z{1,3}|a|h{1,2}|H{1,2}|k{1,2}|K{1,2}|E{1,4}|m{1,2}|s{1,2}|[^A-Za-z']+)?",
        dateTime: "(DATE|TIME|[^A-Za-z]+|'[^']+')?",
        weekDate: "(DATE|WEEK|[^A-Za-z]+|'[^']+')?",
        timeA: "(TIME|AM|[^A-Za-z]+|'[^']+')?",
        timeZ: "(TIME|ZONE|[^A-Za-z]+|'[^']+')?",
        timeAZ: "(TIME|AM|ZONE|[^A-Za-z]+|'[^']+')?"
    }, s._getTokenizedFormat = function(e, t) {
        var n = t && s.ParserChunks[t] || s.ParserChunks.full, r = e.length, i = [], o, u, a = new RegExp(n, "g");
        while (r > 0) {
            o = a.exec(e)[0], u = o.length;
            if (u === 0)
                return [];
            i.push(o), r -= u;
        }
        return i;
    }, s._formatFetch = function(e, t, n, r) {
        switch (e) {
            case "short":
            case "medium":
            case "long":
            case "full":
            case "small":
            case "big":
            case "default":
                return s.dateTimeFormatHash[e + (t || "") + n];
            default:
                return e;
        }
    }, s._dayOffset = function(e, t) {
        var n;
        return t = s._roundToMidnight(t), e = s._roundToMidnight(e), n = (e.getTime() - t.getTime()) / 864e5, n;
    }, s._roundToMidnight = function(e) {
        var t = e.getTime(), n = new Date;
        return n.setTime(t), n.setHours(0), n.setMinutes(0), n.setSeconds(0), n.setMilliseconds(0), n;
    }, s.inputParams = e, typeof e == "undefined" || !e.locale ? t = enyo.g11n.formatLocale() : typeof e.locale == "string" ? t = new enyo.g11n.Locale(e.locale) : t = e.locale, t.language || t.useDefaultLang(), this.locale = t, typeof e == "string" ? s.formatType = e : typeof e == "undefined" ? (e = {
        format: "short"
    }, s.formatType = e.format) : s.formatType = e.format, !s.formatType && !e.time && !e.date && (e ? e.format = "short" : e = {
        format: "short"
    }, s.formatType = "short"), s.dateTimeHash = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/datetime_data",
        locale: t,
        type: "language"
    }), s.dateTimeHash || (s.dateTimeHash = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/datetime_data",
        locale: new enyo.g11n.Locale("en_us")
    })), s.dateTimeFormatHash = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/formats",
        locale: t,
        type: "region"
    }), s.dateTimeFormatHash || (s.dateTimeFormatHash = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/formats",
        locale: new enyo.g11n.Locale("en_us"),
        type: "region"
    })), s.rb = new enyo.g11n.Resources({
        root: enyo.g11n.Utils._getEnyoRoot() + "/base",
        locale: t
    }), typeof e == "undefined" || typeof e.twelveHourFormat == "undefined" ? s.twelveHourFormat = s.dateTimeFormatHash.is12HourDefault : s.twelveHourFormat = e.twelveHourFormat;
    if (s.formatType)
        switch (s.formatType) {
            case "short":
            case "medium":
            case "long":
            case "full":
            case "default":
                s.partsLength = s.formatType, i = s._finalDateTimeFormat(s._getDateFormat(s.formatType, e), s._getTimeFormat(s.formatType, e), e);
                break;
            default:
                i = s.formatType;
        }
    else
        e = s._normalizeDateTimeFormatComponents(e), e.time && (r = s._getTimeFormat(e.time, e), s.partsLength = e.time), e.date && (n = s._getDateFormat(e.date, e), s.partsLength = e.date), i = s._finalDateTimeFormat(n, r, e);
    s.tokenized = s._getTokenizedFormat(i), s.partsLength || (s.partsLength = "full");
}, enyo.g11n.DateFmt.prototype.toString = function() {
    return this.tokenized.join("");
}, enyo.g11n.DateFmt.prototype.isAmPm = function() {
    return this.twelveHourFormat;
}, enyo.g11n.DateFmt.prototype.isAmPmDefault = function() {
    return this.dateTimeFormatHash.is12HourDefault;
}, enyo.g11n.DateFmt.prototype.getFirstDayOfWeek = function() {
    return this.dateTimeFormatHash.firstDayOfWeek;
}, enyo.g11n.DateFmt.prototype._format = function(e, t) {
    var n = this, r, i = [], s, o, u, a, f, l, c, h;
    c = n.dateTimeHash;
    for (f = 0, l = t.length; f < l && t[f] !== undefined; f++) {
        switch (t[f]) {
            case "yy":
                s = "", i.push((e.getFullYear() + "").substring(2));
                break;
            case "yyyy":
                s = "", i.push(e.getFullYear());
                break;
            case "MMMM":
                s = "long", o = "month", u = e.getMonth();
                break;
            case "MMM":
                s = "medium", o = "month", u = e.getMonth();
                break;
            case "MM":
                s = "short", o = "month", u = e.getMonth();
                break;
            case "M":
                s = "single", o = "month", u = e.getMonth();
                break;
            case "dd":
                s = "short", o = "date", u = e.getDate() - 1;
                break;
            case "d":
                s = "single", o = "date", u = e.getDate() - 1;
                break;
            case "zzz":
                s = "", typeof n.timezoneFmt == "undefined" && (typeof n.inputParams == "undefined" || typeof n.inputParams.TZ == "undefined" ? n.timezoneFmt = new enyo.g11n.TzFmt : n.timezoneFmt = new enyo.g11n.TzFmt(n.inputParams)), a = n.timezoneFmt.getCurrentTimeZone(), i.push(a);
                break;
            case "a":
                s = "", e.getHours() > 11 ? i.push(c.pm) : i.push(c.am);
                break;
            case "K":
                s = "", i.push(e.getHours() % 12);
                break;
            case "KK":
                s = "", r = e.getHours() % 12, i.push(r < 10 ? "0" + ("" + r) : r);
                break;
            case "h":
                s = "", r = e.getHours() % 12, i.push(r === 0 ? 12 : r);
                break;
            case "hh":
                s = "", r = e.getHours() % 12, i.push(r === 0 ? 12 : r < 10 ? "0" + ("" + r) : r);
                break;
            case "H":
                s = "", i.push(e.getHours());
                break;
            case "HH":
                s = "", r = e.getHours(), i.push(r < 10 ? "0" + ("" + r) : r);
                break;
            case "k":
                s = "", r = e.getHours() % 12, i.push(r === 0 ? 12 : r);
                break;
            case "kk":
                s = "", r = e.getHours() % 12, i.push(r === 0 ? 12 : r < 10 ? "0" + ("" + r) : r);
                break;
            case "EEEE":
                s = "long", o = "day", u = e.getDay();
                break;
            case "EEE":
                s = "medium", o = "day", u = e.getDay();
                break;
            case "EE":
                s = "short", o = "day", u = e.getDay();
                break;
            case "E":
                s = "single", o = "day", u = e.getDay();
                break;
            case "mm":
            case "m":
                s = "";
                var p = e.getMinutes();
                i.push(p < 10 ? "0" + ("" + p) : p);
                break;
            case "ss":
            case "s":
                s = "";
                var d = e.getSeconds();
                i.push(d < 10 ? "0" + ("" + d) : d);
                break;
            default:
                h = /'([A-Za-z]+)'/.exec(t[f]), s = "", h ? i.push(h[1]) : i.push(t[f]);
        }
        s && i.push(c[s][o][u]);
    }
    return i.join("");
}, enyo.g11n.DateFmt.prototype.format = function(e) {
    var t = this;
    return typeof e != "object" || t.tokenized === null ? (enyo.warn("DateFmt.format: no date to format or no format loaded"), undefined) : this._format(e, t.tokenized);
}, enyo.g11n.DateFmt.prototype.formatRelativeDate = function(e, t) {
    var n, r, i, s, o = this;
    if (typeof e != "object")
        return undefined;
    typeof t == "undefined" ? (r = !1, n = new Date) : (typeof t.referenceDate != "undefined" ? n = t.referenceDate : n = new Date, typeof t.verbosity != "undefined" ? r = t.verbosity : r = !1), s = o._dayOffset(n, e);
    switch (s) {
        case 0:
            return o.dateTimeHash.relative.today;
        case 1:
            return o.dateTimeHash.relative.yesterday;
        case -1:
            return o.dateTimeHash.relative.tomorrow;
        default:
            if (s < 7)
                return o.dateTimeHash.long.day[e.getDay()];
            if (s < 30) {
                if (r) {
                    i = new enyo.g11n.Template(o.dateTimeHash.relative.thisMonth);
                    var u = Math.floor(s / 7);
                    return i.formatChoice(u, {
                        num: u
                    });
                }
                return o.format(e);
            }
            if (s < 365) {
                if (r) {
                    i = new enyo.g11n.Template(o.dateTimeHash.relative.thisYear);
                    var a = Math.floor(s / 30);
                    return i.formatChoice(a, {
                        num: a
                    });
                }
                return o.format(e);
            }
            return o.format(e);
    }
}, enyo.g11n.DateFmt.prototype.formatRange = function(e, t) {
    var n, r, i, s, o, u, a, f, l = this.partsLength || "medium", c = this.dateTimeHash, h = this.dateTimeFormatHash;
    return !e && !t ? "" : !e || !t ? this.format(e || t) : (t.getTime() < e.getTime() && (n = t, t = e, e = n), a = new Date(e.getTime()), a.setHours(0), a.setMinutes(0), a.setSeconds(0), a.setMilliseconds(0), f = new Date(t.getTime()), f.setHours(0), f.setMinutes(0), f.setSeconds(0), f.setMilliseconds(0), f.getTime() - a.getTime() === 864e5 ? (s = "shortTime" + (this.twelveHourFormat ? "12" : "24"), r = this._getTokenizedFormat(h[s]), s = l + "Date", i = this._getTokenizedFormat(h[s]), u = new enyo.g11n.Template(this.rb.$L({
        key: "dateRangeConsecutiveDays",
        value: "#{startDate} #{startTime} - #{endDate} #{endTime}"
    })), u.evaluate({
        startTime: this._format(e, r),
        endTime: this._format(t, r),
        startDate: this._format(e, i),
        endDate: this._format(t, i)
    })) : e.getYear() === t.getYear() ? (o = l === "short" || l === "single" ? (e.getFullYear() + "").substring(2) : e.getFullYear(), e.getMonth() === t.getMonth() ? e.getDate() === t.getDate() ? (s = "shortTime" + (this.twelveHourFormat ? "12" : "24"), r = this._getTokenizedFormat(h[s]), s = l + "Date", i = this._getTokenizedFormat(h[s]), u = new enyo.g11n.Template(this.rb.$L({
        key: "dateRangeWithinDay",
        value: "#{startTime}-#{endTime}, #{date}"
    })), u.evaluate({
        startTime: this._format(e, r),
        endTime: this._format(t, r),
        date: this._format(e, i)
    })) : (s = l + "DDate", i = this._getTokenizedFormat(h[s]), u = new enyo.g11n.Template(this.rb.$L({
        key: "dateRangeWithinMonth",
        value: "#{month} #{startDate}-#{endDate}, #{year}"
    })), u.evaluate({
        month: c[l].month[e.getMonth()],
        startDate: this._format(e, i),
        endDate: this._format(t, i),
        year: o
    })) : (l === "full" ? l = "long" : l === "single" && (l = "short"), s = l + "DMDate", i = this._getTokenizedFormat(h[s]), u = new enyo.g11n.Template(this.rb.$L({
        key: "dateRangeWithinYear",
        value: "#{start} - #{end}, #{year}"
    })), u.evaluate({
        start: this._format(e, i),
        end: this._format(t, i),
        year: o
    }))) : t.getYear() - e.getYear() < 2 ? (s = l + "Date", i = this._getTokenizedFormat(h[s]), u = new enyo.g11n.Template(this.rb.$L({
        key: "dateRangeWithinConsecutiveYears",
        value: "#{start} - #{end}"
    })), u.evaluate({
        start: this._format(e, i),
        end: this._format(t, i)
    })) : (l === "full" ? l = "long" : l === "single" && (l = "short"), s = l + "MYDate", i = this._getTokenizedFormat(h[s]), u = new enyo.g11n.Template(this.rb.$L({
        key: "dateRangeMultipleYears",
        value: "#{startMonthYear} - #{endMonthYear}"
    })), u.evaluate({
        startMonthYear: this._format(e, i),
        endMonthYear: this._format(t, i)
    })));
};

// javascript/numberfmt.js

enyo.g11n.NumberFmt = function(e) {
    var t, n, r, i, s, o, u;
    typeof e == "number" ? this.fractionDigits = e : e && typeof e.fractionDigits == "number" && (this.fractionDigits = e.fractionDigits), !e || !e.locale ? this.locale = enyo.g11n.formatLocale() : typeof e.locale == "string" ? this.locale = new enyo.g11n.Locale(e.locale) : this.locale = e.locale, this.style = e && e.style || "number", t = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/formats",
        locale: this.locale,
        type: "region"
    }), this.style === "currency" && (r = e && e.currency || t && t.currency && t.currency.name, r ? (r = r.toUpperCase(), this.currencyStyle = e && e.currencyStyle === "iso" ? "iso" : "common", n = enyo.g11n.Utils.getNonLocaleFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/number_data/iso4217.json"
    }), n ? (i = n[r], i || (s = new enyo.g11n.Locale(r), u = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "base/formats",
        locale: s,
        type: "region"
    }), u && (r = u.currency && u.currency.name, i = n[r])), i || (r = t && t.currency && t.currency.name, i = n[r]), i ? (this.sign = this.currencyStyle !== "iso" ? i.sign : r, this.fractionDigits = e && typeof e.fractionDigits == "number" ? e.fractionDigits : i.digits) : this.style = "number") : (r = t && t.currency && t.currency.name, this.sign = r)) : (r = t && t.currency && t.currency.name, this.sign = r), r ? (o = t && t.currency && t.currency[this.currencyStyle] || "#{sign} #{amt}", this.currencyTemplate = new enyo.g11n.Template(o)) : this.style = "number"), t ? (this.decimal = t.numberDecimal || ".", this.divider = t.numberDivider || ",", t.dividerIndex ? t.dividerIndex === 4 ? this.numberGroupRegex = /(\d+)(\d{4})/ : this.numberGroupRegex = /(\d+)(\d{3})/ : this.numberGroupRegex = /(\d+)(\d{3})/, this.percentageSpace = t.percentageSpace) : (this.decimal = ".", this.divider = ",", this.numberGroupRegex = /(\d+)(\d{3})/, this.percentageSpace = !1), this.numberGroupRegex.compile(this.numberGroupRegex), enyo.g11n.Utils.releaseAllJsonFiles();
}, enyo.g11n.NumberFmt.prototype.format = function(e) {
    try {
        var t, n, r, i;
        typeof e == "string" && (e = parseFloat(e));
        if (isNaN(e))
            return undefined;
        typeof this.fractionDigits != "undefined" ? t = e.toFixed(this.fractionDigits) : t = e.toString(), n = t.split("."), r = n[0];
        while (this.divider && this.numberGroupRegex.test(r))
            r = r.replace(this.numberGroupRegex, "$1" + this.divider + "$2");
        return n[0] = r, i = n.join(this.decimal), this.style === "currency" && this.currencyTemplate ? i = this.currencyTemplate.evaluate({
            amt: i,
            sign: this.sign
        }) : this.style === "percent" && (i += this.percentageSpace ? " %" : "%"), i;
    } catch (s) {
        return enyo.log("formatNumber error : " + s), (e || "0") + "." + (this.fractionDigits || "");
    }
};

// javascript/duration.js

enyo.g11n.DurationFmt = function(e) {
    typeof e == "undefined" ? (this.locale = enyo.g11n.formatLocale(), this.style = "short") : (e.locale ? typeof e.locale == "string" ? this.locale = new enyo.g11n.Locale(e.locale) : this.locale = e.locale : this.locale = enyo.g11n.formatLocale(), e.style ? (this.style = e.style, this.style !== "short" && this.style !== "medium" && this.style !== "long" && this.style !== "full" && (this.style = "short")) : this.style = "short"), this.rb = new enyo.g11n.Resources({
        root: enyo.g11n.Utils._getEnyoRoot() + "/base",
        locale: this.locale
    }), this.style === "short" ? this.parts = {
        years: new enyo.g11n.Template(this.rb.$L({
            key: "yearsFormatShort",
            value: "##{num}y"
        })),
        months: new enyo.g11n.Template(this.rb.$L({
            key: "monthsFormatShort",
            value: "##{num}m"
        })),
        weeks: new enyo.g11n.Template(this.rb.$L({
            key: "weeksFormatShort",
            value: "##{num}w"
        })),
        days: new enyo.g11n.Template(this.rb.$L({
            key: "daysFormatShort",
            value: "##{num}d"
        })),
        hours: new enyo.g11n.Template(this.rb.$L({
            key: "hoursFormatShort",
            value: "##{num}"
        })),
        minutes: new enyo.g11n.Template(this.rb.$L({
            key: "minutesFormatShort",
            value: "##{num}"
        })),
        seconds: new enyo.g11n.Template(this.rb.$L({
            key: "secondsFormatShort",
            value: "##{num}"
        })),
        separator: this.rb.$L({
            key: "separatorShort",
            value: " "
        }),
        dateTimeSeparator: this.rb.$L({
            key: "dateTimeSeparatorShort",
            value: " "
        }),
        longTimeFormat: new enyo.g11n.Template(this.rb.$L({
            key: "longTimeFormatShort",
            value: "#{hours}:#{minutes}:#{seconds}"
        })),
        shortTimeFormat: new enyo.g11n.Template(this.rb.$L({
            key: "shortTimeFormatShort",
            value: "#{minutes}:#{seconds}"
        })),
        finalSeparator: ""
    } : this.style === "medium" ? this.parts = {
        years: new enyo.g11n.Template(this.rb.$L({
            key: "yearsFormatMedium",
            value: "##{num} yr"
        })),
        months: new enyo.g11n.Template(this.rb.$L({
            key: "monthsFormatMedium",
            value: "##{num} mo"
        })),
        weeks: new enyo.g11n.Template(this.rb.$L({
            key: "weeksFormatMedium",
            value: "##{num} wk"
        })),
        days: new enyo.g11n.Template(this.rb.$L({
            key: "daysFormatMedium",
            value: "##{num} dy"
        })),
        hours: new enyo.g11n.Template(this.rb.$L({
            key: "hoursFormatMedium",
            value: "##{num}"
        })),
        minutes: new enyo.g11n.Template(this.rb.$L({
            key: "minutesFormatMedium",
            value: "##{num}"
        })),
        seconds: new enyo.g11n.Template(this.rb.$L({
            key: "secondsFormatMedium",
            value: "##{num}"
        })),
        separator: this.rb.$L({
            key: "separatorMedium",
            value: " "
        }),
        dateTimeSeparator: this.rb.$L({
            key: "dateTimeSeparatorMedium",
            value: " "
        }),
        longTimeFormat: new enyo.g11n.Template(this.rb.$L({
            key: "longTimeFormatMedium",
            value: "#{hours}:#{minutes}:#{seconds}"
        })),
        shortTimeFormat: new enyo.g11n.Template(this.rb.$L({
            key: "shortTimeFormatMedium",
            value: "#{minutes}:#{seconds}"
        })),
        finalSeparator: ""
    } : this.style === "long" ? this.parts = {
        years: new enyo.g11n.Template(this.rb.$L({
            key: "yearsFormatLong",
            value: "1#1 yr|1>##{num} yrs"
        })),
        months: new enyo.g11n.Template(this.rb.$L({
            key: "monthsFormatLong",
            value: "1#1 mon|1>##{num} mos"
        })),
        weeks: new enyo.g11n.Template(this.rb.$L({
            key: "weeksFormatLong",
            value: "1#1 wk|1>##{num} wks"
        })),
        days: new enyo.g11n.Template(this.rb.$L({
            key: "daysFormatLong",
            value: "1#1 day|1>##{num} dys"
        })),
        hours: new enyo.g11n.Template(this.rb.$L({
            key: "hoursFormatLong",
            value: "0#|1#1 hr|1>##{num} hrs"
        })),
        minutes: new enyo.g11n.Template(this.rb.$L({
            key: "minutesFormatLong",
            value: "0#|1#1 min|1>##{num} min"
        })),
        seconds: new enyo.g11n.Template(this.rb.$L({
            key: "secondsFormatLong",
            value: "0#|1#1 sec|1>##{num} sec"
        })),
        separator: this.rb.$L({
            key: "separatorLong",
            value: " "
        }),
        dateTimeSeparator: this.rb.$L({
            key: "dateTimeSeparatorLong",
            value: " "
        }),
        longTimeFormat: "",
        shortTimeFormat: "",
        finalSeparator: ""
    } : this.style === "full" && (this.parts = {
        years: new enyo.g11n.Template(this.rb.$L({
            key: "yearsFormatFull",
            value: "1#1 year|1>##{num} years"
        })),
        months: new enyo.g11n.Template(this.rb.$L({
            key: "monthsFormatFull",
            value: "1#1 month|1>##{num} months"
        })),
        weeks: new enyo.g11n.Template(this.rb.$L({
            key: "weeksFormatFull",
            value: "1#1 week|1>##{num} weeks"
        })),
        days: new enyo.g11n.Template(this.rb.$L({
            key: "daysFormatFull",
            value: "1#1 day|1>##{num} days"
        })),
        hours: new enyo.g11n.Template(this.rb.$L({
            key: "hoursFormatFull",
            value: "0#|1#1 hour|1>##{num} hours"
        })),
        minutes: new enyo.g11n.Template(this.rb.$L({
            key: "minutesFormatFull",
            value: "0#|1#1 minute|1>##{num} minutes"
        })),
        seconds: new enyo.g11n.Template(this.rb.$L({
            key: "secondsFormatFull",
            value: "0#|1#1 second|1>##{num} seconds"
        })),
        separator: this.rb.$L({
            key: "separatorFull",
            value: ", "
        }),
        dateTimeSeparator: this.rb.$L({
            key: "dateTimeSeparatorFull",
            value: ", "
        }),
        longTimeFormat: "",
        shortTimeFormat: "",
        finalSeparator: this.rb.$L({
            key: "finalSeparatorFull",
            value: " and "
        })
    }), this.dateParts = ["years", "months", "weeks", "days"], this.timeParts = ["hours", "minutes", "seconds"];
}, enyo.g11n.DurationFmt.prototype.format = function(e) {
    var t = [], n = [], r, i, s, o;
    if (!e || enyo.g11n.Char._objectIsEmpty(e))
        return "";
    for (i = 0; i < this.dateParts.length; i++)
        s = e[this.dateParts[i]] || 0, s > 0 && (o = this.parts[this.dateParts[i]].formatChoice(s, {
            num: s
        }), o && o.length > 0 && (t.length > 0 && t.push(this.parts.separator), t.push(o)));
    if (this.style === "long" || this.style === "full")
        for (i = 0; i < this.timeParts.length; i++)
            s = e[this.timeParts[i]] || 0, s > 0 && (o = this.parts[this.timeParts[i]].formatChoice(s, {
                num: s
            }), o && o.length > 0 && (n.length > 0 && n.push(this.parts.separator), n.push(o)));
    else {
        var u = {}, a = e.hours ? this.parts.longTimeFormat : this.parts.shortTimeFormat;
        for (i = 0; i < this.timeParts.length; i++) {
            s = e[this.timeParts[i]] || 0;
            if (s < 10)
                switch (this.timeParts[i]) {
                    case "minutes":
                        e.hours && (s = "0" + s);
                        break;
                    case "seconds":
                        s = "0" + s;
                        break;
                    case "hours":
                }
            o = this.parts[this.timeParts[i]].formatChoice(s, {
                num: s
            }), o && o.length > 0 && (u[this.timeParts[i]] = o);
        }
        n.push(a.evaluate(u));
    }
    r = t, r.length > 0 && n.length > 0 && r.push(this.parts.dateTimeSeparator);
    for (i = 0; i < n.length; i++)
        r.push(n[i]);
    return r.length > 2 && this.style === "full" && (r[r.length - 2] = this.parts.finalSeparator), r.join("") || "";
};

// loadLocalizedCss.js

enyo.requiresWindow(function() {
    enyo.loader.machine.sheet("assets/resources/css/" + enyo.g11n.currentLocale().language + ".css");
});

// javascript/name.js

enyo.g11n.NamePriv = {
    _findPrefix: function(t, n, r) {
        var i, s, o, u = [], a;
        if (t.length > 0 && n)
            for (a = t.length; a > 0; a--)
                o = t.slice(0, a), i = o.join(r ? "" : " "), s = i.toLowerCase(), s = s.replace(/[,\.]/g, ""), s in n && (u = u.concat(r ? i : o), t = t.slice(a), a = t.length + 1);
        return u;
    },
    _isEuroName: function(t) {
        var n, r;
        for (r = 0; r < t.length; r++) {
            n = t.charAt(r);
            if (!enyo.g11n.Char.isIdeo(n) && !enyo.g11n.Char.isPunct(n) && !enyo.g11n.Char.isSpace(n))
                return !0;
        }
        return !1;
    },
    _findLastConjunction: function(t, n) {
        var r = -1, i, s, o;
        o = new enyo.g11n.Resources({
            locale: n,
            root: enyo.g11n.Utils._getEnyoRoot() + "/name"
        });
        for (i = 0; i < t.length; i++) {
            s = t[i];
            if (typeof s == "string") {
                if ("and" === s.toLowerCase() || "or" === s.toLowerCase() || "&" === s || "+" === s)
                    r = i;
                if (o.$L({
                    key: "and1",
                    value: "and"
                }).toLowerCase() === s.toLowerCase() || o.$L({
                    key: "and2",
                    value: "and"
                }).toLowerCase() === s.toLowerCase() || o.$L({
                    key: "or1",
                    value: "or"
                }).toLowerCase() === s.toLowerCase() || o.$L({
                    key: "or2",
                    value: "or"
                }).toLowerCase() === s.toLowerCase() || "&" === s || "+" === s)
                    r = i;
            }
        }
        return r;
    },
    _joinArrayOrString: function(t) {
        var n;
        if (typeof t == "object") {
            for (n = 0; n < t.length; n++)
                t[n] = enyo.g11n.NamePriv._joinArrayOrString(t[n]);
            return t.join(" ");
        }
        return t;
    },
    _shallowCopy: function(t, n) {
        var r;
        for (r in t)
            r !== undefined && t[r] && (n[r] = t[r]);
    }
}, enyo.g11n.Name = function(e, t) {
    var n, r, i, s, o = [], u, a, f, l, c, h, p, d, v, m;
    if (!e || e === "")
        return this;
    !t || !t.locale ? n = enyo.g11n.currentLocale() : typeof t.locale == "string" ? n = new enyo.g11n.Locale(t.locale) : n = t.locale, this.locale = n;
    if (typeof e == "object")
        return this.prefix = e.prefix, this.givenName = e.givenName, this.middleName = e.middleName, this.familyName = e.familyName, this.suffix = e.suffix, this;
    s = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "name/data",
        locale: new enyo.g11n.Locale("en")
    }), r = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "name/data",
        locale: n
    }), u = e.search(/\s*[,\(\[\{<]/), u !== -1 && (v = e.substring(u), v = v.replace(/\s+/g, " "), c = v.split(" "), m = enyo.g11n.NamePriv._findLastConjunction(c, n), m > -1 ? v = undefined : e = e.substring(0, u));
    if (!r || !r.name || r.name.isAsianLocale && enyo.g11n.NamePriv._isEuroName(e))
        r = s;
    i = r.name, !i.isAsianLocale || enyo.g11n.NamePriv._isEuroName(e) ? (e = e.replace(/\s+/g, " "), o = e.trim().split(" "), d = !1) : (e = e.replace(/\s+/g, ""), o = e.trim().split(""), d = !0);
    if (o.length > 1)
        for (u = o.length; u > 0; u--) {
            a = o.slice(0, u), f = a.join(d ? "" : " "), l = f.toLowerCase(), l = l.replace(/[,\.]/g, "");
            if (i.titles && enyo.indexOf(l, i.titles) > -1 || i.honorifics && enyo.indexOf(l, i.honorifics) > -1)
                this.prefix ? (d || (this.prefix += " "), this.prefix += f) : this.prefix = f, o = o.slice(u), u = o.length;
        }
    if (o.length > 1)
        for (u = o.length; u > 0; u--)
            c = o.slice(-u), h = c.join(d ? "" : " "), p = h.toLowerCase(), p = p.replace(/[,\.]/g, ""), i.suffixes && enyo.indexOf(p, i.suffixes) > -1 && (this.suffix ? (d || (this.suffix = " " + this.suffix), this.suffix = h + this.suffix) : this.suffix = h, o = o.slice(0, o.length - u), u = o.length);
    return v && (this.suffix = this.suffix && this.suffix + v || v), o.length > 1 && !d && (o = this._adjoinAuxillaries(o, i)), d ? this._parseAsianName(o, i) : n.language === "es" ? this._parseSpanishName(o, n) : this._parseNameDefaultLocale(o, n), this._joinNameArrays(), enyo.g11n.Utils.releaseAllJsonFiles(), this;
}, enyo.g11n.Name.prototype = {
    _parseSpanishName: function(e, t) {
        var n;
        e.length === 1 ? this.prefix || typeof e[0] == "object" ? this.familyName = e[0] : this.givenName = e[0] : e.length === 2 ? (this.givenName = e[0], this.familyName = e[1]) : e.length === 3 ? (n = enyo.g11n.NamePriv._findLastConjunction(e, t), n === 1 ? this.givenName = e : (this.givenName = e[0], this.familyName = e.slice(1))) : e.length > 3 && (n = enyo.g11n.NamePriv._findLastConjunction(e, t), n > 0 ? (this.givenName = e.splice(0, n + 2), e.length > 1 ? (this.familyName = e.splice(e.length - 2, 2), e.length > 0 && (this.middleName = e)) : e.length === 1 && (this.familyName = e[0])) : (this.givenName = e.splice(0, 1), this.familyName = e.splice(e.length - 2, 2), this.middleName = e));
    },
    _parseNameDefaultLocale: function(e, t) {
        var n;
        e.length === 1 ? this.prefix || typeof e[0] == "object" ? this.familyName = e[0] : this.givenName = e[0] : e.length === 2 ? (this.givenName = e[0], this.familyName = e[1]) : e.length >= 3 && (n = enyo.g11n.NamePriv._findLastConjunction(e, t), n > 0 ? (this.givenName = e.slice(0, n + 2), n + 1 < e.length - 1 && (this.familyName = e.splice(e.length - 1, 1), n + 2 < e.length - 1 && (this.middleName = e.slice(n + 2, e.length - n - 3)))) : (this.givenName = e[0], this.middleName = e.slice(1, e.length - 1), this.familyName = e[e.length - 1]));
    },
    _parseAsianName: function(e, t) {
        var n = enyo.g11n.NamePriv._findPrefix(e, t.knownFamilyNames, !0);
        n && n.length > 0 ? (this.familyName = n.join(""), this.givenName = e.slice(this.familyName.length).join("")) : this.suffix || this.prefix ? this.familyName = e.join("") : this.givenName = e.join("");
    },
    _joinNameArrays: function() {
        var t;
        for (t in this)
            this[t] !== undefined && typeof this[t] == "object" && this[t] instanceof Array && (this[t] = enyo.g11n.NamePriv._joinArrayOrString(this[t]));
    },
    _adjoinAuxillaries: function(e, t) {
        var n, r, i, s, o;
        if (t.auxillaries && (e.length > 2 || this.prefix))
            for (n = 0; n < e.length - 1; n++)
                for (r = e.length; r > n; r--)
                    i = e.slice(n, r), s = i.join(" "), o = s.toLowerCase(), o = o.replace(/[,\.]/g, ""), o in t.auxillaries && (e.splice(n, r + 1 - n, i.concat(e[r])), r = n);
        return e;
    },
    getSortName: function(e) {
        var t, n, r, i, s, o, u, a;
        if (!this.familyName)
            return undefined;
        e ? typeof e == "string" ? t = new enyo.g11n.Locale(e) : t = e : t = this.locale, i = enyo.g11n.Utils.getJsonFile({
            root: enyo.g11n.Utils._getEnyoRoot(),
            path: "name/data",
            locale: t
        }), i || (i = enyo.g11n.Utils.getJsonFile({
            root: enyo.g11n.Utils._getEnyoRoot(),
            path: "name/data",
            locale: new enyo.g11n.Locale("en")
        })), o = i.name;
        if (o)
            if (o.sortByHeadWord)
                typeof this.familyName == "string" ? (n = this.familyName.replace(/\s+/g, " "), u = n.trim().split(" ")) : u = this.familyName, r = enyo.g11n.NamePriv._findPrefix(u, o.auxillaries, !1), r && r.length > 0 && (typeof this.familyName == "string" ? (s = r.join(" "), n = this.familyName.substring(s.length + 1) + ", " + s) : n = this.familyName.slice(r.length).join(" ") + ", " + this.familyName.slice(0, r.length).join(" "));
            else if (o.knownFamilyNames && this.familyName) {
                u = this.familyName.split("");
                var f = enyo.g11n.NamePriv._findPrefix(u, o.knownFamilyNames, !0);
                n = "";
                for (a = 0; a < f.length; a++)
                    n += o.knownFamilyNames[f[a]] || "";
            }
        return enyo.g11n.Utils.releaseAllJsonFiles(), n || this.familyName;
    },
    clone: function() {
        var e = new enyo.g11n.Name;
        return enyo.g11n.NamePriv._shallowCopy(this, e), e;
    }
};

// javascript/format.js

enyo.g11n.Name.shortName = "short", enyo.g11n.Name.mediumName = "medium", enyo.g11n.Name.longName = "long", enyo.g11n.NameFmt = function(e) {
    var t, n;
    if (!e)
        return undefined;
    e.locale ? typeof e.locale == "string" ? t = new enyo.g11n.Locale(e.locale) : t = e.locale : t = enyo.g11n.currentLocale(), n = e.style || enyo.g11n.Name.mediumName, this.langInfo = enyo.g11n.Utils.getJsonFile({
        root: enyo.g11n.Utils._getEnyoRoot(),
        path: "name/data",
        locale: t
    });
    if (!this.langInfo || !this.langInfo.name)
        this.langInfo = enyo.g11n.Utils.getJsonFile({
            root: enyo.g11n.Utils._getEnyoRoot(),
            path: "name/data",
            locale: new enyo.g11n.Locale("en")
        });
    this.langInfo && this.langInfo.name && (this.template = new enyo.g11n.Template(this.langInfo.name.formats[n])), t.language === "es" && n !== enyo.g11n.Name.longName && (this.useFirstFamilyName = !0);
    switch (n) {
        case enyo.g11n.Name.shortName:
            this.defaultEuroTemplate = new enyo.g11n.Template("#{givenName} #{familyName}"), this.defaultAsianTemplate = new enyo.g11n.Template("#{familyName}#{givenName}");
            break;
        case enyo.g11n.Name.longName:
            this.defaultEuroTemplate = new enyo.g11n.Template("#{prefix} #{givenName} #{middleName} #{familyName}#{suffix}"), this.defaultAsianTemplate = new enyo.g11n.Template("#{prefix}#{familyName}#{givenName}#{middleName}#{suffix}"), this.useFirstFamilyName = !1;
            break;
        case enyo.g11n.Name.mediumName:
        default:
            this.defaultEuroTemplate = new enyo.g11n.Template("#{givenName} #{middleName} #{familyName}"), this.defaultAsianTemplate = new enyo.g11n.Template("#{prefix}#{familyName}#{givenName}#{middleName}");
    }
    return this.isAsianLocale = this.langInfo.name.isAsianLocale, enyo.g11n.Utils.releaseAllJsonFiles(), this;
}, enyo.g11n.NameFmt.prototype = {
    getTemplate: function() {
        return this.template;
    },
    format: function(e) {
        var t, n, r, i;
        if (!e || typeof e != "object")
            return undefined;
        if ((!e.givenName || enyo.g11n.NamePriv._isEuroName(e.givenName)) && (!e.middleName || enyo.g11n.NamePriv._isEuroName(e.middleName)) && (!e.familyName || enyo.g11n.NamePriv._isEuroName(e.familyName))) {
            i = !1, r = e.clone(), r.suffix && enyo.g11n.Char.isPunct(r.suffix.charAt(0)) === !1 && (r.suffix = " " + r.suffix);
            if (this.useFirstFamilyName && e.familyName) {
                var s = r.familyName.trim().split(" ");
                s.length > 1 && (s = r._adjoinAuxillaries(s, this.langInfo.name)), r.familyName = s[0];
            }
            r._joinNameArrays();
        } else
            i = !0, r = e;
        !this.template || i !== this.isAsianLocale ? n = i ? this.defaultAsianTemplate : this.defaultEuroTemplate : n = this.template;
        try {
            t = n.evaluate(r);
        } catch (o) {
            enyo.error("Could not format name: " + o), n = new enyo.g11n.Template("#{givenName} #{middleName} #{familyName}"), t = n.evaluate(r);
        }
        return t.replace(/\s+/g, " ").trim();
    }
};

// base/javascript/utils.js

enyo.g11n.PhoneUtils = {
    fieldOrder: ["vsc", "iddPrefix", "countryCode", "trunkAccess", "cic", "emergency", "mobilePrefix", "serviceCode", "areaCode", "subscriberNumber", "extension"],
    states: ["none", "unknown", "plus", "idd", "cic", "service", "cell", "area", "vsc", "country", "personal", "special", "trunk", "premium", "emergency", "service2", "service3", "service4", "cic2", "cic3", "start", "local"],
    deepCopy: function e(t, n) {
        var r;
        for (r in t)
            r && (typeof t[r] == "object" ? (n[r] = {}, e(t[r], n[r])) : n[r] = t[r]);
        return n;
    },
    normPhoneReg: function(e) {
        var t;
        switch (e) {
            case "us":
            case "ca":
            case "ag":
            case "bs":
            case "bb":
            case "dm":
            case "do":
            case "gd":
            case "jm":
            case "kn":
            case "lc":
            case "vc":
            case "tt":
            case "ai":
            case "bm":
            case "vg":
            case "ky":
            case "ms":
            case "tc":
            case "as":
            case "vi":
            case "pr":
            case "mp":
            case "tl":
            case "gu":
                t = "us";
                break;
            case "it":
            case "sm":
            case "va":
                t = "it";
                break;
            case "fr":
            case "gf":
            case "mq":
            case "gp":
            case "bl":
            case "mf":
            case "re":
                t = "fr";
                break;
            default:
                t = e;
        }
        return t;
    },
    mapMCCtoCC: function(e) {
        return e ? (enyo.g11n.PhoneUtils.mcc2cc || (enyo.g11n.PhoneUtils.mcc2cc = enyo.g11n.Utils.getNonLocaleFile({
            root: enyo.g11n.Utils._getEnyoRoot("../"),
            path: "phone/base/data/maps/mcc2cc.json"
        })), enyo.g11n.PhoneUtils.mcc2cc[e]) : undefined;
    },
    mapMCCtoRegion: function(e) {
        return e ? (enyo.g11n.PhoneUtils.mcc2reg || (enyo.g11n.PhoneUtils.mcc2reg = enyo.g11n.Utils.getNonLocaleFile({
            root: enyo.g11n.Utils._getEnyoRoot("../"),
            path: "phone/base/data/maps/mcc2reg.json"
        })), enyo.g11n.PhoneUtils.normPhoneReg(enyo.g11n.PhoneUtils.mcc2reg[e]) || "unknown") : undefined;
    },
    mapCCtoRegion: function(e) {
        return e ? (enyo.g11n.PhoneUtils.cc2reg || (enyo.g11n.PhoneUtils.cc2reg = enyo.g11n.Utils.getNonLocaleFile({
            root: enyo.g11n.Utils._getEnyoRoot("../"),
            path: "phone/base/data/maps/cc2reg.json"
        })), enyo.g11n.PhoneUtils.cc2reg[e] || "unknown") : undefined;
    },
    mapRegiontoCC: function(e) {
        return e ? (enyo.g11n.PhoneUtils.reg2cc || (enyo.g11n.PhoneUtils.reg2cc = enyo.g11n.Utils.getNonLocaleFile({
            root: enyo.g11n.Utils._getEnyoRoot("../"),
            path: "phone/base/data/maps/reg2cc.json"
        })), enyo.g11n.PhoneUtils.reg2cc[e] || "0") : undefined;
    },
    mapAreaToRegion: function(e, t) {
        return e ? (enyo.g11n.PhoneUtils.area2reg || (enyo.g11n.PhoneUtils.area2reg = enyo.g11n.Utils.getNonLocaleFile({
            root: enyo.g11n.Utils._getEnyoRoot("../"),
            path: "phone/base/data/maps/area2reg.json"
        })), e in enyo.g11n.PhoneUtils.area2reg ? enyo.g11n.PhoneUtils.area2reg[e][t] || enyo.g11n.PhoneUtils.area2reg[e]["default"] : enyo.g11n.PhoneUtils.mapCCtoRegion(e)) : undefined;
    },
    _getCharacterCode: function(t) {
        if (t >= "0" && t <= "9")
            return t - "0";
        switch (t) {
            case "+":
                return 10;
            case "*":
                return 11;
            case "#":
                return 12;
            case "^":
                return 13;
            case "p":
            case "P":
            case "t":
            case "T":
            case "w":
            case "W":
                return -1;
            case "x":
            case "X":
                return -1;
        }
        return -2;
    },
    parseImsi: function(e) {
        var t, n, r, i, s, o = 0, u, a = {};
        if (!e)
            return undefined;
        n = 0, r = new enyo.g11n.StatesData({
            path: "phone/base/data/states",
            locale: new enyo.g11n.Locale("_mnc")
        });
        if (!r)
            return undefined;
        while (n < e.length) {
            t = enyo.g11n.PhoneUtils._getCharacterCode(e.charAt(n));
            if (t >= 0) {
                u = r.get(o)[t];
                if (u < 0) {
                    o = u, u = -u - 1, s = enyo.g11n.PhoneUtils.states[u], s === "area" ? i = n + 1 : s === "special" ? i = n : i = 6, a.mcc = e.substring(0, 3), a.mnc = e.substring(3, i), a.msin = e.substring(i);
                    break;
                }
                o = u, n++;
            } else
                t === -1 ? n++ : n++;
        }
        return o > 0 && (n >= e.length && n >= 6 ? (a.mcc = e.substring(0, 3), a.mnc = e.substring(3, 6), a.msin = e.substring(6)) : a = undefined), enyo.g11n.Utils.releaseAllJsonFiles(), a;
    }
};

// base/javascript/phoneloc.js

enyo.g11n.PhoneLoc = function(e) {
    var t, n;
    return e && (e.mcc && (t = enyo.g11n.phoneLocale(), n = enyo.g11n.PhoneUtils.mapMCCtoRegion(e.mcc)), e.locale && (typeof e.locale == "string" ? t = new enyo.g11n.Locale(e.locale) : t = e.locale, n || (n = t.region)), e.countryCode && (t = enyo.g11n.phoneLocale(), n = enyo.g11n.PhoneUtils.mapCCtoRegion(e.countryCode))), n || (t = enyo.g11n.phoneLocale(), n = t.region), this.language = t.language, this.variant = t.variant, this.region = enyo.g11n.PhoneUtils.normPhoneReg(n), this;
}, enyo.g11n.PhoneLoc.prototype = new enyo.g11n.Locale;

// base/javascript/plan.js

enyo.g11n.NumPlan = function(e) {
    this.locale = new enyo.g11n.PhoneLoc(e);
    var t = enyo.g11n.Utils.getNonLocaleFile({
        root: enyo.g11n.Utils._getEnyoRoot("../"),
        path: "phone/base/data/plans/" + this.locale.region + ".json",
        locale: this.locale
    });
    return t || (t = enyo.g11n.Utils.getNonLocaleFile({
        root: enyo.g11n.Utils._getEnyoRoot("../"),
        path: "phone/base/data/plans/unknown.json",
        locale: new enyo.g11n.Locale("unknown_unknown")
    })), t && enyo.g11n.PhoneUtils.deepCopy(t, this), this;
};

// base/javascript/states.js

enyo.g11n.StatesData = function(e) {
    return this.root = e && e.root || enyo.g11n.Utils._getEnyoRoot("../"), this.path = e && e.path || "", this.locale = e && e.locale || enyo.g11n.phoneLocale(), this.data = enyo.g11n.Utils.getNonLocaleFile({
        root: this.root,
        path: this.path + "/" + this.locale.region + ".json",
        locale: this.locale
    }), this.data || (this.data = enyo.g11n.Utils.getNonLocaleFile({
        root: this.root,
        path: this.path + "/unknown.json",
        locale: new enyo.g11n.Locale("unknown_unknown")
    })), this;
}, enyo.g11n.StatesData.prototype = {
    get: function(e) {
        return this.data && this.data[e] || undefined;
    }
};

// format/javascript/styles.js

enyo.g11n.FmtStyles = function(e) {
    return this.locale = e || enyo.g11n.phoneLocale(), this.styles = enyo.g11n.Utils.getNonLocaleFile({
        root: enyo.g11n.Utils._getEnyoRoot("../"),
        path: "phone/format/data/" + this.locale.region + ".json",
        locale: this.locale
    }), this.styles || (this.locale = new enyo.g11n.Locale("unknown_unknown"), this.styles = enyo.g11n.Utils.getNonLocaleFile({
        root: enyo.g11n.Utils._getEnyoRoot("../"),
        path: "phone/format/data/unknown.json",
        locale: this.locale
    })), this;
}, enyo.g11n.FmtStyles.prototype = {
    getStyle: function(t) {
        return this.styles[t] || this.styles["default"];
    },
    hasStyle: function(t) {
        return this.styles[t] !== undefined;
    },
    getExamples: function() {
        var t, n;
        t = [];
        if (this.styles)
            for (n in this.styles)
                this.styles[n].example && t.push({
                    key: n,
                    value: this.styles[n].example
                });
        return t;
    }
}, enyo.g11n.FmtStyles.getRegions = function() {
    return [{
            countryCode: "us",
            countryName: "US, Canada, Caribbean"
        }, {
            countryCode: "au",
            countryName: "Australia"
        }, {
            countryCode: "be",
            countryName: "Belgium"
        }, {
            countryCode: "cn",
            countryName: "China (PRC)"
        }, {
            countryCode: "fr",
            countryName: "France"
        }, {
            countryCode: "de",
            countryName: "Germany"
        }, {
            countryCode: "hk",
            countryName: "Hong Kong"
        }, {
            countryCode: "in",
            countryName: "India"
        }, {
            countryCode: "ie",
            countryName: "Ireland"
        }, {
            countryCode: "it",
            countryName: "Italy"
        }, {
            countryCode: "lu",
            countryName: "Luxembourg"
        }, {
            countryCode: "mx",
            countryName: "Mexico"
        }, {
            countryCode: "nl",
            countryName: "Netherlands"
        }, {
            countryCode: "nz",
            countryName: "New Zealand"
        }, {
            countryCode: "sg",
            countryName: "Singapore"
        }, {
            countryCode: "es",
            countryName: "Spain"
        }, {
            countryCode: "gb",
            countryName: "United Kingdom"
        }];
};

// format/javascript/format.js

enyo.g11n.PhoneFmt = function(e) {
    return this.locale = new enyo.g11n.PhoneLoc(e), this.style = e && e.style || "default", this.plan = new enyo.g11n.NumPlan({
        locale: this.locale
    }), this.styles = new enyo.g11n.FmtStyles(this.locale), enyo.g11n.Utils.releaseAllJsonFiles(), this;
}, enyo.g11n.PhoneFmt.prototype = {
    _substituteDigits: function(t, n, r) {
        var i, s = "", o = 0, u;
        if (!t)
            return s;
        if (typeof n == "object") {
            if (t.length > n.length)
                throw "part " + t + " is too big. We do not have a format template to format it.";
            i = n[t.length - 1];
        } else
            i = n;
        for (u = 0; u < i.length; u++)
            i.charAt(u) === "X" ? (s += t.charAt(o), o++) : s += i.charAt(u);
        if (r && o < t.length - 1)
            throw "too many digits in " + t + " for format " + i;
        return s;
    },
    format: function(t, n) {
        var r, i, s, o, u, a, f, l = "", c, h, p;
        try {
            a = this.style, t.countryCode ? a = t.mobilePrefix ? "internationalmobile" : "international" : t.mobilePrefix !== undefined ? a = "mobile" : t.serviceCode !== undefined && this.styles.hasStyle("service") && (a = "service"), u = !n || !n.partial, p = this.styles.getStyle(a), h = this.locale, p = (u ? p.whole : p.partial) || p;
            for (f in enyo.g11n.PhoneUtils.fieldOrder)
                typeof f == "string" && typeof enyo.g11n.PhoneUtils.fieldOrder[f] == "string" && (s = enyo.g11n.PhoneUtils.fieldOrder[f], t[s] !== undefined && (p[s] !== undefined ? (i = p[s], s === "trunkAccess" && t.areaCode === undefined && t.serviceCode === undefined && t.mobilePrefix === undefined && (i = "X"), r = this._substituteDigits(t[s], i, s === "subscriberNumber"), l += r, s === "countryCode" && (o = t.countryCode.replace(/[wWpPtT\+#\*]/g, ""), h = new enyo.g11n.PhoneLoc({
                    countryCode: o
                }), c = new enyo.g11n.FmtStyles(h), p = c.getStyle(t.mobilePrefix !== undefined ? "internationalmobile" : "international"))) : (enyo.warn("PhoneFmt.format: cannot find format template for field " + s + ", region " + h.region + ", style " + a), l += t[s])));
        } catch (d) {
            if (typeof d != "string")
                throw d;
            l = "";
            for (f in enyo.g11n.PhoneUtils.fieldOrder)
                typeof f == "string" && typeof enyo.g11n.PhoneUtils.fieldOrder[f] == "string" && t[enyo.g11n.PhoneUtils.fieldOrder[f]] !== undefined && (l += t[enyo.g11n.PhoneUtils.fieldOrder[f]], enyo.g11n.PhoneUtils.fieldOrder[f] === "countryCode" && (l += " "));
        }
        return enyo.g11n.Utils.releaseAllJsonFiles(), l;
    },
    reformat: function(e, t) {
        var n = "", r, i, s = 0, o = 0, u = 0, a, f, l, c, h, p;
        if (!e || typeof e != "string")
            return e;
        p = this.plan && this.plan.commonFormatChars || " ()-/.";
        for (r = 0; r < e.length; r++)
            i = e.charAt(r), enyo.g11n.PhoneUtils._getCharacterCode(i) > -1 ? s++ : enyo.indexOf(i, p) > -1 ? o++ : u++;
        if (this.plan && this.plan.fieldLengths && this.plan.fieldLengths.minLocalLength && s < this.plan.fieldLengths.minLocalLength && u > 0)
            return e;
        if (s < u)
            return e;
        var d = new enyo.g11n.PhoneNumber(e, {
            locale: this.locale
        });
        return d.invalid ? e : this.format(d, t);
    }
};

// parse/javascript/handler.js

enyo.g11n.StateHandler = function() {
    return this;
}, enyo.g11n.StateHandler.prototype = {
    processSubscriberNumber: function(e, t, n) {
        var r;
        r = e.search(/[xwtp]/i), r > -1 ? (r > 0 && (t.subscriberNumber = e.substring(0, r)), t.extension = e.substring(r).replace("x", "")) : t.subscriberNumber = e, n.plan.fieldLengths && n.plan.fieldLengths.maxLocalLength && t.subscriberNumber && t.subscriberNumber.length > n.plan.fieldLengths.maxLocalLength && (t.invalid = !0);
    },
    processFieldWithSubscriberNumber: function(e, t, n, r, i, s, o) {
        var u, a, f;
        return f = n.search(/[xwtp]/i), t !== undefined && t > 0 ? (a = t, s.plan.trunkCode === "0" && n.charAt(0) === "0" && (a += s.plan.trunkCode.length)) : a = r + 1 - t, i[e] !== undefined ? this.processSubscriberNumber(n, i, s) : (!o && s.plan.trunkCode === "0" && n.charAt(0) === "0" ? (i.trunkAccess = n.charAt(0), i[e] = n.substring(1, a)) : i[e] = n.substring(0, a), n.length > a && this.processSubscriberNumber(n.substring(a), i, s)), u = {
            number: ""
        }, u;
    },
    processField: function(e, t, n, r, i, s) {
        var o = {}, u;
        return t !== undefined && t > 0 ? (u = t, s.plan.trunkCode === "0" && n.charAt(0) === "0" && (u += s.plan.trunkCode.length)) : u = r + 1 - t, i[e] !== undefined ? (this.processSubscriberNumber(n, i, s), o.number = "") : (s.plan.trunkCode === "0" && n.charAt(0) === "0" ? (i.trunkAccess = n.charAt(0), i[e] = n.substring(1, u), o.skipTrunk = !0) : i[e] = n.substring(0, u), o.number = n.length > u ? n.substring(u) : ""), o;
    },
    trunk: function(e, t, n, r) {
        var i, s;
        return n.trunkAccess !== undefined ? (this.processSubscriberNumber(e, n, r), e = "") : (s = r.plan.trunkCode.length, n.trunkAccess = e.substring(0, s), e = e.length > s ? e.substring(s) : ""), i = {
            number: e
        }, i;
    },
    plus: function(e, t, n, r) {
        var i = {};
        return n.iddPrefix !== undefined ? (this.processSubscriberNumber(e, n, r), i.number = "") : (n.iddPrefix = e.substring(0, 1), i = {
            number: e.substring(1),
            push: new enyo.g11n.Locale("_idd")
        }), i;
    },
    idd: function(e, t, n, r) {
        var i = {};
        return n.iddPrefix !== undefined ? (this.processSubscriberNumber(e, n, r), i.number = "") : (n.iddPrefix = e.substring(0, t + 1), i = {
            number: e.substring(t + 1),
            push: new enyo.g11n.Locale("_idd")
        }), i;
    },
    country: function(e, t, n, r) {
        var i, s, o;
        return n.countryCode = e.substring(0, t + 1), s = n.countryCode.replace(/[wWpPtT\+#\*]/g, ""), o = new enyo.g11n.PhoneLoc({
            countryCode: s
        }), i = {
            number: e.substring(t + 1),
            push: o
        }, i;
    },
    cic: function(e, t, n, r) {
        return this.processField("cic", r.plan.fieldLengths.cic, e, t, n, r);
    },
    service: function(e, t, n, r) {
        return this.processFieldWithSubscriberNumber("serviceCode", r.plan.fieldLengths.serviceCode, e, t, n, r);
    },
    area: function(e, t, n, r) {
        var i, s, o, u;
        s = e.search(/[xwtp]/i), u = s > -1 ? s : e.length, r.plan.fieldLengths.areaCode > 0 ? (o = r.plan.fieldLengths.areaCode, r.plan.trunkCode === e.charAt(0) && (o += r.plan.trunkCode.length, u -= r.plan.trunkCode.length)) : o = t + 1 - r.plan.fieldLengths.areaCode, r.plan.trunkCode === e.charAt(0) ? (n.trunkAccess = e.charAt(0), e.length > 1 && (n.areaCode = e.substring(1, o)), e.length > o && this.processSubscriberNumber(e.substring(o), n, r)) : r.plan.fieldLengths.maxLocalLength !== undefined ? n.trunkAccess !== undefined || n.mobilePrefix !== undefined || n.countryCode !== undefined || u > r.plan.fieldLengths.maxLocalLength ? (n.areaCode = e.substring(0, o), e.length > o && this.processSubscriberNumber(e.substring(o), n, r)) : this.processSubscriberNumber(e, n, r) : (n.areaCode = e.substring(0, o), e.length > o && this.processSubscriberNumber(e.substring(o), n, r));
        if (r.plan.findExtensions !== undefined && n.subscriberNumber !== undefined) {
            var a = enyo.indexOf("-", n.subscriberNumber);
            a > -1 && (n.subscriberNumber = n.subscriberNumber.substring(0, a), n.extension = n.subscriberNumber.substring(a + 1));
        }
        return i = {
            number: ""
        }, i;
    },
    none: function(e, t, n, r) {
        var i;
        return r.plan && e.charAt(0) === r.plan.trunkCode && (n.trunkAccess = e.charAt(0), e = e.substring(1)), e.length > 0 && (this.processSubscriberNumber(e, n, r), t > 0 && t < e.length && (n.invalid = !0)), i = {
            number: ""
        }, i;
    },
    vsc: function(e, t, n, r) {
        var i, s, o;
        return n.vsc === undefined ? (s = r.plan.fieldLengths.vsc || 0, s !== undefined && s > 0 ? o = s : o = t + 1 - s, n.vsc = e.substring(0, o), e = e.length > o ? "^" + e.substring(o) : "") : (this.processSubscriberNumber(e, n, r), e = ""), i = {
            number: e
        }, i;
    },
    cell: function(e, t, n, r) {
        return this.processFieldWithSubscriberNumber("mobilePrefix", r.plan.fieldLengths.mobilePrefix, e, t, n, r);
    },
    personal: function(e, t, n, r) {
        return this.processFieldWithSubscriberNumber("serviceCode", r.plan.fieldLengths.personal, e, t, n, r);
    },
    emergency: function(e, t, n, r) {
        return this.processFieldWithSubscriberNumber("emergency", r.plan.fieldLengths.emergency, e, t, n, r, !0);
    },
    premium: function(e, t, n, r) {
        return this.processFieldWithSubscriberNumber("serviceCode", r.plan.fieldLengths.premium, e, t, n, r);
    },
    special: function(e, t, n, r) {
        return this.processFieldWithSubscriberNumber("serviceCode", r.plan.fieldLengths.special, e, t, n, r);
    },
    service2: function(e, t, n, r) {
        return this.processFieldWithSubscriberNumber("serviceCode", r.plan.fieldLengths.service2, e, t, n, r);
    },
    service3: function(e, t, n, r) {
        return this.processFieldWithSubscriberNumber("serviceCode", r.plan.fieldLengths.service3, e, t, n, r);
    },
    service4: function(e, t, n, r) {
        return this.processFieldWithSubscriberNumber("serviceCode", r.plan.fieldLengths.service4, e, t, n, r);
    },
    cic2: function(e, t, n, r) {
        return this.processField("cic", r.plan.fieldLengths.cic2, e, t, n, r);
    },
    cic3: function(e, t, n, r) {
        return this.processField("cic", r.plan.fieldLengths.cic3, e, t, n, r);
    },
    start: function(e, t, n, r) {
        return {
            number: e
        };
    },
    local: function(e, t, n, r) {
        return this.processSubscriberNumber(e, n, r), {
            number: ""
        };
    }
}, enyo.g11n.CSStateHandler = function() {
    return this;
}, enyo.g11n.CSStateHandler.prototype = new enyo.g11n.StateHandler, enyo.g11n.CSStateHandler.prototype.special = function(e, t, n, r) {
    var i;
    return e.charAt(0) === "0" ? (n.trunkAccess = e.charAt(0), n.areaCode = e.substring(1, t)) : n.areaCode = e.substring(0, t), this.processSubscriberNumber(e.substring(t), n, r), i = {
        number: ""
    }, i;
}, enyo.g11n.USStateHandler = function() {
    return this;
}, enyo.g11n.USStateHandler.prototype = new enyo.g11n.StateHandler, enyo.g11n.USStateHandler.prototype.vsc = function(e, t, n, r) {
    var i, s, o;
    return n.vsc = e, i = {
        number: ""
    }, i;
}, enyo.g11n._handlerFactory = function(e, t) {
    if (typeof t.contextFree == "boolean" && t.contextFree === !1)
        return new enyo.g11n.CSStateHandler;
    var n = e && e.region || "zz";
    switch (n) {
        case "us":
            return new enyo.g11n.USStateHandler;
        default:
            return new enyo.g11n.StateHandler;
    }
};

// parse/javascript/phone.js

enyo.g11n.PhoneNumber = function(e, t) {
    var n, r, i = 0, s, o, u, a, f, l, c, h, p;
    this.locale = new enyo.g11n.PhoneLoc(t);
    if (!e || typeof e == "string" && e.length === 0)
        return this;
    if (typeof e == "object")
        return enyo.g11n.PhoneUtils.deepCopy(e, this), this;
    e = "^" + e.replace(/\^/g, ""), u = new enyo.g11n.StatesData({
        root: enyo.g11n.Utils._getEnyoRoot("../"),
        path: "phone/parse/data",
        locale: this.locale
    }), p = new enyo.g11n.NumPlan({
        locale: this.locale
    }), o = {
        stateTable: u,
        plan: p,
        handler: enyo.g11n._handlerFactory(this.locale, p)
    }, e = this._stripFormatting(e), c = 14, n = 0;
    while (n < e.length)
        r = enyo.g11n.PhoneUtils._getCharacterCode(e.charAt(n)), r >= 0 ? (s = u.get(i)[r], s === -1 && u.get(i)[c] !== -1 && (s = u.get(i)[c]), s < 0 ? (s = -s - 1, a = enyo.g11n.PhoneUtils.states[s], e.charAt(0) === "^" ? f = o.handler[a](e.slice(1), n - 1, this, o) : f = o.handler[a](e, n, this, o), e = f.number, n = 0, i = 0, f.push !== undefined ? (h = f.push, l = new enyo.g11n.StatesData({
            root: enyo.g11n.Utils._getEnyoRoot("../"),
            path: "phone/parse/data",
            locale: h
        }), l && (u = l), l = new enyo.g11n.NumPlan({
            locale: h
        }), l && (p = l), o = {
            stateTable: u,
            plan: p,
            handler: enyo.g11n._handlerFactory(h, p)
        }) : f.skipTrunk !== undefined && (r = enyo.g11n.PhoneUtils._getCharacterCode(o.plan.trunkCode), i = u.get(i)[r])) : (i = s, n++)) : r === -1 ? n++ : n++;
    return i > 0 && n > 0 && (e.charAt(0) === "^" ? f = o.handler.none(e.slice(1), n - 1, this, o) : f = o.handler.none(e, n, this, o)), enyo.g11n.Utils.releaseAllJsonFiles(), this;
}, enyo.g11n.PhoneNumber.prototype = {
    _stripFormatting: function(t) {
        var n = "", r;
        for (r = 0; r < t.length; r++)
            enyo.g11n.PhoneUtils._getCharacterCode(t.charAt(r)) >= -1 && (n += t.charAt(r));
        return n;
    },
    _getPrefix: function() {
        return this.areaCode || this.serviceCode || this.mobilePrefix || "";
    },
    _hasPrefix: function() {
        return this._getPrefix() !== "";
    },
    _xor: function(e, t) {
        return e === undefined && t === undefined || e !== undefined && t !== undefined ? !1 : !0;
    },
    _join: function() {
        var e, t, n = "";
        try {
            for (e in enyo.g11n.PhoneUtils.fieldOrder)
                typeof e == "string" && typeof enyo.g11n.PhoneUtils.fieldOrder[e] == "string" && (t = enyo.g11n.PhoneUtils.fieldOrder[e], this[t] !== undefined && (n += this[t]));
        } catch (r) {
            throw enyo.warn("caught exception in _join: " + r), r;
        }
        return n;
    },
    compare: function(e) {
        var t = 100, n = {
            "590": 1,
            "594": 1,
            "596": 1,
            "262": 1
        }, r = {
            "378": 1,
            "379": 1
        }, i, s, o = enyo.g11n.PhoneUtils.mapRegiontoCC(this.locale.region);
        if (!this.subscriberNumber || !e.subscriberNumber || this.subscriberNumber !== e.subscriberNumber)
            return 0;
        if (this._xor(this.extension, e.extension) || this.extension !== e.extension)
            return 0;
        if (this._xor(this.countryCode, e.countryCode))
            switch (this.locale.region) {
                case "fr":
                    if (this.countryCode in n || e.countryCode in n) {
                        if (this.areaCode !== e.areaCode || this.mobilePrefix !== e.mobilePrefix)
                            t -= 100;
                    } else
                        t -= 16;
                    break;
                case "it":
                    this.countryCode in r || e.countryCode in r ? this.areaCode !== e.areaCode && (t -= 100) : t -= 16;
                    break;
                default:
                    t -= 16;
                    if (this.countryCode !== undefined && this.countryCode !== o || e.countryCode !== undefined && e.countryCode !== o)
                        t -= 16;
            }
        else if (this.countryCode !== e.countryCode)
            if (e.countryCode === "33" || this.countryCode === "33")
                if (this.countryCode in n || e.countryCode in n) {
                    if (this.areaCode !== e.areaCode || this.mobilePrefix !== e.mobilePrefix)
                        t -= 100;
                } else
                    t -= 100;
            else
                this.countryCode === "39" || e.countryCode === "39" ? this.countryCode in r || e.countryCode in r ? this.areaCode !== e.areaCode && (t -= 100) : t -= 100 : t -= 100;
        return this._xor(this.serviceCode, e.serviceCode) ? t -= 20 : this.serviceCode !== e.serviceCode && (t -= 100), this._xor(this.mobilePrefix, e.mobilePrefix) ? t -= 20 : this.mobilePrefix !== e.mobilePrefix && (t -= 100), this._xor(this.areaCode, e.areaCode) ? t -= 12 : this.areaCode !== e.areaCode && (t -= 100), i = this._getPrefix(), s = e._getPrefix(), i && s && i !== s && (t -= 100), t < 0 ? t = 0 : t > 100 && (t = 100), t;
    },
    equals: function(t) {
        var n;
        if (t.locale && this.locale && !this.locale.equals(t.locale) && (!this.countryCode || !t.countryCode))
            return !1;
        for (n in t)
            if (n !== undefined && this[n] !== undefined && typeof this[n] != "object") {
                if (t[n] === undefined)
                    return enyo.error("PhoneNumber.equals: other is missing property " + n + " which has the value " + this[n] + " in this"), enyo.error("this is : " + JSON.stringify(this)), enyo.error("other is: " + JSON.stringify(t)), !1;
                if (this[n] !== t[n])
                    return enyo.error("PhoneNumber.equals: difference in property " + n), enyo.error("this is : " + JSON.stringify(this)), enyo.error("other is: " + JSON.stringify(t)), !1;
            }
        for (n in t)
            if (n !== undefined && t[n] !== undefined && typeof t[n] != "object") {
                if (this[n] === undefined)
                    return enyo.error("PhoneNumber.equals: this is missing property " + n + " which has the value " + t[n] + " in the other"), enyo.error("this is : " + JSON.stringify(this)), enyo.error("other is: " + JSON.stringify(t)), !1;
                if (this[n] !== t[n])
                    return enyo.error("PhoneNumber.equals: difference in property " + n), enyo.error("this is : " + JSON.stringify(this)), enyo.error("other is: " + JSON.stringify(t)), !1;
            }
        return !0;
    },
    normalize: function(e) {
        var t, n, r = "", i, s, o, u, a, f, l, c;
        o = new enyo.g11n.PhoneNumber(this), f = e && e.homeLocale ? new enyo.g11n.PhoneLoc({
            locale: e.homeLocale
        }) : enyo.g11n.phoneLocale(), l = e ? new enyo.g11n.PhoneLoc(e) : f, c = o.countryCode && new enyo.g11n.PhoneLoc({
            countryCode: o.countryCode
        }) || o.locale || l, t = new enyo.g11n.NumPlan({
            locale: l
        }), n = new enyo.g11n.NumPlan({
            locale: c
        }), e && e.assistedDialing && n.fieldLengths && typeof n.fieldLengths.maxLocalLength != "undefined" && !o.trunkAccess && !o.iddPrefix && o.subscriberNumber && o.subscriberNumber.length > n.fieldLengths.maxLocalLength ? (u = new enyo.g11n.PhoneNumber("+" + this._join(), {
            locale: this.locale
        }), a = u.countryCode && enyo.g11n.PhoneUtils.mapCCtoRegion(u.countryCode), a && a !== "unknown" && a !== "sg" && (o = u, c = o.countryCode && new enyo.g11n.PhoneLoc({
            countryCode: o.countryCode
        }) || o.locale || l, n = new enyo.g11n.NumPlan({
            locale: c
        }))) : e && e.assistedDialing && o.invalid && l.region !== o.locale.region && (u = new enyo.g11n.PhoneNumber(this._join(), {
            locale: l
        }), u && !u.invalid && (o = u));
        if (!o.invalid && e && e.assistedDialing) {
            if (o.subscriberNumber && (!e.manualDialing || o.iddPrefix || o.countryCode || o.trunkAccess))
                if (l.region !== c.region)
                    !o._hasPrefix() && e.defaultAreaCode && c.region === f.region && (!n.fieldLengths.minLocalLength || o.subscriberNumber.length >= n.fieldLengths.minLocalLength) && (o.areaCode = e.defaultAreaCode, !n.skipTrunk && n.trunkCode && (o.trunkAccess = n.trunkCode)), o.trunkAccess && n.skipTrunk && delete o.trunkAccess, e.sms ? f.region === "us" && l.region !== "us" ? c.region !== "us" ? (o.iddPrefix = "011", o.countryCode = o.countryCode || enyo.g11n.PhoneUtils.mapRegiontoCC(c.region)) : e.networkType === "cdma" ? (delete o.iddPrefix, delete o.countryCode, o.areaCode && (o.trunkAccess = "1")) : o.areaCode && (o.iddPrefix = "+", o.countryCode = "1", delete o.trunkAccess) : (o.iddPrefix = e.networkType === "cdma" ? t.iddCode : "+", o.countryCode = o.countryCode || enyo.g11n.PhoneUtils.mapRegiontoCC(c.region)) : o._hasPrefix() && !o.countryCode && (o.countryCode = enyo.g11n.PhoneUtils.mapRegiontoCC(c.region)), o.countryCode && !e.sms && (o.iddPrefix = e.networkType === "cdma" ? t.iddCode : "+");
                else {
                    e.defaultAreaCode && (n.dialingPlan === "open" ? !o.trunkAccess && o._hasPrefix() && n.trunkCode && (o.trunkAccess = n.trunkCode) : o._hasPrefix() ? n.trunkRequired && n.trunkCode && (o.trunkAccess = o.trunkAccess || n.trunkCode) : c.region === f.region && (o.areaCode = e.defaultAreaCode, n.trunkRequired && n.trunkCode && (o.trunkAccess = o.trunkAccess || n.trunkCode)));
                    if (e.sms && f.region === "us" && l.region !== "us")
                        o.iddPrefix = "011", n.skipTrunk && o.trunkAccess && delete o.trunkAccess;
                    else if (o.iddPrefix || o.countryCode)
                        delete o.iddPrefix, delete o.countryCode, (n.dialingPlan === "open" || n.trunkRequired) && n.trunkCode && (o.trunkAccess = n.trunkCode);
                }
        } else
            o.invalid || (!o._hasPrefix() && e && e.defaultAreaCode && c.region === f.region && (o.areaCode = e.defaultAreaCode), !o.countryCode && o._hasPrefix() && (o.countryCode = enyo.g11n.PhoneUtils.mapRegiontoCC(c.region)), o.countryCode && (e && e.networkType && e.networkType === "cdma" ? o.iddPrefix = t.iddCode : o.iddPrefix = "+", n.skipTrunk && o.trunkAccess ? delete o.trunkAccess : !n.skipTrunk && !o.trunkAccess && n.trunkCode && (o.trunkAccess = n.trunkCode)));
        return r = o._join(), enyo.g11n.Utils.releaseAllJsonFiles(), r;
    }
};

// geo/javascript/geo.js

enyo.g11n.GeoLocator = function(e) {
    this.locale = new enyo.g11n.PhoneLoc(e), this.transLocale = e && e.locale || this.locale, this.idd = enyo.g11n.Utils.getNonLocaleFile({
        root: enyo.g11n.Utils._getEnyoRoot("../"),
        path: "phone/geo/data/area/idd.json",
        locale: this.locale
    }), this.geoTable = enyo.g11n.Utils.getNonLocaleFile({
        root: enyo.g11n.Utils._getEnyoRoot("../"),
        path: "phone/geo/data/area/" + this.locale.region + ".json",
        locale: this.locale
    }), this.plan = new enyo.g11n.NumPlan({
        locale: this.locale
    }), this.plan.extendedAreaCodes && (this.extGeoTable = enyo.g11n.Utils.getNonLocaleFile({
        root: enyo.g11n.Utils._getEnyoRoot("../"),
        path: "phone/geo/data/extarea/" + this.locale.region + ".json",
        locale: this.locale
    }), this.extStatesTable = new enyo.g11n.StatesData({
        root: enyo.g11n.Utils._getEnyoRoot("../"),
        path: "phone/geo/data/extstates",
        locale: this.locale
    }));
}, enyo.g11n.GeoLocator.prototype = {
    _parseAreaAndSubscriber: function(t, n) {
        var r, i, s, o = 0, u, a = "", f = 14;
        i = 0;
        if (!t || !n)
            return undefined;
        while (i < t.length) {
            r = enyo.g11n.PhoneUtils._getCharacterCode(t.charAt(i));
            if (r >= 0) {
                u = n.get(o)[r], u === -1 && n.get(o)[f] !== -1 ? (u = n.get(o)[f], a += ".") : a += r;
                if (u < 0)
                    return o = u, u = -u - 1, s = enyo.g11n.PhoneUtils.states[u], s === "area" ? a : undefined;
                o = u, i++;
            } else
                r === -1 ? i++ : i++;
        }
        return undefined;
    },
    _matchPrefix: function(t, n) {
        var r, i, s = [], o;
        if (n[t])
            return n[t];
        for (o in n)
            if (o && typeof o == "string") {
                r = 0, i = !1;
                while (r < o.length && (o.charAt(r) === t.charAt(r) || o.charAt(r) === "."))
                    o.charAt(r) === "." && (i = !0), r++;
                if (r >= o.length) {
                    if (!i)
                        return n[o];
                    s.push(o);
                }
            }
        return s.length > 0 ? (s.sort(function(e, t) {
            return t < e ? -1 : e < t ? 1 : 0;
        }), n[s[0]]) : undefined;
    },
    locate: function(e) {
        var t = {}, n, r, i, s, o, u, a, f, l, c, h, p;
        if (e !== undefined && typeof e == "object" && e instanceof enyo.g11n.PhoneNumber) {
            n = this.locale.region, e.countryCode !== undefined && this.idd && (r = e.countryCode.replace(/[wWpPtT\+#\*]/g, ""), o = this.idd[r], p = new enyo.g11n.PhoneLoc({
                countryCode: r
            }), p.region !== this.locale.region && (f = new enyo.g11n.NumPlan({
                locale: p
            }), a = enyo.g11n.Utils.getNonLocaleFile({
                root: enyo.g11n.Utils._getEnyoRoot("../"),
                path: "phone/geo/data/area/" + p.region + ".json",
                locale: p
            })), t.country = {
                sn: o.sn,
                ln: o.ln,
                code: p.region
            }), f || (f = this.plan, p = this.locale, a = this.geoTable), i = new enyo.g11n.Resources({
                root: enyo.g11n.Utils._getEnyoRoot("../") + "/phone/geo",
                locale: this.transLocale
            }), c = e.areaCode || e.serviceCode;
            if (c !== undefined)
                if (f.extendedAreaCodes) {
                    l = c + e.subscriberNumber, l = l.replace(/[wWpPtT\+#\*]/g, ""), p.region === this.locale.region ? (a = this.extGeoTable, h = this.extStatesTable) : (a = enyo.g11n.Utils.getNonLocaleFile({
                        root: enyo.g11n.Utils._getEnyoRoot("../"),
                        path: "phone/geo/data/extarea/" + p.region + ".json",
                        locale: p
                    }), h = new enyo.g11n.StatesData({
                        root: enyo.g11n.Utils._getEnyoRoot("../"),
                        path: "phone/geo/data/extstates",
                        locale: p
                    })), a && h && (c = this._parseAreaAndSubscriber(l, h)), c || (a = p.region === this.locale.region ? this.geoTable : enyo.g11n.Utils.getNonLocaleFile({
                        root: enyo.g11n.Utils._getEnyoRoot("../"),
                        path: "phone/geo/data/extarea/" + p.region + ".json",
                        locale: p
                    }), c = e.areaCode || e.serviceCode);
                    if (!f.fieldLengths || f.fieldLengths.maxLocalLength === undefined || !e.subscriberNumber || e.subscriberNumber.length <= f.fieldLengths.maxLocalLength)
                        s = this._matchPrefix(c, a), s && s.sn && s.ln && (t.area = {
                            sn: s.sn,
                            ln: s.ln
                        });
                } else
                    !f || !f.fieldLengths || f.fieldLengths.maxLocalLength === undefined || !e.subscriberNumber || e.subscriberNumber.length <= f.fieldLengths.maxLocalLength ? a && (u = c.replace(/[wWpPtT\+#\*]/g, ""), s = this._matchPrefix(u, a), s && s.sn && s.ln ? t.area = {
                        sn: s.sn,
                        ln: s.ln
                    } : e.serviceCode ? t.area = {
                        sn: i.$L("Service Number"),
                        ln: i.$L("Service Number")
                    } : (r = enyo.g11n.PhoneUtils.mapRegiontoCC(p.region), r !== "0" && this.idd && (o = this.idd[r], o && o.sn && (t.country = {
                        sn: o.sn,
                        ln: o.ln,
                        code: n
                    })))) : (r = enyo.g11n.PhoneUtils.mapRegiontoCC(p.region), r !== "0" && this.idd && (o = this.idd[r], o && o.sn && (t.country = {
                        sn: o.sn,
                        ln: o.ln,
                        code: n
                    })));
            else
                e.mobilePrefix ? t.area = {
                    sn: i.$L("Mobile Number"),
                    ln: i.$L("Mobile Number")
                } : e.emergency && (t.area = {
                    sn: i.$L("Emergency Services Number"),
                    ln: i.$L("Emergency Services Number")
                });
            return t.country === undefined && (r = enyo.g11n.PhoneUtils.mapRegiontoCC(n), r !== "0" && this.idd && (o = this.idd[r], o && o.sn && (t.country = {
                sn: o.sn,
                ln: o.ln,
                code: n
            }))), i && (t.area && (t.area.sn && (t.area.sn = i.$L(t.area.sn)), t.area.ln && (t.area.ln = i.$L(t.area.ln))), t.country && (t.country.sn && (t.country.sn = i.$L(t.country.sn)), t.country.ln && (t.country.ln = i.$L(t.country.ln)))), enyo.g11n.Utils.releaseAllJsonFiles(), t;
        }
        return t;
    },
    country: function(e) {
        var t, n;
        return !!e && e instanceof enyo.g11n.PhoneNumber ? (n = e.countryCode && enyo.g11n.PhoneUtils.mapCCtoRegion(e.countryCode) || e.locale && e.locale.region || this.locale.region || enyo.g11n.phoneLocale().region, t = e.countryCode || enyo.g11n.PhoneUtils.mapRegiontoCC(n), e.areaCode ? n = enyo.g11n.PhoneUtils.mapAreaToRegion(t, e.areaCode) : t === "33" && e.serviceCode && (n = enyo.g11n.PhoneUtils.mapAreaToRegion(t, e.serviceCode)), n) : undefined;
    }
};

// FittableSample.js

enyo.kind({
    name: "enyo.sample.FittableSample",
    kind: "FittableRows",
    classes: "fittable-sample-box enyo-fit",
    components: [{
            content: "Foo<br>Foo",
            allowHtml: !0,
            classes: "fittable-sample-box fittable-sample-mtb"
        }, {
            content: "Foo<br>Foo",
            allowHtml: !0,
            classes: "fittable-sample-box fittable-sample-mtb"
        }, {
            kind: "FittableColumns",
            fit: !0,
            classes: "fittable-sample-box fittable-sample-mtb fittable-sample-o",
            components: [{
                    content: "Foo",
                    classes: "fittable-sample-box fittable-sample-mlr"
                }, {
                    content: "Foo",
                    classes: "fittable-sample-box fittable-sample-mlr"
                }, {
                    content: "Fits!",
                    fit: !0,
                    classes: "fittable-sample-box fittable-sample-mlr fittable-sample-o"
                }, {
                    content: "Foo",
                    classes: "fittable-sample-box fittable-sample-mlr"
                }]
        }, {
            kind: "FittableColumns",
            content: "Bat",
            classes: "fittable-sample-box fittable-sample-mtb enyo-center",
            components: [{
                    content: "Centered",
                    classes: "fittable-sample-box fittable-sample-mlr"
                }, {
                    content: "1",
                    classes: "fittable-sample-box fittable-sample-mlr"
                }, {
                    content: "2",
                    classes: "fittable-sample-box fittable-sample-mlr"
                }, {
                    content: "3",
                    classes: "fittable-sample-box fittable-sample-mlr"
                }, {
                    content: "4",
                    classes: "fittable-sample-box fittable-sample-mlr"
                }]
        }]
});

// FittableAppLayout1.js

enyo.kind({
    name: "enyo.sample.FittableAppLayout1",
    kind: "FittableRows",
    classes: "enyo-fit",
    components: [{
            kind: "onyx.Toolbar",
            components: [{
                    content: "Header"
                }, {
                    kind: "onyx.Button",
                    content: "Button"
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input"
                        }]
                }]
        }, {
            kind: "FittableColumns",
            fit: !0,
            components: [{
                    style: "width: 30%;"
                }, {
                    kind: "FittableRows",
                    fit: !0,
                    classes: "fittable-sample-shadow",
                    components: [{
                            classes: "fittable-sample-shadow2",
                            style: "height: 30%; position: relative; z-index: 1;"
                        }, {
                            fit: !0,
                            classes: "fittable-sample-fitting-color"
                        }]
                }]
        }]
});

// FittableAppLayout2.js

enyo.kind({
    name: "enyo.sample.FittableAppLayout2",
    kind: "FittableColumns",
    classes: "enyo-fit",
    components: [{
            kind: "FittableRows",
            style: "width: 20%;",
            components: [{
                    fit: !0
                }, {
                    kind: "onyx.Toolbar",
                    components: [{
                            kind: "onyx.Button",
                            content: "1"
                        }]
                }]
        }, {
            kind: "FittableRows",
            style: "width: 20%;",
            classes: "fittable-sample-shadow",
            components: [{
                    fit: !0,
                    style: ""
                }, {
                    kind: "onyx.Toolbar",
                    components: [{
                            kind: "onyx.Button",
                            content: "2"
                        }]
                }]
        }, {
            kind: "FittableRows",
            fit: !0,
            classes: "fittable-sample-shadow",
            components: [{
                    fit: !0,
                    classes: "fittable-sample-fitting-color"
                }, {
                    kind: "onyx.Toolbar",
                    components: [{
                            kind: "onyx.Button",
                            content: "3"
                        }]
                }]
        }]
});

// FittableAppLayout3.js

enyo.kind({
    name: "enyo.sample.FittableAppLayout3",
    kind: "FittableColumns",
    classes: "enyo-fit",
    components: [{
            kind: "FittableRows",
            fit: !0,
            components: [{
                    fit: !0,
                    classes: "fittable-sample-fitting-color"
                }, {
                    classes: "fittable-sample-shadow3",
                    style: "height: 30%; position: relative;"
                }, {
                    kind: "onyx.Toolbar",
                    components: [{
                            kind: "onyx.Button",
                            content: "1"
                        }]
                }]
        }, {
            kind: "FittableRows",
            classes: "fittable-sample-shadow",
            style: "width: 30%; position: relative;",
            components: [{
                    fit: !0
                }, {
                    kind: "onyx.Toolbar",
                    components: [{
                            kind: "onyx.Button",
                            content: "2"
                        }]
                }]
        }]
});

// FittableAppLayout4.js

enyo.kind({
    name: "enyo.sample.FittableAppLayout4",
    kind: "FittableColumns",
    classes: "enyo-fit",
    components: [{
            kind: "FittableRows",
            classes: "fittable-sample-shadow4",
            style: "width: 30%; position: relative; z-index: 1;",
            components: [{
                    style: "height: 20%;"
                }, {
                    style: "height: 20%;"
                }, {
                    fit: !0
                }, {
                    kind: "onyx.Toolbar",
                    style: "height: 57px;",
                    components: [{
                            content: "Toolbar"
                        }]
                }]
        }, {
            kind: "FittableRows",
            fit: !0,
            components: [{
                    fit: !0,
                    classes: "fittable-sample-fitting-color"
                }, {
                    kind: "onyx.Toolbar",
                    style: "height: 57px;",
                    components: [{
                            kind: "onyx.Button",
                            content: "2"
                        }]
                }]
        }]
});

// FittableDescription.js

enyo.kind({
    name: "enyo.sample.FittableDescription",
    classes: "fittable-sample-box enyo-fit",
    style: "padding:10px;",
    kind: "Scroller",
    components: [{
            tag: "p",
            allowHtml: !0,
            content: "FittableColumns, no margin on boxes (all divs have some padding). By default, boxes 'stretch' to fit the container (which must have a height)."
        }, {
            kind: "FittableColumns",
            classes: "fittable-sample-height fittable-sample-box fittable-sample-o fittable-sample-mlr fittable-sample-mtb",
            components: [{
                    content: "BoxA",
                    classes: "fittable-sample-box"
                }, {
                    content: "Fitting BoxB",
                    fit: !0,
                    classes: "fittable-sample-box"
                }, {
                    content: "BoxC",
                    classes: "fittable-sample-box"
                }]
        }, {
            tag: "p",
            allowHtml: !0,
            content: "Boxes with left/right margins. Note: top/bottom margin on column boxes is NOT supported."
        }, {
            kind: "FittableColumns",
            classes: "fittable-sample-height fittable-sample-box fittable-sample-o fittable-sample-mlr fittable-sample-mtb",
            components: [{
                    content: "BoxA",
                    classes: "fittable-sample-box fittable-sample-mlr"
                }, {
                    content: "Fitting BoxB",
                    fit: !0,
                    classes: "fittable-sample-box fittable-sample-mlr"
                }, {
                    content: "BoxC",
                    classes: "fittable-sample-box fittable-sample-mlr"
                }]
        }, {
            tag: "p",
            allowHtml: !0,
            content: "With <code>noStretch: true</code>, boxes have natural height."
        }, {
            kind: "FittableColumns",
            noStretch: !0,
            classes: "fittable-sample-height fittable-sample-box fittable-sample-o fittable-sample-mlr fittable-sample-mtb",
            components: [{
                    content: "BoxA",
                    classes: "fittable-sample-box fittable-sample-mlr"
                }, {
                    content: "Fitting BoxB<br><br>with natural height",
                    fit: !0,
                    allowHtml: !0,
                    classes: "fittable-sample-box fittable-sample-mlr"
                }, {
                    content: "BoxC",
                    classes: "fittable-sample-box fittable-sample-mlr"
                }]
        }, {
            tag: "p",
            allowHtml: !0,
            content: "FittableRows, no margin on boxes (all divs have some padding)."
        }, {
            kind: "FittableRows",
            classes: "fittable-sample-height fittable-sample-box fittable-sample-o fittable-sample-mlr fittable-sample-mtb",
            components: [{
                    content: "BoxA",
                    classes: "fittable-sample-box"
                }, {
                    content: "Fitting BoxB",
                    fit: !0,
                    classes: "fittable-sample-box"
                }, {
                    content: "BoxC",
                    classes: "fittable-sample-box"
                }]
        }, {
            tag: "p",
            allowHtml: !0,
            content: 'Row boxes may have margin in any dimension.<br><br> NOTE: Row boxes will collapse vertical margins according to css rules. If margin collapse is not desired, then "enyo-margin-expand" may be applied. Only in this case, left/right margin on row boxes is NOT supported.'
        }, {
            kind: "FittableRows",
            classes: "fittable-sample-height fittable-sample-box fittable-sample-o fittable-sample-mlr fittable-sample-mtb",
            components: [{
                    content: "BoxA",
                    classes: "fittable-sample-box fittable-sample-mlr fittable-sample-mtb"
                }, {
                    content: "Fitting BoxB",
                    fit: !0,
                    classes: "fittable-sample-box fittable-sample-mlr fittable-sample-mtb"
                }, {
                    content: "BoxC",
                    classes: "fittable-sample-box fittable-sample-mlr fittable-sample-mtb"
                }]
        }, {
            tag: "p",
            allowHtml: !0,
            content: "With <code>noStretch: true</code>, boxes have natural width.<br><br> NOTE: margins will not collapse in this case."
        }, {
            kind: "FittableRows",
            noStretch: !0,
            classes: "fittable-sample-height fittable-sample-box fittable-sample-o fittable-sample-mtb",
            components: [{
                    content: "BoxA",
                    classes: "fittable-sample-box fittable-sample-mlr fittable-sample-mtb"
                }, {
                    content: "Fitting BoxB",
                    fit: !0,
                    classes: "fittable-sample-box fittable-sample-mlr fittable-sample-mtb"
                }, {
                    content: "BoxC",
                    classes: "fittable-sample-box fittable-sample-mlr fittable-sample-mtb"
                }]
        }]
});

// PanelsSample.js

enyo.kind({
    name: "enyo.sample.MyGridArranger",
    kind: "GridArranger",
    colHeight: "150",
    colWidth: "150"
}), enyo.kind({
    name: "enyo.sample.PanelsSample",
    kind: "FittableRows",
    classes: "enyo-fit",
    components: [{
            kind: "FittableColumns",
            noStretch: !0,
            classes: "onyx-toolbar onyx-toolbar-inline",
            components: [{
                    kind: "Scroller",
                    thumb: !1,
                    fit: !0,
                    touch: !0,
                    vertical: "hidden",
                    style: "margin: 0;",
                    components: [{
                            classes: "onyx-toolbar-inline",
                            style: "white-space: nowrap;",
                            components: [{
                                    kind: "onyx.MenuDecorator",
                                    components: [{
                                            content: "Arranger"
                                        }, {
                                            name: "arrangerPicker",
                                            kind: "onyx.Menu",
                                            maxHeight: 360,
                                            floating: !0,
                                            onSelect: "arrangerSelected"
                                        }]
                                }, {
                                    kind: "onyx.Button",
                                    content: "Previous",
                                    ontap: "prevPanel"
                                }, {
                                    kind: "onyx.Button",
                                    content: "Next",
                                    ontap: "nextPanel"
                                }, {
                                    kind: "onyx.InputDecorator",
                                    style: "width: 60px;",
                                    components: [{
                                            kind: "onyx.Input",
                                            value: 0,
                                            onchange: "gotoPanel"
                                        }]
                                }, {
                                    kind: "onyx.Button",
                                    content: "Go",
                                    ontap: "gotoPanel"
                                }, {
                                    kind: "onyx.Button",
                                    content: "Add",
                                    ontap: "addPanel"
                                }, {
                                    kind: "onyx.Button",
                                    content: "Delete",
                                    ontap: "deletePanel"
                                }]
                        }]
                }]
        }, {
            kind: "Panels",
            name: "samplePanels",
            fit: !0,
            realtimeFit: !0,
            classes: "panels-sample-panels enyo-border-box",
            components: [{
                    content: 0,
                    style: "background:red;"
                }, {
                    content: 1,
                    style: "background:orange;"
                }, {
                    content: 2,
                    style: "background:yellow;"
                }, {
                    content: 3,
                    style: "background:green;"
                }, {
                    content: 4,
                    style: "background:blue;"
                }, {
                    content: 5,
                    style: "background:indigo;"
                }, {
                    content: 6,
                    style: "background:violet;"
                }]
        }],
    panelArrangers: [{
            name: "CardArranger",
            arrangerKind: "CardArranger"
        }, {
            name: "CardSlideInArranger",
            arrangerKind: "CardSlideInArranger"
        }, {
            name: "CarouselArranger",
            arrangerKind: "CarouselArranger",
            classes: "panels-sample-wide"
        }, {
            name: "CollapsingArranger",
            arrangerKind: "CollapsingArranger",
            classes: "panels-sample-collapsible"
        }, {
            name: "LeftRightArranger",
            arrangerKind: "LeftRightArranger"
        }, {
            name: "TopBottomArranger",
            arrangerKind: "TopBottomArranger",
            classes: "panels-sample-topbottom"
        }, {
            name: "SpiralArranger",
            arrangerKind: "SpiralArranger",
            classes: "panels-sample-spiral"
        }, {
            name: "GridArranger",
            arrangerKind: "enyo.sample.MyGridArranger",
            classes: "panels-sample-grid"
        }, {
            name: "DockRightArranger",
            arrangerKind: "DockRightArranger",
            classes: "panels-sample-collapsible"
        }],
    bgcolors: ["red", "orange", "yellow", "green", "blue", "indigo", "violet"],
    create: function() {
        this.inherited(arguments);
        for (var e = 0; e < this.panelArrangers.length; e++)
            this.$.arrangerPicker.createComponent({
                content: this.panelArrangers[e].name
            });
        this.panelCount = this.$.samplePanels.getPanels().length;
    },
    rendered: function() {
        this.inherited(arguments);
    },
    arrangerSelected: function(e, t) {
        var n = this.$.samplePanels, r = this.panelArrangers[t.originator.indexInContainer() - 1];
        this.currentClass && n.removeClass(this.currentClass), r.classes && (n.addClass(r.classes), this.currentClass = r.classes), n.setArrangerKind(r.arrangerKind), enyo.Panels.isScreenNarrow() && this.setIndex(1);
    },
    prevPanel: function() {
        this.$.samplePanels.previous(), this.$.input.setValue(this.$.samplePanels.index);
    },
    nextPanel: function() {
        this.$.samplePanels.next(), this.$.input.setValue(this.$.samplePanels.index);
    },
    gotoPanel: function() {
        this.$.samplePanels.setIndex(this.$.input.getValue());
    },
    panelCount: 0,
    addPanel: function() {
        var e = this.$.samplePanels, t = this.panelCount++, n = e.createComponent({
            style: "background:" + this.bgcolors[t % this.bgcolors.length],
            content: t
        });
        n.render(), e.reflow(), e.setIndex(t);
    },
    deletePanel: function() {
        var e = this.$.samplePanels.getActive();
        e && e.destroy();
    }
});

// PanelsFlickrSample.js

enyo.kind({
    name: "enyo.sample.PanelsFlickrSample",
    kind: "Panels",
    classes: "panels-sample-flickr-panels enyo-unselectable enyo-fit",
    arrangerKind: "CollapsingArranger",
    components: [{
            layoutKind: "FittableRowsLayout",
            components: [{
                    kind: "onyx.Toolbar",
                    components: [{
                            kind: "onyx.InputDecorator",
                            style: "width: 90%;",
                            layoutKind: "FittableColumnsLayout",
                            components: [{
                                    name: "searchInput",
                                    fit: !0,
                                    kind: "onyx.Input",
                                    value: "Japan",
                                    onchange: "search"
                                }, {
                                    kind: "Image",
                                    src: "assets/search-input-search.png",
                                    style: "width: 20px; height: 20px;"
                                }]
                        }, {
                            name: "searchSpinner",
                            kind: "Image",
                            src: "assets/spinner.gif",
                            showing: !1
                        }]
                }, {
                    kind: "List",
                    fit: !0,
                    touch: !0,
                    onSetupItem: "setupItem",
                    components: [{
                            name: "item",
                            style: "padding: 10px;",
                            classes: "panels-sample-flickr-item enyo-border-box",
                            ontap: "itemTap",
                            components: [{
                                    name: "thumbnail",
                                    kind: "Image",
                                    classes: "panels-sample-flickr-thumbnail"
                                }, {
                                    name: "title",
                                    classes: "panels-sample-flickr-title"
                                }]
                        }, {
                            name: "more",
                            style: "background-color: #323232;",
                            components: [{
                                    kind: "onyx.Button",
                                    content: "more photos",
                                    classes: "onyx-dark panels-sample-flickr-more-button",
                                    ontap: "more"
                                }, {
                                    name: "moreSpinner",
                                    kind: "Image",
                                    src: "assets/spinner.gif",
                                    classes: "panels-sample-flickr-more-spinner"
                                }]
                        }]
                }]
        }, {
            name: "pictureView",
            fit: !0,
            kind: "FittableRows",
            classes: "enyo-fit panels-sample-flickr-main",
            components: [{
                    name: "backToolbar",
                    kind: "onyx.Toolbar",
                    showing: !1,
                    components: [{
                            kind: "onyx.Button",
                            content: "Back",
                            ontap: "showList"
                        }]
                }, {
                    fit: !0,
                    style: "position: relative;",
                    components: [{
                            name: "flickrImage",
                            kind: "Image",
                            classes: "enyo-fit panels-sample-flickr-center panels-sample-flickr-image",
                            showing: !1,
                            onload: "imageLoaded",
                            onerror: "imageLoaded"
                        }, {
                            name: "imageSpinner",
                            kind: "Image",
                            src: "assets/spinner-large.gif",
                            classes: "enyo-fit panels-sample-flickr-center",
                            showing: !1
                        }]
                }]
        }, {
            kind: "FlickrSearch",
            onResults: "searchResults"
        }],
    rendered: function() {
        this.inherited(arguments), this.search();
    },
    reflow: function() {
        this.inherited(arguments);
        var e = this.$.backToolbar.showing;
        this.$.backToolbar.setShowing(enyo.Panels.isScreenNarrow()), this.$.backToolbar.showing != e && this.$.pictureView.resized();
    },
    search: function() {
        this.searchText = this.$.searchInput.getValue(), this.page = 0, this.results = [], this.$.searchSpinner.show(), this.$.flickrSearch.search(this.searchText);
    },
    searchResults: function(e, t) {
        this.$.searchSpinner.hide(), this.$.moreSpinner.hide(), this.results = this.results.concat(t), this.$.list.setCount(this.results.length), this.page === 0 ? this.$.list.reset() : this.$.list.refresh();
    },
    setupItem: function(e, t) {
        var n = t.index, r = this.results[n];
        this.$.item.addRemoveClass("onyx-selected", e.isSelected(t.index)), this.$.thumbnail.setSrc(r.thumbnail), this.$.title.setContent(r.title || "Untitled"), this.$.more.canGenerate = !this.results[n + 1];
    },
    more: function() {
        this.page++, this.$.moreSpinner.show(), this.$.flickrSearch.search(this.searchText, this.page);
    },
    itemTap: function(e, t) {
        enyo.Panels.isScreenNarrow() && this.setIndex(1), this.$.imageSpinner.show();
        var n = this.results[t.index];
        n.original == this.$.flickrImage.getSrc() ? this.imageLoaded() : (this.$.flickrImage.hide(), this.$.flickrImage.setSrc(n.original));
    },
    imageLoaded: function() {
        var e = this.$.flickrImage;
        e.removeClass("tall"), e.removeClass("wide"), e.show();
        var t = e.getBounds(), n = t.height / t.width;
        n >= 1.25 ? e.addClass("tall") : n <= .8 && e.addClass("wide"), this.$.imageSpinner.hide();
    },
    showList: function() {
        this.setIndex(0);
    }
}), enyo.kind({
    name: "FlickrSearch",
    kind: "Component",
    published: {
        searchText: ""
    },
    events: {
        onResults: ""
    },
    url: "http://api.flickr.com/services/rest/",
    pageSize: 200,
    api_key: "2a21b46e58d207e4888e1ece0cb149a5",
    search: function(e, t) {
        this.searchText = e || this.searchText;
        var n = (t || 0) * this.pageSize, r = {
            method: "flickr.photos.search",
            format: "json",
            api_key: this.api_key,
            per_page: this.pageSize,
            page: n,
            text: this.searchText
        };
        return (new enyo.JsonpRequest({
            url: this.url,
            callbackName: "jsoncallback"
        })).response(this, "processResponse").go(r);
    },
    processResponse: function(e, t) {
        var n = t.photos ? t.photos.photo || [] : [];
        for (var r = 0, i; i = n[r]; r++) {
            var s = "http://farm" + i.farm + ".static.flickr.com/" + i.server + "/" + i.id + "_" + i.secret;
            i.thumbnail = s + "_s.jpg", i.original = s + ".jpg";
        }
        return this.doResults(n), n;
    }
});

// PanelsSlidingSample.js

enyo.kind({
    name: "enyo.sample.PanelsSlidingSample",
    kind: "FittableRows",
    classes: "onyx enyo-fit",
    components: [{
            kind: "onyx.Toolbar",
            components: [{
                    content: "Realtime"
                }, {
                    kind: "onyx.Checkbox",
                    onchange: "checkboxChange"
                }]
        }, {
            kind: "Panels",
            fit: !0,
            classes: "panels-sample-sliding-panels",
            arrangerKind: "CollapsingArranger",
            wrap: !1,
            components: [{
                    name: "left",
                    components: [{
                            kind: "List",
                            classes: "enyo-fit",
                            touch: !0,
                            count: 1e3,
                            onSetupItem: "setupItem",
                            item: "item1",
                            components: [{
                                    name: "item1",
                                    classes: "panels-sample-sliding-item"
                                }]
                        }]
                }, {
                    name: "middle",
                    components: [{
                            kind: "List",
                            classes: "enyo-fit",
                            touch: !0,
                            count: 1e3,
                            onSetupItem: "setupItem",
                            item: "item2",
                            components: [{
                                    name: "item2",
                                    classes: "panels-sample-sliding-item"
                                }]
                        }]
                }, {
                    name: "body",
                    fit: !0,
                    components: [{
                            kind: "Scroller",
                            classes: "enyo-fit",
                            touch: !0,
                            components: [{
                                    classes: "panels-sample-sliding-content",
                                    content: "Broke, down dumb hospitality firewood chitlins. Has mud tired uncle everlastin' cold, out. Hauled thar, up thar tar heffer quarrel farmer fish water is. Simple gritts dogs soap give kickin'. Ain't shiney water range, preacher java rent thar go. Skinned wirey tin farm, trespassin' it, rodeo. Said roped caught creosote go simple. Buffalo butt, jig fried commencin' cipherin' maw, wash. Round-up barefoot jest bible rottgut sittin' trailer shed jezebel. Crop old over poker drinkin' dirt where tools skinned, city-slickers tools liniment mush tarnation. Truck lyin' snakeoil creosote, old a inbred pudneer, slap dirty cain't. Hairy, smokin', nothin' highway hootch pigs drinkin', barefoot bootleg hoosegow mule. Tax-collectors uncle wuz, maw watchin' had jumpin' got redblooded gimmie truck shootin' askin' hootch. No fat ails fire soap cabin jail, reckon if trespassin' fixin' rustle jest liniment. Ya huntin' catfish shot good bankrupt. Fishin' sherrif has, fat cooked shed old. Broke, down dumb hospitality firewood chitlins. Has mud tired uncle everlastin' cold, out. Hauled thar, up thar tar heffer quarrel farmer fish water is. Simple gritts dogs soap give kickin'. Ain't shiney water range, preacher java rent thar go. Skinned wirey tin farm, trespassin' it, rodeo. Said roped caught creosote go simple. Buffalo butt, jig fried commencin' cipherin' maw, wash. Round-up barefoot jest bible rottgut sittin' trailer shed jezebel. Crop old over poker drinkin' dirt where tools skinned, city-slickers tools liniment mush tarnation. Truck lyin' snakeoil creosote, old a inbred pudneer, slap dirty cain't. Hairy, smokin', nothin' highway hootch pigs drinkin', barefoot bootleg hoosegow mule. Tax-collectors uncle wuz, maw watchin' had jumpin' got redblooded gimmie truck shootin' askin' hootch. No fat ails fire soap cabin jail, reckon if trespassin' fixin' rustle jest liniment. Ya huntin' catfish shot good bankrupt. Fishin' sherrif has, fat cooked shed old. Broke, down dumb hospitality firewood chitlins. Has mud tired uncle everlastin' cold, out. Hauled thar, up thar tar heffer quarrel farmer fish water is. Simple gritts dogs soap give kickin'. Ain't shiney water range, preacher java rent thar go. Skinned wirey tin farm, trespassin' it, rodeo. Said roped caught creosote go simple. Buffalo butt, jig fried commencin' cipherin' maw, wash. Round-up barefoot jest bible rottgut sittin' trailer shed jezebel. Crop old over poker drinkin' dirt where tools skinned, city-slickers tools liniment mush tarnation. Truck lyin' snakeoil creosote, old a inbred pudneer, slap dirty cain't. Hairy, smokin', nothin' highway hootch pigs drinkin', barefoot bootleg hoosegow mule. Tax-collectors uncle wuz, maw watchin' had jumpin' got redblooded gimmie truck shootin' askin' hootch. No fat ails fire soap cabin jail, reckon if trespassin' fixin' rustle jest liniment. Ya huntin' catfish shot good bankrupt. Fishin' sherrif has, fat cooked shed old. Broke, down dumb hospitality firewood chitlins. Has mud tired uncle everlastin' cold, out. Hauled thar, up thar tar heffer quarrel farmer fish water is. Simple gritts dogs soap give kickin'. Ain't shiney water range, preacher java rent thar go. Skinned wirey tin farm, trespassin' it, rodeo. Said roped caught creosote go simple. Buffalo butt, jig fried commencin' cipherin' maw, wash. Round-up barefoot jest bible rottgut sittin' trailer shed jezebel. Crop old over poker drinkin' dirt where tools skinned, city-slickers tools liniment mush tarnation. Truck lyin' snakeoil creosote, old a inbred pudneer, slap dirty cain't. Hairy, smokin', nothin' highway hootch pigs drinkin', barefoot bootleg hoosegow mule. Tax-collectors uncle wuz, maw watchin' had jumpin' got redblooded gimmie truck shootin' askin' hootch. No fat ails fire soap cabin jail, reckon if trespassin' fixin' rustle jest liniment. Ya huntin' catfish shot good bankrupt. Fishin' sherrif has, fat cooked shed old."
                                }]
                        }]
                }]
        }],
    setupItem: function(e, t) {
        this.$[e.item].setContent("This is row number: " + t.index);
    },
    checkboxChange: function(e) {
        this.log(), this.$.panels.realtimeFit = e.getValue();
    }
});

// NameGenerator.js

function rnd(e, t) {
    return t < e ? 0 : Math.floor(Math.random() * (t - e + 1)) + e;
}

function makeName(e, t, n, r) {
    n = n || "", r = r || "";
    var i = "aeiouyhaeiouaeiou", s = "bcdfghjklmnpqrstvwxzbcdfgjklmnprstvwbcdfgjklmnprst", o = i + s, u = rnd(e, t) - n.length - r.length;
    u < 1 && (u = 1);
    var a = 0, f;
    if (n.length > 0)
        for (f = 0; f < n.length; f++)
            a == 2 && (a = 0), s.indexOf(n[f]) != -1 && a++;
    else
        a = 1;
    var l = n;
    for (f = 0; f < u; f++)
        a == 2 ? (touse = i, a = 0) : touse = o, c = touse.charAt(rnd(0, touse.length - 1)), l += c, s.indexOf(c) != -1 && a++;
    return l = l.charAt(0).toUpperCase() + l.substring(1, l.length) + r, l;
}

// ListAroundSample.js

enyo.kind({
    name: "enyo.sample.ListAroundSample",
    kind: "FittableRows",
    classes: "enyo-fit enyo-unselectable",
    components: [{
            name: "list",
            kind: "AroundList",
            classes: "list-sample-around",
            fit: !0,
            multiSelect: !0,
            onSetupItem: "setupItem",
            aboveComponents: [{
                    kind: "onyx.Toolbar",
                    layoutKind: "FittableColumnsLayout",
                    components: [{
                            kind: "onyx.InputDecorator",
                            fit: !0,
                            noStretch: !0,
                            layoutKind: "FittableColumnsLayout",
                            components: [{
                                    kind: "onyx.Input",
                                    placeholder: "Search...",
                                    fit: !0,
                                    oninput: "searchInputChange"
                                }, {
                                    kind: "Image",
                                    src: "assets/search-input-search.png",
                                    style: "height: 20px; width: 20px;"
                                }]
                        }]
                }],
            components: [{
                    name: "divider",
                    classes: "list-sample-around-divider"
                }, {
                    name: "item",
                    kind: "AroundListContactItem",
                    classes: "list-sample-around-item enyo-border-box",
                    onRemove: "removeTap"
                }]
        }, {
            name: "popup",
            kind: "onyx.Popup",
            modal: !0,
            centered: !0,
            classes: "list-sample-around-popup",
            components: [{
                    components: [{
                            content: "count:",
                            classes: "list-sample-around-label"
                        }, {
                            kind: "onyx.InputDecorator",
                            components: [{
                                    name: "countInput",
                                    kind: "onyx.Input",
                                    style: "width: 80px",
                                    value: 100
                                }]
                        }]
                }, {
                    components: [{
                            content: "rowsPerPage:",
                            classes: "list-sample-around-label"
                        }, {
                            kind: "onyx.InputDecorator",
                            components: [{
                                    name: "rowsPerPageInput",
                                    kind: "onyx.Input",
                                    style: "width: 80px",
                                    value: 50
                                }]
                        }]
                }, {
                    components: [{
                            content: "hide divider:",
                            classes: "list-sample-around-label"
                        }, {
                            name: "hideDividerCheckbox",
                            kind: "onyx.Checkbox"
                        }]
                }, {
                    components: [{
                            kind: "onyx.Button",
                            content: "populate list",
                            classes: "list-sample-around-populate-button",
                            ontap: "populateList"
                        }]
                }]
        }],
    rendered: function() {
        this.inherited(arguments), this.populateList();
    },
    setupItem: function(e, t) {
        var n = t.index, r = this.filter ? this.filtered : this.db, i = r[n];
        this.$.item.setContact(i), this.$.item.setSelected(e.isSelected(n));
        if (!this.hideDivider) {
            var s = i.name[0], o = r[n - 1], u = s != (o && o.name[0]);
            this.$.divider.setContent(s), this.$.divider.canGenerate = u, this.$.item.applyStyle("border-top", u ? "none" : null);
        }
    },
    refreshList: function() {
        this.filter ? (this.filtered = this.generateFilteredData(this.filter), this.$.list.setCount(this.filtered.length)) : this.$.list.setCount(this.db.length), this.$.list.refresh();
    },
    addItem: function() {
        var e = this.generateItem(enyo.cap(this.$.newContactInput.getValue())), t = 0;
        for (var n; n = this.db[t]; t++)
            if (n.name > e.name) {
                this.db.splice(t, 0, e);
                break;
            }
        this.refreshList(), this.$.list.scrollToRow(t);
    },
    removeItem: function(e) {
        this._removeItem(e), this.refreshList(), this.$.list.getSelection().deselect(e);
    },
    _removeItem: function(e) {
        var t = this.filter ? this.filtered[e].dbIndex : e;
        this.db.splice(t, 1);
    },
    removeTap: function(e, t) {
        return this.removeItem(t.index), !0;
    },
    populateList: function() {
        this.$.popup.hide(), this.createDb(this.$.countInput.getValue()), this.$.list.setCount(this.db.length), this.$.list.setRowsPerPage(this.$.rowsPerPageInput.getValue()), this.hideDivider = this.$.hideDividerCheckbox.getValue(), this.$.divider.canGenerate = !this.hideDivider, this.$.list.reset(), this.$.list.scrollToContentStart();
    },
    createDb: function(e) {
        this.db = [];
        for (var t = 0; t < e; t++)
            this.db.push(this.generateItem(makeName(4, 6) + " " + makeName(5, 10)));
        this.sortDb();
    },
    generateItem: function(e) {
        return {
            name: e,
            avatar: "assets/avatars/" + avatars[enyo.irand(avatars.length)],
            title: titles[enyo.irand(titles.length)]
        };
    },
    sortDb: function() {
        this.db.sort(function(e, t) {
            return e.name < t.name ? -1 : e.name > t.name ? 1 : 0;
        });
    },
    showSetupPopup: function() {
        this.$.popup.show();
    },
    searchInputChange: function(e) {
        enyo.job(this.id + ":search", enyo.bind(this, "filterList", e.getValue()), 200);
    },
    filterList: function(e) {
        e != this.filter && (this.filter = e, this.filtered = this.generateFilteredData(e), this.$.list.setCount(this.filtered.length), this.$.list.reset());
    },
    generateFilteredData: function(e) {
        var t = new RegExp("^" + e, "i"), n = [];
        for (var r = 0, i; i = this.db[r]; r++)
            i.name.match(t) && (i.dbIndex = r, n.push(i));
        return n;
    }
});

var avatars = ["angel.png", "astrologer.png", "athlete.png", "baby.png", "clown.png", "devil.png", "doctor.png", "dude.png", "dude2.png", "dude3.png", "dude4.png", "dude5.png", "dude6.png"], titles = ["Regional Data Producer", "Internal Markets Administrator", "Central Solutions Producer", "Dynamic Program Executive", "Direct Configuration Executive", "International Marketing Assistant", "District Research Consultant", "Lead Intranet Coordinator", "Central Accountability Director", "Product Web Assistant"];

enyo.kind({
    name: "AroundListContactItem",
    events: {
        onRemove: ""
    },
    components: [{
            name: "avatar",
            kind: "Image",
            classes: "list-sample-around-avatar"
        }, {
            components: [{
                    name: "name",
                    classes: "list-sample-around-name"
                }, {
                    name: "title",
                    classes: "list-sample-around-description"
                }, {
                    content: "(415) 711-1234",
                    classes: "list-sample-around-description"
                }]
        }, {
            name: "remove",
            kind: "onyx.IconButton",
            classes: "list-sample-around-remove-button",
            src: "assets/remove-icon.png",
            ontap: "removeTap"
        }],
    setContact: function(e) {
        this.$.name.setContent(e.name), this.$.avatar.setSrc(e.avatar), this.$.title.setContent(e.title);
    },
    setSelected: function(e) {
        this.addRemoveClass("list-sample-around-item-selected", e), this.$.remove.applyStyle("display", e ? "inline-block" : "none");
    },
    removeTap: function(e, t) {
        return this.doRemove(t), !0;
    }
});

// ListBasicSample.js

enyo.kind({
    name: "enyo.sample.ListBasicSample",
    classes: "list-sample enyo-fit",
    components: [{
            name: "list",
            kind: "List",
            count: 2e4,
            multiSelect: !1,
            classes: "enyo-fit list-sample-list",
            onSetupItem: "setupItem",
            components: [{
                    name: "item",
                    classes: "list-sample-item enyo-border-box",
                    components: [{
                            name: "index",
                            classes: "list-sample-index"
                        }, {
                            name: "name"
                        }]
                }]
        }],
    names: [],
    setupItem: function(e, t) {
        var n = t.index;
        this.names[n] || (this.names[n] = makeName(5, 10, "", ""));
        var r = this.names[n], i = ("00000000" + n).slice(-7);
        this.$.item.addRemoveClass("list-sample-selected", e.isSelected(n)), this.$.name.setContent(r), this.$.index.setContent(i);
    }
});

// ListNoSelectSample.js

enyo.kind({
    name: "enyo.sample.ListNoSelectSample",
    classes: "list-sample enyo-fit",
    components: [{
            name: "list",
            kind: "List",
            count: 2e4,
            noSelect: !0,
            multiSelect: !1,
            classes: "enyo-fit list-sample-list",
            onSetupItem: "setupItem",
            components: [{
                    name: "item",
                    classes: "list-sample-item enyo-border-box",
                    components: [{
                            name: "index",
                            classes: "list-sample-index"
                        }, {
                            name: "name"
                        }]
                }]
        }],
    names: [],
    setupItem: function(e, t) {
        var n = t.index;
        this.names[n] || (this.names[n] = makeName(5, 10, "", ""));
        var r = this.names[n], i = ("00000000" + n).slice(-7);
        this.$.name.setContent(r), this.$.index.setContent(i);
    }
});

// ListContactsSample.js

enyo.kind({
    name: "enyo.sample.ListContactsSample",
    kind: "FittableRows",
    classes: "list-sample-contacts enyo-fit",
    components: [{
            kind: "onyx.MoreToolbar",
            layoutKind: "FittableColumnsLayout",
            style: "height: 55px;",
            components: [{
                    kind: "onyx.Button",
                    content: "setup",
                    ontap: "showSetupPopup"
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            name: "newContactInput",
                            kind: "onyx.Input",
                            value: "Frankie Fu"
                        }]
                }, {
                    kind: "onyx.Button",
                    content: "new contact",
                    ontap: "addItem"
                }, {
                    fit: !0
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            placeholder: "Search...",
                            style: "width: 140px;",
                            oninput: "searchInputChange"
                        }, {
                            kind: "Image",
                            src: "assets/search-input-search.png",
                            style: "width: 20px;"
                        }]
                }, {
                    kind: "onyx.Button",
                    content: "remove selected",
                    ontap: "removeSelected"
                }]
        }, {
            kind: "List",
            classes: "list-sample-contacts-list enyo-unselectable",
            fit: !0,
            multiSelect: !0,
            onSetupItem: "setupItem",
            components: [{
                    name: "divider",
                    classes: "list-sample-contacts-divider"
                }, {
                    name: "item",
                    kind: "ContactItem",
                    classes: "list-sample-contacts-item enyo-border-box",
                    onRemove: "removeTap"
                }]
        }, {
            name: "popup",
            kind: "onyx.Popup",
            modal: !0,
            centered: !0,
            classes: "list-sample-contacts-popup",
            components: [{
                    components: [{
                            style: "display:inline-block",
                            components: [{
                                    content: "count:",
                                    classes: "list-sample-contacts-label"
                                }, {
                                    name: "countOutput",
                                    style: "display:inline-block;",
                                    content: "200"
                                }]
                        }, {
                            kind: "onyx.Slider",
                            value: 4,
                            onChanging: "countSliderChanging",
                            onChange: "countSliderChanging"
                        }]
                }, {
                    components: [{
                            content: "rowsPerPage:",
                            classes: "list-sample-contacts-label"
                        }, {
                            name: "rowsPerPageOutput",
                            style: "display:inline-block;",
                            content: "50"
                        }, {
                            kind: "onyx.Slider",
                            value: 10,
                            onChanging: "rowsSliderChanging",
                            onChange: "rowsSliderChanging"
                        }]
                }, {
                    components: [{
                            content: "hide divider:",
                            classes: "list-sample-contacts-label"
                        }, {
                            name: "hideDividerCheckbox",
                            kind: "onyx.Checkbox"
                        }]
                }, {
                    components: [{
                            kind: "onyx.Button",
                            content: "populate list",
                            classes: "list-sample-contacts-populate-button",
                            ontap: "populateList"
                        }]
                }]
        }],
    rendered: function() {
        this.inherited(arguments), this.populateList();
    },
    setupItem: function(e, t) {
        var n = t.index, r = this.filter ? this.filtered : this.db, i = r[n];
        this.$.item.setContact(i), this.$.item.setSelected(e.isSelected(n));
        if (!this.hideDivider) {
            var s = i.name[0], o = r[n - 1], u = s != (o && o.name[0]);
            this.$.divider.setContent(s), this.$.divider.canGenerate = u, this.$.item.applyStyle("border-top", u ? "none" : null);
        }
    },
    refreshList: function() {
        this.filter ? (this.filtered = this.generateFilteredData(this.filter), this.$.list.setCount(this.filtered.length)) : this.$.list.setCount(this.db.length), this.$.list.refresh();
    },
    addItem: function() {
        var e = this.generateItem(enyo.cap(this.$.newContactInput.getValue())), t = 0;
        for (var n; n = this.db[t]; t++)
            if (n.name > e.name) {
                this.db.splice(t, 0, e);
                break;
            }
        n || this.db.push(e), this.refreshList(), this.$.list.scrollToRow(t);
    },
    removeItem: function(e) {
        this._removeItem(e), this.$.list.getSelection().remove(e), this.refreshList();
    },
    _removeItem: function(e) {
        var t = this.filter ? this.filtered[e].dbIndex : e;
        this.db.splice(t, 1);
    },
    removeTap: function(e, t) {
        return this.removeItem(t.index), !0;
    },
    removeSelected: function() {
        var e = enyo.keys(this.$.list.getSelection().getSelected());
        e.sort(function(e, t) {
            return t - e;
        });
        for (var t = 0; t < e.length; t++)
            this._removeItem(e[t]);
        this.$.list.getSelection().clear(), this.refreshList();
    },
    populateList: function() {
        this.$.popup.hide(), this.createDb(~~this.$.countOutput.getContent()), this.$.list.setCount(this.db.length), this.$.list.setRowsPerPage(~~this.$.rowsPerPageOutput.getContent()), this.hideDivider = this.$.hideDividerCheckbox.getValue(), this.$.list.reset();
    },
    createDb: function(e) {
        this.db = [];
        for (var t = 0; t < e; t++)
            this.db.push(this.generateItem(makeName(4, 6) + " " + makeName(5, 10)));
        this.sortDb();
    },
    generateItem: function(e) {
        return {
            name: e,
            avatar: "assets/avatars/" + avatars[enyo.irand(avatars.length)],
            title: titles[enyo.irand(titles.length)],
            importance: 0
        };
    },
    sortDb: function() {
        this.db.sort(function(e, t) {
            return e.name < t.name ? -1 : e.name > t.name ? 1 : 0;
        });
    },
    showSetupPopup: function() {
        this.$.popup.show();
    },
    searchInputChange: function(e) {
        enyo.job(this.id + ":search", enyo.bind(this, "filterList", e.getValue()), 200);
    },
    filterList: function(e) {
        e != this.filter && (this.filter = e, this.filtered = this.generateFilteredData(e), this.$.list.setCount(this.filtered.length), this.$.list.reset());
    },
    generateFilteredData: function(e) {
        var t = new RegExp("^" + e, "i"), n = [];
        for (var r = 0, i; i = this.db[r]; r++)
            i.name.match(t) && (i.dbIndex = r, n.push(i));
        return n;
    },
    countSliderChanging: function(e, t) {
        this.$.countOutput.setContent(Math.round(e.getValue()) * 50);
    },
    rowsSliderChanging: function(e, t) {
        this.$.rowsPerPageOutput.setContent(Math.round(e.getValue()) * 5);
    }
});

var avatars = ["angel.png", "astrologer.png", "athlete.png", "baby.png", "clown.png", "devil.png", "doctor.png", "dude.png", "dude2.png", "dude3.png", "dude4.png", "dude5.png", "dude6.png"], titles = ["Regional Data Producer", "Internal Markets Administrator", "Central Solutions Producer", "Dynamic Program Executive", "Direct Configuration Executive", "International Marketing Assistant", "District Research Consultant", "Lead Intranet Coordinator", "Central Accountability Director", "Product Web Assistant"];

enyo.kind({
    name: "ContactItem",
    events: {
        onRemove: ""
    },
    published: {
        importance: 0
    },
    components: [{
            name: "avatar",
            kind: "Image",
            classes: "list-sample-contacts-avatar"
        }, {
            components: [{
                    name: "name"
                }, {
                    name: "title",
                    classes: "list-sample-contacts-description"
                }, {
                    content: "(415) 711-1234",
                    classes: "list-sample-contacts-description"
                }]
        }, {
            name: "remove",
            kind: "onyx.IconButton",
            classes: "list-sample-contacts-remove-button",
            src: "assets/remove-icon.png",
            ontap: "removeTap"
        }],
    setContact: function(e) {
        this.$.name.setContent(e.name), this.$.avatar.setSrc(e.avatar), this.$.title.setContent(e.title);
    },
    setSelected: function(e) {
        this.addRemoveClass("list-sample-contacts-item-selected", e), this.$.remove.applyStyle("display", e ? "inline-block" : "gne");
    },
    renderImportance: function() {
        switch (this.importance) {
            case 0:
                this.$.importance.setContent("not important");
                break;
            case -1:
                this.$.importance.setContent("important");
                break;
            case -2:
                this.$.importance.setContent("very important");
                break;
            default:
                alert(this.importance + " - wowzer");
        }
    },
    removeTap: function(e, t) {
        return this.doRemove(t), !0;
    }
});

// ListPulldownSample.js

enyo.kind({
    name: "enyo.sample.ListPulldownSample",
    classes: "enyo-unselectable enyo-fit onyx",
    kind: "FittableRows",
    components: [{
            kind: "onyx.Toolbar",
            components: [{
                    kind: "onyx.InputDecorator",
                    components: [{
                            name: "searchInput",
                            kind: "onyx.Input",
                            value: "enyojs",
                            placeholder: "Enter seach term"
                        }, {
                            kind: "Image",
                            src: "assets/search-input-search.png",
                            style: "width: 20px;"
                        }]
                }, {
                    kind: "onyx.Button",
                    content: "search",
                    ontap: "search"
                }]
        }, {
            name: "list",
            kind: "PulldownList",
            classes: "list-sample-pulldown-list",
            fit: !0,
            onSetupItem: "setupItem",
            onPullRelease: "pullRelease",
            onPullComplete: "pullComplete",
            components: [{
                    style: "padding: 10px;",
                    classes: "list-sample-pulldown-item enyo-border-box",
                    components: [{
                            name: "icon",
                            kind: "Image",
                            style: "float: left; width: 48px; height: 48px; padding: 0 10px 10px 0;"
                        }, {
                            name: "name",
                            tag: "span",
                            style: "font-weight: bold;"
                        }, {
                            name: "handle",
                            tag: "span",
                            style: "color: lightgrey;"
                        }, {
                            name: "date",
                            tag: "span",
                            style: "float: right; color: lightgrey;"
                        }, {
                            tag: "br"
                        }, {
                            name: "text",
                            tag: "p",
                            style: "word-wrap: break-word;",
                            allowHtml: !0
                        }]
                }]
        }],
    rendered: function() {
        this.inherited(arguments), this.search();
    },
    pullRelease: function() {
        this.pulled = !0, setTimeout(enyo.bind(this, function() {
            this.search();
        }), 1e3);
    },
    pullComplete: function() {
        this.pulled = !1, this.$.list.reset();
    },
    search: function() {
        var e = this.$.searchInput.getValue().replace(/^\s+|\s+$/g, "");
        if (e !== "") {
            var t = new enyo.JsonpRequest({
                url: "http://search.twitter.com/search.json",
                callbackName: "callback"
            });
            t.response(enyo.bind(this, "processSearchResults")), t.go({
                q: e,
                rpp: 20
            });
        } else
            this.$.searchInput.setValue(e);
    },
    processSearchResults: function(e, t) {
        this.results = t.results, this.$.list.setCount(this.results.length), this.pulled ? this.$.list.completePull() : this.$.list.reset();
    },
    setupItem: function(e, t) {
        var n = t.index, r = this.results[n];
        this.$.icon.setSrc(r.profile_image_url), this.$.name.setContent(r.from_user_name), this.$.handle.setContent(" @" + r.from_user), this.$.date.setContent(this.getRelativeDateString(r.created_at)), this.$.text.setContent(this.parseTweet(r.text));
    },
    getRelativeDateString: function(e) {
        var t = new Date(e), n = new Date, r;
        if (n.toLocaleDateString() == t.toLocaleDateString()) {
            var i = n.getHours() - t.getHours(), s = n.getMinutes() - t.getMinutes();
            r = i ? i + " hour" : s ? s + " minute" : n.getSeconds() - t.getSeconds() + " second";
        } else {
            var o = n.getMonth() - t.getMonth();
            r = o ? o + " month" : n.getDate() - t.getDate() + " day";
        }
        return r.split(" ")[0] > 1 ? r + "s" : r;
    },
    parseTweet: function(e) {
        var t = e;
        return t = t.replace(/[A-Za-z]+:\/\/[A-Za-z0-9_-]+\.[A-Za-z0-9_:%&~\?\/.=-]+/g, function(e) {
            return "<a href='" + e + "'target='_blank'>" + e + "</a>";
        }), t.replace(/[@]+[A-Za-z0-9_-]+/, function(e) {
            var t = e.replace("@", "");
            return "<a href='http://twitter.com/" + e + "'target='_blank'>@" + t + "</a>";
        });
    }
});

// ListLanguagesSample.js

enyo.kind({
    name: "enyo.sample.ListLanguagesSample",
    kind: "FittableRows",
    classes: "list-sample-language enyo-fit",
    data: [],
    languages: {
        English: ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"],
        Italian: ["Uno", "Due", "Tre", "Quattro", "Cinque", "Sei", "Sette", "Otto", "Nove", "Dieci"],
        Spanish: ["Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez"],
        German: ["Eins", "Zwei", "Drei", "Vier", "F\u00fcnf", "Sechs", "Sieben", "Acht", "Neun", "Zehn"],
        French: ["Un", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf", "Dix"]
    },
    components: [{
            kind: "onyx.MoreToolbar",
            layoutKind: "FittableColumnsLayout",
            style: "height: 55px;",
            components: [{
                    content: "Rows:"
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            value: "10",
                            name: "numRows"
                        }]
                }, {
                    kind: "onyx.Button",
                    content: "Repopulate",
                    ontap: "populateList"
                }]
        }, {
            kind: "List",
            classes: "list-sample-language-list enyo-unselectable",
            fit: !0,
            multiSelect: !0,
            reorderable: !0,
            centerReorderContainer: !1,
            enableSwipe: !0,
            onSetupItem: "setupItem",
            onReorder: "listReorder",
            onSetupReorderComponents: "setupReorderComponents",
            onSetupSwipeItem: "setupSwipeItem",
            onSwipeComplete: "swipeComplete",
            components: [{
                    name: "item",
                    classes: "list-sample-language-item",
                    components: [{
                            name: "text",
                            classes: "itemLabel"
                        }, {
                            name: "rowNumber",
                            classes: "rowNumberLabel"
                        }, {
                            name: "serial",
                            classes: "serialLabel"
                        }]
                }],
            reorderComponents: [{
                    name: "reorderContent",
                    classes: "enyo-fit reorderDragger",
                    components: [{
                            name: "reorderTitle",
                            tag: "h2",
                            allowHtml: !0
                        }]
                }],
            swipeableComponents: [{
                    name: "swipeItem",
                    classes: "enyo-fit swipeGreen",
                    components: [{
                            name: "swipeTitle",
                            classes: "swipeTitle"
                        }]
                }]
        }],
    rendered: function() {
        this.inherited(arguments), this.populateList();
    },
    listReorder: function(e, t) {
        var n = enyo.clone(this.data[t.reorderFrom]);
        this.data.splice(t.reorderFrom, 1), this.data.splice(t.reorderTo, 0, n);
    },
    setupItem: function(e, t) {
        var n = t.index;
        if (!this.data[n])
            return;
        var r = this.data[n].langs[this.data[n].currentIndex], i = this.data[n].val, s = this.languages[r][i], o = this.data[n].serial;
        this.$.rowNumber.setContent("ROW " + n), this.$.text.setContent(s), this.$.serial.setContent("#" + o);
    },
    setupReorderComponents: function(e, t) {
        var n = t.index;
        if (!this.data[n])
            return;
        var r = this.data[n].langs[this.data[n].currentIndex], i = this.data[n].val, s = this.languages[r][i];
        this.$.reorderTitle.setContent(s);
    },
    setupSwipeItem: function(e, t) {
        var n = t.index;
        if (!this.data[n])
            return;
        var r = t.xDirection == 1 ? this.getNextLang(n) : this.getPrevLang(n);
        this.$.swipeTitle.setContent(this.data[n].langs[r]);
    },
    swipeComplete: function(e, t) {
        var n = t.index;
        this.data[n].currentIndex = t.xDirection == 1 ? this.getNextLang(n) : this.getPrevLang(n), this.$.list.renderRow(n);
    },
    getNextLang: function(e) {
        var t = this.data[e].currentIndex;
        return (t + 1) % this.data[e].langs.length;
    },
    getPrevLang: function(e) {
        var t = this.data[e].currentIndex;
        return (t - 1 + this.data[e].langs.length) % this.data[e].langs.length;
    },
    populateList: function() {
        this.createRandomData(), this.$.list.setCount(this.data.length), this.$.list.reset();
    },
    createRandomData: function() {
        var e = this.getLanguages(), t, n = parseInt(this.$.numRows.getValue(), 10);
        this.data = [];
        var r = function() {
            return .5 - Math.random();
        };
        for (var i = 0; i < n; i++)
            t = enyo.clone(e), t.sort(r), this.data.push({
                langs: t,
                val: i % 10,
                currentIndex: 0,
                serial: i
            });
        this.data.sort(function() {
            return .5 - Math.random();
        });
    },
    getLanguages: function() {
        return enyo.keys(this.languages);
    }
});

// FlyweightRepeaterSample.js

enyo.kind({
    name: "enyo.sample.FlyweightRepeaterSample",
    kind: "FittableRows",
    classes: "flyweight-repeater-sample enyo-fit onyx",
    components: [{
            kind: "onyx.Toolbar",
            components: [{
                    content: "FlyweightRepeater Result"
                }]
        }, {
            name: "result",
            style: "padding:12px; font-size: 20px;",
            content: "Nothing selected yet."
        }, {
            kind: "enyo.Scroller",
            fit: !0,
            components: [{
                    name: "repeater",
                    kind: "enyo.FlyweightRepeater",
                    classes: "flyweight-repeater-sample-list",
                    count: 26,
                    onSetupItem: "setupItem",
                    components: [{
                            name: "item",
                            classes: "flyweight-repeater-sample-item"
                        }]
                }]
        }],
    handlers: {
        onSelect: "itemSelected"
    },
    people: [{
            name: "Andrew"
        }, {
            name: "Betty"
        }, {
            name: "Christopher"
        }, {
            name: "Donna"
        }, {
            name: "Ephraim"
        }, {
            name: "Frankie"
        }, {
            name: "Gerald"
        }, {
            name: "Heather"
        }, {
            name: "Ingred"
        }, {
            name: "Jack"
        }, {
            name: "Kevin"
        }, {
            name: "Lucy"
        }, {
            name: "Matthew"
        }, {
            name: "Noreen"
        }, {
            name: "Oscar"
        }, {
            name: "Pedro"
        }, {
            name: "Quentin"
        }, {
            name: "Ralph"
        }, {
            name: "Steven"
        }, {
            name: "Tracy"
        }, {
            name: "Uma"
        }, {
            name: "Victor"
        }, {
            name: "Wendy"
        }, {
            name: "Xin"
        }, {
            name: "Yulia"
        }, {
            name: "Zoltan"
        }],
    setupItem: function(e, t) {
        var n = t.index;
        this.$.item.setContent(n + 1 + ". " + this.people[n].name), this.$.item.applyStyle("background", t.selected ? "dodgerblue" : "lightgray");
    },
    itemSelected: function(e, t) {
        var n = t.index, r = t.flyweight.count;
        n >= 0 && n < r && this.$.result.setContent(" [" + (n + 1) + ". " + this.people[n].name + "] is selected");
    }
});

// PersistentSwipeableItemSample.js

enyo.kind({
    name: "enyo.sample.PersistentSwipeableItemSample",
    kind: "FittableRows",
    classes: "list-sample-persistent-swipeable-item enyo-fit",
    data: ["Cat", "Dog", "Hippopotamus"],
    components: [{
            kind: "List",
            classes: "list-sample-persistent-swipeable-item-list enyo-unselectable",
            fit: !0,
            multiSelect: !0,
            reorderable: !1,
            enableSwipe: !0,
            centerReorderContainer: !1,
            onSetupItem: "setupItem",
            onSetupSwipeItem: "setupSwipeItem",
            onSwipeComplete: "swipeComplete",
            components: [{
                    name: "item",
                    classes: "list-sample-persistent-swipeable-item-item",
                    components: [{
                            name: "text",
                            classes: "itemLabel",
                            allowHtml: !0
                        }]
                }],
            swipeableComponents: [{
                    name: "swipeItem",
                    classes: "enyo-fit swipeGreen",
                    components: [{
                            name: "swipeTitle",
                            classes: "swipeTitle",
                            content: "This is a test"
                        }]
                }]
        }],
    rendered: function() {
        this.inherited(arguments), this.populateList();
    },
    populateList: function() {
        this.$.list.setCount(this.data.length), this.$.list.reset();
    },
    setupItem: function(e, t) {
        if (!this.data[t.index])
            return;
        this.$.text.setContent(this.data[t.index]);
    },
    setupSwipeItem: function(e, t) {
        if (!this.data[t.index])
            return;
        t.xDirection === -1 ? (this.$.list.setPersistSwipeableItem(!0), this.$.swipeTitle.setContent("This is a persistent item"), this.$.swipeItem.removeClass("swipeGreen"), this.$.swipeItem.addClass("swipeRed")) : (this.$.list.setPersistSwipeableItem(!1), this.$.swipeTitle.setContent("This is not a persistent item"), this.$.swipeItem.removeClass("swipeRed"), this.$.swipeItem.addClass("swipeGreen"));
    },
    swipeComplete: function(e, t) {
    }
});

// Node.js

enyo.kind({
    name: "enyo.Node",
    published: {
        expandable: !1,
        expanded: !1,
        icon: "",
        onlyIconExpands: !1,
        selected: !1
    },
    style: "padding: 0 0 0 16px;",
    content: "Node",
    defaultKind: "Node",
    classes: "enyo-node",
    components: [{
            name: "icon",
            kind: "Image",
            showing: !1
        }, {
            kind: "Control",
            name: "caption",
            Xtag: "span",
            style: "display: inline-block; padding: 4px;",
            allowHtml: !0
        }, {
            kind: "Control",
            name: "extra",
            tag: "span",
            allowHtml: !0
        }],
    childClient: [{
            kind: "Control",
            name: "box",
            classes: "enyo-node-box",
            Xstyle: "border: 1px solid orange;",
            components: [{
                    kind: "Control",
                    name: "client",
                    classes: "enyo-node-client",
                    Xstyle: "border: 1px solid lightblue;"
                }]
        }],
    handlers: {
        ondblclick: "dblclick"
    },
    events: {
        onNodeTap: "nodeTap",
        onNodeDblClick: "nodeDblClick",
        onExpand: "nodeExpand",
        onDestroyed: "nodeDestroyed"
    },
    create: function() {
        this.inherited(arguments), this.selectedChanged(), this.iconChanged();
    },
    destroy: function() {
        this.doDestroyed(), this.inherited(arguments);
    },
    initComponents: function() {
        this.expandable && (this.kindComponents = this.kindComponents.concat(this.childClient)), this.inherited(arguments);
    },
    contentChanged: function() {
        this.$.caption.setContent(this.content);
    },
    iconChanged: function() {
        this.$.icon.setSrc(this.icon), this.$.icon.setShowing(Boolean(this.icon));
    },
    selectedChanged: function() {
        this.addRemoveClass("enyo-selected", this.selected);
    },
    rendered: function() {
        this.inherited(arguments), this.expandable && !this.expanded && this.quickCollapse();
    },
    addNodes: function(e) {
        this.destroyClientControls();
        for (var t = 0, n; n = e[t]; t++)
            this.createComponent(n);
        this.$.client.render();
    },
    addTextNodes: function(e) {
        this.destroyClientControls();
        for (var t = 0, n; n = e[t]; t++)
            this.createComponent({
                content: n
            });
        this.$.client.render();
    },
    tap: function(e, t) {
        return this.onlyIconExpands ? t.target == this.$.icon.hasNode() ? this.toggleExpanded() : this.doNodeTap() : (this.toggleExpanded(), this.doNodeTap()), !0;
    },
    dblclick: function(e, t) {
        return this.doNodeDblClick(), !0;
    },
    toggleExpanded: function() {
        this.setExpanded(!this.expanded);
    },
    quickCollapse: function() {
        this.removeClass("enyo-animate"), this.$.box.applyStyle("height", "0");
        var e = this.$.client.getBounds().height;
        this.$.client.setBounds({
            top: -e
        });
    },
    _expand: function() {
        this.addClass("enyo-animate");
        var e = this.$.client.getBounds().height;
        this.$.box.setBounds({
            height: e
        }), this.$.client.setBounds({
            top: 0
        }), setTimeout(enyo.bind(this, function() {
            this.expanded && (this.removeClass("enyo-animate"), this.$.box.applyStyle("height", "auto"));
        }), 225);
    },
    _collapse: function() {
        this.removeClass("enyo-animate");
        var e = this.$.client.getBounds().height;
        this.$.box.setBounds({
            height: e
        }), setTimeout(enyo.bind(this, function() {
            this.addClass("enyo-animate"), this.$.box.applyStyle("height", "0"), this.$.client.setBounds({
                top: -e
            });
        }), 25);
    },
    expandedChanged: function(e) {
        if (!this.expandable)
            this.expanded = !1;
        else {
            var t = {
                expanded: this.expanded
            };
            this.doExpand(t), t.wait || this.effectExpanded();
        }
    },
    effectExpanded: function() {
        this.$.client && (this.expanded ? this._expand() : this._collapse());
    }
});

// TreeSample.js

enyo.kind({
    name: "enyo.sample.TreeSample",
    classes: "enyo-unselectable enyo-fit",
    kind: "FittableRows",
    fit: !0,
    components: [{
            kind: "Selection",
            onSelect: "select",
            onDeselect: "deselect"
        }, {
            kind: "Scroller",
            fit: !0,
            components: [{
                    kind: "Node",
                    icon: "assets/folder-open.png",
                    content: "Tree",
                    expandable: !0,
                    expanded: !0,
                    onExpand: "nodeExpand",
                    onNodeTap: "nodeTap",
                    components: [{
                            icon: "assets/file.png",
                            content: "Alpha"
                        }, {
                            icon: "assets/folder-open.png",
                            content: "Bravo",
                            expandable: !0,
                            expanded: !0,
                            components: [{
                                    icon: "assets/file.png",
                                    content: "Bravo-Alpha"
                                }, {
                                    icon: "assets/file.png",
                                    content: "Bravo-Bravo"
                                }, {
                                    icon: "assets/file.png",
                                    content: "Bravo-Charlie"
                                }]
                        }, {
                            icon: "assets/folder.png",
                            content: "Charlie",
                            expandable: !0,
                            components: [{
                                    icon: "assets/file.png",
                                    content: "Charlie-Alpha"
                                }, {
                                    icon: "assets/file.png",
                                    content: "Charlie-Bravo"
                                }, {
                                    icon: "assets/file.png",
                                    content: "Charlie-Charlie"
                                }]
                        }, {
                            icon: "assets/folder-open.png",
                            content: "Delta",
                            expandable: !0,
                            expanded: !0,
                            components: [{
                                    icon: "assets/file.png",
                                    content: "Delta-Alpha"
                                }, {
                                    icon: "assets/file.png",
                                    content: "Delta-Bravo"
                                }, {
                                    icon: "assets/file.png",
                                    content: "Delta-Charlie"
                                }]
                        }, {
                            icon: "assets/file.png",
                            content: "Epsilon"
                        }]
                }]
        }],
    nodeExpand: function(e, t) {
        e.setIcon("assets/" + (e.expanded ? "folder-open.png" : "folder.png"));
    },
    nodeTap: function(e, t) {
        var n = t.originator;
        this.$.selection.select(n.id, n);
    },
    select: function(e, t) {
        t.data.$.caption.applyStyle("background-color", "lightblue");
    },
    deselect: function(e, t) {
        t.data.$.caption.applyStyle("background-color", null);
    }
});

// ImageViewPin.js

enyo.kind({
    name: "enyo.ImageViewPin",
    kind: "enyo.Control",
    published: {
        highlightAnchorPoint: !1,
        anchor: {
            top: 0,
            left: 0
        },
        position: {
            top: 0,
            left: 0
        }
    },
    style: "position:absolute;z-index:1000;width:0px;height:0px;",
    handlers: {
        onPositionPin: "reAnchor"
    },
    create: function() {
        this.inherited(arguments), this.styleClientControls(), this.positionClientControls(), this.highlightAnchorPointChanged(), this.anchorChanged();
    },
    styleClientControls: function() {
        var e = this.getClientControls();
        for (var t = 0; t < e.length; t++)
            e[t].applyStyle("position", "absolute");
    },
    positionClientControls: function() {
        var e = this.getClientControls();
        for (var t = 0; t < e.length; t++)
            for (var n in this.position)
                e[t].applyStyle(n, this.position[n] + "px");
    },
    highlightAnchorPointChanged: function() {
        this.addRemoveClass("pinDebug", this.highlightAnchorPoint);
    },
    anchorChanged: function() {
        var e = null, t = null;
        for (t in this.anchor) {
            e = this.anchor[t].toString().match(/^(\d+(?:\.\d+)?)(.*)$/);
            if (!e)
                continue;
            this.anchor[t + "Coords"] = {
                value: e[1],
                units: e[2] || "px"
            };
        }
    },
    reAnchor: function(e, t) {
        var n = t.scale, r = t.bounds, i = this.anchor.right ? this.anchor.rightCoords.units == "px" ? r.width + r.x - this.anchor.rightCoords.value * n : r.width * (100 - this.anchor.rightCoords.value) / 100 + r.x : this.anchor.leftCoords.units == "px" ? this.anchor.leftCoords.value * n + r.x : r.width * this.anchor.leftCoords.value / 100 + r.x, s = this.anchor.bottom ? this.anchor.bottomCoords.units == "px" ? r.height + r.y - this.anchor.bottomCoords.value * n : r.height * (100 - this.anchor.bottomCoords.value) / 100 + r.y : this.anchor.topCoords.units == "px" ? this.anchor.topCoords.value * n + r.y : r.height * this.anchor.topCoords.value / 100 + r.y;
        this.applyStyle("left", i + "px"), this.applyStyle("top", s + "px");
    }
});

// ImageView.js

enyo.kind({
    name: "enyo.ImageView",
    kind: enyo.Scroller,
    touchOverscroll: !1,
    thumb: !1,
    animate: !0,
    verticalDragPropagation: !0,
    horizontalDragPropagation: !0,
    published: {
        scale: "auto",
        disableZoom: !1,
        src: undefined
    },
    events: {
        onZoom: ""
    },
    touch: !0,
    preventDragPropagation: !1,
    handlers: {
        ondragstart: "dragPropagation"
    },
    components: [{
            name: "animator",
            kind: "Animator",
            onStep: "zoomAnimationStep",
            onEnd: "zoomAnimationEnd"
        }, {
            name: "viewport",
            style: "overflow:hidden;min-height:100%;min-width:100%;",
            classes: "enyo-fit",
            ongesturechange: "gestureTransform",
            ongestureend: "saveState",
            ontap: "singleTap",
            ondblclick: "doubleClick",
            onmousewheel: "mousewheel",
            components: [{
                    kind: "Image",
                    ondown: "down"
                }]
        }],
    create: function() {
        this.inherited(arguments), this.canTransform = enyo.dom.canTransform(), this.canTransform || this.$.image.applyStyle("position", "relative"), this.canAccelerate = enyo.dom.canAccelerate(), this.bufferImage = new Image, this.bufferImage.onload = enyo.bind(this, "imageLoaded"), this.bufferImage.onerror = enyo.bind(this, "imageError"), this.srcChanged(), this.getStrategy().setDragDuringGesture(!1), this.getStrategy().$.scrollMath && this.getStrategy().$.scrollMath.start();
    },
    down: function(e, t) {
        t.preventDefault();
    },
    dragPropagation: function(e, t) {
        var n = this.getStrategy().getScrollBounds(), r = n.top === 0 && t.dy > 0 || n.top >= n.maxTop - 2 && t.dy < 0, i = n.left === 0 && t.dx > 0 || n.left >= n.maxLeft - 2 && t.dx < 0;
        return !(r && this.verticalDragPropagation || i && this.horizontalDragPropagation);
    },
    mousewheel: function(e, t) {
        t.pageX |= t.clientX + t.target.scrollLeft, t.pageY |= t.clientY + t.target.scrollTop;
        var n = (this.maxScale - this.minScale) / 10, r = this.scale;
        if (t.wheelDelta > 0 || t.detail < 0)
            this.scale = this.limitScale(this.scale + n);
        else if (t.wheelDelta < 0 || t.detail > 0)
            this.scale = this.limitScale(this.scale - n);
        return this.eventPt = this.calcEventLocation(t), this.transformImage(this.scale), r != this.scale && this.doZoom({
            scale: this.scale
        }), this.ratioX = this.ratioY = null, t.preventDefault(), !0;
    },
    srcChanged: function() {
        this.src && this.src.length > 0 && this.bufferImage && this.src != this.bufferImage.src && (this.bufferImage.src = this.src);
    },
    imageLoaded: function(e) {
        this.originalWidth = this.bufferImage.width, this.originalHeight = this.bufferImage.height, this.scaleChanged(), this.$.image.setSrc(this.bufferImage.src), enyo.dom.transformValue(this.getStrategy().$.client, "translate3d", "0px, 0px, 0"), this.positionClientControls(this.scale), this.alignImage();
    },
    resizeHandler: function() {
        this.inherited(arguments), this.$.image.src && this.scaleChanged();
    },
    scaleChanged: function() {
        var e = this.hasNode();
        if (e) {
            this.containerWidth = e.clientWidth, this.containerHeight = e.clientHeight;
            var t = this.containerWidth / this.originalWidth, n = this.containerHeight / this.originalHeight;
            this.minScale = Math.min(t, n), this.maxScale = this.minScale * 3 < 1 ? 1 : this.minScale * 3, this.scale == "auto" ? this.scale = this.minScale : this.scale == "width" ? this.scale = t : this.scale == "height" ? this.scale = n : this.scale == "fit" ? (this.fitAlignment = "center", this.scale = Math.max(t, n)) : (this.maxScale = Math.max(this.maxScale, this.scale), this.scale = this.limitScale(this.scale));
        }
        this.eventPt = this.calcEventLocation(), this.transformImage(this.scale);
    },
    imageError: function(e) {
        enyo.error("Error loading image: " + this.src), this.bubble("onerror", e);
    },
    alignImage: function() {
        if (this.fitAlignment && this.fitAlignment === "center") {
            var e = this.getScrollBounds();
            this.setScrollLeft(e.maxLeft / 2), this.setScrollTop(e.maxTop / 2);
        }
    },
    gestureTransform: function(e, t) {
        this.eventPt = this.calcEventLocation(t), this.transformImage(this.limitScale(this.scale * t.scale));
    },
    calcEventLocation: function(e) {
        var t = {
            x: 0,
            y: 0
        };
        if (e && this.hasNode()) {
            var n = this.node.getBoundingClientRect();
            t.x = Math.round(e.pageX - n.left - this.imageBounds.x), t.x = Math.max(0, Math.min(this.imageBounds.width, t.x)), t.y = Math.round(e.pageY - n.top - this.imageBounds.y), t.y = Math.max(0, Math.min(this.imageBounds.height, t.y));
        }
        return t;
    },
    transformImage: function(e) {
        this.tapped = !1;
        var t = this.imageBounds || this.innerImageBounds(e);
        this.imageBounds = this.innerImageBounds(e), this.scale > this.minScale ? this.$.viewport.applyStyle("cursor", "move") : this.$.viewport.applyStyle("cursor", null), this.$.viewport.setBounds({
            width: this.imageBounds.width + "px",
            height: this.imageBounds.height + "px"
        }), this.ratioX = this.ratioX || (this.eventPt.x + this.getScrollLeft()) / t.width, this.ratioY = this.ratioY || (this.eventPt.y + this.getScrollTop()) / t.height;
        var n, r;
        this.$.animator.ratioLock ? (n = this.$.animator.ratioLock.x * this.imageBounds.width - this.containerWidth / 2, r = this.$.animator.ratioLock.y * this.imageBounds.height - this.containerHeight / 2) : (n = this.ratioX * this.imageBounds.width - this.eventPt.x, r = this.ratioY * this.imageBounds.height - this.eventPt.y), n = Math.max(0, Math.min(this.imageBounds.width - this.containerWidth, n)), r = Math.max(0, Math.min(this.imageBounds.height - this.containerHeight, r));
        if (this.canTransform) {
            var i = {
                scale: e
            };
            this.canAccelerate ? i = enyo.mixin({
                translate3d: Math.round(this.imageBounds.left) + "px, " + Math.round(this.imageBounds.top) + "px, 0px"
            }, i) : i = enyo.mixin({
                translate: this.imageBounds.left + "px, " + this.imageBounds.top + "px"
            }, i), enyo.dom.transform(this.$.image, i);
        } else
            this.$.image.setBounds({
                width: this.imageBounds.width + "px",
                height: this.imageBounds.height + "px",
                left: this.imageBounds.left + "px",
                top: this.imageBounds.top + "px"
            });
        this.setScrollLeft(n), this.setScrollTop(r), this.positionClientControls(e);
    },
    limitScale: function(e) {
        return this.disableZoom ? e = this.scale : e > this.maxScale ? e = this.maxScale : e < this.minScale && (e = this.minScale), e;
    },
    innerImageBounds: function(e) {
        var t = this.originalWidth * e, n = this.originalHeight * e, r = {
            x: 0,
            y: 0,
            transX: 0,
            transY: 0
        };
        return t < this.containerWidth && (r.x += (this.containerWidth - t) / 2), n < this.containerHeight && (r.y += (this.containerHeight - n) / 2), this.canTransform && (r.transX -= (this.originalWidth - t) / 2, r.transY -= (this.originalHeight - n) / 2), {
            left: r.x + r.transX,
            top: r.y + r.transY,
            width: t,
            height: n,
            x: r.x,
            y: r.y
        };
    },
    saveState: function(e, t) {
        var n = this.scale;
        this.scale *= t.scale, this.scale = this.limitScale(this.scale), n != this.scale && this.doZoom({
            scale: this.scale
        }), this.ratioX = this.ratioY = null;
    },
    doubleClick: function(e, t) {
        enyo.platform.ie == 8 && (this.tapped = !0, t.pageX = t.clientX + t.target.scrollLeft, t.pageY = t.clientY + t.target.scrollTop, this.singleTap(e, t), t.preventDefault());
    },
    singleTap: function(e, t) {
        setTimeout(enyo.bind(this, function() {
            this.tapped = !1;
        }), 300), this.tapped ? (this.tapped = !1, this.smartZoom(e, t)) : this.tapped = !0;
    },
    smartZoom: function(e, t) {
        var n = this.hasNode(), r = this.$.image.hasNode();
        if (n && r && this.hasNode() && !this.disableZoom) {
            var i = this.scale;
            this.scale != this.minScale ? this.scale = this.minScale : this.scale = this.maxScale, this.eventPt = this.calcEventLocation(t);
            if (this.animate) {
                var s = {
                    x: (this.eventPt.x + this.getScrollLeft()) / this.imageBounds.width,
                    y: (this.eventPt.y + this.getScrollTop()) / this.imageBounds.height
                };
                this.$.animator.play({
                    duration: 350,
                    ratioLock: s,
                    baseScale: i,
                    deltaScale: this.scale - i
                });
            } else
                this.transformImage(this.scale), this.doZoom({
                    scale: this.scale
                });
        }
    },
    zoomAnimationStep: function(e, t) {
        var n = this.$.animator.baseScale + this.$.animator.deltaScale * this.$.animator.value;
        this.transformImage(n);
    },
    zoomAnimationEnd: function(e, t) {
        this.doZoom({
            scale: this.scale
        }), this.$.animator.ratioLock = undefined;
    },
    positionClientControls: function(e) {
        this.waterfallDown("onPositionPin", {
            scale: e,
            bounds: this.imageBounds
        });
    }
});

// ImageCarousel.js

enyo.kind({
    name: "enyo.ImageCarousel",
    kind: enyo.Panels,
    arrangerKind: "enyo.CarouselArranger",
    defaultScale: "auto",
    disableZoom: !1,
    lowMemory: !1,
    published: {
        images: []
    },
    handlers: {
        onTransitionStart: "transitionStart",
        onTransitionFinish: "transitionFinish"
    },
    create: function() {
        this.inherited(arguments), this.imageCount = this.images.length, this.images.length > 0 && (this.initContainers(), this.loadNearby());
    },
    initContainers: function() {
        for (var e = 0; e < this.images.length; e++)
            this.$["container" + e] || (this.createComponent({
                name: "container" + e,
                style: "height:100%; width:100%;"
            }), this.$["container" + e].render());
        for (e = this.images.length; e < this.imageCount; e++)
            this.$["image" + e] && this.$["image" + e].destroy(), this.$["container" + e].destroy();
        this.imageCount = this.images.length;
    },
    loadNearby: function() {
        var e = this.getBufferRange();
        for (var t in e)
            this.loadImageView(e[t]);
    },
    getBufferRange: function() {
        var e = [];
        if (this.layout.containerBounds) {
            var t = 1, n = this.layout.containerBounds, r, i, s, o, u, a;
            o = this.index - 1, u = 0, a = n.width * t;
            while (o >= 0 && u <= a)
                s = this.$["container" + o], u += s.width + s.marginWidth, e.unshift(o), o--;
            o = this.index, u = 0, a = n.width * (t + 1);
            while (o < this.images.length && u <= a)
                s = this.$["container" + o], u += s.width + s.marginWidth, e.push(o), o++;
        }
        return e;
    },
    reflow: function() {
        this.inherited(arguments), this.loadNearby();
    },
    loadImageView: function(e) {
        return this.wrap && (e = (e % this.images.length + this.images.length) % this.images.length), e >= 0 && e <= this.images.length - 1 && (this.$["image" + e] ? this.$["image" + e].src != this.images[e] && (this.$["image" + e].setSrc(this.images[e]), this.$["image" + e].setScale(this.defaultScale), this.$["image" + e].setDisableZoom(this.disableZoom)) : (this.$["container" + e].createComponent({
            name: "image" + e,
            kind: "ImageView",
            scale: this.defaultScale,
            disableZoom: this.disableZoom,
            src: this.images[e],
            verticalDragPropagation: !1,
            style: "height:100%; width:100%;"
        }, {
            owner: this
        }), this.$["image" + e].render())), this.$["image" + e];
    },
    setImages: function(e) {
        this.setPropertyValue("images", e, "imagesChanged");
    },
    imagesChanged: function() {
        this.initContainers(), this.loadNearby();
    },
    indexChanged: function() {
        this.loadNearby(), this.lowMemory && this.cleanupMemory(), this.inherited(arguments);
    },
    transitionStart: function(e, t) {
        if (t.fromIndex == t.toIndex)
            return !0;
    },
    transitionFinish: function(e, t) {
        this.loadNearby(), this.lowMemory && this.cleanupMemory();
    },
    getActiveImage: function() {
        return this.getImageByIndex(this.index);
    },
    getImageByIndex: function(e) {
        return this.$["image" + e] || this.loadImageView(e);
    },
    cleanupMemory: function() {
        var e = getBufferRange();
        for (var t = 0; t < this.images.length; t++)
            enyo.indexOf(t, e) === -1 && this.$["image" + t] && this.$["image" + t].destroy();
    }
});

// ImageViewSample.js

enyo.kind({
    name: "enyo.sample.ImageViewSample",
    components: [{
            name: "sampleImageView",
            kind: "ImageView",
            src: "assets/globe.jpg",
            scale: "auto",
            classes: "enyo-fit",
            components: [{
                    kind: "enyo.ImageViewPin",
                    highlightAnchorPoint: !0,
                    anchor: {
                        top: 79,
                        right: 224
                    },
                    position: {
                        bottom: 0,
                        left: -16
                    },
                    components: [{
                            kind: "Image",
                            src: "assets/pin.png"
                        }]
                }, {
                    kind: "enyo.ImageViewPin",
                    anchor: {
                        top: 280,
                        left: 415
                    },
                    position: {
                        bottom: 0,
                        right: -16
                    },
                    components: [{
                            kind: "Image",
                            src: "assets/pin.png"
                        }]
                }, {
                    kind: "enyo.ImageViewPin",
                    highlightAnchorPoint: !0,
                    anchor: {
                        bottom: "20%",
                        left: "400px"
                    },
                    position: {
                        bottom: 0,
                        left: 0
                    },
                    components: [{
                            style: "background:rgba(255,255,255,0.8);border:1px solid #888;margin:0px;padding:0px;width:300px",
                            components: [{
                                    tag: "h3",
                                    content: "This is a text box"
                                }]
                        }]
                }, {
                    name: "testPin",
                    kind: "enyo.ImageViewPin",
                    anchor: {
                        top: "10%",
                        right: "10%"
                    },
                    position: {
                        top: 0,
                        left: 0
                    },
                    components: [{
                            style: "border:1px solid yellow;width:10px;background:red;height:10px;"
                        }]
                }]
        }]
});

// ImageCarouselSample.js

enyo.kind({
    name: "enyo.sample.ImageCarouselSample",
    kind: "FittableRows",
    classes: "enyo-fit",
    components: [{
            kind: "onyx.Toolbar",
            style: "text-align:center;",
            components: [{
                    kind: "onyx.Button",
                    content: "&larr;",
                    allowHtml: !0,
                    ontap: "previous"
                }, {
                    kind: "onyx.Button",
                    content: "&rarr;",
                    allowHtml: !0,
                    ontap: "next"
                }, {
                    kind: "onyx.InputDecorator",
                    classes: "imagecarousel-sample-input",
                    components: [{
                            name: "carouselIndexInput",
                            kind: "onyx.Input",
                            value: "0",
                            onchange: "updateIndex"
                        }]
                }]
        }, {
            name: "carousel",
            kind: "ImageCarousel",
            fit: !0,
            onload: "load",
            onZoom: "zoom",
            onerror: "error",
            onTransitionStart: "transitionStart",
            onTransitionFinish: "transitionFinish"
        }],
    create: function() {
        this.inherited(arguments), this.urls = ["assets/mercury.jpg", "assets/venus.jpg", "assets/earth.jpg", "assets/mars.jpg", "assets/jupiter.jpg", "assets/saturn.jpg", "assets/uranus.jpg", "assets/neptune.jpg"], this.$.carousel.setImages(this.urls);
    },
    load: function(e, t) {
    },
    zoom: function(e, t) {
    },
    error: function(e, t) {
    },
    transitionStart: function(e, t) {
    },
    transitionFinish: function(e, t) {
        this.$.carouselIndexInput && this.$.carouselIndexInput.setValue(t.toIndex);
    },
    previous: function(e, t) {
        this.$.carousel.previous();
    },
    next: function(e, t) {
        this.$.carousel.next();
    },
    getRandomIndex: function() {
        var e = Math.floor(Math.random() * this.$.carousel.images.length);
        while (e == this.$.carousel.index)
            e = Math.floor(Math.random() * this.$.carousel.images.length);
        return e;
    },
    updateIndex: function(e, t) {
        var n = this.trimWhitespace(this.$.carouselIndexInput.getValue());
        if (n === "" || isNaN(n))
            return;
        this.$.carousel.setIndex(parseInt(n, 10));
    },
    trimWhitespace: function(e) {
        return e.replace(/^\s+|\s+$/g, "");
    }
});

// ButtonGroupSample.js

enyo.kind({
    name: "onyx.sample.ButtonGroupSample",
    classes: "onyx onyx-sample",
    components: [{
            classes: "onyx-sample-divider",
            content: "RadioGroup"
        }, {
            kind: "onyx.RadioGroup",
            onActivate: "radioActivated",
            components: [{
                    content: "Alpha",
                    active: !0
                }, {
                    content: "Beta"
                }, {
                    content: "Gamma"
                }]
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "TabGroup"
        }, {
            kind: "onyx.RadioGroup",
            onActivate: "tabActivated",
            controlClasses: "onyx-tabbutton",
            components: [{
                    content: "Alpha",
                    active: !0
                }, {
                    content: "Beta"
                }]
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "Button Group"
        }, {
            kind: "Group",
            onActivate: "buttonActivated",
            classes: "onyx-sample-tools group",
            defaultKind: "onyx.Button",
            highlander: !0,
            components: [{
                    content: "Button A",
                    active: !0,
                    classes: "onyx-affirmative"
                }, {
                    content: "Button B",
                    classes: "onyx-negative"
                }, {
                    content: "Button C",
                    classes: "onyx-blue"
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.Groupbox",
            classes: "onyx-sample-result-box",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Result"
                }, {
                    name: "result",
                    classes: "onyx-sample-result",
                    content: "No button tapped yet."
                }]
        }],
    radioActivated: function(e, t) {
        t.originator.getActive() && this.$.result.setContent('The "' + t.originator.getContent() + '" radio button is selected.');
    },
    tabActivated: function(e, t) {
        t.originator.getActive() && this.$.result.setContent('The "' + t.originator.getContent() + '" tab button is selected.');
    },
    buttonActivated: function(e, t) {
        t.originator.getActive() && this.$.result.setContent('The "' + t.originator.getContent() + '" button is selected.');
    }
});

// ButtonSample.js

enyo.kind({
    name: "onyx.sample.ButtonSample",
    classes: "onyx onyx-sample",
    components: [{
            classes: "onyx-sample-divider",
            content: "Buttons"
        }, {
            classes: "onyx-sample-tools",
            components: [{
                    kind: "onyx.Button",
                    content: "Button",
                    ontap: "buttonTapped"
                }]
        }, {
            classes: "onyx-sample-tools",
            components: [{
                    kind: "onyx.Button",
                    content: "Affirmative",
                    classes: "onyx-affirmative",
                    ontap: "buttonTapped"
                }, {
                    kind: "onyx.Button",
                    content: "Negative",
                    classes: "onyx-negative",
                    ontap: "buttonTapped"
                }, {
                    kind: "onyx.Button",
                    content: "Blue",
                    classes: "onyx-blue",
                    ontap: "buttonTapped"
                }, {
                    kind: "onyx.Button",
                    content: "Dark",
                    classes: "onyx-dark",
                    ontap: "buttonTapped"
                }, {
                    kind: "onyx.Button",
                    content: "Custom",
                    style: "background-color: purple; color: #F1F1F1;",
                    ontap: "buttonTapped"
                }]
        }, {
            classes: "onyx-sample-tools",
            components: [{
                    kind: "onyx.Button",
                    content: "Active",
                    classes: "active",
                    ontap: "buttonTapped"
                }, {
                    kind: "onyx.Button",
                    content: "Disabled",
                    disabled: !0,
                    ontap: "buttonTapped"
                }, {
                    kind: "onyx.Button",
                    content: "Active Disabled",
                    classes: "active",
                    disabled: !0,
                    ontap: "buttonTapped"
                }]
        }, {
            classes: "onyx-sample-tools",
            components: [{
                    kind: "onyx.Button",
                    content: "Tall Button",
                    style: "height: 70px;",
                    ontap: "buttonTapped"
                }]
        }, {
            classes: "onyx-sample-divider",
            content: "Buttons with images"
        }, {
            classes: "onyx-sample-tools",
            components: [{
                    kind: "onyx.Button",
                    name: "Image Button",
                    ontap: "buttonTapped",
                    components: [{
                            tag: "img",
                            attributes: {
                                src: "assets/favicon.ico"
                            }
                        }, {
                            content: "There is an image here"
                        }]
                }, {
                    kind: "onyx.Button",
                    name: "Fishbowl Button",
                    ontap: "buttonTapped",
                    components: [{
                            kind: "onyx.Icon",
                            src: "assets/fish_bowl.png"
                        }]
                }]
        }, {
            kind: "onyx.Groupbox",
            classes: "onyx-sample-result-box",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Result"
                }, {
                    name: "result",
                    classes: "onyx-sample-result",
                    content: "No button tapped yet."
                }]
        }],
    buttonTapped: function(e, t) {
        e.content ? this.$.result.setContent('The "' + e.getContent() + '" button was tapped') : this.$.result.setContent('The "' + e.getName() + '" button was tapped');
    }
});

// CheckboxSample.js

enyo.kind({
    name: "onyx.sample.CheckboxSample",
    classes: "onyx onyx-sample",
    components: [{
            classes: "onyx-sample-divider",
            content: "Checkboxes"
        }, {
            classes: "onyx-sample-tools",
            components: [{
                    kind: "onyx.Checkbox",
                    onchange: "checkboxChanged"
                }, {
                    kind: "onyx.Checkbox",
                    onchange: "checkboxChanged"
                }, {
                    kind: "onyx.Checkbox",
                    onchange: "checkboxChanged",
                    checked: !0
                }]
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "Checkboxes Group"
        }, {
            kind: "Group",
            classes: "onyx-sample-tools group",
            onActivate: "groupActivated",
            highlander: !0,
            components: [{
                    kind: "onyx.Checkbox",
                    checked: !0
                }, {
                    kind: "onyx.Checkbox"
                }, {
                    kind: "onyx.Checkbox"
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.Groupbox",
            classes: "onyx-sample-result-box",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Result"
                }, {
                    name: "result",
                    classes: "onyx-sample-result",
                    content: "No button tapped yet."
                }]
        }],
    checkboxChanged: function(e, t) {
        this.$.result.setContent(e.name + " was " + (e.getValue() ? " selected." : "deselected."));
    },
    ordinals: ["1st", "2nd", "3rd"],
    groupActivated: function(e, t) {
        if (t.originator.getActive()) {
            var n = t.originator.indexInContainer();
            this.$.result.setContent("The " + this.ordinals[n] + " checkbox in the group is selected.");
        }
    }
});

// GroupboxSample.js

enyo.kind({
    name: "onyx.sample.GroupboxSample",
    classes: "onyx onyx-sample",
    components: [{
            classes: "onyx-sample-divider",
            content: "Groupboxes"
        }, {
            kind: "onyx.Groupbox",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Header"
                }, {
                    content: "I'm a group item!",
                    style: "padding: 8px;"
                }, {
                    content: "I'm a group item!",
                    style: "padding: 8px;"
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.Groupbox",
            components: [{
                    content: "I'm a group item!",
                    style: "padding: 8px;"
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.Groupbox",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Header"
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            style: "width: 100%",
                            placeholder: "Enter text here"
                        }]
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            style: "width: 100%",
                            value: "Middle"
                        }]
                }, {
                    kind: "onyx.InputDecorator",
                    style: "background: lightblue;",
                    components: [{
                            kind: "onyx.Input",
                            style: "width: 100%;",
                            value: "Last"
                        }]
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.Groupbox",
            components: [{
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            style: "width: 100%",
                            placeholder: "Enter text here"
                        }]
                }]
        }, {
            kind: "onyx.Groupbox",
            components: [{
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            type: "password",
                            style: "width: 100%",
                            placeholder: "Enter Password"
                        }]
                }]
        }]
});

// IconButtonSample.js

enyo.kind({
    name: "onyx.sample.IconButtonSample",
    classes: "onyx onyx-sample",
    components: [{
            classes: "onyx-sample-divider",
            content: "Icon"
        }, {
            kind: "onyx.Icon",
            src: "assets/menu-icon-bookmark.png"
        }, {
            tag: "br"
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "Icon Button"
        }, {
            kind: "onyx.IconButton",
            src: "assets/menu-icon-bookmark.png",
            ontap: "iconTapped"
        }, {
            kind: "onyx.IconButton",
            src: "assets/menu-icon-bookmark.png",
            disabled: !0,
            ontap: "iconTapped"
        }, {
            tag: "br"
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "Grouped Icon Buttons"
        }, {
            kind: "Group",
            onActivate: "iconGroupActivated",
            components: [{
                    kind: "onyx.IconButton",
                    active: !0,
                    src: "assets/menu-icon-bookmark.png"
                }, {
                    kind: "onyx.IconButton",
                    src: "assets/menu-icon-bookmark.png"
                }, {
                    kind: "onyx.IconButton",
                    src: "assets/menu-icon-bookmark.png"
                }]
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "Toggle Icon Buttons"
        }, {
            kind: "onyx.ToggleIconButton",
            onChange: "toggleChanged",
            src: "assets/menu-icon-bookmark.png"
        }, {
            kind: "onyx.ToggleIconButton",
            onChange: "toggleChanged",
            value: !0,
            src: "assets/menu-icon-bookmark.png"
        }, {
            kind: "onyx.ToggleIconButton",
            onChange: "toggleChanged",
            disabled: !0,
            src: "assets/menu-icon-bookmark.png"
        }, {
            kind: "onyx.ToggleIconButton",
            onChange: "toggleChanged",
            value: !0,
            disabled: !0,
            src: "assets/menu-icon-bookmark.png"
        }, {
            tag: "br"
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "Icon Buttons in Toolbar"
        }, {
            kind: "onyx.Toolbar",
            defaultKind: "onyx.IconButton",
            components: [{
                    src: "assets/menu-icon-bookmark.png",
                    ontap: "iconTapped"
                }, {
                    src: "assets/menu-icon-bookmark.png",
                    ontap: "iconTapped"
                }, {
                    src: "assets/menu-icon-bookmark.png",
                    ontap: "iconTapped"
                }, {
                    kind: "Control"
                }, {
                    kind: "Group",
                    tag: null,
                    onActivate: "iconGroupActivated",
                    defaultKind: "onyx.IconButton",
                    components: [{
                            src: "assets/menu-icon-bookmark.png",
                            active: !0
                        }, {
                            src: "assets/menu-icon-bookmark.png"
                        }, {
                            src: "assets/menu-icon-bookmark.png"
                        }]
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.Groupbox",
            classes: "onyx-sample-result-box",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Result"
                }, {
                    name: "result",
                    classes: "onyx-sample-result",
                    content: "No button tapped yet."
                }]
        }],
    iconTappedCounts: {},
    iconTapped: function(e, t) {
        this.iconTappedCounts[e.name] = this.iconTappedCounts[e.name] || 0, this.$.result.setContent("The icon button was tapped: " + ++this.iconTappedCounts[e.name]);
    },
    toggleChanged: function(e, t) {
        this.$.result.setContent(e.name + " was " + (e.getValue() ? " selected." : "deselected."));
    },
    ordinals: ["1st", "2nd", "3rd"],
    iconGroupActivated: function(e, t) {
        if (t.originator.getActive()) {
            var n = t.originator.indexInContainer();
            this.$.result.setContent("The " + this.ordinals[n] + " icon button in the group is selected.");
        }
    }
});

// InputSample.js

enyo.kind({
    name: "onyx.sample.InputSample",
    classes: "onyx onyx-sample",
    components: [{
            classes: "onyx-sample-divider",
            content: "Inputs"
        }, {
            classes: "onyx-toolbar-inline",
            components: [{
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            placeholder: "Enter text here",
                            onchange: "inputChanged"
                        }]
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            placeholder: "Search term",
                            onchange: "inputChanged"
                        }, {
                            kind: "Image",
                            src: "assets/search-input-search.png"
                        }]
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            type: "password",
                            placeholder: "Enter password",
                            onchange: "inputChanged"
                        }]
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            content: "alwaysLookFocused:"
                        }, {
                            kind: "onyx.Checkbox",
                            onchange: "changeFocus"
                        }]
                }]
        }, {
            classes: "onyx-toolbar-inline",
            components: [{
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            disabled: !0,
                            value: "Disabled input"
                        }]
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            content: "Left:"
                        }, {
                            kind: "onyx.Input",
                            value: "Input Area",
                            onchange: "inputChanged"
                        }, {
                            content: " :Right"
                        }]
                }]
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "RichTexts"
        }, {
            classes: "onyx-toolbar-inline",
            components: [{
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.RichText",
                            style: "width: 200px;",
                            placeholder: "Enter text here",
                            onchange: "inputChanged"
                        }]
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.RichText",
                            style: "width: 200px;",
                            placeholder: "Search term",
                            onchange: "inputChanged"
                        }, {
                            kind: "Image",
                            src: "assets/search-input-search.png"
                        }]
                }]
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "TextAreas"
        }, {
            classes: "onyx-toolbar-inline",
            components: [{
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.TextArea",
                            placeholder: "Enter text here",
                            onchange: "inputChanged"
                        }]
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.TextArea",
                            placeholder: "Search term",
                            onchange: "inputChanged"
                        }, {
                            kind: "Image",
                            src: "assets/search-input-search.png"
                        }]
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.Groupbox",
            classes: "onyx-sample-result-box",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Result"
                }, {
                    name: "result",
                    classes: "onyx-sample-result",
                    content: "No input entered yet."
                }]
        }],
    inputChanged: function(e, t) {
        this.$.result.setContent("Input: " + e.getValue());
    },
    changeFocus: function(e, t) {
        this.$.inputDecorator.setAlwaysLooksFocused(e.getValue()), this.$.inputDecorator2.setAlwaysLooksFocused(e.getValue()), this.$.inputDecorator3.setAlwaysLooksFocused(e.getValue());
    }
});

// PopupSample.js

enyo.kind({
    name: "onyx.sample.PopupSample",
    classes: "onyx onyx-sample",
    components: [{
            classes: "onyx-sample-divider",
            content: "Popups"
        }, {
            classes: "onyx-sample-tools",
            components: [{
                    kind: "onyx.Button",
                    content: "Basic Popup",
                    ontap: "showPopup",
                    popup: "basicPopup"
                }, {
                    name: "basicPopup",
                    kind: "onyx.Popup",
                    centered: !0,
                    floating: !0,
                    classes: "onyx-sample-popup",
                    style: "padding: 10px;",
                    content: "Popup..."
                }, {
                    tag: "br"
                }, {
                    kind: "onyx.Button",
                    content: "Popup w/Spinner (Dark)",
                    ontap: "showPopup",
                    popup: "spinnerPopup"
                }, {
                    name: "spinnerPopup",
                    classes: "onyx-sample-popup",
                    kind: "onyx.Popup",
                    centered: !0,
                    floating: !0,
                    onHide: "popupHidden",
                    scrim: !0,
                    components: [{
                            kind: "onyx.Spinner"
                        }, {
                            content: "Popup"
                        }]
                }, {
                    tag: "br"
                }, {
                    kind: "onyx.Button",
                    content: "Popup w/Spinner (Light)",
                    ontap: "showPopup",
                    popup: "lightPopup"
                }, {
                    name: "lightPopup",
                    classes: "onyx-sample-popup",
                    style: "background: #eee;color: black;",
                    kind: "onyx.Popup",
                    centered: !0,
                    floating: !0,
                    onHide: "popupHidden",
                    scrim: !0,
                    components: [{
                            kind: "onyx.Spinner",
                            classes: "onyx-light"
                        }, {
                            content: "Popup"
                        }]
                }, {
                    tag: "br"
                }, {
                    kind: "onyx.Button",
                    content: "Modal Popup with Input",
                    ontap: "showPopup",
                    popup: "modalPopup"
                }, {
                    name: "modalPopup",
                    classes: "onyx-sample-popup",
                    kind: "onyx.Popup",
                    centered: !0,
                    modal: !0,
                    floating: !0,
                    onShow: "popupShown",
                    onHide: "popupHidden",
                    components: [{
                            kind: "onyx.InputDecorator",
                            components: [{
                                    kind: "onyx.Input"
                                }]
                        }, {
                            tag: "br"
                        }, {
                            kind: "onyx.Button",
                            content: "Close",
                            ontap: "closeModalPopup"
                        }, {
                            kind: "onyx.Button",
                            content: "Another!",
                            ontap: "showPopup",
                            popup: "lightPopup"
                        }]
                }, {
                    tag: "br"
                }, {
                    kind: "onyx.Button",
                    content: "Popup at Event (right)",
                    ontap: "showPopupAtEvent",
                    popup: "rightEventPopup",
                    style: "float: right;"
                }, {
                    kind: "onyx.Button",
                    content: "Popup at Event",
                    ontap: "showPopupAtEvent",
                    popup: "leftEventPopup"
                }, {
                    name: "leftEventPopup",
                    classes: "onyx-sample-popup",
                    kind: "onyx.Popup",
                    modal: !0,
                    floating: !0,
                    content: "Anchor defaults<br/>to top left corner",
                    allowHtml: !0
                }, {
                    name: "rightEventPopup",
                    classes: "onyx-sample-popup",
                    kind: "onyx.Popup",
                    modal: !0,
                    floating: !0,
                    content: "Adjusts anchor to<br/>stay in viewport",
                    allowHtml: !0
                }]
        }],
    showPopup: function(e) {
        var t = this.$[e.popup];
        t && t.show();
    },
    showPopupAtEvent: function(e, t) {
        var n = this.$[e.popup];
        n && n.showAtEvent(t);
    },
    popupHidden: function() {
        document.activeElement.blur(), this.$.modalPopup.showing && enyo.job("focus", enyo.bind(this.$.input, "focus"), 500);
    },
    popupShown: function() {
        this.$.input.focus(), enyo.job("focus", enyo.bind(this.$.input, "focus"), 500);
    },
    closeModalPopup: function() {
        this.$.modalPopup.hide();
    }
});

// ProgressSample.js

enyo.kind({
    name: "onyx.sample.ProgressSample",
    classes: "onyx onyx-sample",
    components: [{
            classes: "onyx-sample-divider",
            content: "Progress Bars"
        }, {
            kind: "onyx.ProgressBar",
            progress: 25
        }, {
            kind: "onyx.ProgressBar",
            animateStripes: !1,
            progress: 25
        }, {
            kind: "onyx.ProgressBar",
            progress: 25,
            barClasses: "onyx-green"
        }, {
            kind: "onyx.ProgressBar",
            progress: 25,
            barClasses: "onyx-red"
        }, {
            kind: "onyx.ProgressBar",
            progress: 25,
            barClasses: "onyx-dark"
        }, {
            kind: "onyx.ProgressBar",
            animateStripes: !1,
            barClasses: "onyx-light",
            progress: 50
        }, {
            kind: "onyx.ProgressBar",
            showStripes: !1,
            progress: 75
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "Progress Buttons"
        }, {
            kind: "onyx.ProgressButton",
            progress: 25,
            onCancel: "clearValue",
            components: [{
                    content: "0"
                }, {
                    content: "100",
                    style: "float: right;"
                }]
        }, {
            kind: "onyx.ProgressButton",
            animateStripes: !1,
            barClasses: "onyx-dark",
            progress: 50,
            onCancel: "clearValue"
        }, {
            kind: "onyx.ProgressButton",
            showStripes: !1,
            progress: 75,
            onCancel: "clearValue"
        }, {
            tag: "br"
        }, {
            kind: "onyx.InputDecorator",
            style: "margin-right:10px;",
            components: [{
                    kind: "onyx.Input",
                    placeholder: "Value",
                    style: "width:50px;"
                }]
        }, {
            kind: "onyx.Button",
            content: "Set",
            classes: "onyx-sample-spaced-button",
            ontap: "changeValue"
        }, {
            kind: "onyx.Button",
            content: "-",
            classes: "onyx-sample-spaced-button",
            ontap: "decValue"
        }, {
            kind: "onyx.Button",
            content: "+",
            classes: "onyx-sample-spaced-button",
            ontap: "incValue"
        }, {
            tag: "br"
        }, {
            tag: "br"
        }, {
            kind: "onyx.Checkbox",
            name: "animateSetting",
            checked: !0
        }, {
            content: "Animated",
            classes: "enyo-inline onyx-sample-animate-label"
        }, {
            tag: "br"
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "Sliders"
        }, {
            kind: "onyx.Slider",
            min: 10,
            max: 50,
            value: 30
        }, {
            tag: "br"
        }, {
            kind: "onyx.Slider",
            lockBar: !1,
            progress: 20,
            value: 75
        }, {
            tag: "br"
        }, {
            name: "progressSlider",
            kind: "onyx.Slider",
            lockBar: !1,
            value: 75
        }, {
            kind: "onyx.Button",
            content: "Toggle Progress",
            ontap: "toggleProgress"
        }],
    changeValue: function(e, t) {
        for (var n in this.$)
            if (this.$[n].kind == "onyx.ProgressBar" || this.$[n].kind == "onyx.ProgressButton")
                this.$.animateSetting.getValue() ? this.$[n].animateProgressTo(this.$.input.getValue()) : this.$[n].setProgress(this.$.input.getValue());
    },
    incValue: function() {
        this.$.input.setValue(Math.min(parseInt(this.$.input.getValue() || 0, 10) + 10, 100)), this.changeValue();
    },
    decValue: function() {
        this.$.input.setValue(Math.max(parseInt(this.$.input.getValue() || 0, 10) - 10, 0)), this.changeValue();
    },
    clearValue: function(e, t) {
        e.setProgress(0);
    },
    toggleProgress: function() {
        this._progressing = !this._progressing, this.nextProgress();
    },
    nextProgress: function() {
        this._progressing && enyo.requestAnimationFrame(enyo.bind(this, function() {
            this.incrementProgress(), setTimeout(enyo.bind(this, "nextProgress"), 500);
        }), this.hasNode());
    },
    incrementProgress: function() {
        var e = this.$.progressSlider, t = e.min + (e.progress - e.min + 5) % (e.max - e.min + 1);
        e.animateProgressTo(t);
    }
});

// SliderSample.js

enyo.kind({
    name: "onyx.sample.SliderSample",
    classes: "onyx onyx-sample",
    components: [{
            classes: "onyx-sample-divider",
            content: "Sliders"
        }, {
            kind: "onyx.Slider",
            value: 50,
            onChanging: "sliderChanging",
            onChange: "sliderChanged"
        }, {
            tag: "br"
        }, {
            kind: "onyx.Slider",
            lockBar: !1,
            value: 50,
            onChanging: "sliderChanging",
            onChange: "sliderChanged"
        }, {
            tag: "br"
        }, {
            kind: "onyx.InputDecorator",
            style: "margin-right:10px;",
            components: [{
                    kind: "onyx.Input",
                    placeholder: "Value",
                    style: "width:50px;"
                }]
        }, {
            kind: "onyx.Button",
            content: "Set",
            classes: "onyx-sample-spaced-button",
            ontap: "changeValue"
        }, {
            kind: "onyx.Button",
            content: "-",
            classes: "onyx-sample-spaced-button",
            ontap: "decValue"
        }, {
            kind: "onyx.Button",
            content: "+",
            classes: "onyx-sample-spaced-button",
            ontap: "incValue"
        }, {
            tag: "br"
        }, {
            tag: "br"
        }, {
            kind: "onyx.Checkbox",
            name: "animateSetting",
            value: !0
        }, {
            content: "Animated",
            classes: "enyo-inline onyx-sample-animate-label"
        }, {
            kind: "onyx.Checkbox",
            onchange: "sliderIncrementChanged",
            checked: !1
        }, {
            content: "increment by 7",
            classes: "enyo-inline"
        }, {
            tag: "br"
        }, {
            tag: "br"
        }, {
            kind: "onyx.Groupbox",
            classes: "onyx-sample-result-box",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Result"
                }, {
                    name: "result",
                    classes: "onyx-sample-result",
                    content: "No slider moved yet."
                }]
        }, {
            tag: "br"
        }, {
            tag: "br"
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "RangeSlider"
        }, {
            tag: "br"
        }, {
            kind: "onyx.RangeSlider",
            rangeMin: 100,
            rangeMax: 500,
            rangeStart: 200,
            rangeEnd: 400,
            increment: 20,
            showLabels: !0,
            onChanging: "rangeSliderChanging",
            onChange: "rangeSliderChanged"
        }, {
            components: [{
                    style: "width:20%; display:inline-block; text-align:left;",
                    content: "$100"
                }, {
                    style: "width:60%; display:inline-block; text-align:center;",
                    content: "$300"
                }, {
                    style: "width:20%; display:inline-block; text-align:right;",
                    content: "$500"
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.Checkbox",
            onchange: "rangeSliderIncrementChanged",
            checked: !0
        }, {
            content: "increment by 20",
            classes: "enyo-inline"
        }, {
            tag: "br"
        }, {
            tag: "br"
        }, {
            kind: "onyx.Groupbox",
            classes: "onyx-sample-result-box",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Result"
                }, {
                    name: "rangeSliderResult",
                    classes: "onyx-sample-result",
                    content: "RangeSlider not moved yet."
                }]
        }],
    changeValue: function(e, t) {
        for (var n in this.$)
            this.$[n].kind == "onyx.Slider" && (this.$.animateSetting.getValue() ? this.$[n].animateTo(this.$.input.getValue()) : this.$[n].setValue(this.$.input.getValue()));
    },
    incValue: function() {
        this.$.input.setValue(Math.min(parseInt(this.$.input.getValue() || 0, 10) + 10, 100)), this.changeValue();
    },
    decValue: function() {
        this.$.input.setValue(Math.max(parseInt(this.$.input.getValue() || 0, 10) - 10, 0)), this.changeValue();
    },
    sliderChanging: function(e, t) {
        this.$.result.setContent(e.name + " changing: " + Math.round(e.getValue()));
    },
    sliderChanged: function(e, t) {
        this.$.result.setContent(e.name + " changed to " + Math.round(e.getValue()) + ".");
    },
    rangeSliderIncrementChanged: function(e, t) {
        this.$.rangeSlider.setIncrement(e.getValue() ? 20 : 0);
    },
    sliderIncrementChanged: function(e, t) {
        this.$.slider2.setIncrement(e.getValue() ? 7 : 0), this.$.slider.setIncrement(e.getValue() ? 7 : 0);
    },
    updateRangeLabels: function(e) {
        e.setStartLabel("--> " + Math.floor(e.getRangeStart())), e.setEndLabel(Math.floor(e.getRangeEnd()) + "<--");
    },
    rangeSliderChanging: function(e, t) {
        this.updateRangeLabels(e), this.$.rangeSliderResult.setContent("Range changing: $" + Math.round(e.getRangeStart()) + " - $" + Math.round(e.getRangeEnd()));
    },
    rangeSliderChanged: function(e, t) {
        this.updateRangeLabels(e), this.$.rangeSliderResult.setContent("Range changed to $" + Math.round(e.getRangeStart()) + " - $" + Math.round(e.getRangeEnd()) + ".");
    },
    create: function() {
        this.inherited(arguments), this.updateRangeLabels(this.$.rangeSlider);
    }
});

// ToggleButtonSample.js

enyo.kind({
    name: "onyx.sample.ToggleButtonSample",
    classes: "onyx onyx-sample",
    components: [{
            classes: "onyx-sample-divider",
            content: "Toggle Buttons"
        }, {
            classes: "onyx-sample-tools",
            components: [{
                    kind: "onyx.ToggleButton",
                    onChange: "toggleChanged",
                    value: !0
                }, {
                    kind: "onyx.ToggleButton",
                    onChange: "toggleChanged"
                }, {
                    kind: "onyx.ToggleButton",
                    onChange: "toggleChanged"
                }, {
                    kind: "onyx.ToggleButton",
                    onChange: "toggleChanged",
                    value: !0,
                    disabled: !0
                }]
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "Toggle Buttons Group"
        }, {
            kind: "Group",
            classes: "onyx-sample-tools group",
            onActivate: "groupActivated",
            highlander: !0,
            components: [{
                    kind: "onyx.ToggleButton"
                }, {
                    kind: "onyx.ToggleButton",
                    value: !0
                }, {
                    kind: "onyx.ToggleButton"
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.Groupbox",
            classes: "onyx-sample-result-box",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Result"
                }, {
                    name: "result",
                    classes: "onyx-sample-result",
                    content: "No button tapped yet."
                }]
        }],
    toggleChanged: function(e, t) {
        this.$.result.setContent(e.name + " was " + (e.getValue() ? " selected." : "deselected."));
    },
    ordinals: ["1st", "2nd", "3rd"],
    groupActivated: function(e, t) {
        if (t.originator.getActive()) {
            var n = t.originator.indexInContainer();
            this.$.result.setContent("The " + this.ordinals[n] + " toggle button in the group is selected.");
        }
    }
});

// ToolbarSample.js

enyo.kind({
    name: "onyx.sample.ToolbarSample",
    classes: "onyx onyx-sample",
    components: [{
            classes: "onyx-sample-divider",
            content: "ToolBar"
        }, {
            kind: "onyx.Toolbar",
            components: [{
                    kind: "onyx.Grabber"
                }, {
                    content: "Header"
                }, {
                    kind: "onyx.Button",
                    content: "Button"
                }, {
                    kind: "onyx.Button",
                    content: "Down",
                    classes: "active"
                }, {
                    kind: "onyx.Button",
                    content: "Button"
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            placeholder: "Input"
                        }]
                }, {
                    kind: "onyx.Button",
                    content: "Right"
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            placeholder: "Right Input"
                        }]
                }, {
                    kind: "onyx.Button",
                    content: "More Right"
                }, {
                    content: "There's more"
                }, {
                    kind: "onyx.Button",
                    content: "Far Right"
                }]
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "Scrolling ToolBar"
        }, {
            kind: "Scroller",
            classes: "onyx-toolbar",
            touchOverscroll: !1,
            touch: !0,
            vertical: "hidden",
            style: "margin:0px;",
            thumb: !1,
            components: [{
                    classes: "onyx-toolbar-inline",
                    style: "white-space: nowrap;",
                    components: [{
                            kind: "onyx.Grabber"
                        }, {
                            content: "Header"
                        }, {
                            kind: "onyx.Button",
                            content: "Button"
                        }, {
                            kind: "onyx.Button",
                            content: "Down",
                            classes: "active"
                        }, {
                            kind: "onyx.Button",
                            content: "Button"
                        }, {
                            kind: "onyx.InputDecorator",
                            components: [{
                                    kind: "onyx.Input",
                                    placeholder: "Input"
                                }]
                        }, {
                            kind: "onyx.Button",
                            content: "Right"
                        }, {
                            kind: "onyx.InputDecorator",
                            components: [{
                                    kind: "onyx.Input",
                                    placeholder: "Right Input"
                                }]
                        }, {
                            kind: "onyx.Button",
                            content: "More Right"
                        }, {
                            content: "There's more"
                        }, {
                            kind: "onyx.Button",
                            content: "Far Right"
                        }]
                }]
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "More ToolBar"
        }, {
            kind: "onyx.MoreToolbar",
            components: [{
                    kind: "onyx.Grabber"
                }, {
                    content: "Header"
                }, {
                    kind: "onyx.Button",
                    content: "Button"
                }, {
                    kind: "onyx.Button",
                    content: "Down",
                    classes: "active"
                }, {
                    kind: "onyx.Button",
                    content: "Button"
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            placeholder: "Input"
                        }]
                }, {
                    kind: "onyx.Button",
                    content: "Right"
                }, {
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            placeholder: "Right Input"
                        }]
                }, {
                    kind: "onyx.Button",
                    content: "More Right"
                }, {
                    content: "There's more"
                }, {
                    kind: "onyx.Button",
                    content: "Far Right"
                }]
        }]
});

// DrawerSample.js

enyo.kind({
    name: "onyx.sample.DrawerSample",
    classes: "onyx drawer-sample",
    components: [{
            content: "Drawers",
            classes: "drawer-sample-divider"
        }, {
            content: "Activate (V)",
            classes: "drawer-sample-box drawer-sample-mtb",
            ontap: "activateDrawer"
        }, {
            name: "drawer",
            kind: "onyx.Drawer",
            components: [{
                    content: "Vertical Drawer<br>Vertical Drawer<br>Vertical Drawer<br>Vertical Drawer",
                    allowHtml: !0,
                    classes: "drawer-sample-box drawer-sample-mtb"
                }, {
                    components: [{
                            kind: "onyx.Checkbox",
                            name: "animateSetting",
                            value: !0
                        }, {
                            content: "Animated",
                            classes: "enyo-inline onyx-sample-animate-label"
                        }]
                }, {
                    content: "Activate (V) (Toggled Animation)",
                    classes: "drawer-sample-box drawer-sample-mtb",
                    ontap: "activateDrawer2"
                }, {
                    name: "drawer2",
                    kind: "onyx.Drawer",
                    animated: !0,
                    components: [{
                            content: "Vertical Drawer<br>Vertical Drawer<br>Vertical Drawer<br>Vertical Drawer",
                            allowHtml: !0,
                            classes: "drawer-sample-box drawer-sample-mtb"
                        }]
                }, {
                    content: "Vertical Drawer<br>Vertical Drawer<br>Vertical Drawer<br>Vertical Drawer",
                    allowHtml: !0,
                    classes: "drawer-sample-box drawer-sample-mtb"
                }]
        }, {
            content: "Foo<br>Foo",
            allowHtml: !0,
            classes: "drawer-sample-box drawer-sample-mtb"
        }, {
            kind: "FittableColumns",
            fit: !0,
            ontap: "activateColumnsDrawer",
            classes: "drawer-sample-box drawer-sample-mtb drawer-sample-o",
            components: [{
                    content: "Activate (H)",
                    classes: "drawer-sample-box drawer-sample-mlr"
                }, {
                    name: "columnsDrawer",
                    orient: "h",
                    kind: "onyx.Drawer",
                    open: !1,
                    components: [{
                            content: "H-Drawer",
                            classes: "drawer-sample-box drawer-sample-mlr"
                        }]
                }, {
                    content: "Foo",
                    fit: !0,
                    classes: "drawer-sample-box drawer-sample-mlr drawer-sample-o"
                }, {
                    content: "Foo",
                    classes: "drawer-sample-box drawer-sample-mlr"
                }]
        }, {
            content: "Foo",
            classes: "drawer-sample-box drawer-sample-mtb"
        }],
    activateDrawer: function() {
        this.$.drawer.setOpen(!this.$.drawer.open);
    },
    activateDrawer2: function() {
        this.$.drawer2.setAnimated(this.$.animateSetting.getValue()), this.$.drawer2.setOpen(!this.$.drawer2.open);
    },
    activateColumnsDrawer: function() {
        return this.$.columnsDrawer.setOpen(!this.$.columnsDrawer.open), !0;
    }
});

// MenuSample.js

enyo.kind({
    name: "onyx.sample.MenuSample",
    classes: "onyx onyx-sample",
    components: [{
            classes: "onyx-sample-divider",
            content: "Menus in Toolbars"
        }, {
            kind: "onyx.Toolbar",
            classes: "onyx-menu-toolbar",
            components: [{
                    kind: "onyx.MenuDecorator",
                    onSelect: "itemSelected",
                    components: [{
                            kind: "onyx.IconButton",
                            src: "assets/menu-icon-bookmark.png"
                        }, {
                            kind: "onyx.Menu",
                            components: [{
                                    components: [{
                                            kind: "onyx.IconButton",
                                            src: "assets/menu-icon-bookmark.png"
                                        }, {
                                            content: "Bookmarks"
                                        }]
                                }, {
                                    content: "Favorites"
                                }, {
                                    classes: "onyx-menu-divider"
                                }, {
                                    content: "Recents"
                                }]
                        }]
                }, {
                    kind: "onyx.MenuDecorator",
                    onSelect: "itemSelected",
                    components: [{
                            content: "Bookmarks menu"
                        }, {
                            kind: "onyx.Menu",
                            components: [{
                                    components: [{
                                            kind: "onyx.IconButton",
                                            src: "assets/menu-icon-bookmark.png"
                                        }, {
                                            content: "Bookmarks"
                                        }]
                                }, {
                                    content: "Favorites"
                                }, {
                                    classes: "onyx-menu-divider"
                                }, {
                                    content: "Recents"
                                }]
                        }]
                }]
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "Menus from Buttons"
        }, {
            kind: "onyx.MenuDecorator",
            onSelect: "itemSelected",
            components: [{
                    content: "Popup menu (floating)"
                }, {
                    kind: "onyx.Menu",
                    floating: !0,
                    components: [{
                            content: "1"
                        }, {
                            content: "2"
                        }, {
                            classes: "onyx-menu-divider"
                        }, {
                            content: "3"
                        }]
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.MenuDecorator",
            onSelect: "itemSelected",
            components: [{
                    content: "Scrolling Popup menu"
                }, {
                    kind: "onyx.Menu",
                    components: [{
                            name: "menuScroller",
                            kind: "enyo.Scroller",
                            defaultKind: "onyx.MenuItem",
                            vertical: "auto",
                            classes: "enyo-unselectable",
                            maxHeight: "200px",
                            strategyKind: "TouchScrollStrategy",
                            components: [{
                                    content: "1"
                                }, {
                                    content: "2"
                                }, {
                                    classes: "onyx-menu-divider"
                                }, {
                                    content: "3"
                                }, {
                                    content: "4"
                                }, {
                                    content: "5"
                                }, {
                                    classes: "onyx-menu-divider"
                                }, {
                                    content: "6"
                                }, {
                                    content: "7"
                                }]
                        }]
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.MenuDecorator",
            onSelect: "itemSelected",
            components: [{
                    content: "Split Popup menu",
                    kind: "onyx.Button",
                    onActivate: "preventMenuActivate",
                    style: "border-radius: 3px 0 0 3px;"
                }, {
                    content: "v",
                    allowHtml: !0,
                    style: "border-radius: 0 3px 3px 0;"
                }, {
                    kind: "onyx.Menu",
                    components: [{
                            content: "1"
                        }, {
                            content: "2"
                        }, {
                            classes: "onyx-menu-divider"
                        }, {
                            content: "3"
                        }]
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.Groupbox",
            classes: "onyx-sample-result-box",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Result"
                }, {
                    name: "menuSelection",
                    classes: "onyx-sample-result",
                    content: "No menu selection yet."
                }]
        }],
    create: function() {
        this.inherited(arguments);
    },
    showPopup: function(e) {
        var t = this.$[e.popup];
        t && t.show();
    },
    preventMenuActivate: function() {
        return !0;
    },
    itemSelected: function(e, t) {
        t.originator.content ? this.$.menuSelection.setContent(t.originator.content + " Selected") : t.selected && this.$.menuSelection.setContent(t.selected.controlAtIndex(1).content + " Selected");
    }
});

// TooltipSample.js

enyo.kind({
    name: "onyx.sample.TooltipSample",
    classes: "onyx onyx-sample",
    handlers: {
        onSelect: "itemSelected"
    },
    components: [{
            classes: "onyx-sample-divider",
            content: "Tooltips on Toolbar"
        }, {
            kind: "onyx.Toolbar",
            classes: "onyx-menu-toolbar",
            components: [{
                    kind: "onyx.TooltipDecorator",
                    components: [{
                            kind: "onyx.Button",
                            content: "Tooltip"
                        }, {
                            kind: "onyx.Tooltip",
                            content: "I'm a tooltip for a button."
                        }]
                }, {
                    kind: "onyx.TooltipDecorator",
                    components: [{
                            kind: "onyx.InputDecorator",
                            components: [{
                                    kind: "onyx.Input",
                                    style: "width:130px;",
                                    placholder: "Just an input..."
                                }]
                        }, {
                            kind: "onyx.Tooltip",
                            content: "I'm a tooltip for an input."
                        }]
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.Toolbar",
            classes: "onyx-menu-toolbar",
            components: [{
                    kind: "onyx.MenuDecorator",
                    components: [{
                            kind: "onyx.IconButton",
                            src: "assets/menu-icon-bookmark.png"
                        }, {
                            kind: "onyx.Tooltip",
                            content: "Bookmarks menu"
                        }, {
                            kind: "onyx.Menu",
                            components: [{
                                    components: [{
                                            kind: "onyx.IconButton",
                                            src: "assets/menu-icon-bookmark.png"
                                        }, {
                                            content: "Bookmarks"
                                        }]
                                }, {
                                    content: "Favorites"
                                }, {
                                    classes: "onyx-menu-divider"
                                }, {
                                    content: "Recents"
                                }]
                        }]
                }, {
                    kind: "onyx.MenuDecorator",
                    components: [{
                            content: "Bookmarks menu"
                        }, {
                            kind: "onyx.Tooltip",
                            content: "Tap to open..."
                        }, {
                            kind: "onyx.Menu",
                            components: [{
                                    components: [{
                                            kind: "onyx.IconButton",
                                            src: "assets/menu-icon-bookmark.png"
                                        }, {
                                            content: "Bookmarks"
                                        }]
                                }, {
                                    content: "Favorites"
                                }, {
                                    classes: "onyx-menu-divider"
                                }, {
                                    content: "Recents"
                                }]
                        }]
                }]
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "Tooltips on items"
        }, {
            kind: "onyx.TooltipDecorator",
            components: [{
                    kind: "onyx.Button",
                    content: "Tooltip"
                }, {
                    kind: "onyx.Tooltip",
                    content: "I'm a tooltip for a button."
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.TooltipDecorator",
            components: [{
                    kind: "onyx.InputDecorator",
                    components: [{
                            kind: "onyx.Input",
                            style: "width:130px;",
                            placholder: "Just an input..."
                        }]
                }, {
                    kind: "onyx.Tooltip",
                    content: "I'm a tooltip for an input."
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.MenuDecorator",
            components: [{
                    kind: "onyx.IconButton",
                    src: "assets/menu-icon-bookmark.png"
                }, {
                    kind: "onyx.Tooltip",
                    content: "Bookmarks menu"
                }, {
                    kind: "onyx.Menu",
                    components: [{
                            components: [{
                                    kind: "onyx.IconButton",
                                    src: "assets/menu-icon-bookmark.png"
                                }, {
                                    content: "Bookmarks"
                                }]
                        }, {
                            content: "Favorites"
                        }, {
                            classes: "onyx-menu-divider"
                        }, {
                            content: "Recents"
                        }]
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.MenuDecorator",
            components: [{
                    content: "Bookmarks menu"
                }, {
                    kind: "onyx.Tooltip",
                    content: "Tap to open..."
                }, {
                    kind: "onyx.Menu",
                    components: [{
                            components: [{
                                    kind: "onyx.IconButton",
                                    src: "assets/menu-icon-bookmark.png"
                                }, {
                                    content: "Bookmarks"
                                }]
                        }, {
                            content: "Favorites"
                        }, {
                            classes: "onyx-menu-divider"
                        }, {
                            content: "Recents"
                        }]
                }]
        }]
});

// SpinnerSample.js

enyo.kind({
    name: "onyx.sample.SpinnerSample",
    classes: "onyx onyx-sample",
    handlers: {
        onSelect: "itemSelected"
    },
    components: [{
            classes: "onyx-sample-divider",
            content: "Light Spinner"
        }, {
            style: "background:black; border-radius:5px; padding:15px",
            components: [{
                    kind: "onyx.Spinner"
                }]
        }, {
            tag: "br"
        }, {
            classes: "onyx-sample-divider",
            content: "Dark Spinner"
        }, {
            style: "background:white; border-radius:5px; padding:15px",
            components: [{
                    kind: "onyx.Spinner",
                    classes: "onyx-light"
                }]
        }]
});

// PickerSample.js

enyo.kind({
    name: "onyx.sample.PickerSample",
    kind: "FittableRows",
    classes: "onyx onyx-sample",
    handlers: {
        onSelect: "itemSelected"
    },
    components: [{
            content: "Default Picker",
            classes: "onyx-sample-divider"
        }, {
            kind: "onyx.PickerDecorator",
            components: [{}, {
                    kind: "onyx.Picker",
                    components: [{
                            content: "Gmail",
                            active: !0
                        }, {
                            content: "Yahoo"
                        }, {
                            content: "Outlook"
                        }, {
                            content: "Hotmail"
                        }]
                }]
        }, {
            tag: "br"
        }, {
            content: "Picker with Static Button",
            classes: "onyx-sample-divider"
        }, {
            kind: "onyx.PickerDecorator",
            components: [{
                    kind: "onyx.PickerButton",
                    content: "Pick One...",
                    style: "width: 200px"
                }, {
                    kind: "onyx.Picker",
                    components: [{
                            content: "Hello!"
                        }, {
                            content: "I am busy."
                        }, {
                            content: "Good Bye."
                        }]
                }]
        }, {
            tag: "br"
        }, {
            content: "Integer Picker",
            classes: "onyx-sample-divider"
        }, {
            classes: "onyx-toolbar-inline",
            components: [{
                    kind: "onyx.PickerDecorator",
                    components: [{
                            style: "min-width: 60px;"
                        }, {
                            kind: "onyx.IntegerPicker",
                            min: 0,
                            max: 25,
                            value: 5
                        }]
                }]
        }, {
            tag: "br"
        }, {
            content: "Other Pickers",
            classes: "onyx-sample-divider"
        }, {
            classes: "onyx-toolbar-inline",
            components: [{
                    content: "Date",
                    classes: "onyx-sample-label"
                }, {
                    kind: "onyx.PickerDecorator",
                    components: [{}, {
                            name: "monthPicker",
                            kind: "onyx.Picker"
                        }]
                }, {
                    kind: "onyx.PickerDecorator",
                    components: [{
                            style: "min-width: 60px;"
                        }, {
                            name: "dayPicker",
                            kind: "onyx.Picker"
                        }]
                }, {
                    classes: "onyx-toolbar-inline",
                    style: "margin: 0px;",
                    components: [{
                            content: "Year",
                            classes: "onyx-sample-label"
                        }, {
                            kind: "onyx.PickerDecorator",
                            components: [{
                                    name: "yearPickerButton",
                                    style: "min-width: 80px;"
                                }, {
                                    name: "yearPicker",
                                    kind: "onyx.FlyweightPicker",
                                    count: 200,
                                    onSetupItem: "setupYear",
                                    components: [{
                                            name: "year"
                                        }]
                                }]
                        }]
                }]
        }, {
            tag: "br"
        }, {
            classes: "onyx-toolbar-inline",
            components: [{
                    kind: "onyx.PickerDecorator",
                    components: [{}, {
                            kind: "onyx.Picker",
                            components: [{
                                    content: "Gmail"
                                }, {
                                    content: "Yahoo"
                                }, {
                                    content: "Outlook"
                                }, {
                                    content: "Hotmail",
                                    active: !0
                                }]
                        }]
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.Groupbox",
            classes: "onyx-sample-result-box",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Selection"
                }, {
                    name: "pickerSelection",
                    classes: "onyx-sample-result",
                    content: "Nothing picked yet."
                }]
        }],
    create: function() {
        this.inherited(arguments);
        var e = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"], t = new Date, n, r;
        for (n = 0; r = e[n]; n++)
            this.$.monthPicker.createComponent({
                content: r,
                active: n == t.getMonth()
            });
        for (n = 0; n < 30; n++)
            this.$.dayPicker.createComponent({
                content: n + 1,
                active: n == t.getDate() - 1
            });
        var i = t.getYear();
        this.$.yearPicker.setSelected(i), this.$.yearPickerButton.setContent(1900 + i);
    },
    setupYear: function(e, t) {
        this.$.year.setContent(1900 + t.index);
    },
    itemSelected: function(e, t) {
        this.$.pickerSelection.setContent(t.selected.content);
    }
});

// DatePickerSample.js

enyo.kind({
    name: "onyx.sample.DatePickerSample",
    kind: "FittableRows",
    classes: "onyx",
    handlers: {
        onSelect: "updateDateValues"
    },
    components: [{
            kind: "onyx.Toolbar",
            content: $L("Dates")
        }, {
            kind: "FittableColumns",
            style: "padding: 10px",
            components: [{
                    components: [{
                            content: $L("Choose Locale:"),
                            classes: "onyx-sample-divider"
                        }, {
                            kind: "onyx.PickerDecorator",
                            style: "padding:10px;",
                            onSelect: "pickerHandler",
                            components: [{
                                    content: "Pick One...",
                                    style: "width: 200px"
                                }, {
                                    kind: "onyx.Picker",
                                    components: [{
                                            content: "en_us",
                                            active: !0
                                        }, {
                                            content: "en_ca"
                                        }, {
                                            content: "en_ie"
                                        }, {
                                            content: "en_gb"
                                        }, {
                                            content: "en_mx"
                                        }, {
                                            content: "de_de"
                                        }, {
                                            content: "fr_fr"
                                        }, {
                                            content: "fr_ca"
                                        }, {
                                            content: "it_it"
                                        }, {
                                            content: "es_es"
                                        }, {
                                            content: "es_mx"
                                        }, {
                                            content: "es_us"
                                        }]
                                }]
                        }]
                }]
        }, {
            kind: "onyx.Button",
            content: "Get Dates",
            style: "margin:10px;",
            ontap: "getDates"
        }, {
            kind: "onyx.Button",
            content: "Reset Dates",
            ontap: "resetDates"
        }, {
            style: "width:100%;height:5px;background-color:black;margin-bottom:5px;"
        }, {
            caption: "Dates",
            style: "padding: 10px",
            components: [{
                    content: "DATE",
                    classes: "onyx-sample-divider"
                }, {
                    classes: "onyx-toolbar-inline",
                    components: [{
                            name: "datePicker1",
                            kind: "onyx.DatePicker"
                        }]
                }, {
                    kind: "onyx.Groupbox",
                    style: "padding:5px;",
                    components: [{
                            kind: "onyx.GroupboxHeader",
                            content: "Value"
                        }, {
                            name: "datePicker1Value",
                            style: "padding:15px;"
                        }]
                }, {
                    content: "DATE W/MIN & MAX YEARS",
                    classes: "onyx-sample-divider"
                }, {
                    classes: "onyx-toolbar-inline",
                    components: [{
                            name: "datePicker2",
                            kind: "onyx.DatePicker",
                            minYear: 2010,
                            maxYear: 2020
                        }]
                }, {
                    kind: "onyx.Groupbox",
                    style: "padding:5px;",
                    components: [{
                            kind: "onyx.GroupboxHeader",
                            content: "Value"
                        }, {
                            name: "datePicker2Value",
                            style: "padding:15px;"
                        }]
                }, {
                    content: "DATE W/DAYS HIDDEN",
                    classes: "onyx-sample-divider"
                }, {
                    classes: "onyx-toolbar-inline",
                    components: [{
                            name: "datePicker3",
                            kind: "onyx.DatePicker",
                            dayHidden: !0
                        }]
                }, {
                    kind: "onyx.Groupbox",
                    style: "padding:5px;",
                    components: [{
                            kind: "onyx.GroupboxHeader",
                            content: "Value"
                        }, {
                            name: "datePicker3Value",
                            style: "padding:15px;"
                        }]
                }, {
                    content: "DISABLED",
                    classes: "onyx-sample-divider"
                }, {
                    classes: "onyx-toolbar-inline",
                    components: [{
                            name: "datePicker4",
                            kind: "onyx.DatePicker",
                            disabled: !0
                        }]
                }]
        }],
    initComponents: function() {
        this.inherited(arguments), this.locale = enyo.g11n.currentLocale().getLocale();
    },
    pickerHandler: function(e, t) {
        return this.locale = t.selected.content, this.formatDate(), !0;
    },
    formatDate: function() {
        this.$.datePicker1.setLocale(this.locale), this.$.datePicker2.setLocale(this.locale), this.$.datePicker3.setLocale(this.locale), this.$.datePicker4.setLocale(this.locale);
    },
    resetDates: function(e) {
        var t = new Date;
        this.$.datePicker1.setValue(t), this.$.datePicker2.setValue(t), this.$.datePicker3.setValue(t), this.$.datePicker4.setValue(t), this.getDates();
    },
    getDates: function() {
        var e = this.format();
        this.$.datePicker1Value.setContent(e.format(this.$.datePicker1.getValue())), this.$.datePicker2Value.setContent(e.format(this.$.datePicker2.getValue())), e = this.format("my"), this.$.datePicker3Value.setContent(e.format(this.$.datePicker3.getValue()));
    },
    updateDateValues: function(e, t) {
        var n = t.name != "datePicker3" ? this.format() : this.format("my");
        this.$[t.name + "Value"].setContent(n.format(t.value));
    },
    format: function(e) {
        return fmt = new enyo.g11n.DateFmt({
            dateComponents: e || undefined,
            date: "short",
            locale: new enyo.g11n.Locale(this.locale)
        });
    }
});

// TimePickerSample.js

enyo.kind({
    name: "onyx.sample.TimePickerSample",
    kind: "FittableRows",
    classes: "onyx enyo-fit",
    handlers: {
        onSelect: "updateTimeValues"
    },
    components: [{
            kind: "onyx.Toolbar",
            content: $L("Times")
        }, {
            kind: "FittableColumns",
            style: "padding: 10px",
            components: [{
                    components: [{
                            content: $L("Choose Locale:"),
                            classes: "onyx-sample-divider"
                        }, {
                            kind: "onyx.PickerDecorator",
                            style: "padding:10px;",
                            onSelect: "pickerHandler",
                            components: [{
                                    content: "Pick One...",
                                    style: "width: 200px"
                                }, {
                                    kind: "onyx.Picker",
                                    components: [{
                                            content: "en_us",
                                            active: !0
                                        }, {
                                            content: "en_ca"
                                        }, {
                                            content: "en_ie"
                                        }, {
                                            content: "en_gb"
                                        }, {
                                            content: "en_mx"
                                        }, {
                                            content: "de_de"
                                        }, {
                                            content: "fr_fr"
                                        }, {
                                            content: "fr_ca"
                                        }, {
                                            content: "it_it"
                                        }, {
                                            content: "es_es"
                                        }, {
                                            content: "es_mx"
                                        }, {
                                            content: "es_us"
                                        }]
                                }]
                        }]
                }]
        }, {
            kind: "onyx.Button",
            content: "Get Times",
            style: "margin:10px;",
            ontap: "getTimes"
        }, {
            kind: "onyx.Button",
            content: "Reset Times",
            ontap: "resetTimes"
        }, {
            style: "width:100%;height:5px;background-color:black;margin-bottom:5px;"
        }, {
            caption: "Dates",
            style: "padding: 10px",
            components: [{
                    content: "TIME",
                    classes: "onyx-sample-divider"
                }, {
                    classes: "onyx-toolbar-inline",
                    components: [{
                            name: "timePicker1",
                            kind: "onyx.TimePicker"
                        }]
                }, {
                    kind: "onyx.Groupbox",
                    style: "padding:5px;",
                    components: [{
                            kind: "onyx.GroupboxHeader",
                            content: "Value"
                        }, {
                            name: "timePicker1Value",
                            style: "padding:15px;"
                        }]
                }, {
                    content: "TIME 24 HOUR MODE",
                    classes: "onyx-sample-divider"
                }, {
                    classes: "onyx-toolbar-inline",
                    components: [{
                            name: "timePicker2",
                            kind: "onyx.TimePicker",
                            is24HrMode: !0
                        }]
                }, {
                    kind: "onyx.Groupbox",
                    style: "padding:5px;",
                    components: [{
                            kind: "onyx.GroupboxHeader",
                            content: "Localized Value"
                        }, {
                            name: "timePicker2Value",
                            style: "padding:15px;"
                        }]
                }, {
                    content: "DISABLED",
                    classes: "onyx-sample-divider"
                }, {
                    classes: "onyx-toolbar-inline",
                    components: [{
                            name: "timePicker3",
                            kind: "onyx.TimePicker",
                            disabled: !0
                        }]
                }]
        }],
    initComponents: function() {
        this.inherited(arguments), this.locale = enyo.g11n.currentLocale().getLocale();
    },
    pickerHandler: function(e, t) {
        return this.locale = t.selected.content, this.formatTime(), !0;
    },
    formatTime: function() {
        this.$.timePicker1.setLocale(this.locale), this.$.timePicker2.setLocale(this.locale), this.$.timePicker2.setIs24HrMode(!0), this.$.timePicker3.setLocale(this.locale);
    },
    resetTimes: function(e) {
        var t = new Date;
        this.$.timePicker1.setValue(t), this.$.timePicker2.setValue(t), this.$.timePicker3.setValue(t), this.getTimes();
    },
    getTimes: function() {
        var e = new enyo.g11n.DateFmt({
            time: "short",
            locale: new enyo.g11n.Locale(this.locale)
        });
        this.$.timePicker1Value.setContent(e.format(this.$.timePicker1.getValue())), this.$.timePicker2Value.setContent(e.format(this.$.timePicker2.getValue()));
    },
    updateTimeValues: function(e, t) {
        var n = new enyo.g11n.DateFmt({
            time: "short",
            locale: new enyo.g11n.Locale(this.locale)
        });
        this.$[t.name + "Value"].setContent(n.format(t.value));
    }
});

// ContextualPopupSample.js

enyo.kind({
    name: "onyx.sample.ContextualPopupSample",
    kind: "FittableRows",
    classes: "onyx enyo-fit",
    handlers: {
        ontap: "tapHandler"
    },
    components: [{
            kind: "onyx.Toolbar",
            name: "topToolbar",
            classes: "onyx-menu-toolbar",
            style: "background-color:lightgray",
            components: [{
                    kind: "FittableColumns",
                    style: "width:100%;",
                    components: [{
                            kind: "onyx.MenuDecorator",
                            components: [{
                                    kind: onyx.IconButton,
                                    src: "assets/menu-icon-bookmark.png"
                                }, {
                                    kind: "onyx.ContextualPopup",
                                    title: "Toolbar Button",
                                    floating: !0,
                                    actionButtons: [{
                                            content: "test1",
                                            classes: "onyx-button-warning"
                                        }, {
                                            content: "test2"
                                        }],
                                    components: [{
                                            content: "testing 1"
                                        }, {
                                            content: "testing 2"
                                        }]
                                }]
                        }, {
                            kind: "onyx.MenuDecorator",
                            fit: !0,
                            style: "position:absolute;right:0;",
                            components: [{
                                    kind: onyx.IconButton,
                                    src: "assets/menu-icon-bookmark.png"
                                }, {
                                    kind: "onyx.ContextualPopup",
                                    title: "Toolbar Button",
                                    floating: !0,
                                    actionButtons: [{
                                            content: "test1",
                                            classes: "onyx-button-warning"
                                        }, {
                                            content: "test2"
                                        }],
                                    components: [{
                                            content: "testing 1"
                                        }, {
                                            content: "testing 2"
                                        }, {
                                            content: "testing 3"
                                        }, {
                                            content: "testing 4"
                                        }, {
                                            content: "testing 5"
                                        }, {
                                            content: "testing 6"
                                        }]
                                }]
                        }]
                }]
        }, {
            kind: "Scroller",
            fit: !0,
            thumb: !1,
            components: [{
                    name: "buttonContainer",
                    kind: "FittableRows",
                    classes: "onyx-contextualpopup-button-container enyo-fit",
                    components: [{
                            components: [{
                                    kind: "onyx.MenuDecorator",
                                    style: "display:inline-block",
                                    components: [{
                                            content: "Average"
                                        }, {
                                            kind: "onyx.ContextualPopup",
                                            title: "Average",
                                            floating: !0,
                                            actionButtons: [{
                                                    content: "Press Me"
                                                }],
                                            components: [{
                                                    content: "Item 1"
                                                }, {
                                                    content: "Item 2"
                                                }, {
                                                    content: "Item 3"
                                                }, {
                                                    content: "Item 4"
                                                }, {
                                                    content: "Item 5"
                                                }]
                                        }]
                                }, {
                                    kind: "onyx.MenuDecorator",
                                    style: "display:inline-block;float:right",
                                    components: [{
                                            content: "Small"
                                        }, {
                                            kind: "onyx.ContextualPopup",
                                            title: "Small",
                                            floating: !0
                                        }]
                                }]
                        }, {
                            fit: !0,
                            style: "padding-top:15%;padding-bottom:15%;",
                            components: [{
                                    kind: "onyx.MenuDecorator",
                                    style: "display:inline-block;",
                                    components: [{
                                            content: "Wide"
                                        }, {
                                            kind: "onyx.ContextualPopup",
                                            style: "width:300px",
                                            floating: !0,
                                            actionButtons: [{
                                                    content: "test1",
                                                    classes: "onyx-button-warning"
                                                }, {
                                                    content: "test2"
                                                }],
                                            components: [{
                                                    kind: "Scroller",
                                                    style: "min-width:150px;",
                                                    horizontal: "auto",
                                                    touch: !0,
                                                    thumb: !1,
                                                    components: [{
                                                            content: "testing 1"
                                                        }, {
                                                            content: "testing 2"
                                                        }]
                                                }]
                                        }]
                                }, {
                                    kind: "onyx.MenuDecorator",
                                    style: "display:inline-block;float:right",
                                    components: [{
                                            content: "Long"
                                        }, {
                                            kind: "onyx.ContextualPopup",
                                            maxHeight: "200",
                                            title: "Long",
                                            floating: !0,
                                            actionButtons: [{
                                                    content: "Press Me"
                                                }],
                                            components: [{
                                                    content: "testing 1"
                                                }, {
                                                    content: "testing 2"
                                                }, {
                                                    content: "testing 3"
                                                }, {
                                                    content: "testing 4"
                                                }, {
                                                    content: "testing 5"
                                                }, {
                                                    content: "testing 6"
                                                }, {
                                                    content: "testing 7"
                                                }, {
                                                    content: "testing 9"
                                                }, {
                                                    content: "testing 10"
                                                }, {
                                                    content: "testing 11"
                                                }, {
                                                    content: "testing 12"
                                                }, {
                                                    content: "testing 13"
                                                }, {
                                                    content: "testing 14"
                                                }, {
                                                    content: "testing 15"
                                                }, {
                                                    content: "testing 16"
                                                }, {
                                                    content: "testing 17"
                                                }, {
                                                    content: "testing 18"
                                                }, {
                                                    content: "testing 19"
                                                }, {
                                                    content: "testing 20"
                                                }, {
                                                    content: "testing 21"
                                                }, {
                                                    content: "testing 22"
                                                }, {
                                                    content: "testing 23"
                                                }, {
                                                    content: "testing 24"
                                                }, {
                                                    content: "testing 25"
                                                }, {
                                                    content: "testing 26"
                                                }, {
                                                    content: "testing 27"
                                                }, {
                                                    content: "testing 28"
                                                }, {
                                                    content: "testing 29"
                                                }, {
                                                    content: "testing 30"
                                                }]
                                        }]
                                }]
                        }, {
                            components: [{
                                    kind: "onyx.MenuDecorator",
                                    style: "display:inline-block;",
                                    components: [{
                                            content: "Press Me"
                                        }, {
                                            kind: "onyx.ContextualPopup",
                                            title: "Press Me",
                                            floating: !0,
                                            style: "width:200px",
                                            actionButtons: [{
                                                    content: "test1",
                                                    classes: "onyx-button-warning"
                                                }, {
                                                    content: "test2"
                                                }],
                                            components: [{
                                                    content: "testing 1"
                                                }, {
                                                    content: "testing 2"
                                                }, {
                                                    content: "testing 3"
                                                }, {
                                                    content: "testing 4"
                                                }, {
                                                    content: "testing 5"
                                                }, {
                                                    content: "testing 6"
                                                }, {
                                                    content: "testing 7"
                                                }, {
                                                    content: "testing 9"
                                                }, {
                                                    content: "testing 10"
                                                }]
                                        }]
                                }, {
                                    kind: "onyx.MenuDecorator",
                                    style: "display:inline-block;float:right",
                                    components: [{
                                            content: "Try Me"
                                        }, {
                                            kind: "onyx.ContextualPopup",
                                            style: "width:250px",
                                            title: "Try Me",
                                            floating: !0,
                                            actionButtons: [{
                                                    content: "Do Nothing",
                                                    classes: "onyx-button-warning"
                                                }, {
                                                    content: "Dismiss",
                                                    name: "dismiss_button"
                                                }],
                                            components: [{
                                                    content: "Item 1"
                                                }, {
                                                    content: "Item 2"
                                                }, {
                                                    content: "Item 3"
                                                }, {
                                                    content: "Item 4"
                                                }, {
                                                    content: "Item 5"
                                                }]
                                        }]
                                }]
                        }]
                }]
        }, {
            kind: "onyx.Toolbar",
            name: "bottomToolbar",
            classes: "onyx-menu-toolbar",
            style: "background-color:lightgray",
            components: [{
                    kind: "FittableColumns",
                    style: "width:100%;",
                    components: [{
                            kind: "onyx.MenuDecorator",
                            components: [{
                                    kind: onyx.IconButton,
                                    src: "assets/menu-icon-bookmark.png"
                                }, {
                                    kind: "onyx.ContextualPopup",
                                    title: "Toolbar Button",
                                    floating: !0,
                                    actionButtons: [{
                                            content: "test1",
                                            classes: "onyx-button-warning"
                                        }, {
                                            content: "test2"
                                        }],
                                    components: [{
                                            content: "testing 1"
                                        }, {
                                            content: "testing 2"
                                        }, {
                                            content: "testing 3"
                                        }, {
                                            content: "testing 4"
                                        }, {
                                            content: "testing 5"
                                        }, {
                                            content: "testing 6"
                                        }]
                                }]
                        }, {
                            kind: "onyx.MenuDecorator",
                            fit: !0,
                            style: "position:absolute;right:0;",
                            components: [{
                                    kind: onyx.IconButton,
                                    src: "assets/menu-icon-bookmark.png"
                                }, {
                                    kind: "onyx.ContextualPopup",
                                    name: "facebook",
                                    title: "Toolbar Button",
                                    floating: !0,
                                    actionButtons: [{
                                            content: "test1",
                                            classes: "onyx-button-warning"
                                        }, {
                                            content: "Dismiss",
                                            name: "dismiss_button"
                                        }],
                                    components: [{
                                            content: "testing 1"
                                        }, {
                                            content: "testing 2"
                                        }, {
                                            content: "testing 3"
                                        }, {
                                            content: "testing 4"
                                        }, {
                                            content: "testing 5"
                                        }, {
                                            content: "testing 6"
                                        }]
                                }]
                        }]
                }]
        }],
    tapHandler: function(e, t) {
        t.actionButton && (enyo.log(t.popup), enyo.log("action button index: " + t.originator.index), enyo.log("action button name: " + t.originator.name), t.originator.name == "dismiss_button" && t.popup.hide());
    }
});

// Canvas.js

enyo.kind({
    name: "enyo.Canvas",
    kind: enyo.Control,
    tag: "canvas",
    attributes: {
        width: 500,
        height: 500
    },
    defaultKind: "enyo.canvas.Control",
    generateInnerHtml: function() {
        return "";
    },
    teardownChildren: function() {
    },
    rendered: function() {
        this.renderChildren();
    },
    addChild: function() {
        enyo.UiComponent.prototype.addChild.apply(this, arguments);
    },
    removeChild: function() {
        enyo.UiComponent.prototype.removeChild.apply(this, arguments);
    },
    renderChildren: function(e) {
        var t = e, n = this.hasNode();
        t || n.getContext && (t = n.getContext("2d"));
        if (t)
            for (var r = 0, i; i = this.children[r]; r++)
                i.render(t);
    },
    update: function() {
        var e = this.hasNode();
        if (e.getContext) {
            var t = e.getContext("2d"), n = this.getBounds();
            t.clearRect(0, 0, n.width, n.height), this.renderChildren(t);
        }
    }
});

// CanvasControl.js

enyo.kind({
    name: "enyo.canvas.Control",
    kind: enyo.UiComponent,
    defaultKind: "enyo.canvas.Control",
    published: {
        bounds: null
    },
    events: {
        onRender: ""
    },
    constructor: function() {
        this.bounds = {
            l: enyo.irand(400),
            t: enyo.irand(400),
            w: enyo.irand(100),
            h: enyo.irand(100)
        }, this.inherited(arguments);
    },
    importProps: function(e) {
        this.inherited(arguments), e && e.bounds && (enyo.mixin(this.bounds, e.bounds), delete e.bounds);
    },
    renderSelf: function(e) {
        this.doRender({
            context: e
        });
    },
    render: function(e) {
        this.children.length ? this.renderChildren(e) : this.renderSelf(e);
    },
    renderChildren: function(e) {
        for (var t = 0, n; n = this.children[t]; t++)
            n.render(e);
    }
});

// Shape.js

enyo.kind({
    name: "enyo.canvas.Shape",
    kind: enyo.canvas.Control,
    published: {
        color: "red",
        outlineColor: ""
    },
    fill: function(e) {
        e.fill();
    },
    outline: function(e) {
        e.stroke();
    },
    draw: function(e) {
        this.color && (e.fillStyle = this.color, this.fill(e)), this.outlineColor && (e.strokeStyle = this.outlineColor, this.outline(e));
    }
});

// Circle.js

enyo.kind({
    name: "enyo.canvas.Circle",
    kind: enyo.canvas.Shape,
    renderSelf: function(e) {
        e.beginPath(), e.arc(this.bounds.l, this.bounds.t, this.bounds.w, 0, Math.PI * 2), this.draw(e);
    }
});

// Rectangle.js

enyo.kind({
    name: "enyo.canvas.Rectangle",
    kind: enyo.canvas.Shape,
    published: {
        clear: !1
    },
    renderSelf: function(e) {
        this.clear ? e.clearRect(this.bounds.l, this.bounds.t, this.bounds.w, this.bounds.h) : this.draw(e);
    },
    fill: function(e) {
        e.fillRect(this.bounds.l, this.bounds.t, this.bounds.w, this.bounds.h);
    },
    outline: function(e) {
        e.strokeRect(this.bounds.l, this.bounds.t, this.bounds.w, this.bounds.h);
    }
});

// Text.js

enyo.kind({
    name: "enyo.canvas.Text",
    kind: enyo.canvas.Shape,
    published: {
        text: "",
        font: "12pt Arial",
        align: "left"
    },
    renderSelf: function(e) {
        e.textAlign = this.align, e.font = this.font, this.draw(e);
    },
    fill: function(e) {
        e.fillText(this.text, this.bounds.l, this.bounds.t);
    },
    outline: function(e) {
        e.strokeText(this.text, this.bounds.l, this.bounds.t);
    }
});

// Image.js

enyo.kind({
    name: "enyo.canvas.Image",
    kind: enyo.canvas.Control,
    published: {
        src: ""
    },
    create: function() {
        this.image = new Image, this.inherited(arguments), this.srcChanged();
    },
    srcChanged: function() {
        this.src && (this.image.src = this.src);
    },
    renderSelf: function(e) {
        e.drawImage(this.image, this.bounds.l, this.bounds.t);
    }
});

// CanvasPrimitivesSample.js

enyo.kind({
    name: "enyo.sample.CanvasPrimitivesSample",
    classes: "enyo-unselectable onyx",
    components: [{
            kind: "enyo.Canvas",
            components: [{
                    kind: "enyo.canvas.Circle",
                    bounds: {
                        t: 60,
                        l: 60,
                        w: 30
                    },
                    color: "lightcoral",
                    outlineColor: "red"
                }, {
                    kind: "enyo.canvas.Rectangle",
                    bounds: {
                        t: 110,
                        l: 30,
                        w: 100,
                        h: 50
                    },
                    color: "lightblue",
                    outlineColor: "blue"
                }, {
                    kind: "enyo.canvas.Text",
                    bounds: {
                        t: 200,
                        l: 30,
                        h: 40,
                        w: 200
                    },
                    color: "green",
                    text: "enyo.js",
                    font: "20pt Cooper Black"
                }, {
                    kind: "enyo.canvas.Image",
                    bounds: {
                        t: 230,
                        l: 30,
                        h: 32,
                        w: 32
                    },
                    src: "assets/astrologer.png"
                }, {
                    kind: "enyo.sample.BlinkyTriangle",
                    bounds: {
                        t: 290,
                        l: 30,
                        w: 60,
                        h: 60
                    },
                    color: "gold",
                    outlineColor: "orange",
                    src: "assets/astrologer.png"
                }]
        }],
    create: function() {
        this.inherited(arguments);
        var e = new Image;
        e.src = this.$.image.src, e.onload = enyo.bind(this, function() {
            this.$.canvas.update();
        });
    }
}), enyo.kind({
    name: "enyo.sample.BlinkyTriangle",
    kind: "enyo.canvas.Shape",
    published: {
        highlightColor: "yellow"
    },
    renderSelf: function(e) {
        e.beginPath(), e.moveTo(this.bounds.l + this.bounds.w / 2, this.bounds.t), e.lineTo(this.bounds.l, this.bounds.t + this.bounds.h), e.lineTo(this.bounds.l + this.bounds.w, this.bounds.t + this.bounds.h), e.lineTo(this.bounds.l + this.bounds.w / 2, this.bounds.t), this.draw(e);
    },
    create: function() {
        this.inherited(arguments), this.jobName = "blinkMe_" + this.id, this.blinkMe();
    },
    destroy: function() {
        enyo.job.stop(this.jobName), this.inherited(arguments);
    },
    blinkMe: function() {
        var e = this.color;
        this.color = this.highlightColor, this.highlightColor = e, this.container.update(), enyo.job(this.jobName, enyo.bind(this, "blinkMe"), 500);
    }
});

// CanvasBallsSample.js

enyo.kind({
    name: "enyo.sample.CanvasBallsSample",
    kind: "Control",
    style: "padding:15px;",
    components: [{
            kind: "Canvas",
            style: "border: 1px solid black;",
            attributes: {
                width: 280,
                height: 300
            },
            components: [{
                    name: "ballpit",
                    kind: "canvas.Control"
                }, {
                    kind: "canvas.Rectangle",
                    bounds: {
                        l: 0,
                        t: 290,
                        w: 300,
                        h: 10
                    }
                }, {
                    name: "fpsCounter",
                    kind: "canvas.Text",
                    bounds: {
                        l: 0,
                        t: 15
                    },
                    color: "black"
                }]
        }, {
            tag: "br"
        }, {
            tag: "button",
            content: "Reset",
            ontap: "reset"
        }, {
            tag: "br"
        }, {
            tag: "span",
            content: "Balls: "
        }, {
            kind: "onyx.InputDecorator",
            components: [{
                    kind: "onyx.Input",
                    name: "balls",
                    value: "10",
                    placeholder: "Number of Balls"
                }]
        }],
    published: {
        accel: 9.8,
        balls: 10
    },
    setupBalls: function() {
        this.cancel && enyo.cancelRequestAnimationFrame(this.cancel), this.loopStart = Date.now(), this.frame = 0, this.start = Date.now(), this.$.ballpit.destroyClientControls();
        var e = ["green", "blue", "black", "brown", "red", "orange"], t, n, r, i;
        for (var s = 0; s < this.balls; s++)
            t = (enyo.irand(69) + 30) / 100, n = e[enyo.irand(e.length)], r = enyo.irand(375), i = 10 + enyo.irand(27) * 10, this.$.ballpit.createComponent({
                kind: "canvas.Circle",
                bounds: {
                    l: i,
                    t: r,
                    w: 10
                },
                color: n,
                bounce: t,
                vel: 0,
                owner: this
            });
        enyo.asyncMethod(this, "loop");
    },
    rendered: function() {
        this.setupBalls();
    },
    destroy: function() {
        this.cancel && enyo.cancelRequestAnimationFrame(this.cancel), this.inherited(arguments);
    },
    loop: function() {
        this.frame++;
        for (var e = 0, t; t = this.$.ballpit.children[e]; e++)
            t.bounds.t + t.bounds.w > this.$.rectangle.bounds.t ? (t.vel = -t.vel * t.bounce, t.bounds.t = this.$.rectangle.bounds.t - t.bounds.w) : t.bounds.t < t.bounds.w && (t.bounds.t = t.bounds.w, t.vel = 0), t.vel += this.accel * (Date.now() - this.start), t.bounds.t += t.vel / 1e4;
        this.$.canvas.update(), this.start = Date.now(), this.cancel = enyo.requestAnimationFrame(enyo.bind(this, "loop")), this.$.fpsCounter.setText(Math.floor(this.frame / ((Date.now() - this.loopStart) / 1e3)));
    },
    reset: function() {
        var e = this.$.balls.hasNode(), t = e ? parseInt(e.value, 0) : this.balls;
        if (isFinite(t) && t >= 0 && t != this.balls)
            this.setBalls(t);
        else
            for (var n = 0, r; r = this.$.ballpit.children[n]; n++)
                r.bounds.t = enyo.irand(375), r.vel = 0;
    },
    ballsChanged: function(e) {
        this.setupBalls();
    }
});

// CodeEditor.js

enyo.kind({
    name: "CodeEditor",
    kind: "Control",
    tag: "textarea",
    published: {
        url: "",
        value: ""
    },
    events: {
        onLoad: ""
    },
    create: function() {
        this.inherited(arguments), this.valueChanged(), this.urlChanged();
    },
    urlChanged: function() {
        this.url && (new enyo.Ajax({
            url: this.url,
            handleAs: "text"
        })).response(this, "receive").go();
    },
    receive: function(e, t) {
        this.setValue(t), this.doLoad({
            code: t
        });
    },
    valueChanged: function() {
        this.setAttribute("value", this.value), this.hasNode() && (this.hasNode().value = this.value);
    },
    getValue: function() {
        return this.hasNode() ? this.node.value : this.getAttribute("value");
    }
});

// CodePlayer.js

enyo.kind({
    name: "CodePlayer",
    kind: "Control",
    evalCode: function(inCode) {
        eval(inCode);
    },
    go: function(e) {
        this.destroyClientControls();
        try {
            this.evalCode(e), this.createComponent({
                kind: "Sample"
            }), this.hasNode() && this.render();
        } catch (t) {
            console.error("Error creating code: " + t);
        }
    }
});

// Exampler.js

enyo.kind({
    name: "Exampler",
    kind: "Control",
    style: "background: #ABABAB",
    published: {
        url: ""
    },
    components: [{
            classes: "enyo-fit",
            classes: "tabbar",
            style: "overflow: hidden; height: 40px;",
            components: [{
                    name: "outputTab",
                    classes: "active tab",
                    content: "Output",
                    ontap: "outputTap"
                }, {
                    name: "codeTab",
                    classes: "tab",
                    content: "Code",
                    ontap: "editorTap"
                }]
        }, {
            kind: "CodePlayer",
            classes: "enyo-fit",
            style: "top: 40px;"
        }, {
            kind: "CodeEditor",
            classes: "enyo-fit",
            style: "top: 40px;",
            onLoad: "go",
            showing: !1
        }],
    create: function() {
        this.inherited(arguments), this.addClass("theme-fu"), this.urlChanged();
    },
    urlChanged: function() {
        this.$.codeEditor.setUrl(this.url);
    },
    go: function() {
        this.$.codePlayer.go(this.$.codeEditor.getValue());
    },
    editorTap: function() {
        this.showHideEditor(!0);
    },
    outputTap: function() {
        this.go(), this.showHideEditor(!1);
    },
    showHideEditor: function(e) {
        this.$.codeEditor.setShowing(e), this.$.codePlayer.setShowing(!e), this.$.codeTab.addRemoveClass("active", e), this.$.outputTab.addRemoveClass("active", !e);
    }
});

// PlatformSample.js

enyo.kind({
    name: "enyo.sample.PlatformSample",
    kind: "FittableRows",
    classes: "enyo-fit platform-sample",
    components: [{
            classes: "platform-sample-divider",
            content: "Enyo Platform Detection"
        }, {
            kind: "onyx.Groupbox",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "User-Agent String"
                }, {
                    name: "uaString",
                    content: "",
                    style: "padding: 8px;"
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.Groupbox",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Window"
                }, {
                    name: "windowAttr",
                    content: "",
                    style: "padding: 8px;"
                }]
        }, {
            tag: "br"
        }, {
            kind: "onyx.Groupbox",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "enyo.platform"
                }, {
                    name: "enyoPlatformJSON",
                    content: "",
                    style: "padding: 8px;"
                }]
        }],
    updateWindowSize: function() {
        this.$.windowAttr.setContent("size: " + window.innerWidth + "x" + window.innerHeight + ", devicePixelRatio: " + window.devicePixelRatio);
    },
    create: function() {
        this.inherited(arguments), this.$.uaString.setContent(navigator.userAgent), this.$.enyoPlatformJSON.setContent(JSON.stringify(enyo.platform, null, 1)), this.updateWindowSize();
    },
    resizeHandler: function() {
        this.inherited(arguments), this.updateWindowSize();
    }
});

// Playground.js

enyo.kind({
    name: "enyo.sample.Playground",
    kind: "Panels",
    classes: "enyo-fit onyx playground-sample-panels",
    arrangerKind: "CollapsingArranger",
    components: [{
            kind: "FittableRows",
            style: "width:50%;",
            components: [{
                    kind: "onyx.Toolbar",
                    name: "toolbar",
                    layoutKind: "FittableColumnsLayout",
                    components: [{
                            content: "Enyo Playground",
                            fit: !0
                        }, {
                            kind: "onyx.PickerDecorator",
                            components: [{}, {
                                    kind: "onyx.Picker",
                                    floating: !0,
                                    onChange: "sampleChanged",
                                    components: [{
                                            content: "Sample1",
                                            active: !0
                                        }, {
                                            content: "Sample2"
                                        }, {
                                            content: "Sample3"
                                        }, {
                                            content: "Sample4"
                                        }]
                                }]
                        }]
                }, {
                    fit: !0,
                    style: "padding:15px;",
                    components: [{
                            kind: "CodeEditor",
                            fit: !0,
                            classes: "playground-sample-source"
                        }]
                }, {
                    kind: "FittableColumns",
                    style: "margin:0px 15px 15px 15px",
                    components: [{
                            fit: !0
                        }, {
                            kind: "onyx.Button",
                            content: "Render Kind",
                            ontap: "go"
                        }]
                }]
        }, {
            kind: "FittableRows",
            classes: "onyx",
            components: [{
                    kind: "onyx.Toolbar",
                    components: [{
                            kind: "onyx.Grabber"
                        }, {
                            content: "Result"
                        }]
                }, {
                    kind: "Scroller",
                    fit: !0,
                    components: [{
                            kind: "CodePlayer",
                            fit: !0,
                            classes: "playground-sample-player"
                        }]
                }]
        }],
    create: function() {
        this.inherited(arguments);
    },
    sampleChanged: function(e, t) {
        this.loadSample(t.selected.content), this.$.toolbar.resized();
    },
    loadSample: function(e) {
        this.$.codeEditor.setUrl("assets/" + e + ".js");
    },
    go: function() {
        this.$.codePlayer.go(this.$.codeEditor.getValue()), enyo.Panels.isScreenNarrow() && this.next();
    }
});

// AjaxSample.js

enyo.kind({
    name: "enyo.sample.AjaxSample",
    kind: "FittableRows",
    classes: "enyo-fit ajax-sample",
    components: [{
            kind: "FittableColumns",
            classes: "onyx-toolbar-inline",
            components: [{
                    content: "YQL: "
                }, {
                    kind: "onyx.Input",
                    name: "query",
                    fit: !0,
                    value: 'select * from upcoming.events where woeid in (select woeid from geo.places where text="Sunnyvale, CA")'
                }, {
                    kind: "onyx.Button",
                    content: "Fetch",
                    ontap: "fetch"
                }]
        }, {
            kind: "FittableColumns",
            classes: "onyx-toolbar-inline",
            components: [{
                    content: "URL: "
                }, {
                    kind: "onyx.Input",
                    name: "baseUrl",
                    fit: !0,
                    value: "http://query.yahooapis.com/v1/public/yql?format=json"
                }]
        }, {
            kind: "onyx.TextArea",
            fit: !0,
            classes: "ajax-sample-source"
        }],
    fetch: function() {
        var e = new enyo.Ajax({
            url: this.$.baseUrl.getValue()
        });
        e.go({
            q: this.$.query.getValue()
        }), e.response(this, "processResponse"), e.error(this, "processError");
    },
    processResponse: function(e, t) {
        this.$.textArea.setValue(JSON.stringify(t, null, 2));
    },
    processError: function(e, t) {
        alert("Error!");
    }
});

// JsonpSample.js

enyo.kind({
    name: "enyo.sample.JsonpSample",
    kind: "FittableRows",
    classes: "enyo-fit jsonp-sample",
    components: [{
            kind: "FittableColumns",
            classes: "onyx-toolbar-inline",
            components: [{
                    content: "YQL: "
                }, {
                    kind: "onyx.Input",
                    name: "query",
                    fit: !0,
                    value: 'select * from upcoming.events where woeid in (select woeid from geo.places where text="Sunnyvale, CA")'
                }, {
                    kind: "onyx.Button",
                    content: "Fetch",
                    ontap: "fetch"
                }]
        }, {
            kind: "onyx.TextArea",
            fit: !0,
            classes: "jsonp-sample-source"
        }],
    fetch: function() {
        var e = new enyo.JsonpRequest({
            url: "http://query.yahooapis.com/v1/public/yql?format=json",
            callbackName: "callback"
        });
        e.go({
            q: this.$.query.getValue()
        }), e.response(this, "processResponse");
    },
    processResponse: function(e, t) {
        this.$.textArea.setValue(JSON.stringify(t, null, 2));
    }
});

// WebServiceSample.js

enyo.kind({
    name: "enyo.sample.WebServiceSample",
    kind: "FittableRows",
    classes: "enyo-fit webservice-sample",
    components: [{
            kind: "WebService",
            name: "yql",
            url: "http://query.yahooapis.com/v1/public/yql?format=json",
            onResponse: "processResponse",
            callbackName: "callback"
        }, {
            kind: "FittableColumns",
            classes: "onyx-toolbar-inline",
            components: [{
                    content: "YQL: "
                }, {
                    kind: "onyx.Input",
                    name: "query",
                    fit: !0,
                    value: 'select * from upcoming.events where woeid in (select woeid from geo.places where text="Sunnyvale, CA")'
                }, {
                    kind: "onyx.PickerDecorator",
                    components: [{
                            content: "Choose Scroller",
                            style: "width:100px;"
                        }, {
                            kind: "onyx.Picker",
                            floating: !0,
                            components: [{
                                    content: "AJAX",
                                    active: !0
                                }, {
                                    content: "JSON-P"
                                }]
                        }]
                }, {
                    kind: "onyx.Button",
                    content: "Fetch",
                    ontap: "fetch"
                }]
        }, {
            kind: "onyx.TextArea",
            fit: !0,
            classes: "webservice-sample-source"
        }],
    fetch: function() {
        this.$.yql.send({
            q: this.$.query.getValue(),
            jsonp: this.$.picker.getSelected().indexInContainer() == 2
        });
    },
    processResponse: function(e, t) {
        this.$.textArea.setValue(JSON.stringify(t.data, null, 2));
    }
});

// RepeaterSample.js

enyo.kind({
    name: "enyo.sample.RepeaterSample",
    classes: "enyo-fit repeater-sample",
    components: [{
            kind: "Repeater",
            onSetupItem: "setupItem",
            components: [{
                    name: "item",
                    classes: "repeater-sample-item",
                    components: [{
                            tag: "span",
                            name: "personNumber"
                        }, {
                            tag: "span",
                            name: "personName"
                        }]
                }]
        }],
    create: function() {
        this.inherited(arguments), this.$.repeater.setCount(this.people.length);
    },
    setupItem: function(e, t) {
        var n = t.index, r = t.item, i = this.people[n];
        r.$.personNumber.setContent(n + 1 + ". "), r.$.personName.setContent(i.name), r.$.personName.applyStyle("color", i.sex == "male" ? "dodgerblue" : "deeppink");
    },
    people: [{
            name: "Andrew",
            sex: "male"
        }, {
            name: "Betty",
            sex: "female"
        }, {
            name: "Christopher",
            sex: "male"
        }, {
            name: "Donna",
            sex: "female"
        }, {
            name: "Ephraim",
            sex: "male"
        }, {
            name: "Frankie",
            sex: "male"
        }, {
            name: "Gerald",
            sex: "male"
        }, {
            name: "Heather",
            sex: "female"
        }, {
            name: "Ingred",
            sex: "female"
        }, {
            name: "Jack",
            sex: "male"
        }, {
            name: "Kevin",
            sex: "male"
        }, {
            name: "Lucy",
            sex: "female"
        }, {
            name: "Matthew",
            sex: "male"
        }, {
            name: "Noreen",
            sex: "female"
        }, {
            name: "Oscar",
            sex: "male"
        }, {
            name: "Pedro",
            sex: "male"
        }, {
            name: "Quentin",
            sex: "male"
        }, {
            name: "Ralph",
            sex: "male"
        }, {
            name: "Steven",
            sex: "male"
        }, {
            name: "Tracy",
            sex: "female"
        }, {
            name: "Uma",
            sex: "female"
        }, {
            name: "Victor",
            sex: "male"
        }, {
            name: "Wendy",
            sex: "female"
        }, {
            name: "Xin",
            sex: "male"
        }, {
            name: "Yulia",
            sex: "female"
        }, {
            name: "Zoltan"
        }]
});

// ScrollerSample.js

enyo.kind({
    name: "enyo.sample.ScrollerSample",
    kind: "FittableRows",
    classes: "enyo-fit  enyo-unselectable",
    components: [{
            kind: "onyx.Toolbar",
            components: [{
                    kind: "onyx.PickerDecorator",
                    components: [{
                            content: "Choose Scroller",
                            style: "width:250px;"
                        }, {
                            kind: "onyx.Picker",
                            floating: !0,
                            maxHeight: 300,
                            onSelect: "sampleChanged",
                            components: [{
                                    content: "Default scroller",
                                    active: !0
                                }, {
                                    content: "Force touch scroller"
                                }, {
                                    content: "Horizontal only"
                                }, {
                                    content: "Vertical only"
                                }, {
                                    content: "Force TouchScrollStrategy"
                                }, {
                                    content: "Force TransitionScrollStrategy"
                                }, {
                                    content: "Force TranslateScrollStrategy"
                                }]
                        }]
                }]
        }, {
            kind: "Panels",
            fit: !0,
            draggable: !1,
            classes: "scroller-sample-panels",
            components: [{
                    kind: "Scroller",
                    classes: "scroller-sample-scroller enyo-fit"
                }, {
                    kind: "Scroller",
                    touch: !0,
                    classes: "scroller-sample-scroller enyo-fit"
                }, {
                    kind: "Scroller",
                    vertical: "hidden",
                    classes: "scroller-sample-scroller enyo-fit"
                }, {
                    kind: "Scroller",
                    horizontal: "hidden",
                    classes: "scroller-sample-scroller enyo-fit",
                    onmousedown: "mouseDown",
                    ondragstart: "dragStart"
                }, {
                    kind: "Scroller",
                    classes: "scroller-sample-scroller enyo-fit",
                    strategyKind: "TouchScrollStrategy"
                }, {
                    kind: "Scroller",
                    classes: "scroller-sample-scroller enyo-fit",
                    strategyKind: "TransitionScrollStrategy"
                }, {
                    kind: "Scroller",
                    classes: "scroller-sample-scroller enyo-fit",
                    strategyKind: "TranslateScrollStrategy"
                }]
        }],
    create: function() {
        this.inherited(arguments);
        var e = this.$.panels.getPanels();
        for (var t in e)
            e[t].createComponent({
                allowHtml: !0,
                content: this.text,
                classes: "scroller-sample-content"
            });
    },
    sampleChanged: function(e, t) {
        this.$.panels.setIndex(t.selected.indexInContainer() - 1);
    },
    text: "Foo<br>Bar<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. <br>Foo<br>Bar<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. <br>Foo<br>Bar<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. <br>Foo<br>Bar<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow<br>Foo<br>Bar<br>Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. Boom boom pow. <br>",
    mouseDown: function(e, t) {
        t.preventDefault();
    },
    dragStart: function(e, t) {
        if (t.horizontal)
            return !0;
    }
});

// GestureSample.js

enyo.kind({
    name: "enyo.sample.GestureSample",
    kind: "FittableRows",
    classes: "gesture-sample enyo-fit enyo-unselectable",
    components: [{
            classes: "gesture-sample-pad",
            fit: !0,
            ondown: "handleEvent",
            onup: "handleEvent",
            ontap: "handleEvent",
            onmove: "handleEvent",
            onenter: "handleEvent",
            onleave: "handleEvent",
            ondragstart: "handleEvent",
            ondrag: "handleEvent",
            ondragover: "handleEvent",
            onhold: "handleEvent",
            onrelease: "handleEvent",
            onholdpulse: "handleEvent",
            onflick: "handleEvent",
            ongesturestart: "handleEvent",
            ongesturechange: "handleEvent",
            ongestureend: "handleEvent",
            components: [{
                    content: "Perform gestures here"
                }, {
                    classes: "gesture-sample-note",
                    content: "(tap below for options)"
                }]
        }, {
            kind: "onyx.Groupbox",
            ontap: "toggleSettings",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Events"
                }, {
                    name: "eventList",
                    style: "font-size:12px;",
                    onDone: "removeEvent",
                    components: [{
                            name: "waiting",
                            content: "Waiting for events...",
                            style: "padding:4px;font-style:italic;color:gray;"
                        }]
                }]
        }, {
            ontap: "toggleSettings",
            name: "settings",
            showing: !1,
            components: [{
                    kind: "onyx.Groupbox",
                    classes: "gesture-sample-padded",
                    components: [{
                            kind: "onyx.GroupboxHeader",
                            content: "Options"
                        }, {
                            classes: "gesture-sample-setting",
                            components: [{
                                    content: "Truncate detail on small screen: "
                                }, {
                                    name: "truncateDetail",
                                    onchange: "truncateChanged",
                                    ontap: "preventDefault",
                                    kind: "onyx.Checkbox",
                                    checked: !0
                                }]
                        }, {
                            classes: "gesture-sample-setting",
                            style: "min-height:40px;",
                            components: [{
                                    content: "Monitor event: "
                                }, {
                                    kind: "onyx.PickerDecorator",
                                    ontap: "preventDefault",
                                    onSelect: "monitorEventSelected",
                                    components: [{
                                            content: "Select event",
                                            style: "width:140px; margin-bottom:5px;"
                                        }, {
                                            name: "eventPicker",
                                            kind: "onyx.Picker",
                                            classes: "gesture-sample-left"
                                        }]
                                }]
                        }]
                }]
        }],
    create: function() {
        this.inherited(arguments), this.eventList = {}, this.eventCount = 0, enyo.forEach(["All events", "down", "up", "tap", "move", "enter", "leave", "dragstart", "drag", "dragover", "hold", "release", "holdpulse", "flick", "gesturestart", "gesturechange", "gestureend"], enyo.bind(this, function(e) {
            this.$.eventPicker.createComponent({
                content: e,
                style: "text-align:left"
            });
        }));
    },
    handleEvent: function(e, t) {
        var n = enyo.clone(t);
        if (this.monitorEvent && n.type != this.monitorEvent)
            return !0;
        var r = this.eventList[n.type];
        return r ? r.setEvent(n) : (this.eventCount++, r = this.$.eventList.createComponent({
            kind: "enyo.sample.EventItem",
            event: n,
            truncate: this.$.truncateDetail.getValue(),
            persist: this.monitorEvent
        }), this.eventList[n.type] = r), r.render(), this.$.waiting.hide(), this.reflow(), !0;
    },
    truncateChanged: function() {
        for (var e in this.eventList)
            this.eventList[e].setTruncate(this.$.truncateDetail.getValue());
        return this.reflow(), !1;
    },
    removeEvent: function(e, t) {
        return this.eventCount--, this.eventList[t.type].destroy(), delete this.eventList[t.type], this.eventCount === 0 && this.$.waiting.show(), this.reflow(), !0;
    },
    removeAllEvents: function() {
        for (var e in this.eventList)
            this.eventList[e].destroy(), delete this.eventList[e];
        this.eventCount = 0, this.$.waiting.show(), this.reflow();
    },
    toggleSettings: function() {
        this.$.settings.setShowing(!this.$.settings.getShowing()), this.reflow();
    },
    preventDefault: function() {
        return !0;
    },
    monitorEventSelected: function(e, t) {
        this.removeAllEvents(), t.originator.content == "All events" ? this.monitorEvent = null : this.monitorEvent = t.originator.content;
    }
}), enyo.kind({
    name: "enyo.sample.EventItem",
    published: {
        event: "",
        truncate: !0,
        persist: !1
    },
    style: "padding:4px;",
    events: {
        onDone: ""
    },
    components: [{
            name: "eventProps",
            allowHtml: !0
        }, {
            kind: "Animator",
            duration: 1e3,
            startValue: 0,
            endValue: 255,
            onStep: "stepAnimation",
            onEnd: "animationEnded"
        }],
    create: function() {
        this.inherited(arguments), this.eventChanged(), this.truncateChanged();
    },
    truncateChanged: function() {
        this.$.eventProps.addRemoveClass("gesture-sample-truncate", this.truncate);
    },
    setEvent: function(e) {
        this.setPropertyValue("event", e, "eventChanged");
    },
    eventChanged: function(e) {
        this.event && (this.timeout && (clearTimeout(this.timeout), this.timeout = null), this.$.animator.stop(), this.$.eventProps.setContent(this.getPropsString()), this.$.animator.play());
    },
    stepAnimation: function(e, t) {
        var n = Math.floor(e.value);
        this.applyStyle("background-color", "rgb(" + n + ",255," + n + ");");
    },
    animationEnded: function() {
        this.persist || (this.timeout = setTimeout(enyo.bind(this, function() {
            this.doDone({
                type: this.event.type
            });
        }), 2e3));
    },
    destroy: function() {
        this.timeout && (clearTimeout(this.timeout), this.timeout = null), this.inherited(arguments);
    },
    getPropsString: function() {
        var e = [];
        for (var t in this.event)
            this.event[t] !== undefined && this.event[t] !== null && !(this.event[t] instanceof Object) && t != "type" && e.push(t + ": " + this.event[t]);
        return this.event.srcEvent && this.event.srcEvent.type && e.push("srcEvent.type: " + this.event.srcEvent.type), "<b>" + this.event.type + "</b>: { " + e.join(", ") + " }";
    }
});

// StringSample.js

enyo.kind({
    name: "g11n.sample.StringSample",
    kind: "FittableRows",
    classes: "enyo-fit",
    components: [{
            kind: "onyx.Toolbar",
            content: $L("Strings")
        }, {
            kind: "FittableColumns",
            style: "padding: 10px",
            components: [{
                    components: [{
                            content: $L("Choose Locale:"),
                            classes: "g11n-sample-divider"
                        }, {
                            kind: "onyx.PickerDecorator",
                            style: "padding:10px;",
                            onSelect: "pickerHandler",
                            components: [{
                                    content: "Pick One...",
                                    style: "width: 200px"
                                }, {
                                    kind: "onyx.Picker",
                                    components: [{
                                            content: "en_us",
                                            active: !0
                                        }, {
                                            content: "en_ca"
                                        }, {
                                            content: "en_ie"
                                        }, {
                                            content: "en_gb"
                                        }, {
                                            content: "en_mx"
                                        }, {
                                            content: "de_de"
                                        }, {
                                            content: "fr_fr"
                                        }, {
                                            content: "fr_ca"
                                        }, {
                                            content: "it_it"
                                        }, {
                                            content: "es_es"
                                        }, {
                                            content: "es_mx"
                                        }, {
                                            content: "es_us"
                                        }]
                                }]
                        }]
                }]
        }, {
            kind: "onyx.Groupbox",
            style: "padding:10px",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: $L("Example Translations")
                }, {
                    kind: "Scroller",
                    style: "height:300px",
                    components: [{
                            name: "Box",
                            allowHtml: !0,
                            style: "font-size:1.2em"
                        }]
                }]
        }],
    initComponents: function() {
        this.inherited(arguments), this.$.Box.setContent(this.strings().join("<br>"));
        var e = enyo.g11n.currentLocale().getLocale();
        this.format(e);
    },
    pickerHandler: function(e, t) {
        this.format(t.selected.content);
    },
    format: function(e) {
        this.mockTranslate(e);
    },
    mockTranslate: function(e) {
        this._mockResources[e] || (this._mockResources[e] = new enyo.g11n.Resources({
            locale: e
        }) || {
            $L: function(e) {
                return e;
            }
        }), $L._resources = this._mockResources[e], this.$.Box.setContent(this.strings().join("<br/>"));
    },
    _mockResources: {},
    strings: function() {
        return [$L("(activated)"), $L("(not activated)"), $L("1 message #{high}"), $L("A new security policy has been implemented for your Exchange ActiveSync account.  When you end the call, you will be able to change your password."), $L("A security policy has been implemented for your Exchange ActiveSync account. You must set a password or PIN to continue using it."), $L("A security policy has been implemented for your Exchange ActiveSync account. You must set a password to continue using it."), $L("Add to Contacts"), $L("Airplane mode is on."), $L("Akey and checksum are not correct."), $L("Akey set failed."), $L("Albania"), $L("Algeria"), $L("American Samoa (US)"), $L("Andorra"), $L("Answer failed."), $L("Answer failed: invalid call id"), $L("Antigua and Barbuda"), $L("Are you sure you want to clear all of the calls in your call history?"), $L("Argentina"), $L("Armenia"), $L("Australia"), $L("Austria"), $L("Authorization failed."), $L("Azerbaijani Republic"), $L("Bahrain"), $L("Barbados"), $L("Baseband crashed."), $L("Belarus"), $L("Belgium"), $L("Benin"), $L("Bermuda (UK)"), $L("Bhutan"), $L("Blocked number"), $L("Bolivia"), $L("Bosnia and Herzegovina"), $L("Brazil"), $L("British Virgin Islands (UK)"), $L("Bulgaria"), $L("CNAP disabled."), $L("CNAP enabled."), $L("CNAP not provisioned."), $L("CNAP query failed."), $L("Call #{value}"), $L("Call barred by network"), $L("Call barring password change failed. #{errorText}"), $L("Call barring password change was successful."), $L("Call customer service"), $L("Call dropped"), $L("Call dropped."), $L("Call dropped: baseband crashed."), $L("Call dropped: out-of-range."), $L("Call dropped: signal faded"), $L("Call dropped: signal faded."), $L("Call ended"), $L("Call failed."), $L("Call failed: No free lines."), $L("Call failed: No service."), $L("Call failed: Not an emergency call."), $L("Call failed: Not on fixed dialing list."), $L("Call failed: Phone is locked."), $L("Call failed: Phone is off."), $L("Call failed: network busy"), $L("Call failed: no service"), $L("Call forwarding (all-conditional) status: #{status}"), $L("Call forwarding (all-forwarding) status: #{status}"), $L("Call forwarding (mobile busy) status: #{status}"), $L("Call forwarding (no reply) status: #{status}"), $L("Call forwarding (unconditional) status: #{status}"), $L("Call forwarding (unreachable) status: #{status}"), $L("Call forwarding activation failed. #{errorText}"), $L("Call forwarding deactivation failed. #{errorText}"), $L("Call forwarding registration failed. #{errorText}"), $L("Call forwarding unregistration failed. #{errorText}"), $L("Call service provider for PUK code."), $L("Call waiting activation failed. #{errorText}"), $L("Call waiting deactivation failed. #{errorText}"), $L("Call waiting is not active."), $L("Call waiting query failed. #{errorText}"), $L("Call waiting registration failed. #{errorText}"), $L("Call waiting unregistration failed. #{errorText}"), $L("Call with #{contact} ended"), $L("Cambodia"), $L("Cameroon"), $L("Cancel"), $L("Cape Verde"), $L("Cayman Islands (UK)"), $L("Central African Republic"), $L("Chad"), $L("Change Default Number"), $L("Check Skype Credit"), $L("Chile"), $L("China"), $L("Choose a default number"), $L("Clear Call History"), $L("Colombia"), $L("Command timed out."), $L("Commit succeeded"), $L("Comoros"), $L("Conference call"), $L("Conference call ended"), $L("Conference failed."), $L("Conference failed: need at least 2 calls."), $L("Connecting"), $L("Connecting to network to dial..."), $L("Cook Islands (NZ)"), $L("Cote d'Ivoire"), $L("Croatia"), $L("Cyprus"), $L("Czech Republic"), $L("Delete"), $L("Denmark"), $L("Device Password Required"), $L("Device Password Upgrade Required"), $L("Dial"), $L("Dial "), $L("Dialing"), $L("Dominica"), $L("Dominican Republic"), $L("Done"), $L("East Timor"), $L("Ecuador"), $L("Egypt"), $L("Eight"), $L("Emergency Call"), $L("Emergency call"), $L("Emergency call failed."), $L("Emergency calls only."), $L("Ended"), $L("Ending"), $L("Enter MSL then tap Done."), $L("Enter PIN"), $L("Enter name or number..."), $L("Enter number..."), $L("Entering an incorrect PIN will erase your phone"), $L("Equatorial Guinea"), $L("Eritrea"), $L("Error occurred."), $L("Error: MSL value is empty."), $L("Estonia"), $L("Ethiopia"), $L("Extract failed."), $L("Extract failed: no conference."), $L("Extract failed: no free lines."), $L("Failed to register for TelephonyService status."), $L("Failed to save voicemail greeting"), $L("Failure. "), $L("Failure. Tries left : "), $L("Faroe Islands (Denmark)"), $L("Fax"), $L("Federated States of Micronesia"), $L("Fiji"), $L("Finland"), $L("Five"), $L("Four"), $L("French Guiana (France)"), $L("French Polynesia (France)"), $L("Gabonese Republic"), $L("Gambia"), $L("General error."), $L("Georgia"), $L("Germany"), $L("Getting activation info..."), $L("Gibraltar (UK)"), $L("Greece"), $L("Greenland (Denmark)"), $L("Grenada"), $L("Guam (US)"), $L("Guinea"), $L("Guinea-Bissau"), $L("Guyana"), $L("Haiti"), $L("Hold"), $L("Home"), $L("Hong Kong (PRC)"), $L("Hungary"), $L("IMEI query failed."), $L("IMEI: #{value}"), $L("Iceland"), $L("If you enter an incorrect PIN now your phone will be erased."), $L("Ignored call from #{contact}"), $L("Incoming call"), $L("Incoming caller ID presentation disabled."), $L("Incoming caller ID presentation enabled."), $L("Incoming caller ID presentation not provisioned."), $L("Incoming caller ID presentation query failed. #{errorText}"), $L("India"), $L("Indonesia"), $L("Initial programming required"), $L("Initializing..."), $L("International Call"), $L("Invalid parameter."), $L("Iraq"), $L("Ireland"), $L("Israel"), $L("Italy"), $L("Jamaica"), $L("Japan"), $L("Jordan"), $L("Kuwait"), $L("Kyrgyz Republic"), $L("Latvia"), $L("Lebanon"), $L("Libya"), $L("Line is busy"), $L("Listening..."), $L("Lithuania"), $L("MDN downloaded"), $L("Macao (PRC)"), $L("Macedonia, The Former Yugoslav Republic Of"), $L("Main"), $L("Malaysia"), $L("Malta"), $L("Marshall Islands"), $L("Mauritania"), $L("Mauritius"), $L("Mexico"), $L("Missed call"), $L("Missed call "), $L("Missed call at "), $L("Modem error"), $L("Moldova"), $L("Mongolia"), $L("Montserrat (UK)"), $L("Morocco"), $L("NAM downloaded"), $L("Namibia"), $L("Nepal"), $L("Netherlands"), $L("Netherlands Antilles (Netherlands)"), $L("Network failure."), $L("Network message"), $L("Network update"), $L("New Caledonia (France)"), $L("New Zealand"), $L("New message #{high}"), $L("Nine"), $L("No answer"), $L("No free lines."), $L("No service."), $L("No telephony server"), $L("Northern Mariana Islands"), $L("Norway"), $L("Not supported by this network type."), $L("Number not on fixed dialing list."), $L("On hold"), $L("One"), $L("Operation failed: Call forwarding (all-conditional). #{errorText}"), $L("Operation failed: Call forwarding (all-forwarding) query. #{errorText}"), $L("Operation failed: Call forwarding (mobile busy) query. #{errorText}"), $L("Operation failed: Call forwarding (no reply). #{errorText}"), $L("Operation failed: Call forwarding (unconditional) #{errorText}"), $L("Operation failed: Call forwarding (unreachable) query. #{errorText}"), $L("Other"), $L("Outgoing Caller ID restriction not provisioned."), $L("Outgoing Caller ID restriction query failed."), $L("Outgoing caller ID enable failed."), $L("Outgoing caller ID enabled."), $L("Outgoing caller ID restricted failed."), $L("Outgoing caller ID restricted."), $L("PAD access"), $L("PCS Vision Services could not be prepared. If the problem persists, call Sprint Customer Service."), $L("PIN change successful."), $L("PIN doesn't match"), $L("PIN must be enabled before change is allowed."), $L("PIN required."), $L("PIN reset failed. #{attemptsRemaining} attempts remaining."), $L("PIN reset successful."), $L("PIN2 change successful."), $L("PIN2 must be enabled before change is allowed."), $L("PIN2 reset successful."), $L("PRL downloaded"), $L("PRL update could not be prepared. If the problem persists, call Sprint Customer Service."), $L("Pager"), $L("Papua New Guinea"), $L("Password does not match security requirements."), $L("Password must contain both numbers and letters."), $L("Passwords do not match."), $L("Peru"), $L("Phone"), $L("Phone Locked"), $L("Phone is locked."), $L("Phone is off."), $L("Placed call"), $L("Poland"), $L("Processing..."), $L("Programming in progress"), $L("Programming succeeded"), $L("Programming unsuccessful"), $L("Programming unsuccessful.  Call #{value}"), $L("Programming unsuccessful. Call customer service."), $L("Programming..."), $L("Puerto Rico (US)"), $L("Record New Greeting"), $L("Remove"), $L("Request failed to complete before timeout."), $L("Reunion (France)"), $L("Romania"), $L("Russian Federation"), $L("Rwandese Republic"), $L("SIM has bad file."), $L("SIM phonebook not ready."), $L("SPL unlocked"), $L("Saint Lucia"), $L("Saint Pierre and Miquelon (France)"), $L("Saint Vincent and the Grenadines"), $L("San Marino"), $L("Sao Tome and Principe"), $L("Saudi Arabia"), $L("Sending your request..."), $L("Senegal"), $L("Serbia and Montenegro"), $L("Service Provider"), $L("Set Password"), $L("Seven"), $L("Singapore"), $L("Slovakia"), $L("Slovenia"), $L("Solomon Islands"), $L("Somalia"), $L("South Africa"), $L("Spain"), $L("Speaker"), $L("Success"), $L("Sudan"), $L("Sweden"), $L("Switzerland"), $L("Syria"), $L("TTY/TDD"), $L("Taiwan"), $L("Tajikistan"), $L("Tanzania"), $L("Tap to add default"), $L("Tap to add number"), $L("TelephonyService not connected to radio."), $L("Thailand"), $L("The network is unavailable."), $L("The number you are trying to call cannot be tried again until you restart your phone."), $L("Three"), $L("Togolese Republic"), $L("Trinidad and Tobago"), $L("Try Again"), $L("Tunisia"), $L("Turkey"), $L("Turkmenistan"), $L("Turks and Caicos Islands (UK)"), $L("Two"), $L("USSD request failed."), $L("USSD request successful"), $L("Uganda"), $L("Unable to change PIN status."), $L("Unable to change PIN status: PUK locked."), $L("Unable to change PIN status: SIM locked."), $L("Unable to change PIN status: bad format."), $L("Unable to change PIN."), $L("Unable to change PIN. #{attemptsRemaining} attempts remaining."), $L("Unable to change PIN2."), $L("Unable to change PIN2. #{attemptsRemaining} attempts remaining."), $L("Unable to change PIN: PINs don't match."), $L("Unable to change PIN: PUK locked."), $L("Unable to change PIN: SIM locked."), $L("Unable to change PIN: enable PIN first."), $L("Unable to complete call."), $L("Unable to find voicemail number."), $L("Unable to reset PIN."), $L("Unable to reset PIN2."), $L("Unable to reset PIN2. #{attemptsRemaining} attempts remaining."), $L("Unable to unlock PUK."), $L("Unable to unlock PUK: PINs don't match."), $L("Unable to unlock PUK: SIM locked."), $L("Unable to unlock PUK: bad or incorrect PUK."), $L("Unable to unlock PUK: new PIN not valid."), $L("United Arab Emirates"), $L("United Kingdom"), $L("United States Virgin Islands (US)"), $L("United States of America"), $L("Unknown"), $L("Unknown error."), $L("Unknown method."), $L("Unknown number"), $L("Unlock"), $L("Uzbekistan"), $L("Vatican City State"), $L("View Contact"), $L("Voice privacy disabled."), $L("Voice privacy enabled."), $L("Voicemail"), $L("Voicemail Greeting"), $L("Wallis and Futuna (France)"), $L("Warning"), $L("Which service would you like to use?"), $L("Wired headset"), $L("Work"), $L("Yemen"), $L("You are currently using a default greeting."), $L("Zambia"), $L("Zero"), $L("all asynchronous services"), $L("all basic services"), $L("all synchronous services"), $L("asynchronous circuit data"), $L("asynchronous circuit data switch"), $L("auxiliary telephony"), $L("confirm password..."), $L("data"), $L("enter password..."), $L("fax"), $L("packet access"), $L("synchronous circuit data"), $L("synchronous circuit data switch"), $L("voice")];
    }
});

// DateSample.js

enyo.kind({
    name: "g11n.sample.DateSample",
    kind: "FittableRows",
    classes: "enyo-fit",
    components: [{
            kind: "onyx.Toolbar",
            content: $L("Dates")
        }, {
            kind: "FittableColumns",
            style: "padding: 10px",
            components: [{
                    components: [{
                            content: $L("Choose Locale"),
                            classes: "g11n-sample-divider"
                        }, {
                            kind: "onyx.PickerDecorator",
                            style: "padding:10px;",
                            onSelect: "pickerHandler",
                            components: [{
                                    content: "Pick One...",
                                    style: "width: 200px"
                                }, {
                                    kind: "onyx.Picker",
                                    components: [{
                                            content: "en_us",
                                            active: !0
                                        }, {
                                            content: "en_ca"
                                        }, {
                                            content: "en_ie"
                                        }, {
                                            content: "en_gb"
                                        }, {
                                            content: "en_mx"
                                        }, {
                                            content: "de_de"
                                        }, {
                                            content: "fr_fr"
                                        }, {
                                            content: "fr_ca"
                                        }, {
                                            content: "it_it"
                                        }, {
                                            content: "es_es"
                                        }, {
                                            content: "es_mx"
                                        }, {
                                            content: "es_us"
                                        }]
                                }]
                        }]
                }]
        }, {
            kind: "onyx.Groupbox",
            style: "padding: 10px",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Date"
                }, {
                    name: "dateExample",
                    style: "padding: 8px",
                    content: "Current date"
                }]
        }],
    initComponents: function() {
        this.inherited(arguments);
        var e = enyo.g11n.currentLocale().getLocale();
        this.format(e);
    },
    pickerHandler: function(e, t) {
        this.format(t.selected.content);
    },
    format: function(e) {
        this.formatDates(e);
    },
    formatDates: function(e) {
        var t = new enyo.g11n.DateFmt({
            date: "short",
            time: "short",
            locale: new enyo.g11n.Locale(e)
        });
        this.$.dateExample.setContent("Current date in " + e + " = " + t.format(new Date));
    }
});

// NumberSample.js

enyo.kind({
    name: "g11n.sample.NumberSample",
    kind: "FittableRows",
    classes: "enyo-fit",
    components: [{
            kind: "onyx.Toolbar",
            content: $L("Numbers")
        }, {
            kind: "FittableColumns",
            style: "padding: 10px",
            components: [{
                    components: [{
                            content: $L("Choose Locale:"),
                            classes: "g11n-sample-divider"
                        }, {
                            kind: "onyx.PickerDecorator",
                            style: "padding:10px;",
                            onSelect: "pickerHandler",
                            components: [{
                                    content: "Pick One...",
                                    style: "width: 200px"
                                }, {
                                    kind: "onyx.Picker",
                                    components: [{
                                            content: "en_us",
                                            active: !0
                                        }, {
                                            content: "en_ca"
                                        }, {
                                            content: "en_ie"
                                        }, {
                                            content: "en_gb"
                                        }, {
                                            content: "en_mx"
                                        }, {
                                            content: "de_de"
                                        }, {
                                            content: "fr_fr"
                                        }, {
                                            content: "fr_ca"
                                        }, {
                                            content: "it_it"
                                        }, {
                                            content: "es_es"
                                        }, {
                                            content: "es_mx"
                                        }, {
                                            content: "es_us"
                                        }]
                                }]
                        }]
                }]
        }, {
            kind: "onyx.Groupbox",
            style: "padding: 10px",
            components: [{
                    kind: "onyx.GroupboxHeader",
                    content: "Number"
                }, {
                    name: "NumberExample",
                    style: "padding: 8px"
                }]
        }],
    initComponents: function() {
        this.inherited(arguments);
        var e = enyo.g11n.currentLocale().getLocale();
        this.formatNumbers(e);
    },
    pickerHandler: function(e, t) {
        this.formatNumbers(t.selected.content);
    },
    formatNumbers: function(e) {
        var t = new enyo.g11n.NumberFmt({
            fractionDigits: 1,
            locale: new enyo.g11n.Locale(e)
        });
        this.$.NumberExample.setContent("33333.3 in " + e + " = " + t.format(33333.3));
    }
});

// DurationSample.js

enyo.kind({
    name: "g11n.sample.DurationSample",
    kind: "FittableRows",
    classes: "enyo-fit",
    components: [{
            kind: "onyx.Toolbar",
            content: $L("Duration")
        }, {
            style: "padding: 10px",
            components: [{
                    kind: "onyx.Groupbox",
                    style: "padding:20px 0;",
                    components: [{
                            kind: "onyx.GroupboxHeader",
                            content: "Duration"
                        }, {
                            content: "1 year, 2 months, 3 weeks, 27 days, 8 hours, 9 minutes & 10 seconds",
                            style: "padding: 8px"
                        }]
                }, {
                    kind: "onyx.Groupbox",
                    components: [{
                            kind: "onyx.GroupboxHeader",
                            content: "Duration Styles"
                        }, {
                            name: "DurationExample",
                            style: "padding: 8px",
                            allowHtml: !0
                        }, {
                            name: "DurationExample2",
                            style: "padding: 8px;",
                            allowHtml: !0
                        }, {
                            name: "DurationExample3",
                            style: "padding: 8px;",
                            allowHtml: !0
                        }]
                }]
        }],
    initComponents: function() {
        this.inherited(arguments);
        var e = enyo.g11n.currentLocale().getLocale();
        this.format(e);
    },
    pickerHandler: function(e, t) {
        this.format(t.selected.content);
    },
    format: function(e) {
        this.formatDuration(e);
    },
    formatDuration: function(e) {
        var t = new enyo.g11n.DurationFmt({
            style: "short",
            locale: new enyo.g11n.Locale(e)
        }), n = {
            years: 1,
            months: 2,
            weeks: 3,
            days: 27,
            hours: 8,
            minutes: 9,
            seconds: 10
        };
        this.$.DurationExample.setContent("<b>short:</b>&nbsp;&nbsp;&nbsp;" + t.format(n));
        var r = new enyo.g11n.DurationFmt({
            style: "medium",
            locale: new enyo.g11n.Locale(e)
        });
        this.$.DurationExample2.setContent("<b>medium:</b>&nbsp;&nbsp;&nbsp;" + r.format(n));
        var i = new enyo.g11n.DurationFmt({
            style: "long",
            locale: new enyo.g11n.Locale(e)
        });
        this.$.DurationExample3.setContent("<b>long:</b>&nbsp;&nbsp;&nbsp;" + i.format(n));
    }
});

// AddressSample.js

enyo.kind({
    name: "g11n.sample.AddressSample",
    kind: "FittableRows",
    classes: "enyo-fit",
    components: [{
            kind: "onyx.Toolbar",
            content: $L("Addresses")
        }, {
            style: "padding: 10px",
            components: [{
                    kind: "onyx.InputDecorator",
                    components: [{
                            name: "numberInput",
                            kind: "onyx.Input",
                            placeholder: "Enter Address String",
                            style: "width:100%;",
                            oninput: "inputChanged"
                        }]
                }, {
                    tag: "br"
                }, {
                    tag: "br"
                }, {
                    kind: "onyx.Groupbox",
                    components: [{
                            kind: "onyx.GroupboxHeader",
                            content: "Address"
                        }, {
                            name: "streetAddress",
                            style: "padding: 8px",
                            content: "Street Address ="
                        }, {
                            name: "locality",
                            style: "padding: 8px",
                            content: "Locality = "
                        }, {
                            name: "postalCode",
                            style: "padding: 8px",
                            content: "Postal Code = "
                        }, {
                            name: "region",
                            style: "padding: 8px",
                            content: "Region = "
                        }, {
                            name: "country",
                            style: "padding: 8px",
                            content: "Country Code = "
                        }]
                }]
        }],
    inputChanged: function(e, t) {
        var n = new enyo.g11n.Address(e.getValue());
        try {
            this.$.streetAddress.setContent("Street Address = " + n.streetAddress.replace("undefined", "")), this.$.locality.setContent("Locality = " + n.locality.replace("undefined", "")), this.$.postalCode.setContent("Postal Code = " + n.postalCode.replace("undefined", "")), this.$.region.setContent("Region = " + n.region.replace("undefined", "")), this.$.country.setContent("Country Code = " + n.countryCode.replace("undefined", ""));
        } catch (r) {
            enyo.log(r);
        }
    }
});

// PhoneSample.js

enyo.kind({
    name: "g11n.sample.PhoneSample",
    kind: "FittableRows",
    classes: "enyo-fit",
    components: [{
            kind: "onyx.Toolbar",
            content: $L("Phone Numbers")
        }, {
            style: "padding: 10px",
            components: [{
                    kind: "onyx.InputDecorator",
                    components: [{
                            name: "numberInput",
                            kind: "onyx.Input",
                            placeholder: "Enter phone #",
                            oninput: "inputChanged"
                        }]
                }, {
                    tag: "br"
                }, {
                    tag: "br"
                }, {
                    kind: "onyx.Groupbox",
                    components: [{
                            kind: "onyx.GroupboxHeader",
                            content: "Phone"
                        }, {
                            name: "formattedNumber",
                            style: "padding: 8px",
                            content: "Formatted Number ="
                        }, {
                            name: "areaCode",
                            style: "padding: 8px",
                            content: "Area Code = "
                        }, {
                            name: "subscriberNumber",
                            style: "padding: 8px",
                            content: "Subscriber Number = "
                        }, {
                            name: "locale",
                            style: "padding: 8px",
                            content: "Locale = "
                        }, {
                            name: "location",
                            style: "padding: 8px",
                            content: "Area = "
                        }, {
                            name: "country",
                            style: "padding: 8px",
                            content: "Country = "
                        }]
                }]
        }],
    inputChanged: function(e, t) {
        var n = new enyo.g11n.GeoLocator, r = new enyo.g11n.PhoneNumber(e.getValue()), i = new enyo.g11n.PhoneFmt;
        try {
            this.$.formattedNumber.setContent("Formatted Number = " + i.format(r)), this.$.areaCode.setContent("Area Code = " + r.areaCode.replace("undefined", "")), this.$.subscriberNumber.setContent("Subscriber Number = " + r.subscriberNumber.replace("undefined", "")), this.$.locale.setContent("Locale = " + r.locale.language + "_" + r.locale.region.replace("undefined", ""));
            var s = n.locate(r);
            this.$.location.setContent("Area = " + s.area.ln.replace("undefined", "")), this.$.country.setContent("Country = " + s.country.sn.replace("undefined", ""));
        } catch (o) {
            enyo.log(o);
        }
    }
});

// NameSample.js

enyo.kind({
    name: "g11n.sample.NameSample",
    kind: "FittableRows",
    classes: "enyo-fit",
    components: [{
            kind: "onyx.Toolbar",
            content: $L("Names")
        }, {
            style: "padding: 10px",
            components: [{
                    kind: "onyx.InputDecorator",
                    components: [{
                            name: "numberInput",
                            kind: "onyx.Input",
                            placeholder: "Enter a Name",
                            style: "width:100%;",
                            oninput: "inputChanged"
                        }]
                }, {
                    tag: "br"
                }, {
                    tag: "br"
                }, {
                    kind: "onyx.Groupbox",
                    components: [{
                            kind: "onyx.GroupboxHeader",
                            content: "Name"
                        }, {
                            name: "givenName",
                            style: "padding: 8px",
                            content: "Given Name = "
                        }, {
                            name: "middleName",
                            style: "padding: 8px",
                            content: "Middle Name = "
                        }, {
                            name: "familyName",
                            style: "padding: 8px",
                            content: "Family Name = "
                        }]
                }]
        }],
    inputChanged: function(e, t) {
        var n = new enyo.g11n.Name(e.getValue());
        try {
            this.$.givenName.setContent("Given Name = " + (n.givenName ? n.givenName.replace("undefined", "") : "")), this.$.middleName.setContent("Middle Name = " + (n.middleName ? n.middleName.replace("undefined", "") : "")), this.$.familyName.setContent("Family Name = " + (n.familyName ? n.familyName.replace("undefined", "") : ""));
        } catch (r) {
            enyo.log(r);
        }
    }
});

// LocalizedCssSample.js

enyo.kind({
    name: "g11n.sample.LocalizedCssSample",
    kind: "FittableRows",
    classes: "enyo-fit g11n-text-color",
    components: [{
            kind: "onyx.Toolbar",
            content: $L("Localized CSS")
        }, {
            style: "padding: 10px",
            components: [{
                    content: "If your current language is on this list then this text should be one of the following colors."
                }, {
                    tag: "br"
                }, {
                    content: "English: Blue"
                }, {
                    content: "Spanish: Red"
                }, {
                    content: "French: Yellow"
                }, {
                    content: "Italian: Green"
                }, {
                    content: "German: Purple"
                }, {
                    tag: "br"
                }, {
                    content: "If your language is not on this list then the text will be black."
                }]
        }]
});

// App.js

enyo.kind({
    name: "App",
    classes: "app onyx font-lato enyo-unselectable",
    samples: [],
    handlers: {
        onresize: "resized",
        onHideSampleSource: "hideSource"
    },
    browserScopeTestKey: "agt1YS1wcm9maWxlcnINCxIEVGVzdBjU2-gRDA",
    components: [{
            kind: "Panels",
            name: "mainPanels",
            classes: "panels enyo-fit",
            arrangerKind: "CollapsingArranger",
            components: [{
                    kind: "ViewStack",
                    name: "navPanels",
                    onTransitionFinish: "navChanged",
                    classes: "enyo-fit"
                }, {
                    kind: "Panels",
                    name: "contentPanels",
                    arrangerKind: "CollapsingArranger",
                    draggable: !1,
                    classes: "panels enyo-fit",
                    onTransitionFinish: "contentTransitionComplete",
                    components: [{
                            kind: "FittableRows",
                            classes: "wide",
                            components: [{
                                    kind: "Scroller",
                                    name: "sampleContent",
                                    horizontal: "hidden",
                                    fit: !0,
                                    classes: "onyx enyo-unselectable"
                                }, {
                                    kind: "onyx.Toolbar",
                                    layoutKind: "FittableColumnsLayout",
                                    name: "viewSourceToolbar",
                                    noStretch: !0,
                                    classes: "footer-toolbar",
                                    components: [{
                                            kind: "onyx.Grabber",
                                            ontap: "toggleFullScreen"
                                        }, {
                                            fit: !0
                                        }, {
                                            kind: "onyx.Button",
                                            name: "viewSource",
                                            content: "View Source",
                                            ontap: "viewSource",
                                            showing: !1
                                        }, {
                                            kind: "onyx.TooltipDecorator",
                                            showing: document.location.protocol != "file:",
                                            components: [{
                                                    kind: "onyx.Button",
                                                    name: "openFiddle",
                                                    ontap: "openFiddle",
                                                    style: "padding-left:8px; padding-right:8px;",
                                                    showing: !1,
                                                    components: [{
                                                            kind: "onyx.Icon",
                                                            src: "assets/fiddle.png",
                                                            style: "margin-top:-5px;"
                                                        }]
                                                }, {
                                                    kind: "onyx.Tooltip",
                                                    content: "Open sample in jsFiddle"
                                                }]
                                        }, {
                                            kind: "onyx.TooltipDecorator",
                                            showing: document.location.protocol != "file:",
                                            components: [{
                                                    kind: "onyx.Button",
                                                    name: "openExternal",
                                                    ontap: "openExternal",
                                                    style: "padding-left:8px; padding-right:8px;",
                                                    showing: !1,
                                                    components: [{
                                                            kind: "onyx.Icon",
                                                            src: "assets/open-external.png",
                                                            style: "margin-top:-5px;"
                                                        }]
                                                }, {
                                                    kind: "onyx.Tooltip",
                                                    content: "Open sample in new tab"
                                                }]
                                        }]
                                }]
                        }]
                }]
        }],
    create: function() {
        this.inherited(arguments), this.parseQueryString(), window.onhashchange = enyo.bind(this, "hashChange"), this.loadSamples(), this.resized();
    },
    loadSamples: function() {
        this.$.navPanels.popAll(), (new enyo.Ajax({
            url: "assets/manifest.json"
        })).response(this, function(e, t) {
            this.samples = t, this.samples.isTop = !0;
            var n = this.sourcePath || localStorage.getItem("sourcePath") || this.samples.sourcePath;
            n && (enyo.path.addPath("lib", n + "/lib"), enyo.path.addPath("enyo", n + "/enyo")), (this.sourcePath || localStorage.getItem("sourcePath")) && this.loadSamplePackages(t), this.addSamples = enyo.json.parse(localStorage.getItem("addSamples")), this.loadAddSamples();
        }).go();
    },
    loadAddSamples: function() {
        if (this.addSamples && this.addSamples.length) {
            var e = this.addSamples.shift();
            (new enyo.Ajax({
                url: e
            })).response(this, function(t, n) {
                var r = e.substring(0, e.lastIndexOf("/") + 1);
                this.aliasSamplePaths(n, r + n.sourcePath), this.samples.samples.push(n), this.loadSamplePackages(n), this.loadAddSamples();
            }).error(this, function() {
                this.loadAddSamples();
            }).go();
        } else
            this.pushSampleList(this.samples);
    },
    aliasSamplePaths: function(e, t) {
        e.path && (e.path = e.path.replace(/\$lib/g, t + "/lib"), e.path = e.path.replace(/\$enyo/g, t + "/enyo")), e.loadPackages && (e.loadPackages = e.loadPackages.replace(/\$lib/g, t + "/lib"), e.loadPackages = e.loadPackages.replace(/\$enyo/g, t + "/enyo"));
        if (e.samples)
            for (var n in e.samples)
                this.aliasSamplePaths(e.samples[n], t);
    },
    loadSamplePackages: function(e) {
        if (e.loadPackages) {
            var t = e.loadPackages.split(" ");
            enyo.log("Loading " + t), enyo.load(t);
        }
        if (e.samples)
            for (var n in e.samples)
                this.loadSamplePackages(e.samples[n]);
    },
    parseQueryString: function() {
        var e = {}, t = function(e) {
            return decodeURIComponent(e.replace(/\+/g, " "));
        }, n = location.search.substring(1);
        if (!n.length)
            return;
        var r = n.split("&");
        for (var i in r) {
            var s = r[i].split("=");
            s.length > 1 && (e[t(s[0])] = t(s[1]));
        }
        e.addSamples && localStorage.setItem("addSamples", enyo.json.stringify(e.addSamples.split(","))), e.jiraCollectorId && localStorage.setItem("jiraCollectorId", e.jiraCollectorId), e.sourcePath && localStorage.setItem("sourcePath", e.sourcePath), (e.extras || localStorage.getItem("addSamples") || localStorage.getItem("jiraCollectorId") || localStorage.getItem("sourcePath")) && localStorage.setItem("extras", "true"), e.reset && (localStorage.setItem("addSamples", ""), localStorage.setItem("jiraCollectorId", ""), localStorage.setItem("sourcePath", ""), localStorage.setItem("extras", "")), e.debug || (window.location = window.location.pathname);
    },
    rendered: function() {
        this.inherited(arguments);
    },
    pushSampleList: function(e) {
        this.$.navPanels.pushView({
            kind: "NavigationList",
            samples: e,
            onNavTap: "navTap",
            onNavBack: "navBack",
            onMenuAction: "handleMenuAction",
            version: this.versionContent
        }, {
            owner: this
        });
    },
    toggleFullScreen: function() {
        this.$.mainPanels.setIndex(this.$.mainPanels.index ? 0 : 1);
    },
    navTap: function(e, t) {
        var n = e.samples.samples[t.index];
        n.samples && this.pushSampleList(n), n.path && this.renderSample(n), !n.samples && !n.path && (this.$.sampleContent.createComponent({
            content: 'Sorry, no sample yet for "' + n.name + '".'
        }), this.$.sampleContent.render(), enyo.Panels.isScreenNarrow() && this.$.mainPanels.next());
    },
    renderSample: function(e) {
        this.resetSample();
        var t = e.path.substring(e.path.lastIndexOf("/") + 1), n = e.ns || this.currNamespace, r = e.path.substring(0, e.path.lastIndexOf("/") + 1);
        this.kind = n + "." + t;
        var i = this.$.sampleContent.createComponent({
            kind: this.kind
        });
        window.sample = i, this.$.sampleContent.render(), this.$.sampleContent.resized(), this.externalURL = enyo.path.rewrite(e.path + ".html"), this.externalURL.indexOf("http") !== 0 || this.externalURL.indexOf(window.location.origin) === 0 ? ((new enyo.Ajax({
            url: enyo.path.rewrite(e.path + ".js"),
            handleAs: "text"
        })).response(this, function(e, t) {
            this.jsSource = t;
            var n = this.getComponents();
            for (var r = 0; r < n.length; r++)
                if (n[r].name == "sourceViewer") {
                    this.$.sourceViewer.jsSource = t, this.$.sourceViewer.jsSourceChanged();
                    break;
                }
        }).go(), (new enyo.Ajax({
            url: enyo.path.rewrite(r + (e.css || t) + ".css"),
            handleAs: "text"
        })).response(this, function(e, t) {
            this.cssSource = t;
            var n = this.getComponents();
            for (var r = 0, i = !1; r < n.length; r++)
                if (n[r].name == "sourceViewer") {
                    this.$.sourceViewer.cssSource = t, this.$.sourceViewer.cssSourceChanged();
                    break;
                }
        }).go()) : (this.$.jsContent.setContent("Sorry, the source for this sample is on a separate server and cannot be displayed due to cross-origin restrictions."), this.$.cssContent.setContent("Sorry, the source for this sample is on a separate server and cannot be displayed due to cross-origin restrictions.")), enyo.Panels.isScreenNarrow() && this.$.mainPanels.next(), this.$.viewSource.show(), this.$.openExternal.show(), this.$.openFiddle.show(), this.$.viewSourceToolbar.resized();
    },
    resized: function() {
        var e = this.getComponents();
        for (var t = 0; t < e.length; t++)
            if (e[t].name == "sourceViewer") {
                this.$.sourceViewer.resized();
                break;
            }
    },
    navChanged: function() {
        var e = this.$.navPanels.getActive();
        e && e.samples && e.samples.ns && (this.currNamespace = e.samples.ns);
    },
    navBack: function() {
        this.$.navPanels.popView(), this.$.navPanels.getActive().clearSelection(), this.resetSample();
    },
    resetSample: function() {
        this.$.sampleContent.destroyClientControls(), this.$.viewSource.hide(), this.$.openExternal.hide(), this.$.openFiddle.hide(), window.sample = undefined;
    },
    viewSource: function() {
        var e = this.$.contentPanels.createComponent({
            name: "sourceViewer",
            kind: "dynamicSourceViewer",
            jsSource: this.jsSource,
            cssSource: this.cssSource
        }, {
            owner: this
        });
        e.jsSourceChanged(), e.cssSourceChanged(), e.render(), this.$.contentPanels.render(), this.$.contentPanels.setIndex(1);
    },
    hideSource: function() {
        this.hidingSource = !0, this.$.contentPanels.setIndex(0);
    },
    contentTransitionComplete: function(e, t) {
        this.hidingSource && this.destroySourceViewer();
    },
    destroySourceViewer: function() {
        this.$.sourceViewer.destroy(), this.hidingSource = !1;
    },
    openExternal: function() {
        window.open(this.externalURL, "_blank");
    },
    openFiddle: function() {
        var e;
        e = document.createElement("form"), e.method = "post", e.action = "http://jsfiddle.net/api/post/enyo/nightly/dependencies/onyx,layout,canvas,g11n/", e.target = "_blank";
        var t;
        t = document.createElement("textarea"), t.style.display = "none", t.type = "hidden", t.name = "js", t.value = this.jsSource.replace(/\"assets\//g, '"http://nightly.enyojs.com/latest/sampler/assets/'), e.appendChild(t), t = document.createElement("textarea"), t.style.display = "none", t.type = "hidden", t.name = "css", t.value = this.cssSource, e.appendChild(t), t = document.createElement("textarea"), t.style.display = "none", t.type = "hidden", t.name = "html", t.value = "<script>\n	new " + this.kind + "().renderInto(document.body);\n</script>", e.appendChild(t), document.body.appendChild(e), e.submit(), document.body.removeChild(e);
    },
    getHashComponentName: function() {
        return window.location.hash.slice(1);
    },
    setHashComponentName: function(e) {
        window.location.hash = e;
    },
    hashChange: function() {
        var e = this.getHashComponentName();
    },
    handleMenuAction: function(e, t) {
        if (t.action == "startTest")
            this.$.navPanels.pushView({
                kind: "TestController",
                onQuit: "quitTest",
                onRenderSample: "renderTest",
                samples: this.samples,
                browserScopeTestKey: this.browserScopeTestKey
            }, {
                owner: this
            });
        else if (t.action == "browserscope") {
            this.resetSample();
            var n = "http://www.browserscope.org/user/tests/table/" + this.browserScopeTestKey + "?o=html&v=1", r = "width:100%; height:100%; border:0px;";
            this.$.sampleContent.createComponent({
                tag: "iframe",
                src: n,
                style: r
            }), this.$.sampleContent.render(), this.$.sampleContent.resized();
        } else
            t.action == "switchNightly" ? (this.sourcePath = "http://nightly.enyojs.com/enyo-nightly-" + t.version, this.versionContent = t.content, this.loadSamples()) : t.action == "settings" && this.$.navPanels.pushView({
                kind: "SettingsView",
                onQuit: "quitTest"
            }, {
                owner: this
            });
    },
    renderTest: function(e, t) {
        this.renderSample(t.sample);
    },
    quitTest: function() {
        this.resetSample(), this.$.navPanels.popView();
    }
}), enyo.kind({
    name: "SourceView",
    kind: "Control",
    tag: "pre",
    classes: "source enyo-selectable",
    published: {
        wrap: !1
    },
    create: function() {
        this.inherited(arguments), this.wrapChanged();
    },
    contentChanged: function(e) {
        var t = this.hasNode();
        if (t) {
            while (t.hasChildNodes())
                t.removeChild(t.firstChild);
            t.appendChild(document.createTextNode(this.content));
        }
    },
    wrapChanged: function(e) {
        this.addRemoveClass("nowrap", !this.wrap);
    }
}), enyo.kind({
    name: "dynamicSourceViewer",
    kind: "FittableRows",
    classes: "wide onyx",
    published: {
        jsSource: "",
        cssSource: ""
    },
    events: {
        onHideSampleSource: ""
    },
    components: [{
            kind: "Panels",
            name: "sourcePanels",
            fit: !0,
            draggable: !1,
            components: [{
                    kind: "Scroller",
                    classes: "enyo-fit scroller",
                    components: [{
                            kind: "SourceView",
                            name: "jsContent"
                        }]
                }, {
                    kind: "Scroller",
                    classes: "enyo-fit scroller",
                    components: [{
                            kind: "SourceView",
                            name: "cssContent"
                        }]
                }]
        }, {
            kind: "onyx.Toolbar",
            layoutKind: "FittableColumnsLayout",
            classes: "footer-toolbar",
            noStretch: !0,
            components: [{
                    kind: "onyx.Button",
                    name: "srcCancelButton",
                    content: "Close",
                    ontap: "doHideSampleSource"
                }, {
                    kind: "onyx.IconButton",
                    name: "srcCancelIcon",
                    src: "assets/cancel.png",
                    ontap: "doHideSampleSource"
                }, {
                    fit: !0,
                    style: "text-align:center;",
                    components: [{
                            kind: "onyx.RadioGroup",
                            onActivate: "sourceChanged",
                            components: [{
                                    content: "JS",
                                    classes: "source-tabs",
                                    active: !0
                                }, {
                                    content: "CSS",
                                    classes: "source-tabs"
                                }]
                        }]
                }, {
                    components: [{
                            kind: "onyx.Checkbox",
                            onchange: "wrapChanged"
                        }, {
                            content: "Wrap",
                            classes: "enyo-inline wrap-label"
                        }]
                }]
        }],
    jsSourceChanged: function() {
        this.$.jsContent.setContent(this.getJsSource());
    },
    cssSourceChanged: function() {
        this.$.cssContent.setContent(this.getCssSource());
    },
    sourceChanged: function(e, t) {
        t.originator.active && this.$.sourcePanels.setIndex(t.originator.indexInContainer());
    },
    wrapChanged: function(e, t) {
        this.$.jsContent.setWrap(e.getValue()), this.$.cssContent.setWrap(e.getValue());
    },
    resized: function() {
        this.$.srcCancelButton.setShowing(!enyo.Panels.isScreenNarrow()), this.$.srcCancelIcon.setShowing(enyo.Panels.isScreenNarrow());
    }
}), enyo.kind({
    name: "ViewStack",
    kind: "Panels",
    arrangerKind: "CarouselArranger",
    draggable: !1,
    handlers: {
        onTransitionFinish: "transitionFinish"
    },
    currView: -1,
    transitionFinish: function() {
        if (this.suppressFinish)
            return !0;
        var e = this.getPanels().length - 1;
        if (e > this.currView) {
            this.suppressFinish = !0, this.saveAnimate = this.getAnimate(), this.setAnimate(!1);
            while (e > this.currView) {
                var t = this.getPanels()[e];
                t.destroy(), e--;
            }
            this.setIndexDirect(this.currView), this.setAnimate(this.saveAnimate), this.suppressFinish = !1;
        }
    },
    pushView: function(e, t) {
        this.currView++;
        var n = this.createComponent(e, t);
        return n.render(), this.reflow(), this.next(), n;
    },
    popView: function() {
        this.currView--, this.previous();
    },
    popToRootView: function(e) {
        this.currView = 0, e ? this.setIndexDirect(0) : this.setIndex(0);
    },
    popAll: function() {
        this.saveAnimate = this.getAnimate(), this.setAnimate(!1), this.suppressFinish = !0;
        var e = this.getPanels().length - 1;
        while (e > -1) {
            var t = this.getPanels()[e];
            t.destroy(), e--;
        }
        this.setAnimate(this.saveAnimate), this.suppressFinish = !1;
    }
}), enyo.kind({
    name: "NavigationList",
    kind: "FittableRows",
    classes: "enyo-fit enyo-unselectable",
    published: {
        samples: ""
    },
    events: {
        onNavTap: "",
        onNavBack: "",
        onMenuAction: ""
    },
    components: [{
            kind: "onyx.Toolbar",
            style: "background-color:#555;"
        }, {
            kind: "List",
            classes: "list",
            touch: !0,
            fit: !0,
            onSetupItem: "setupItem",
            components: [{
                    name: "item",
                    classes: "item enyo-border-box",
                    ontap: "navTap"
                }]
        }, {
            kind: "onyx.Toolbar",
            layoutKind: "FittableColumnsLayout",
            classes: "footer-toolbar",
            components: [{
                    kind: "onyx.Button",
                    name: "back",
                    content: "Back",
                    ontap: "doNavBack"
                }, {
                    fit: !0
                }, {
                    kind: "onyx.MenuDecorator",
                    name: "extrasMenu",
                    showing: !1,
                    components: [{
                            kind: "onyx.Button",
                            content: "Extras"
                        }, {
                            kind: "onyx.Menu",
                            onSelect: "menuAction",
                            floating: !0,
                            components: [{
                                    content: "Start Test Mode",
                                    action: "startTest"
                                }, {
                                    content: "Browserscope Results",
                                    action: "browserscope"
                                }, {
                                    kind: "onyx.PickerDecorator",
                                    components: [{
                                            kind: "onyx.MenuItem",
                                            content: "Switch to Nightly (experimental)"
                                        }, {
                                            kind: "onyx.Picker",
                                            name: "nightlyPicker",
                                            modal: !1,
                                            onSelect: "nightlyAction",
                                            floating: !0
                                        }]
                                }, {
                                    content: "Settings",
                                    action: "settings"
                                }]
                        }]
                }]
        }],
    create: function() {
        this.inherited(arguments), this.samplesChanged(), localStorage.getItem("extras") == "true" && this.$.extrasMenu.setShowing(!0);
        var e = new Date;
        for (var t = 0; t < 20; t++) {
            var n = e.getFullYear(), r = e.getMonth() + 1;
            r = r < 10 ? "0" + r : r;
            var i = e.getDate();
            i = i < 10 ? "0" + i : i;
            var s = n + "/" + r + "/" + i, o = n + "" + r + "" + i;
            this.$.nightlyPicker.createComponent({
                content: s,
                version: o
            }), e = new Date(e.getTime() - 864e5);
        }
    },
    menuAction: function(e, t) {
        t.originator.action && this.doMenuAction({
            action: t.originator.action
        });
    },
    nightlyAction: function(e, t) {
        return this.doMenuAction({
            action: "switchNightly",
            version: t.originator.version,
            content: t.originator.content
        }), !0;
    },
    samplesChanged: function() {
        this.$.toolbar.setContent(this.samples.name + (this.version ? " (" + this.version + ")" : "")), this.$.back.setShowing(!this.samples.isTop), this.$.list.setCount(this.samples.samples.length);
    },
    setupItem: function(e, t) {
        var n = this.$.item;
        n.setContent(this.samples.samples[t.index].name), n.addRemoveClass("onyx-selected", e.isSelected(t.index));
    },
    clearSelection: function() {
        this.selected !== undefined && this.$.list.getSelection().deselect(this.selected);
    },
    navTap: function(e, t) {
        this.selected = t.index, this.doNavTap(t);
    },
    startTest: function(e, t) {
        this.doStartTest(t);
    }
}), enyo.kind({
    name: "SettingsView",
    kind: "FittableRows",
    events: {
        onQuit: ""
    },
    classes: "enyo-fit enyo-unselectable onyx",
    components: [{
            kind: "onyx.Toolbar",
            style: "background-color:#555;",
            content: "Settings"
        }, {
            kind: "Scroller",
            fit: !0,
            components: [{
                    classes: "test-tools",
                    components: [{
                            kind: "onyx.Groupbox",
                            name: "addSamplesGroup",
                            components: [{
                                    kind: "onyx.GroupboxHeader",
                                    content: "Additional Samples"
                                }, {
                                    kind: "Repeater",
                                    style: "background:white;",
                                    name: "addSamplesList",
                                    onSetupItem: "setupManifest",
                                    components: [{
                                            kind: "onyx.InputDecorator",
                                            layoutKind: "FittableColumnsLayout",
                                            noStretch: !0,
                                            components: [{
                                                    kind: "onyx.Input",
                                                    name: "manifestURL",
                                                    onchange: "manifestChanged",
                                                    fit: !0
                                                }, {
                                                    kind: "onyx.IconButton",
                                                    style: "width:32px;",
                                                    src: "assets/remove-icon.png",
                                                    ontap: "removeManifest"
                                                }]
                                        }]
                                }]
                        }, {
                            kind: "onyx.Button",
                            content: "Add Samples",
                            ontap: "addManifest",
                            style: "margin-bottom:10px;"
                        }, {
                            kind: "onyx.Groupbox",
                            components: [{
                                    kind: "onyx.GroupboxHeader",
                                    content: "JIRA Collector ID"
                                }, {
                                    kind: "onyx.InputDecorator",
                                    layoutKind: "FittableColumnsLayout",
                                    noStretch: !0,
                                    components: [{
                                            kind: "onyx.Input",
                                            name: "jiraCollectorId",
                                            fit: !0
                                        }]
                                }]
                        }, {
                            kind: "onyx.Groupbox",
                            components: [{
                                    kind: "onyx.GroupboxHeader",
                                    content: "Alternate Source Path"
                                }, {
                                    kind: "onyx.InputDecorator",
                                    layoutKind: "FittableColumnsLayout",
                                    noStretch: !0,
                                    components: [{
                                            kind: "onyx.Input",
                                            placeholder: "(experimental)",
                                            name: "sourcePath",
                                            key: "sourcePath",
                                            fit: !0
                                        }]
                                }]
                        }]
                }]
        }, {
            kind: "onyx.Toolbar",
            layoutKind: "FittableColumnsLayout",
            classes: "footer-toolbar",
            components: [{
                    kind: "onyx.Button",
                    content: "Cancel",
                    ontap: "doQuit"
                }, {
                    kind: "onyx.Button",
                    content: "Save and Apply",
                    ontap: "save"
                }]
        }],
    create: function() {
        this.inherited(arguments), this.addSamples = enyo.json.parse(localStorage.getItem("addSamples")) || [], this.$.addSamplesList.setCount(this.addSamples.length), this.$.addSamplesGroup.setShowing(this.addSamples.length), this.$.sourcePath.setValue(localStorage.getItem("sourcePath")), this.$.jiraCollectorId.setValue(localStorage.getItem("jiraCollectorId"));
    },
    setupManifest: function(e, t) {
        t.item.$.manifestURL.setValue(this.addSamples[t.index]);
    },
    removeManifest: function(e, t) {
        this.addSamples.splice(t.index, 1), this.$.addSamplesList.setCount(this.addSamples.length), this.$.addSamplesGroup.setShowing(this.addSamples.length);
    },
    addManifest: function() {
        this.addSamples.push(""), this.$.addSamplesList.setCount(this.addSamples.length), this.$.addSamplesGroup.setShowing(this.addSamples.length);
    },
    manifestChanged: function(e, t) {
        this.addSamples[t.index] = t.originator.getValue();
    },
    save: function() {
        localStorage.setItem("addSamples", enyo.json.stringify(this.addSamples)), localStorage.setItem("sourcePath", this.$.sourcePath.getValue()), localStorage.setItem("jiraCollectorId", this.$.jiraCollectorId.getValue()), window.location = window.location.pathname;
    }
}), enyo.kind({
    name: "TestController",
    kind: "FittableRows",
    events: {
        onQuit: "",
        onRenderSample: ""
    },
    classes: "enyo-fit enyo-unselectable onyx",
    components: [{
            kind: "onyx.Toolbar",
            style: "background-color:#555;",
            content: "Sampler Test Mode"
        }, {
            kind: "Scroller",
            fit: !0,
            components: [{
                    classes: "test-tools",
                    components: [{
                            components: [{
                                    kind: "onyx.Button",
                                    name: "prevBtn",
                                    classes: "test-button-left",
                                    content: "< Previous",
                                    ontap: "prevTest"
                                }, {
                                    kind: "onyx.Button",
                                    name: "nextBtn",
                                    classes: "test-button-right",
                                    content: "Next >",
                                    ontap: "nextTest"
                                }]
                        }, {
                            kind: "onyx.Groupbox",
                            components: [{
                                    kind: "onyx.GroupboxHeader",
                                    content: "Sample"
                                }, {
                                    kind: "onyx.PickerDecorator",
                                    name: "samplePickerDec",
                                    onSelect: "sampleChanged",
                                    components: [{
                                            name: "sampleName",
                                            style: "padding:10px; background:white; width:100%; text-align:left;",
                                            content: "Sample Name"
                                        }, {
                                            name: "samplePicker",
                                            style: "width:100%",
                                            kind: "onyx.FlyweightPicker",
                                            onSetupItem: "setupPicker",
                                            components: [{
                                                    name: "pickerItem",
                                                    style: "text-align:left;"
                                                }]
                                        }]
                                }]
                        }, {
                            components: [{
                                    kind: "onyx.Button",
                                    name: "failBtn",
                                    content: "Fail",
                                    classes: "onyx-negative test-button-left",
                                    ontap: "failTest"
                                }, {
                                    kind: "onyx.Button",
                                    name: "passBtn",
                                    content: "Pass",
                                    classes: "onyx-affirmative test-button-right",
                                    ontap: "passTest"
                                }]
                        }, {
                            kind: "onyx.Groupbox",
                            name: "resultGroup",
                            components: [{
                                    kind: "onyx.GroupboxHeader",
                                    content: "Test Result"
                                }, {
                                    name: "resultValue",
                                    style: "padding:10px; background:white;",
                                    content: "Pass"
                                }]
                        }, {
                            kind: "onyx.Groupbox",
                            name: "descGroup",
                            components: [{
                                    kind: "onyx.GroupboxHeader",
                                    content: "Fail Description"
                                }, {
                                    kind: "onyx.InputDecorator",
                                    components: [{
                                            kind: "onyx.TextArea",
                                            name: "descText",
                                            style: "width: 100%;",
                                            oninput: "descChanged"
                                        }]
                                }]
                        }, {
                            components: [{
                                    kind: "onyx.Button",
                                    name: "cancelBtn",
                                    content: "Cancel",
                                    classes: "test-button-left",
                                    ontap: "cancelFail"
                                }, {
                                    kind: "onyx.Button",
                                    name: "confirmBtn",
                                    content: "Confirm Failure",
                                    classes: "onyx-negative test-button-right",
                                    ontap: "confirmFail"
                                }]
                        }, {
                            kind: "onyx.Groupbox",
                            name: "knownIssues",
                            showing: !1,
                            components: [{
                                    kind: "onyx.GroupboxHeader",
                                    content: "Known Issues"
                                }, {
                                    kind: "Repeater",
                                    style: "background:white;",
                                    name: "knownIssuesList",
                                    onSetupItem: "setupKnownIssues",
                                    components: [{
                                            name: "item",
                                            style: "padding:10px; font-size:12px;",
                                            components: [{
                                                    tag: "a",
                                                    name: "issueKey",
                                                    style: "width:75px; padding-right:10px; color:blue;"
                                                }, {
                                                    tag: "span",
                                                    name: "issueSummary"
                                                }]
                                        }]
                                }]
                        }]
                }]
        }, {
            kind: "onyx.Toolbar",
            classes: "footer-toolbar",
            components: [{
                    kind: "onyx.Button",
                    name: "back",
                    content: "Done",
                    ontap: "doneTapped"
                }]
        }, {
            name: "donePopup",
            style: "width:250px;padding:10px;",
            kind: "onyx.Popup",
            centered: !0,
            modal: !0,
            floating: !0,
            scrim: !0,
            components: [{
                    style: "padding-bottom:10px;",
                    content: "Would you like to report your test results to Browserscope?"
                }, {
                    kind: "onyx.Button",
                    name: "discardBtn",
                    classes: "onyx-negative",
                    content: "No, Discard",
                    ontap: "dismissDone"
                }, {
                    kind: "onyx.Button",
                    name: "reportBtn",
                    classes: "onyx-affirmative",
                    content: "Yes, Report",
                    ontap: "dismissDone"
                }]
        }],
    create: function() {
        this.inherited(arguments), this.results = [], this.resultsChanged = !1, this.sampleList = [], this.currSample = -1, this.populateSampleList(this.samples.samples), this.$.samplePicker.setCount(this.sampleList.length), this.jiraCollectorId = localStorage.getItem("jiraCollectorId"), this.jiraCollectorId && this.loadJIRACollector(this.jiraCollectorId), this.nextTest();
    },
    loadJIRACollector: function(e) {
        if (!document.getElementById("_jira_collector")) {
            var t = document.createElement("script");
            t.id = "_jira_collector", firstScript = document.getElementsByTagName("script")[0], t.src = "https://enyojs.atlassian.net/s/en_USx1agvx-418945332/801/41/1.1/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?collectorId=" + e, firstScript.parentNode.insertBefore(t, firstScript);
        }
    },
    populateSampleList: function(e, t) {
        for (var n in e) {
            var r = e[n];
            r.samples ? this.populateSampleList(r.samples, r.ns || t) : r.path && (r.ns = t, this.sampleList.push(r));
        }
    },
    pickerNameForSample: function(e) {
        var t = this.sampleList[e];
        return e + 1 + "/" + this.sampleList.length + ": " + t.name;
    },
    setupPicker: function(e, t) {
        this.$.pickerItem.setContent(this.pickerNameForSample(t.index));
    },
    sampleChanged: function(e, t) {
        this.currSample = t ? t.originator.selected : 0, this.selectSample(this.sampleList[this.currSample]);
    },
    nextTest: function() {
        this.currSample < this.sampleList.length - 1 && (this.currSample++, this.$.samplePicker.setSelected(this.currSample), this.selectSample(this.sampleList[this.currSample]));
    },
    prevTest: function() {
        this.currSample > 0 && (this.currSample--, this.$.samplePicker.setSelected(this.currSample), this.selectSample(this.sampleList[this.currSample]));
    },
    selectSample: function(e) {
        this.$.descGroup.hide(), this.$.cancelBtn.hide(), this.$.confirmBtn.hide(), this.$.knownIssues.hide();
        var t = this.results[this.currSample];
        this.$.resultGroup.setShowing(t), this.$.resultValue.setContent(t ? t.result ? "Pass" : "Fail" : ""), this.$.descGroup.setShowing(t && t.failDesc), this.$.descText.setValue(t ? t.failDesc : ""), this.$.pickerItem.setContent(this.pickerNameForSample(this.currSample)), this.$.sampleName.setContent(this.pickerNameForSample(this.currSample)), this.doRenderSample({
            sample: e
        }), this.$.nextBtn.setDisabled(this.currSample == this.sampleList.length - 1), this.$.prevBtn.setDisabled(this.currSample === 0);
        var n = e.name.match("ENYO-[0-9]+");
        n = n && n.length ? " OR ((id=" + n.join(") OR (id=") + "))" : "";
        var r = "+" + e.name.replace(/ /g, " +").replace(":", ""), i = '(summary ~ "' + r + '" and status in ("Open", "In Progress"))' + n, s = new enyo.JsonpRequest({
            url: "https://enyojs.atlassian.net/rest/api/latest/search",
            callbackName: "jsonp-callback"
        });
        s.go({
            jql: i
        }), s.response(this, "processKnownIssues");
    },
    processKnownIssues: function(e, t) {
        this.knownIssues = t.issues, this.$.knownIssues.setShowing(this.knownIssues.length), this.$.knownIssuesList.setCount(this.knownIssues.length);
    },
    setupKnownIssues: function(e, t) {
        var n = t.item, r = this.knownIssues[t.index];
        n.$.issueKey.setContent(r.key), n.$.issueKey.setAttributes({
            href: "https://enyojs.atlassian.net/browse/" + r.key,
            target: "_blank"
        }), n.$.issueSummary.setContent(r.fields.summary);
    },
    descChanged: function() {
        this.$.confirmBtn.setDisabled(this.$.descText.getValue().length === 0);
    },
    passTest: function() {
        this.results[this.currSample] = {
            result: 1
        }, this.resultsChanged = !0, this.$.resultGroup.setShowing(!0), this.$.resultValue.setContent("Pass"), this.nextTest();
    },
    failTest: function() {
        this.jiraCollectorId && window._jira_collector_trigger(), this.confirmFail();
    },
    cancelFail: function() {
        this.$.descGroup.hide(), this.$.cancelBtn.hide(), this.$.confirmBtn.hide();
    },
    confirmFail: function() {
        this.results[this.currSample] = {
            result: 0,
            failDesc: this.$.descText.getValue()
        }, this.resultsChanged = !0, this.$.resultGroup.setShowing(!0), this.$.resultValue.setContent("Fail");
    },
    doneTapped: function() {
        this.resultsChanged ? this.$.donePopup.show() : this.doQuit();
    },
    dismissDone: function(e) {
        e == this.$.reportBtn && this.reportResults(), this.$.donePopup.hide(), this.doQuit();
    },
    reportResults: function() {
        window._bTestResults = {};
        for (var e in this.results)
            if (this.results[e]) {
                var t = this.sampleList[e].name;
                window._bTestResults[t] = this.results[e].result;
            }
        var n = "", r = document.createElement("script"), i = document.getElementsByTagName("script")[0];
        r.src = "http://www.browserscope.org/user/beacon/" + this.browserScopeTestKey, n && (r.src += "?sandboxid=" + n), i.parentNode.insertBefore(r, i);
    }
});
