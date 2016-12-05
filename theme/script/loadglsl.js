var glslify = require('glslify');

var preFunction = glslify(__dirname + '/header.glsl');

var glslCanvases = [];
var glslEditors = [];
var glslGraphs = [];
function loadGlslElements() {

var postFunction = "\n\
void main(){\n\
    vec2 st = (gl_FragCoord.xy/u_resolution.xy)-offset;\n\
    st.x *= u_resolution.x/u_resolution.y;\n\
    gl_FragColor = vec4(color(st/zoom),1.0);\n\
}"
    // Load single Shaders
    var canvas = document.getElementsByClassName("canvas");
    for (var i = 0; i < canvas.length; i++){
        glslCanvases.push(new GlslCanvas(canvas[i]));
    } 

    // parse EDITORS
    var ccList = document.querySelectorAll(".codeAndCanvas");
    for(var i = 0; i < ccList.length; i++){
        if (ccList[i].hasAttribute("data")){
            var srcFile = ccList[i].getAttribute("data");
            var editor = new GlslEditor(ccList[i], { canvas_size: 250, canvas_follow: true, tooltips: true, exportIcon: false, frag_header: preFunction,frag_footer: postFunction});
            editor.open(srcFile);
            glslEditors.push(editor);
        }
    }
    var ccList = document.querySelectorAll(".big-editor");
    for(var i = 0; i < ccList.length; i++){
        if (ccList[i].hasAttribute("data")){
            var srcFile = ccList[i].getAttribute("data");
            var editor = new GlslEditor(ccList[i], { canvas_size: 500, canvas_follow: true, tooltips: true, exportIcon: false, frag_header: preFunction,frag_footer: postFunction});
            editor.open(srcFile);
            glslEditors.push(editor);
        }
    }
    // parse GRAPHS
    var sfList = document.querySelectorAll(".simpleFunction");
    for(var i = 0; i < sfList.length; i++){
        if (sfList[i].hasAttribute("data")){
            var srcFile = sfList[i].getAttribute("data");
            glslGraphs.push(new GlslEditor(sfList[i], { canvas_width: 800, lineNumbers: false, canvas_height: 250, frag_header: preFunction, frag_footer: postFunction, tooltips: true }).open(srcFile));
        }
    }    
}
window.onload = function () {
	loadGlslElements();
}