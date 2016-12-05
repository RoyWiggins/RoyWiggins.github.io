(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


var glslCanvases = [];
var glslEditors = [];
var glslGraphs = [];
var preFunction = "precision mediump float;\n#define GLSLIFY 1\n\n#define PI 3.14159265359\r\n\nuniform vec2 u_resolution;\n\nuniform vec2 u_mouse;\n\nuniform float u_time;\n\nfloat zoom = 0.5;\n\nvec2 offset = vec2(0.5);\n\nmat3  rotationMatrix3(vec3 v, float angle)\n\n{  float c = cos(radians(angle));\n\n    float s = sin(radians(angle));\n\n    return mat3(c + (1.0 - c) * v.x * v.x, (1.0 - c) * v.x * v.y - s * v.z, (1.0 - c) * v.x * v.z + s * v.y,\n\n        (1.0 - c) * v.x * v.y + s * v.z, c + (1.0 - c) * v.y * v.y, (1.0 - c) * v.y * v.z - s * v.x,\n\n        (1.0 - c) * v.x * v.z - s * v.y, (1.0 - c) * v.y * v.z + s * v.x, c + (1.0 - c) * v.z * v.z\n\n        );\n\n}\n\nvec3 radius(vec2 c,float r1, float r2, float angle){\n\n    mat3 m =rotationMatrix3(vec3(0,0,1),angle);\n\n    c = (m * vec3(c,0)).xy;\n\n    return vec3( (smoothstep(r1,r1+.01, c.x) - smoothstep(r2,r2+.01,c.x) ) * \n\n                   (smoothstep(-0.02,-0.01,c.y) - smoothstep(0.01,0.02,c.y) ));\n\n}\n\nvoid addColor(inout vec3 base, vec3 new, vec3 amt){\n\n    base = mix(base,new,amt);\n\n}\n\nvec3 circle(vec2 c, float r){\n\n    return vec3( smoothstep(0.,.01,length(c)-r+0.02)-smoothstep(0.,.01,length(c)-r-0.02));\n\n}\n\nvec3 circles(vec2 z,float r1,float r2){\n\n    vec3 col;\n\n    addColor(col,vec3(0,1,0),radius(z, r1,r2,0.));\n\n    addColor(col,vec3(0,0,1),radius(z, r1,r2,90.));\n\n    addColor(col,vec3(1,1,0),radius(z, r1,r2,180.));\n\n    addColor(col,vec3(1,0,1),radius(z, r1,r2,270.));\n\n    addColor(col,vec3(1,0.5,0.5),circle(z,r1));\n\n    addColor(col,vec3(1,0.5,0.5),circle(z,r2));\n\n    return col;\n\n}\n\nfloat cosh(float val)\n\n{\n\n    float tmp = exp(val);\n\n    float cosH = (tmp + 1.0 / tmp) / 2.0;\n\n    return cosH;\n\n}\n\nfloat tanh(float val)\n\n{\n\n    float tmp = exp(val);\n\n    float tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);\n\n    return tanH;\n\n}\n\nfloat sinh(float val)\n\n{\n\n    float tmp = exp(val);\n\n    float sinH = (tmp - 1.0 / tmp) / 2.0;\n\n    return sinH;\n\n}\n\nvec2 cMul(vec2 a, vec2 b) {\n\n    return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);\n\n}\n\nvec2 cPower(vec2 z, float n) {\n\n    float r2 = dot(z,z);\n\n    return pow(r2,n/2.0)*vec2(cos(n*atan(z.y,z.x)),sin(n*atan(z.y,z.x)));\n\n}\n\nvec2 cInverse(vec2 a) {\n\n    return  vec2(a.x,-a.y)/dot(a,a);\n\n}\n\nvec2 cDiv(vec2 a, vec2 b) {\n\n    return cMul( a,cInverse(b));\n\n}\n\nvec2 cExp(in vec2 z){\n\n    return vec2(exp(z.x)*cos(z.y),exp(z.x)*sin(z.y));\n\n}\n\nvec2 cLog(vec2 a) {\n\n    float b =  atan(a.y,a.x);\n\n    if (b>0.0) b-=2.0*3.1415;\n\n    return vec2(log(length(a)),b);\n\n}\n\nvec2 cSqr(vec2 z) {\n\n    return vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y);\n\n}\n\nvec2 cSin(vec2 z) {\n\n    return vec2(sin(z.x)*cosh(z.y), cos(z.x)*sinh(z.y));\n\n}\n\nvec2 cCos(vec2 z) {\n\n    return vec2(cos(z.x)*cosh(z.y), -sin(z.x)*sinh(z.y));\n\n}\n\nvec2 cPower2(vec2 z, vec2 a) {\n\n    return cExp(cMul(cLog(z), a));\n\n}";


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
            var editor = new GlslEditor(ccList[i], { canvas_size: 250, canvas_follow: true, tooltips: true, exportIcon: true, frag_header: preFunction,frag_footer: postFunction});
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
loadGlslElements();
},{}]},{},[1]);
