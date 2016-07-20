(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


var preFunction = "precision mediump float;\n#define GLSLIFY 1\n\n#define PI 3.14159265359\r\n#define PI2 6.28318530718\r\n\nuniform vec2 u_resolution;\n\nuniform vec2 u_mouse;\n\nuniform float u_time;\n\nuniform sampler2D u_tex0;\n\nuniform sampler2D u_tex1;\n\nuniform sampler2D u_tex2;\n\nuniform sampler2D u_tex3;\n\nfloat zoom = 0.5;\n\nvec2 offset = vec2(0.5);\n\nvec3 smoothstepr(float center, float width, vec3 value){\n\n    return smoothstep(center-width/2.,center+width/2.,value);\n\n}\n\nmat3 rotationMatrix3(vec3 v, float angle)\n\n{  float c = cos(radians(angle));\n\n    float s = sin(radians(angle));\n\n    return mat3(c + (1.0 - c) * v.x * v.x, (1.0 - c) * v.x * v.y - s * v.z, (1.0 - c) * v.x * v.z + s * v.y,\n\n        (1.0 - c) * v.x * v.y + s * v.z, c + (1.0 - c) * v.y * v.y, (1.0 - c) * v.y * v.z - s * v.x,\n\n        (1.0 - c) * v.x * v.z - s * v.y, (1.0 - c) * v.y * v.z + s * v.x, c + (1.0 - c) * v.z * v.z\n\n        );\n\n}\n\nvoid rotate(inout vec2 c, float angle){\n\n    mat3 m =rotationMatrix3(vec3(0,0,1),angle);\n\n    c = (m * vec3(c,0)).xy;\n\n}\n\nvec2 rotate2(in vec2 c, float angle){\n\n    mat3 m =rotationMatrix3(vec3(0,0,1),angle);\n\n    return (m * vec3(c,0)).xy;\n\n}\n\nvec3 radius(vec2 c,float r1, float r2, float angle){\n\n    mat3 m =rotationMatrix3(vec3(0,0,1),angle);\n\n    c = (m * vec3(c,0)).xy;\n\n    return vec3( (smoothstep(r1,r1+.01, c.x) - smoothstep(r2,r2+.01,c.x) ) * \n\n                   (smoothstep(-0.02,-0.01,c.y) - smoothstep(0.01,0.02,c.y) ));\n\n}\n\nvoid addColor(inout vec3 base, vec3 new, vec3 amt){\n\n    base = mix(base,new,amt);\n\n}\n\nvec3 circle(vec2 c, float r){\n\n    return vec3( smoothstep(0.,.01,length(c)-r+0.02)-smoothstep(0.,.01,length(c)-r-0.02));\n\n}\n\nvec3 circles(vec2 z,float r1,float r2){\n\n    vec3 col;\n\n    addColor(col,vec3(0,1,0),radius(z, r1,r2,0.));\n\n    addColor(col,vec3(0,0,1),radius(z, r1,r2,90.));\n\n    addColor(col,vec3(1,1,0),radius(z, r1,r2,180.));\n\n    addColor(col,vec3(1,0,1),radius(z, r1,r2,270.));\n\n    addColor(col,vec3(1,0.5,0.5),circle(z,r1));\n\n    addColor(col,vec3(1,0.5,0.5),circle(z,r2));\n\n    return col;\n\n}\n\nvec3 filledcircle(vec2 c, float r){\n\n    return vec3( 1.0-smoothstep(0.,.01,length(c)-r-0.02));\n\n}\n\nfloat cosh(float val)\n\n{\n\n    float tmp = exp(val);\n\n    float cosH = (tmp + 1.0 / tmp) / 2.0;\n\n    return cosH;\n\n}\n\nfloat tanh(float val)\n\n{\n\n    float tmp = exp(val);\n\n    float tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);\n\n    return tanH;\n\n}\n\nfloat sinh(float val)\n\n{\n\n    float tmp = exp(val);\n\n    float sinH = (tmp - 1.0 / tmp) / 2.0;\n\n    return sinH;\n\n}\n\nvec2 cis(float a){\n\n    return vec2(cos(a),sin(a));\n\n}\n\nvec2 cMul(vec2 a, vec2 b) {\n\n    return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);\n\n}\n\nvec2 cPower(vec2 z, float n) {\n\n    float r2 = dot(z,z);\n\n    return pow(r2,n/2.0)*vec2(cos(n*atan(z.y,z.x)),sin(n*atan(z.y,z.x)));\n\n}\n\nvec2 cInverse(vec2 a) {\n\n    return  vec2(a.x,-a.y)/dot(a,a);\n\n}\n\nvec2 cDiv(vec2 a, vec2 b) {\n\n    return cMul( a,cInverse(b));\n\n}\n\nvec2 cExp(in vec2 z){\n\n    return vec2(exp(z.x)*cos(z.y),exp(z.x)*sin(z.y));\n\n}\n\nvec2 cLog(vec2 a) {\n\n    float b =  atan(a.y,a.x);\n\n    if (b>0.0) b-=2.0*3.1415;\n\n    return vec2(log(length(a)),b);\n\n}\n\nvec2 cSqr(vec2 z) {\n\n    return vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y);\n\n}\n\nvec2 cSin(vec2 z) {\n\n    return vec2(sin(z.x)*cosh(z.y), cos(z.x)*sinh(z.y));\n\n}\n\nvec2 cCos(vec2 z) {\n\n    return vec2(cos(z.x)*cosh(z.y), -sin(z.x)*sinh(z.y));\n\n}\n\nvec2 cPower2(vec2 z, vec2 a) {\n\n    return cExp(cMul(cLog(z), a));\n\n}\n\nvec2 cConj(vec2 z) {\n\n    return vec2(z.x,-z.y);\n\n}\n\nvec3 hash3( vec2 p ){\n\n    vec3 q = vec3( dot(p,vec2(127.1,311.7)), \n\n                   dot(p,vec2(269.5,183.3)), \n\n                   dot(p,vec2(419.2,371.9)) );\n\n    return fract(sin(q)*43758.5453);\n\n}\n\nfloat iqnoise( in vec2 x, float u, float v ){\n\n//https://www.shadertoy.com/view/Xd23Dh\r\n    vec2 p = floor(x);\n\n    vec2 f = fract(x);\n\n    float k = 1.0+63.0*pow(1.0-v,4.0);\n\n    float va = 0.0;\n\n    float wt = 0.0;\n\n    for( int j=-2; j<=2; j++ )\n\n    for( int i=-2; i<=2; i++ )\n\n    {\n\n        vec2 g = vec2( float(i),float(j) );\n\n        vec3 o = hash3( p + g )*vec3(u,u,1.0);\n\n        vec2 r = g - f + o.xy;\n\n        float d = dot(r,r);\n\n        float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );\n\n        va += o.z*ww;\n\n        wt += ww;\n\n    }\n\n    return va/wt;\n\n}\n\nvec3 hsv2rgb(vec3 c)\n\n{\n\n    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n\n    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n\n    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n\n}\n\nfloat sphere( vec3 p, float radius )\n\n{\n\n    return length( p ) - radius;\n\n}\n\n \n\n//-----------------------------------------------------------------------------------------------\r\n// The map function is the function that defines our scene.\r\n\nfloat map( vec3 p )\n\n{    \n\n    return sphere( p, 1.0 );\n\n}\n\n \n\nvec3 getNormal( vec3 p )\n\n{\n\n    vec3 e = vec3( 0.001, 0.00, 0.00 );\n\n    \n\n    float deltaX = map( p + e.xyy ) - map( p - e.xyy );\n\n    float deltaY = map( p + e.yxy ) - map( p - e.yxy );\n\n    float deltaZ = map( p + e.yyx ) - map( p - e.yyx );\n\n    \n\n    return normalize( vec3( deltaX, deltaY, deltaZ ) );\n\n}\n\n \n\nfloat trace( vec3 origin, vec3 direction, out vec3 p )\n\n{\n\n    float totalDistanceTraveled = 0.0;\n\n \n\n    for( int i=0; i <170; ++i)\n\n    {\n\n        // Here we march along our ray and store the new point\r\n        // on the ray in the \"p\" variable.\r\n        p = origin + direction * totalDistanceTraveled;\n\n \n\n        // \"distanceFromPointOnRayToClosestObjectInScene\" is the \r\n        // distance traveled from our current position along \r\n        // our ray to the closest point on any object\r\n        // in our scene.  Remember that we use \"totalDistanceTraveled\"\r\n        // to calculate the new point along our ray.  We could just\r\n        // increment the \"totalDistanceTraveled\" by some fixed amount.\r\n        // However we can improve the performance of our shader by\r\n        // incrementing the \"totalDistanceTraveled\" by the distance\r\n        // returned by our map function.  This works because our map function\r\n        // simply returns the distance from some arbitrary point \"p\" to the closest\r\n        // point on any geometric object in our scene.  We know we are probably about \r\n        // to intersect with an object in the scene if the resulting distance is very small.\r\n        float distanceFromPointOnRayToClosestObjectInScene = map( p );\n\n        totalDistanceTraveled += distanceFromPointOnRayToClosestObjectInScene;\n\n \n\n        // If our last step was very small, that means we are probably very close to\r\n        // intersecting an object in our scene.  Therefore we can improve our performance\r\n        // by just pretending that we hit the object and exiting early.\r\n        if( distanceFromPointOnRayToClosestObjectInScene < 0.0001 )\n\n        {\n\n            break;\n\n        }\n\n        if( totalDistanceTraveled > 10000.0 )\n\n        {\n\n            totalDistanceTraveled = 0.0000;\n\n            break;\n\n        }\n\n    }\n\n \n\n    return totalDistanceTraveled;\n\n}\n\n \n\n// Standard Blinn lighting model.\r\nvec3 calculateLighting(vec3 pointOnSurface, vec3 surfaceNormal, vec3 lightPosition, vec3 cameraPosition,vec3 diff)\n\n{\n\n    vec3 fromPointToLight = normalize(lightPosition - pointOnSurface);\n\n    float diffuseStrength = clamp( dot( surfaceNormal, fromPointToLight ), 0.0, 1.0 );\n\n    \n\n    vec3 diffuseColor = diffuseStrength * diff;\n\n    vec3 reflectedLightVector = normalize( reflect( -fromPointToLight, surfaceNormal ) );\n\n    \n\n    vec3 fromPointToCamera = normalize( cameraPosition - pointOnSurface );\n\n    float specularStrength = pow( clamp( dot(reflectedLightVector, fromPointToCamera), 0.0, 1.0 ), 10.0 );\n\n \n\n    // Ensure that there is no specular lighting when there is no diffuse lighting.\r\n    specularStrength = min( diffuseStrength, specularStrength );\n\n    vec3 specularColor = specularStrength * vec3( 1.0 );\n\n    \n\n    vec3 finalColor = diffuseColor;// + specularColor; \r\n \n\n    return finalColor;\n\n}\n\nvec2 sphereViewer(vec2 uv, out float distanceToClosestPointInScene){\n\n    \n\n    // We will need to shoot a ray from our camera's position through each pixel.  To do this,\r\n    // we will exploit the uv variable we calculated earlier, which describes the pixel we are\r\n    // currently rendering, and make that our direction vector.\r\n    vec2 mouse_uv = ( u_mouse.xy / u_resolution.xy ) * 2.0 - 1.0;\n\n    vec3 cameraPosition = vec3(0.,-15.*cis(mouse_uv.y*PI/2.));\n\n    vec3 cameraDirection = normalize( vec3( uv.x, uv.y, -10.0) );\n\n    cameraDirection = cameraDirection * rotationMatrix3(vec3(1,0,0),degrees(-atan(cameraPosition.y, cameraPosition.z)));\n\n    vec3 pointOnSurface;\n\n    distanceToClosestPointInScene = trace( cameraPosition, cameraDirection, pointOnSurface );\n\n    vec2 projected = pointOnSurface.xy / (1.-pointOnSurface.z);\n\n    return projected;\n\n}\n\nvec2 droste_(vec2 z,float r1, float r2) {\n\n    z = cLog(z);\n\n    float scale = log(r2/r1);\n\n    float angle = atan(scale/(2.0*PI));\n\n    z = cDiv(z, cExp(vec2(0,angle))*cos(angle)); \n\n    z.x = mod(z.x,scale);\n\n    z = cExp(z)*r1;\n\n    return z;\n\n}\n\n// ---------\r\nvec3 smoothgear(in vec3 col, vec2 z, float r, float n, float toothHeight){\n\n    float theta = atan(z.y,z.x);\n\n    float R = length(z)-r-toothHeight/5.;\n\n    float val;\n\n    val = 1.0 - smoothstep(0.,0.01,sin(R)+sin(theta*n)*toothHeight/2.);\n\n    val = val+smoothstepr(R-toothHeight/5.,0.01,vec3(0.)).x-1. ;\n\n    val = clamp(val,0.,1.);\n\n    val = val+smoothstepr(R+toothHeight/5.,0.01,vec3(0.)).x ;\n\n    return vec3(clamp(val,0.,1.));\n\n}\n\nvec3 planetGear(in vec3 col, in vec2 z, float sunRadius, float planetRadius,float planetTeeth,float carrierSpeed, float planetSpeed, float stime, float angle){\n\n    return smoothgear(col,rotate2(rotate2(z,angle+stime*carrierSpeed)-vec2(sunRadius+planetRadius,0),-(stime+angle) * planetSpeed),planetRadius,planetTeeth,0.13);\n\n}\n\nvec3 planetaryLinkage(vec2 z){\n\n    vec3 col;\n\n    float r1 = 0.5;\n\n    float r2 = 1.;\n\n    float secondsPerRotation = 40.;\n\n    float stime = 360. * u_time/secondsPerRotation;\n\n    float sunTeeth = 30.;\n\n    float planetTeeth = 8.;\n\n    float annulusTeeth = 40.;\n\n    float sunToothHeight = 0.1;\n\n    float sunRadius = r1+sunToothHeight;\n\n    float carrierSpeed = 4.;    \n\n    float planetSpeed =  annulusTeeth/planetTeeth * carrierSpeed;\n\n    float sunSpeed = (1.+annulusTeeth/sunTeeth)*carrierSpeed;\n\n    float planetRadius = (r2-sunRadius-0.1)/2.;\n\n    float nPlanets = 10.;\n\n    z = rotate2(z,-stime*1.5);\n\n    vec3 annulusColor = vec3(1.,.1,.1);\n\n    addColor(col,annulusColor,vec3(1)-smoothgear(col,rotate2(z,  0.),sunRadius+planetRadius+sunToothHeight*2.,annulusTeeth,0.1));\n\n    addColor(col,annulusColor,smoothgear(col,rotate2(z,  stime*sunSpeed),sunRadius,sunTeeth,sunToothHeight*1.5));\n\n    for( float x = 0.; x<360.; x += 36.){\n\n        addColor(col,vec3(0.925,0.701,0.),planetGear(col,z,sunRadius+0.061,planetRadius-0.018,planetTeeth,carrierSpeed,planetSpeed,stime,x));\n\n    }\n\n    return col;\n\n}\n\nvec2 mouse_uv(){\n\n        return ( u_mouse.xy / u_resolution.xy ) * 2.0 - 1.0;\n\n}\n\nvec3 phase_portrait(vec2 z){\n\n    return vec3(hsv2rgb(vec3(atan(z.y,z.x)/PI2,1.,1.)));\n\n}";

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
        var width = 250;
        var srcFile; var textures = [];
        var theme = "default"
        var preF = preFunction;
        var postF = postFunction;
        if (ccList[i].hasAttribute("data")){
            srcFile = ccList[i].getAttribute("data");
        } else {
            srcFile = ccList[i].innerHTML;
            ccList[i].innerHTML = "";
        }
        if (ccList[i].hasAttribute("data-width")){
            width = ccList[i].getAttribute("data-width");
        }            
        if (ccList[i].hasAttribute("data-theme")){
            theme = ccList[i].getAttribute("data-theme");
        }
        if (ccList[i].hasAttribute("data-texture")){
            textures[0] = ccList[i].getAttribute("data-texture");
        }
        if (ccList[i].hasAttribute("data-raw")){
            preF = "";
            postF = "";
        }

        var editor = new GlslEditor(ccList[i], { canvas_size: width, theme:theme, canvas_follow: true, tooltips: true, exportIcon: false, frag_header: preF,frag_footer: postF, textures:textures});
        editor.open(srcFile);
        glslEditors.push(editor);
    }

    // parse GRAPHS
    var sfList = document.querySelectorAll(".simpleFunction");
    for(var i = 0; i < sfList.length; i++){
        if (sfList[i].hasAttribute("data")){
            var srcFile = sfList[i].getAttribute("data");
            glslGraphs.push(new GlslEditor(sfList[i], { canvas_width: 800, lineNumbers: false, canvas_height: 250, frag_header: preFunction, frag_footer: postFunction, tooltips: true }).open(srcFile));
        }
    }
    document.activeElement.blur();
    window.scrollTo(0,0);
}
loadGlslElements();
},{}]},{},[1]);
