class Renderer{
    constructor() {
        this._winWidth = document.documentElement.clientWidth;
        this._winHeight = document.documentElement.clientHeight;
        this._renderMethod = 'svg';  // Auto Save
        this._curNodeId = null;
        this._withLabel = 1; // Auto Save
        this._force_link = 100;  // Auto Save
        this._force_manybody = 1500; // Auto Save

        this.initCookies();
    }

    setParams(params) {
        this._winWidth = document.documentElement.clientWidth;
        this._winHeight = document.documentElement.clientHeight;
        this._renderMethod = params['renderMethod'] != undefined ? params['renderMethod'] : 'svg';
        this._curNodeId = params['curNodeId'] != undefined ? params['curNodeId'] : null;
        this._withLabel = params['withLabel'] != undefined ? params['withLabel'] : 1;
        this._force_link = params['forcethis._link'] != undefined ? params['forcethis._link'] : 100;
        this._force_manybody = params['forcethis._manybody'] != undefined ? params['forcethis._manybody'] : 1500;
    }

    initCookies() {
        if(localStorage.getItem('renderMethod') == null) localStorage.setItem('renderMethod', this._renderMethod);
        if(localStorage.getItem('withLabel') == null) localStorage.setItem('withLabel', this._withLabel);
        if(localStorage.getItem('force_link') == null) localStorage.setItem('force_link', this._force_link);
        if(localStorage.getItem('force_manybody') == null) localStorage.setItem('force_manybody', this._force_manybody);
    }

    updateSize() {
        $('#graph_svg').attr('width', this._winWidth).attr('height', this._winHeight);
        $('#graph_canvas').attr('width', this._winWidth).attr('height', this._winHeight);
        if(SIMULATION != undefined){
            SIMULATION.force("center",d3.forceCenter(this._winWidth/2, this._winHeight/2));
        }
    }

    switchRenderMethod() {
        let sw_svg = $("#rander_svg");
        let sw_canvas = $("#rander_canvas");
        if(this._renderMethod == 'svg'){
            sw_svg.addClass('radio_seledted');
            sw_canvas.removeClass('radio_seledted');
        }else if(this._renderMethod == 'canvas'){
            sw_svg.removeClass('radio_seledted');
            sw_canvas.addClass('radio_seledted');
        }
        if(GRAPH['haveGraphData'])    renderGraphByMethod();
    }

    switchWithLabel() {
        let with_label = $("#rander_with_label");
        let no_label = $("#rander_no_label");
        if(this._withLabel == 1){
            with_label.addClass('radio_seledted');
            no_label.removeClass('radio_seledted');
        }else if(this._withLabel == 0){
            with_label.removeClass('radio_seledted');
            no_label.addClass('radio_seledted');
        }
        if(GRAPH['haveGraphData'])    renderGraphByApparence();
    }

    applyForceParam() {
        $('#node_manybody').val(this._force_manybody);
        $('#edge_link').val(this._force_link);
        if(SIMULATION != undefined){
            SIMULATION.force("charge",d3.forceManyBody().strength(-(this._force_manybody-0)))
                .force("link", d3.forceLink(GRAPH['links']).distance(this._force_link-0));
            SIMULATION.alphaTarget(0.1).alphaDecay(0.1).restart();
        }
    }

    get winWidth() {
        return this._winWidth;
    }

    set winWidth(value) {
        this._winWidth = value;
        this.updateSize();
    }

    get winHeight() {
        return this._winHeight;
    }

    set winHeight(value) {
        this._winHeight = value;
        this.updateSize();
    }

    get renderMethod() {
        return this._renderMethod;
    }

    set renderMethod(value) {   // Auto Save
        this._renderMethod = value;
        this.switchRenderMethod();
        localStorage.setItem('renderMethod', value);
    }

    get curNodeId() {
        return this._curNodeId;
    }

    set curNodeId(value) {
        this._curNodeId = value;
    }

    get withLabel() {
        return this._withLabel;
    }

    set withLabel(value) {  // Auto Save
        this._withLabel = parseInt(value);
        this.switchWithLabel();
        localStorage.setItem('withLabel', parseInt(value));
    }

    get force_link() {
        return this._force_link;
    }

    set force_link(value) { // Auto Save
        this._force_link = parseInt(value);
        this.applyForceParam();
        localStorage.setItem('force_link', parseInt(value));
    }

    get force_manybody() {
        return this._force_manybody;
    }

    set force_manybody(value) { // Auto Save
        this._force_manybody = parseInt(value);
        this.applyForceParam();
        localStorage.setItem('force_manybody', parseInt(value));
    }
}

class Appearance{
    constructor() {
        this._theme = 'light';   // Auto Save

        this.initCookies();
    }

    initCookies() {
        if(localStorage.getItem('theme') == null) $.cookie('theme', this.theme);
    }

    switchTheme() {
        let body = $('body');
        let theme_light = $("#theme_light");
        let theme_dark = $("#theme_dark");
        if(this._theme === 'light'){
            body.removeClass('dark_theme');
            body.addClass('light_theme');
            theme_light.addClass('radio_seledted');
            theme_dark.removeClass('radio_seledted');
        }else if(this._theme === 'dark'){
            body.removeClass('light_theme');
            body.addClass('dark_theme');
            theme_light.removeClass('radio_seledted');
            theme_dark.addClass('radio_seledted');
        }
        if(GRAPH['haveGraphData'])    renderGraphByApparence();
    }

    get theme() {
        return this._theme;
    }

    set theme(value) {  // Auto Save
        this._theme = value+'';
        this.switchTheme();
        localStorage.setItem('theme', value+'');
    }
}



var GRAPH = {
    "nodes": [],
    "links": [],
    "ig": [],
    "queryId": "",
    "nodes_dict": {},
    "haveGraphData": 0,
    "color": ['#44c0ee',
        '#98df8a',
        '#ecbb8f',
        '#d78e8e',
        '#aec7e8',
        '#87c0e7',
        '#a893e7',
        '#e1e1e1'],
    "link_color": ['#b0b0b0',
        '#dedede'],
    "link_color_dark": ['#646464',
        '#dedede'],
    "text_color": ['#000',
        '#dedede'],
    "text_color_dark": ['#e5e5e5',
        '#dedede'],
    "query_stroke_color": ['#734040',
    '#dedede'],
    "community_stroke_color": ['#5e5e5e',
        '#dedede']
};

var RENDERER = new Renderer();

var APPEARANCE = new Appearance();

var HaveMouseTip = 0;
var MouseLeaveList = 0;

window.addEventListener("resize", init);

function init(){
    RENDERER.winWidth = document.documentElement.clientWidth;
    RENDERER.winHeight = document.documentElement.clientHeight;
    restoreFromCookies();
}

function restoreFromCookies() {
    RENDERER.renderMethod = localStorage.getItem('renderMethod');
    RENDERER.withLabel = localStorage.getItem('withLabel');
    RENDERER.force_link = localStorage.getItem('force_link');
    RENDERER.force_manybody = localStorage.getItem('force_manybody');
    APPEARANCE.theme = localStorage.getItem('theme');
}

function showSortedNodes(obj){
    showTip('排序中');
    obj = $(obj);
    const sort_method = obj.attr('m');
    let type = obj.attr('s');
    $('#show_all_nodes_head .list_item').each(function (i, item) {
        $(item).attr('s', '');
    });
    obj.attr('s', type);
    if(type == 'asce'){
        obj.attr('s', 'desc');
    }else if (type == 'desc'){
        obj.attr('s', 'asce');
    }else{
        type = 'desc';
        obj.attr('s', 'asce');
    }
    showAllNodesInfo(sortAllNodes(sort_method, type));
}

function sortAllNodes(sort_method, type){
    if(type == '' || type == undefined || type == null) type = 'asce';
    let nodes = JSON.parse(JSON.stringify(GRAPH['nodes']));
    if(sort_method == 'class'){
        nodes.sort(function (a, b){
            if(type === 'desc'){
                return b['type'] - a['type'];
            }else{
                return a['type'] - b['type'];
            }
        });
    }else if(sort_method == 'id'){
        nodes.sort(function (a, b){
            if(type === 'desc'){
                return b['id'] - a['id'];
            }else{
                return a['id'] - b['id'];
            }
        });
    }else if(sort_method == 'prob'){
        nodes.sort(function (a, b){
            if(type === 'desc'){
                return parseFloat(b['prob']) - parseFloat(a['prob']);
            }else{
                return parseFloat(a['prob']) - parseFloat(b['prob']);
            }
        });
    }
    return {nodes,sort_method,type};
}

function showAllNodesInfo(sortedNodes){
    let nodesList = $('#show_all_nodes');
    let sort_class = $('#sort_class');
    let class_indicator = $('#sort_class .indicator');
    let sort_id = $('#sort_id');
    let id_indicator = $('#sort_id .indicator');
    let sort_prob = $('#sort_prob');
    let prob_indicator = $('#sort_prob .indicator');
    $('#show_all_nodes_head').show();
    if(sortedNodes['sort_method'] == 'class'){
        sort_class.addClass('sorted');
        class_indicator.show();
        sort_id.removeClass('sorted');
        id_indicator.hide();
        sort_prob.removeClass('sorted');
        prob_indicator.hide();
        if(sortedNodes['type'] === 'desc'){
            class_indicator.css({transform: 'rotate(180deg)'});
        }else{
            class_indicator.css({transform: 'rotate(0)'});
        }
    }else if(sortedNodes['sort_method'] == 'id'){
        sort_class.removeClass('sorted');
        class_indicator.hide();
        sort_id.addClass('sorted');
        id_indicator.show();
        sort_prob.removeClass('sorted');
        prob_indicator.hide();
        if(sortedNodes['type'] === 'desc'){
            id_indicator.css({transform: 'rotate(180deg)'});
        }else{
            id_indicator.css({transform: 'rotate(0)'});
        }
    }else if(sortedNodes['sort_method'] == 'prob'){
        sort_class.removeClass('sorted');
        class_indicator.hide();
        sort_id.removeClass('sorted');
        id_indicator.hide();
        sort_prob.addClass('sorted');
        prob_indicator.show();
        if(sortedNodes['type'] === 'desc'){
            prob_indicator.css({transform: 'rotate(180deg)'});
        }else{
            prob_indicator.css({transform: 'rotate(0)'});
        }
    }
    nodesList.html('');
    $('#all_nodes_cnt').text(sortedNodes['nodes'].length + '个');
    var data;
    for(var n of sortedNodes['nodes']){
        data = "{'id': "+n.id+", 'type': "+n.type+", 'prob': "+n.prob+"}";
        let query_classname = n['query'] == '1' ? 'Q' : '';
        nodesList.append('<div class="menu_body_line" nid="'+n.id+'" onclick="showNodeInfo('+data+')" onmouseover="mouseoverListNode('+data+', this)" onmouseleave="mouseleaveListNode('+data+', this)">\n' +
                        '    <div class="node" style="background: '+GRAPH['color'][n.type]+'">'+query_classname+'</div>\n' +
                        '    <span class="list_item">'+n.id+'</span>\n' +
                        '    <span class="list_item">'+n.prob+'</span>\n' +
                        '</div>');
    }
}

function mouseoverListNode(d, obj) {
    if(RENDERER.renderMethod == 'svg'){
        mouseoverNode(d);
    }else if(RENDERER.renderMethod == 'canvas'){
        RENDERER.curNodeId = d['id'];
        canvasRender();
    }
    showMouseTip(d, obj);
}

function mouseleaveListNode(d, obj) {
    let mouse_tips = $('#mouse_tips');
    if(RENDERER.renderMethod == 'svg'){
        mouseleaveNode(d);
    }else if(RENDERER.renderMethod == 'canvas'){
        RENDERER.curNodeId = null;
        canvasRender();
    }
    mouse_tips.stop(true);
    mouse_tips.css({opacity: '1'});
    hideMouseTip(d, obj);
}

function showMouseTip(msg, obj) {
    let mouse_tips = $('#mouse_tips');
    let t, l;
    obj = $(obj)[0];
    $('#mt_node').css({'background': GRAPH['color'][msg.type]});
    $('#mt_node_type').text(msg.type);
    $('#mt_node_id').text(msg.id);
    $('#mt_node_info').text(msg.prob);
    if(obj != undefined){
        if(obj.offsetWidth != undefined) {
            t = obj.getBoundingClientRect().top;
            l = obj.offsetWidth + 10;
            if(t + mouse_tips[0].offsetHeight > document.documentElement.clientHeight){
                t = document.documentElement.clientHeight - mouse_tips.offsetHeight;
            }
            if (HaveMouseTip == 0) {
                HaveMouseTip = 1;
                mouse_tips.css({top: t + '', right: l + ''});
                mouse_tips.fadeIn(100);
            } else if (HaveMouseTip == 1) {
                mouse_tips.animate({top: t + '', right: l + ''});
            }
        }else{
            hideMouseTip(msg, obj);
        }
    }
}

function hideMouseTip(msg, obj) {
    let mouse_tips = $('#mouse_tips');
    if(HaveMouseTip == 1 && MouseLeaveList == 1){
        HaveMouseTip = 0;
        MouseLeaveList = 0;
        mouse_tips.fadeOut(100);
    }
}

function showNodeStatistics() {
    if(GRAPH['queryId'] == "" || GRAPH['queryId'] == undefined || GRAPH['queryId'] == null) return 0;
    let q_id = $('#query_id');
    let q_type = $('#query_type');
    let q_prob = $('#query_info');
    let com_search_acc = $('#com_search_acc');
    let com_node = $('#com_node_cnt');
    let com_same = $('#com_same_cnt');
    let com_diff = $('#com_diff_cnt');
    let cnt_same = $('#sg_same_cnt');
    let cnt_diff = $('#sg_diff_cnt');
    let node = GRAPH['nodes_dict'][GRAPH['queryId']];
    let same = 0;
    let diff = 0;
    let same_com = 0;
    let diff_com = 0;

    // Query node info
    q_id.text(node.id);
    q_id.css({color: GRAPH['color'][node.type]});
    q_type.text(node.type);
    q_prob.text(node.prob);

    // Statistics
    for (let n of GRAPH['nodes']){
        if(n.id != node.id && n.type == node.type){
            same++;
            if(n.community == 1) same_com++;
        }else if(n.id != node.id && n.type != node.type){
            diff++;
            if(n.community == 1) diff_com++;
        }
    }
    com_search_acc.text(((same_com / (same_com + diff_com)) * 100).toFixed(5) + '%');
    com_node.text(same_com + diff_com);
    com_same.text(same_com);
    com_diff.text(diff_com);
    cnt_same.text(same);
    cnt_diff.text(diff);
}

function initGraphData(graph) {
    GRAPH['nodes'] = graph["NODES"];
    GRAPH['links'] = graph["LINKS"];
    GRAPH['ig'] = graph["ig"];
    GRAPH['queryId'] = graph["QueryNode"];
    // indexing
    for(let nid of GRAPH['nodes']){
        GRAPH['nodes_dict'][''+nid.id] = nid;
    }
    GRAPH['haveGraphData'] = 1;
}

function renderGraphByMethod() {
    let graph_svg = $('#graph_svg');
    let graph_canvas = $('#graph_canvas');
    showTip('图数据正在渲染');
    $('#graph_none').hide();
    showNodeStatistics();
    let sortedNodes = sortAllNodes('prob', 'desc');
    showAllNodesInfo(sortedNodes);
    undrag_svg();
    svg.selectAll("*").remove();
    if(SIMULATION != undefined) SIMULATION.stop();
    if(RENDERER.renderMethod == 'svg'){
        graph_svg.show();
        graph_canvas.hide();
        drawGraphSvg();
        drag_svg();
    }else if(RENDERER.renderMethod == 'canvas'){
        graph_svg.hide();
        graph_canvas.show();
        drawGraphCanvas();
    }
}

function renderGraphByApparence() {
    showTip('图数据正在渲染');
    if(RENDERER.renderMethod == 'svg'){
        initGraphSvg();
    }else if(RENDERER.renderMethod == 'canvas'){
        canvasRender();
    }
}

function toggleMenu(menu_nav) {
    menu_nav = $(menu_nav);
    let sw = menu_nav.attr('sw');
    let menu = $('#menu');
    let menu_nav_img = $('#menu_nav svg');
    let menu_back_top= $('#menu_back_top');
    let bt_sw = menu_back_top.attr('sw');
    if(sw == 'on'){
        menu.animate({left: '-350px'}, 200);
        menu_nav.animate({left: '10px'}, 200);
        menu_nav_img.css({transform: 'rotate(0)'});
        menu_nav.attr('sw', 'off');
        if(bt_sw == 'on')   menu_back_top.fadeOut(200);
    }else if(sw == 'off'){
        menu.animate({left: '0'}, 200);
        menu_nav.animate({left: '350px'}, 200);
        menu_nav_img.css({transform: 'rotate(-180deg)'});
        menu_nav.attr('sw', 'on');
        if(bt_sw == 'on')   menu_back_top.fadeIn(200);
    }
}

function toggleMenuRight(menu_nav) {
    menu_nav = $(menu_nav);
    let sw = menu_nav.attr('sw');
    let menu = $('#menu_right');
    let menu_back_top= $('#menu_back_top');
    let bt_sw = menu_back_top.attr('sw');
    let logo = $('#logo_body');
    if(sw == 'on'){
        menu.animate({right: '-350px'}, 200);
        menu_nav.animate({right: '10px'}, 200);
        logo.animate({right: '30px'}, 200);
        menu_nav.attr('sw', 'off');
        if(bt_sw == 'on')   menu_back_top.fadeOut(200);
    }else if(sw == 'off'){
        menu.animate({right: '0'}, 200);
        menu_nav.animate({right: '350px'}, 200);
        logo.animate({right: '380px'}, 200);
        menu_nav.attr('sw', 'on');
        if(bt_sw == 'on')   menu_back_top.fadeIn(200);
    }
}

function getPageArea(){
    if (document.compatMode == "BackCompat"){
        return {
            width: Math.max(document.body.scrollWidth,
                document.body.clientWidth),
            height: Math.max(document.body.scrollHeight,
                document.body.clientHeight)
        }
    } else {
        return {
            width: Math.max(document.documentElement.scrollWidth,
                document.documentElement.clientWidth),
            height: Math.max(document.documentElement.scrollHeight,
                document.documentElement.clientHeight)
        }
    }
}

$("#graph_none").click(function () {
    $("#graph_json").click();
});

$("#import_graph").click(function () {
    $("#graph_json").click();
});

function fileImport() {
    //获取读取我文件的File对象
    var selectedFile = document.getElementById('graph_json').files[0];
    var name = selectedFile.name;//读取选中文件的文件名
    var size = selectedFile.size;//读取选中文件的大小
    $('#graph_filename').text(name);

    var reader = new FileReader();//这是核心,读取操作就是由它完成.
    reader.readAsText(selectedFile);//读取文件的内容,也可以读取文件的URL
    reader.onload = function () {
        //当读取完成后回调这个函数,然后此时文件的内容存储到了result中,直接操作即可
        let graph = JSON.parse(this.result);
        initGraphData(graph);
        renderGraphByMethod();
    }
}

function showTip(text){
    $('#tips').text(text).animate({top: '50px'});
    setTimeout(function () {
        $('#tips').animate({top: '-60px'});
    }, 3000);
}

function err(obj){
    obj.shake(3, 10, 200);
    obj.css({'border': '2px solid rgba(255, 0, 0, 0.3)'});
}

function no_err(obj){
    obj.css({'border': '2px solid rgba(0, 0, 0, 0.1)'});
}

function inputingParams(obj) {
    $(obj).css({'border': '2px solid rgba(255, 165, 0, 0.3)'});
}

$("#show_all_nodes").mouseleave(function () {
    MouseLeaveList = 1;
});

$("#pause_graph").click(function () {
    showTip('正在暂停运动');
    SIMULATION.alphaTarget(0);
});

$("#reset_graph").click(function () {
    showTip('重置图位置');
    if(RENDERER.renderMethod == 'svg'){
        resetDrag();
    }else if(RENDERER.renderMethod == 'canvas'){
        resetTransform();
    }
    RENDERER.force_link = 100;
    RENDERER.force_manybody = 1500;
    $('#edge_link').val(100);
    $('#node_manybody').val(1500);
    
    SIMULATION.force("charge",d3.forceManyBody().strength(-1500))
        .force("link", d3.forceLink(GRAPH['links']).distance(100));
    SIMULATION.alphaTarget(0.1).alphaDecay(0.1).restart();
});

$("#search_set").click(function () {
    let search_res = $("#search_set_res");
    search_res.html('');
    if(GRAPH['ig'] == null || GRAPH['ig'] == undefined || GRAPH['ig'].length == 0){
        search_res.append('未定义ig');
        $("#search_cnt").text('');
        return false;
    }
    var n1_id = $.trim($('#n1_id').val());
    var n2_id = $.trim($('#n2_id').val());
    var n1_i = GRAPH['ig'][n1_id];
    var n2_i = GRAPH['ig'][n2_id];
    var cnt = 0;
    for(u of n1_i){
        if(n2_i.indexOf(u) != -1){
            cnt++;
            // search_res.append(u+', ');
            search_res.append('<span class="search_node">'+u+'</span>');
        }
    }
    $("#search_cnt").text('总计：'+cnt+'个');
});

$("#upgrade_graph").click(function () {
    showTip('正在应用参数');
    var manybody = $.trim($('#node_manybody').val());
    var link = $.trim($('#edge_link').val());

    if(manybody <= 100 || manybody >= 10000 || manybody == '' || manybody == undefined || manybody == null){
        err($('#node_manybody'));
    }else if(link < 0 || link >= 1000 || link == '' || link == undefined || link == null){
        err($('#edge_link'));
    }else{
        no_err($('#node_manybody'));
        no_err($('#edge_link'));
        RENDERER.force_link = link;
        RENDERER.force_manybody = manybody;
        showTip('参数已应用');
    }
});

function scrollToPosition(obj_id, pos) {
    let obj = $('#'+obj_id);
    obj.animate({
        scrollTop: pos
    });
}

function scrollToObject(scroll_body_id, target_jq_obj, offset) {
    if(target_jq_obj != undefined && target_jq_obj != null){
        let top = target_jq_obj[0].offsetTop;
        $('#'+scroll_body_id).animate({
            scrollTop: parseInt(top) - parseInt(offset)
        }, function () {
            target_jq_obj.addClass('highlight_bg_1');
            setTimeout(function () {
                target_jq_obj.removeClass('highlight_bg_1');
            }, 1000);
        });
    }
}

$("#located_node").click(function () {
    let id = $.trim($('#node_id').text());
    if(id != '-' && id != null && id != undefined){
        scrollToObject('menu_right', $('.menu_body_line[nid=' + id + ']'), 100);
        if(RENDERER.renderMethod == 'svg'){
            moveToNodeSvg(id);
        }else if(RENDERER.renderMethod == 'canvas'){
            moveToNodeCanvas(id);
        }
    }
});

$("#located_query").click(function () {
    let id = GRAPH['queryId'];
    if(id != '-' && id != null && id != undefined){
        scrollToObject('menu_right', $('.menu_body_line[nid=' + id + ']'), 100);
        if(RENDERER.renderMethod == 'svg'){
            moveToNodeSvg(id);
        }else if(RENDERER.renderMethod == 'canvas'){
            moveToNodeCanvas(id);
        }
    }
});

$("#rander_svg").click(function () {
    RENDERER.renderMethod = 'svg';
});

$("#rander_canvas").click(function () {
    RENDERER.renderMethod = 'canvas';
});

$("#rander_with_label").click(function () {
    RENDERER.withLabel = 1;
});

$("#rander_no_label").click(function () {
    RENDERER.withLabel = 0;
});

$("#theme_light").click(function () {
    APPEARANCE.theme = 'light';
});

$("#theme_dark").click(function () {
    APPEARANCE.theme = 'dark';
});

$('#menu_right').scroll(function () {
    let offset = $("#menu_right")[0].scrollTop;
    let menu_back_top = $("#menu_back_top")
    if(offset > 0){
        menu_back_top.fadeIn(200);
        menu_back_top.attr('sw', 'on');
    }else{
        menu_back_top.fadeOut(200);
        menu_back_top.attr('sw', 'off');
    }
});
