var svg = d3.select("#graph_svg");

var SIMULATION;
var SVG_LINKS;
var SVG_NODES;
var SVG_COM;
var SVG_TEXTS;
var MARKER;

var HAS_COM = 0;
var CIRCLE_NODES = [];
var RECT_NODES = [];

function drawGraphSvg(){
    // 通过布局来转换数据，然后进行绘制
    SIMULATION = d3.forceSimulation(GRAPH['nodes'])
        .force("link", d3.forceLink(GRAPH['links']).distance(RENDERER['force_link']))
        // 碰撞力 防止节点重叠
        // .force('collide',d3.forceCollide().radius(80).iterations(1))
        // 整个实例中心
        .force("center",d3.forceCenter(RENDERER['winWidth']/2, RENDERER['winHeight']/2))
        // 引力
        .force("charge",d3.forceManyBody().strength(-RENDERER['force_manybody']));

    // if(GRAPH['nodes'][0]['community'] != undefined && GRAPH['nodes'][0]['community'] != null && GRAPH['nodes'][0]['community'] != ""){
    //     HAS_COM = 1;
    //     for (let n of GRAPH['nodes']){
    //         if(n['community'] == 1){
    //             RECT_NODES.push(n);
    //         }else{
    //             CIRCLE_NODES.push(n);
    //         }
    //     }
    // }else{
    //     HAS_COM = 0;
    //     CIRCLE_NODES = GRAPH['nodes'];
    // }

    initGraphSvg();

    // 为节点分配坐标
    SIMULATION.nodes(GRAPH['nodes'])
              .on("tick", svgTicked);

    // 连接线
    SIMULATION.force("link")
              .links(GRAPH['links']);
    // var color = d3.scaleOrdinal(d3.schemeCategory20);
}

function initGraphSvg() {
    svg.selectAll("*").remove();

    // 绘制
    SVG_LINKS = svg.selectAll("line")
        .data(GRAPH['links'])
        .enter()
        .append("line")
        .style("stroke", function(d,i){
            if(APPEARANCE.theme == 'light'){
                return GRAPH['link_color'][d.type];
            }else{
                return GRAPH['link_color_dark'][d.type];
            }
        })
        .style("stroke-width", 1)
        .call(d3.zoom()
            .scaleExtent([-5, 2])
        );

    SVG_NODES = svg.selectAll("circle")
        .data(GRAPH['nodes'])
        .enter()
        .append("circle")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", '20')
        .attr("fill", function(d,i){
            return GRAPH['color'][d.type];
        })
        .attr("id", function(d,i){
            return i;
        })
        .attr("stroke", function (d) {
            let sc = '';
            if(d.community == 1){
                sc = GRAPH['community_stroke_color'][0];
            }
            if(d.query == 1){
                sc = GRAPH['query_stroke_color'][0];
            }
            return sc;
        })
        .attr("stroke-width", 5)
        .attr("class", function(d) {
            return 'n_id_'+d.id;
        })
        .on("click", showNodeInfo)
        .on("mouseover", mouseoverNode)
        .on("mouseleave", mouseleaveNode)
        .call(d3.drag().on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // if(HAS_COM == 1){
    //     SVG_COM = svg.selectAll("rect")
    //         .data(RECT_NODES)
    //         .enter()
    //         .append("rect")
    //         .attr("x", function(d) { return d.x - 20; })
    //         .attr("y", function(d) { return d.y - 20; })
    //         .attr("width", '40')
    //         .attr("height", '40')
    //         .attr("fill", function(d,i){
    //             return GRAPH['color'][d.type];
    //         })
    //         .attr("id", function(d,i){
    //             return i;
    //         })
    //         .attr("class", function(d) {
    //             let cn = 'n_id_'+d.id;
    //             if(d.query == 1){
    //                 cn += ' query_node';
    //             }
    //             return cn;
    //         })
    //         .on("click", showNodeInfo)
    //         .on("mouseover", mouseoverNode)
    //         .on("mouseleave", mouseleaveNode)
    //         .call(d3.drag().on("start", dragstarted)
    //             .on("drag", dragged)
    //             .on("end", dragended));
    // }


    //添加描述节点的文字
    SVG_TEXTS = svg.selectAll("text")
        .data(GRAPH['nodes'])
        .enter()
        .append("text")
        .attr("fill", function (d) {
            if(APPEARANCE.theme == 'light'){
                return GRAPH['text_color'][0];
            }else{
                return GRAPH['text_color_dark'][0];
            }
        })
        .attr("dx", 20)
        .attr("dy", 8)
        .on("click", showNodeInfo)
        .on("mouseover", mouseoverNode)
        .on("mouseleave", mouseleaveNode)
        .call(d3.drag().on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .text(function(d){
            return d.prob;
        });

    if(RENDERER['withLabel'] == 0){
        SVG_TEXTS.attr("style", 'display: none;');
    }else{
        SVG_TEXTS.attr("style", '');
    }

    //有向图的边是用带箭头的线来表示。如果是无向图，不需要这段代码
    // MARKER = svg.append("marker")
    //     .attr("id", "resolved")
    //     .attr("markerUnits","userSpaceOnUse")
    //     .attr("viewBox", "0 -20 35 35")//坐标系的区域
    //     .attr("refX", 150)//箭头在线上的位置，数值越小越靠近顶点
    //     .attr("refY", 0)
    //     .attr("markerWidth", 6)//箭头的大小（长度）
    //     .attr("markerHeight", 6)  //没用
    //     .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
    //     .attr("stroke-width",2)//箭头宽度
    //     .append("path")
    //     .attr("d", "M0,-20L35,0L0,20")//箭头的路径
    //     .attr('fill', "#000");//箭头颜色

    svgTicked();
}

function dragstarted(d) {
    if (!d3.event.active) SIMULATION.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) SIMULATION.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

function svgTicked() {
    SVG_LINKS.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .attr("marker-end", "url(#resolved)");

    // if(HAS_COM == 1){
    //     SVG_COM.attr("x", function(d) { return d.x - 20; })
    //         .attr("y", function(d) { return d.y - 20; });
    // }

    SVG_NODES.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    SVG_TEXTS.attr("x", function(d){ return d.x - 40; })
        .attr("y", function(d){ return d.y; });

}

var input_focus = 0;

function input_ok(objList){
    for (var obj of objList){
        obj.css({'border': '2px solid rgba(0, 100, 168, 0.5)'});
    }
}

function input_reset(objList){
    for (var obj of objList) {
        obj.css({'border': '2px solid rgba(0, 0, 0, 0.1)'});
        obj.removeClass('highlight_border_inf');
    }
}

function showNodeInfo(d) {
    scrollToPosition('menu', 0);
    $('#node_id').text(d.id);
    $('#node_type').text(d.type);
    $('#node_info').text(d.prob);
    $('#node_id').css({color: GRAPH['color'][d.type]});
    if(input_focus == 0){
        $('#n1_id').val(d.id);
        input_ok([$('#n1_id')]);
        $('#n2_id').addClass('highlight_border_inf');
    }else if(input_focus == 1){
        $('#n2_id').val(d.id);
        input_ok([$('#n2_id')]);
        $("#search_set").click();
        input_reset([$('#n1_id'),$('#n2_id')]);
    }
    input_focus = (input_focus + 1) % 2;
}

function mouseoverNode(d) {
    var n = $('.n_id_'+d.id);
    n.css({'filter': 'brightness(1.2)'});
    n.attr('r', 25);
}

function mouseleaveNode(d) {
    var n = $('.n_id_'+d.id);
    n.css({'filter': 'brightness(1)'});
    n.attr('r', 20);
}
