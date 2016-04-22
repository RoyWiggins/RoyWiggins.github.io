var glslCanvas = [];
var glslEditors = [];
var glslGraphs = [];
function loadGlslElements() {
var preFunction = "\n\
precision mediump float;\n\
#define PI 3.14159265359\n\
\n\
uniform vec2 u_resolution;\n\
uniform vec2 u_mouse;\n\
uniform float u_time;\n\
float zoom = 0.5;\n\
vec2 offset = vec2(0.5);\n\
mat3  rotationMatrix3(vec3 v, float angle)\n\
{\n\  float c = cos(radians(angle));\n\
    float s = sin(radians(angle));\n\
    return mat3(c + (1.0 - c) * v.x * v.x, (1.0 - c) * v.x * v.y - s * v.z, (1.0 - c) * v.x * v.z + s * v.y,\n\
        (1.0 - c) * v.x * v.y + s * v.z, c + (1.0 - c) * v.y * v.y, (1.0 - c) * v.y * v.z - s * v.x,\n\
        (1.0 - c) * v.x * v.z - s * v.y, (1.0 - c) * v.y * v.z + s * v.x, c + (1.0 - c) * v.z * v.z\n\
        );\n\
}\n\
vec3 radius(vec2 c,float r1, float r2, float angle){\n\
    mat3 m =rotationMatrix3(vec3(0,0,1),angle);\n\
    c = (m * vec3(c,0)).xy;\n\
    return vec3( (smoothstep(r1,r1+.01, c.x) - smoothstep(r2,r2+.01,c.x) ) * \n\
                   (smoothstep(-0.02,-0.01,c.y) - smoothstep(0.01,0.02,c.y) ));\n\
}\n\
void addColor(inout vec3 base, vec3 new, vec3 amt){\n\
    base = mix(base,new,amt);\n\
}\n\
vec3 circle(vec2 c, float r){\n\
    return vec3( smoothstep(0.,.01,length(c)-r+0.02)-smoothstep(0.,.01,length(c)-r-0.02));\n\
}\n\
vec3 circles(vec2 z,float r1,float r2){\n\
    vec3 col;\n\
    addColor(col,vec3(0,1,0),radius(z, r1,r2,0.));\n\
    addColor(col,vec3(0,0,1),radius(z, r1,r2,90.));\n\
    addColor(col,vec3(1,1,0),radius(z, r1,r2,180.));\n\
    addColor(col,vec3(1,0,1),radius(z, r1,r2,270.));\n\
    addColor(col,vec3(1,0.5,0.5),circle(z,r1));\n\
    addColor(col,vec3(1,0.5,0.5),circle(z,r2));\n\
    return col;\n\
}\n\
float cosh(float val)\n\
{\n\
    float tmp = exp(val);\n\
    float cosH = (tmp + 1.0 / tmp) / 2.0;\n\
    return cosH;\n\
}\n\
float tanh(float val)\n\
{\n\
    float tmp = exp(val);\n\
    float tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);\n\
    return tanH;\n\
}\n\
float sinh(float val)\n\
{\n\
    float tmp = exp(val);\n\
    float sinH = (tmp - 1.0 / tmp) / 2.0;\n\
    return sinH;\n\
}\n\
vec2 cMul(vec2 a, vec2 b) {\n\
    return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);\n\
}\n\
vec2 cPower(vec2 z, float n) {\n\
    float r2 = dot(z,z);\n\
    return pow(r2,n/2.0)*vec2(cos(n*atan(z.y,z.x)),sin(n*atan(z.y,z.x)));\n\
}\n\
vec2 cInverse(vec2 a) {\n\
    return  vec2(a.x,-a.y)/dot(a,a);\n\
}\n\
vec2 cDiv(vec2 a, vec2 b) {\n\
    return cMul( a,cInverse(b));\n\
}\n\
vec2 cExp(in vec2 z){\n\
    return vec2(exp(z.x)*cos(z.y),exp(z.x)*sin(z.y));\n\
}\n\
vec2 cLog(vec2 a) {\n\
    float b =  atan(a.y,a.x);\n\
    if (b>0.0) b-=2.0*3.1415;\n\
    return vec2(log(length(a)),b);\n\
}\n\
vec2 cSqr(vec2 z) {\n\
    return vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y);\n\
}\n\
vec2 cSin(vec2 z) {\n\
    return vec2(sin(z.x)*cosh(z.y), cos(z.x)*sinh(z.y));\n\
}\n\
vec2 cCos(vec2 z) {\n\
    return vec2(cos(z.x)*cosh(z.y), -sin(z.x)*sinh(z.y));\n\
}\n\
vec2 cPower2(vec2 z, vec2 a) {\n\
    return cExp(cMul(cLog(z), a));\n\
}";

var postFunction = "\n\
void main(){\n\
    vec2 st = (gl_FragCoord.xy/u_resolution.xy)-offset;\n\
    st.x *= u_resolution.x/u_resolution.y;\n\
    gl_FragColor = vec4(color(st/zoom),1.0);\n\
}"
    // Load single Shaders
    var canvas = document.getElementsByClassName("canvas");
    for (var i = 0; i < canvas.length; i++){
        glslCanvas.push(new GlslCanvas(canvas[i]));
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
window.onload = function(){
    loadGlslElements();
}
