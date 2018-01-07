(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var glslify = require('glslify');

var preFunction = glslify(["precision mediump float;\n#define GLSLIFY 1\n#define PI 3.14159265359\n#define PI2 6.28318530718\n\nuniform vec2 u_resolution;\nuniform vec2 u_mouse;\nuniform float u_time;\n\nuniform sampler2D u_tex0;\nuniform sampler2D u_tex1;\nuniform sampler2D u_tex2;\nuniform sampler2D u_tex3;\n\nfloat zoom = 0.5;\nvec2 offset = vec2(0.5);\n\nvec3 smoothstepr(float center, float width, vec3 value){\n    return smoothstep(center-width/2.,center+width/2.,value);\n}\n\nmat3 rotationMatrix3(vec3 v, float angle)\n{  float c = cos(radians(angle));\n    float s = sin(radians(angle));\n    return mat3(c + (1.0 - c) * v.x * v.x, (1.0 - c) * v.x * v.y - s * v.z, (1.0 - c) * v.x * v.z + s * v.y,\n        (1.0 - c) * v.x * v.y + s * v.z, c + (1.0 - c) * v.y * v.y, (1.0 - c) * v.y * v.z - s * v.x,\n        (1.0 - c) * v.x * v.z - s * v.y, (1.0 - c) * v.y * v.z + s * v.x, c + (1.0 - c) * v.z * v.z\n        );\n}\nvoid rotate(inout vec2 c, float angle){\n    mat3 m =rotationMatrix3(vec3(0,0,1),angle);\n    c = (m * vec3(c,0)).xy;\n}\nvec2 rotate2(in vec2 c, float angle){\n    mat3 m =rotationMatrix3(vec3(0,0,1),angle);\n    return (m * vec3(c,0)).xy;\n}\n\nvec3 radius(vec2 c,float r1, float r2, float angle){\n    mat3 m =rotationMatrix3(vec3(0,0,1),angle);\n    c = (m * vec3(c,0)).xy;\n    return vec3( (smoothstep(r1,r1+.01, c.x) - smoothstep(r2,r2+.01,c.x) ) * \n                   (smoothstep(-0.02,-0.01,c.y) - smoothstep(0.01,0.02,c.y) ));\n}\nvoid addColor(inout vec3 base, vec3 new, vec3 amt){\n    base = mix(base,new,amt);\n}\nvec3 circle(vec2 c, float r){\n    return vec3( smoothstep(0.,.01,length(c)-r+0.02)-smoothstep(0.,.01,length(c)-r-0.02));\n}\n\nvec3 circles(vec2 z,float r1,float r2){\n    vec3 col = vec3(0);\n    addColor(col,vec3(0,1,0),radius(z, r1,r2,0.));\n    addColor(col,vec3(0,0,1),radius(z, r1,r2,90.));\n    addColor(col,vec3(1,1,0),radius(z, r1,r2,180.));\n    addColor(col,vec3(1,0,1),radius(z, r1,r2,270.));\n    addColor(col,vec3(1,0.5,0.5),circle(z,r1));\n    addColor(col,vec3(1,0.5,0.5),circle(z,r2));\n    return col;\n}\nvec3 filledcircle(vec2 c, float r){\n    return vec3( 1.0-smoothstep(0.,.01,length(c)-r-0.02));\n}\n\nfloat cosh(float val)\n{\n    float tmp = exp(val);\n    float cosH = (tmp + 1.0 / tmp) / 2.0;\n    return cosH;\n}\nfloat tanh(float val)\n{\n    float tmp = exp(val);\n    float tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);\n    return tanH;\n}\nfloat sinh(float val)\n{\n    float tmp = exp(val);\n    float sinH = (tmp - 1.0 / tmp) / 2.0;\n    return sinH;\n}\nvec2 cis(float a){\n    return vec2(cos(a),sin(a));\n}\nvec2 cMul(vec2 a, vec2 b) {\n    return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);\n}\nvec2 cPower(vec2 z, float n) {\n    float r2 = dot(z,z);\n    return pow(r2,n/2.0)*vec2(cos(n*atan(z.y,z.x)),sin(n*atan(z.y,z.x)));\n}\nvec2 cInverse(vec2 a) {\n    return  vec2(a.x,-a.y)/dot(a,a);\n}\nvec2 cDiv(vec2 a, vec2 b) {\n    return cMul( a,cInverse(b));\n}\nvec2 cExp(in vec2 z){\n    return vec2(exp(z.x)*cos(z.y),exp(z.x)*sin(z.y));\n}\nvec2 cLog(vec2 a) {\n    float b =  atan(a.y,a.x);\n    if (b>0.0) b-=2.0*3.1415;\n    return vec2(log(length(a)),b);\n}\nvec2 cSqr(vec2 z) {\n    return vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y);\n}\nvec2 cSin(vec2 z) {\n    return vec2(sin(z.x)*cosh(z.y), cos(z.x)*sinh(z.y));\n}\nvec2 cCos(vec2 z) {\n    return vec2(cos(z.x)*cosh(z.y), -sin(z.x)*sinh(z.y));\n}\nvec2 cPower2(vec2 z, vec2 a) {\n    return cExp(cMul(cLog(z), a));\n}\nvec2 cConj(vec2 z) {\n    return vec2(z.x,-z.y);\n}\n\nvec3 hash3( vec2 p ){\n    vec3 q = vec3( dot(p,vec2(127.1,311.7)), \n                   dot(p,vec2(269.5,183.3)), \n                   dot(p,vec2(419.2,371.9)) );\n    return fract(sin(q)*43758.5453);\n}\n\nfloat iqnoise( in vec2 x, float u, float v ){\n//https://www.shadertoy.com/view/Xd23Dh\n    vec2 p = floor(x);\n    vec2 f = fract(x);\n\n    float k = 1.0+63.0*pow(1.0-v,4.0);\n\n    float va = 0.0;\n    float wt = 0.0;\n    for( int j=-2; j<=2; j++ )\n    for( int i=-2; i<=2; i++ )\n    {\n        vec2 g = vec2( float(i),float(j) );\n        vec3 o = hash3( p + g )*vec3(u,u,1.0);\n        vec2 r = g - f + o.xy;\n        float d = dot(r,r);\n        float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );\n        va += o.z*ww;\n        wt += ww;\n    }\n\n    return va/wt;\n}\nvec3 hsv2rgb(vec3 c)\n{\n    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nfloat sphere( vec3 p, float radius )\n{\n    return length( p ) - radius;\n}\n \n//-----------------------------------------------------------------------------------------------\n// The map function is the function that defines our scene.\n\nfloat map( vec3 p )\n{    \n    return sphere( p, 1.0 );\n}\n \nvec3 getNormal( vec3 p )\n{\n    vec3 e = vec3( 0.001, 0.00, 0.00 );\n    \n    float deltaX = map( p + e.xyy ) - map( p - e.xyy );\n    float deltaY = map( p + e.yxy ) - map( p - e.yxy );\n    float deltaZ = map( p + e.yyx ) - map( p - e.yyx );\n    \n    return normalize( vec3( deltaX, deltaY, deltaZ ) );\n}\n \nfloat trace( vec3 origin, vec3 direction, out vec3 p )\n{\n    float totalDistanceTraveled = 0.0;\n \n    for( int i=0; i <170; ++i)\n    {\n        // Here we march along our ray and store the new point\n        // on the ray in the \"p\" variable.\n        p = origin + direction * totalDistanceTraveled;\n \n        // \"distanceFromPointOnRayToClosestObjectInScene\" is the \n        // distance traveled from our current position along \n        // our ray to the closest point on any object\n        // in our scene.  Remember that we use \"totalDistanceTraveled\"\n        // to calculate the new point along our ray.  We could just\n        // increment the \"totalDistanceTraveled\" by some fixed amount.\n        // However we can improve the performance of our shader by\n        // incrementing the \"totalDistanceTraveled\" by the distance\n        // returned by our map function.  This works because our map function\n        // simply returns the distance from some arbitrary point \"p\" to the closest\n        // point on any geometric object in our scene.  We know we are probably about \n        // to intersect with an object in the scene if the resulting distance is very small.\n        float distanceFromPointOnRayToClosestObjectInScene = map( p );\n        totalDistanceTraveled += distanceFromPointOnRayToClosestObjectInScene;\n \n        // If our last step was very small, that means we are probably very close to\n        // intersecting an object in our scene.  Therefore we can improve our performance\n        // by just pretending that we hit the object and exiting early.\n        if( distanceFromPointOnRayToClosestObjectInScene < 0.0001 )\n        {\n            break;\n        }\n\n        if( totalDistanceTraveled > 10000.0 )\n        {\n            totalDistanceTraveled = 0.0000;\n            break;\n        }\n    }\n \n    return totalDistanceTraveled;\n}\n\n \n// Standard Blinn lighting model.\nvec3 calculateLighting(vec3 pointOnSurface, vec3 surfaceNormal, vec3 lightPosition, vec3 cameraPosition, vec3 color)\n{\n    vec3 fromPointToLight = normalize(lightPosition - pointOnSurface);\n    float diffuseStrength = clamp( dot( surfaceNormal, fromPointToLight ), 0.0, 1.0 );\n    \n    vec3 diffuseColor = diffuseStrength*color;\n    vec3 reflectedLightVector = normalize( reflect( -fromPointToLight, surfaceNormal ) );\n    \n    vec3 fromPointToCamera = normalize( cameraPosition - pointOnSurface );\n    float specularStrength = pow( clamp( dot(reflectedLightVector, fromPointToCamera), 0.0, 1.0 ), 10.0 );\n \n    // Ensure that there is no specular lighting when there is no diffuse lighting.\n    specularStrength = min( diffuseStrength, specularStrength );\n    vec3 specularColor = specularStrength * vec3( 1.0 );\n    \n    vec3 finalColor = diffuseColor;// + specularColor; \n \n    return finalColor;\n}\n\nvec2 sphereViewer(vec2 uv, out float distanceToClosestPointInScene){\n    \n    // We will need to shoot a ray from our camera's position through each pixel.  To do this,\n    // we will exploit the uv variable we calculated earlier, which describes the pixel we are\n    // currently rendering, and make that our direction vector.\n    vec2 mouse_uv = ( u_mouse.xy / u_resolution.xy ) * 2.0 - 1.0;\n    vec3 cameraPosition = vec3(0.,-15.*cis(mouse_uv.y*PI/2.));\n    vec3 cameraDirection = normalize( vec3( uv.x, uv.y, -10.0) );\n    cameraDirection = cameraDirection * rotationMatrix3(vec3(1,0,0),degrees(-atan(cameraPosition.y, cameraPosition.z)));\n    vec3 pointOnSurface;\n    distanceToClosestPointInScene = trace( cameraPosition, cameraDirection, pointOnSurface );\n    vec2 projected = pointOnSurface.xy / (1.-pointOnSurface.z);\n    return projected;\n}\n\nvec2 droste_(vec2 z,float r1, float r2) {\n    z = cLog(z);\n    float scale = log(r2/r1);\n    float angle = atan(scale/(2.0*PI));\n    z = cDiv(z, cExp(vec2(0,angle))*cos(angle)); \n    z.x = mod(z.x,scale);\n    z = cExp(z)*r1;\n    return z;\n}\n\n// ---------\nvec3 smoothgear(in vec3 col, vec2 z, float r, float n, float toothHeight){\n    float theta = atan(z.y,z.x);\n    float R = length(z)-r-toothHeight/5.;\n    float val = 0.;\n    val = 1.0 - smoothstep(0.,0.01,sin(R)+sin(theta*n)*toothHeight/2.);\n    val = val+smoothstepr(R-toothHeight/5.,0.01,vec3(0.)).x-1. ;\n    val = clamp(val,0.,1.);\n    val = val+smoothstepr(R+toothHeight/5.,0.01,vec3(0.)).x ;\n    return vec3(clamp(val,0.,1.));\n}\nvec3 planetGear(in vec3 col, in vec2 z, float sunRadius, float planetRadius,float planetTeeth,float carrierSpeed, float planetSpeed, float stime, float angle){\n    return smoothgear(col,rotate2(rotate2(z,angle+stime*carrierSpeed)-vec2(sunRadius+planetRadius,0),-(stime+angle) * planetSpeed),planetRadius,planetTeeth,0.13);\n}\nvec3 planetaryLinkage(vec2 z){\n    vec3 col = vec3(0);\n    float r1 = 0.5;\n    float r2 = 1.;\n    float secondsPerRotation = 40.;\n    float stime = 360. * u_time/secondsPerRotation;\n    float sunTeeth = 30.;\n    float planetTeeth = 8.;\n    float annulusTeeth = 40.;\n\n    float sunToothHeight = 0.1;\n    float sunRadius = r1+sunToothHeight;\n    float carrierSpeed = 4.;    \n    float planetSpeed =  annulusTeeth/planetTeeth * carrierSpeed;\n    float sunSpeed = (1.+annulusTeeth/sunTeeth)*carrierSpeed;\n    float planetRadius = (r2-sunRadius-0.1)/2.;\n    float nPlanets = 10.;\n\n    z = rotate2(z,-stime*1.5);\n    vec3 annulusColor = vec3(1.,.1,.1);\n    addColor(col,annulusColor,vec3(1)-smoothgear(col,rotate2(z,  0.),sunRadius+planetRadius+sunToothHeight*2.,annulusTeeth,0.1));\n    addColor(col,annulusColor,smoothgear(col,rotate2(z,  stime*sunSpeed),sunRadius,sunTeeth,sunToothHeight*1.5));\n\n    for( float x = 0.; x<360.; x += 36.){\n        addColor(col,vec3(0.925,0.701,0.),planetGear(col,z,sunRadius+0.061,planetRadius-0.018,planetTeeth,carrierSpeed,planetSpeed,stime,x));\n    }\n    return col;\n}\nvec2 mouse_uv(){\n        return ( u_mouse.xy / u_resolution.xy ) * 2.0 - 1.0;\n}\nvec3 phase_portrait(vec2 z){\n    return vec3(hsv2rgb(vec3(atan(z.y,z.x)/PI2,1.,1.)));\n}\nmat2 rot_mat2(float a){\n    return mat2(cos(a),-sin(a),sin(a),cos(a));\n}\n\nfloat DE(vec3 p){\n\treturn 0.;\n}\nvec3 getDENormal( vec3 p )\n{\n    vec3 e = vec3( 0.001, 0.00, 0.00 );\n    \n    float deltaX = DE( p + e.xyy ) - DE( p - e.xyy );\n    float deltaY = DE( p + e.yxy ) - DE( p - e.yxy );\n    float deltaZ = DE( p + e.yyx ) - DE( p - e.yyx );\n    \n    return normalize( vec3( deltaX, deltaY, deltaZ ) );\n}\n\nfloat tracer( vec3 origin, vec3 direction, out vec3 p )\n{\n    float totalDistance = 0.0;\n\n    for( int i=0; i<35; ++i)\n    {\n        // Here we march along our ray and store the new point\n        // on the ray in the \"p\" variable.\n        p = origin + direction * totalDistance;\n        float dist = DE(p);\n        totalDistance += dist;\n        if( dist < 0.0001 ) break;\n        if( totalDistance > 100000.0 )\n        {\n            totalDistance = 0.;\n            break;\n        }\n    }\n \n    return totalDistance;\n}\n\nvec3 lighting2(vec3 pointOnSurface, vec3 surfaceNormal, vec3 lightPosition, vec3 cameraPosition)\n{\n    vec3 fromPointToLight = normalize(lightPosition - pointOnSurface);\n    float diffuseStrength = clamp( dot( surfaceNormal, fromPointToLight ), 0.0, 1.0 );\n    \n    vec3 diffuseColor = diffuseStrength * vec3( 1.0, 0.0, 0.0 );\n    vec3 reflectedLightVector = normalize( reflect( -fromPointToLight, surfaceNormal ) );\n    \n    vec3 fromPointToCamera = normalize( cameraPosition - pointOnSurface );\n    float specularStrength = pow( clamp( dot(reflectedLightVector, fromPointToCamera), 0.0, 1.0 ), 10.0 );\n \n    // Ensure that there is no specular lighting when there is no diffuse lighting.\n    specularStrength = min( diffuseStrength, specularStrength );\n    vec3 specularColor = specularStrength * vec3( 1.0 );\n    \n    vec3 finalColor = diffuseColor + specularColor; \n \n    return finalColor;\n}\n\nvec3 simple_raymarch(vec2 uv){\n    vec3 cameraPosition = vec3( 0., 0.0, -2.0 );\n    vec3 cameraDirection = normalize( vec3( uv.x, uv.y, 1.0) );\n    vec3 pointOnSurface;\n    float distanceToClosestPointInScene = tracer( cameraPosition, cameraDirection, pointOnSurface );\n    vec3 finalColor = vec3(0.0);\n    if( distanceToClosestPointInScene > 0.0 )\n    {\n        vec3 lightPosition = vec3( 0.0, 0., -40.0 );\n        vec3 surfaceNormal = getDENormal( pointOnSurface );\n        finalColor = lighting2( pointOnSurface, surfaceNormal, lightPosition, cameraPosition);\n    }\n    return finalColor;\n}\n"]);

var glslCanvases = [];
var glslEditors = [];
var glslGraphs = [];


function sliceOutMain(str){
    var regex = /vec3 color\s*\(.*?\)\s*?{/img;
    var p = 1;
    var end = undefined;
    var match = regex.exec(str);
    if (!match){
        console.log(str);
        return str;
    }
    for (var i = regex.lastIndex, len = str.length; i < len; i++) {
      if (str[i] == "{"){
        p += 1;
      } else if (str[i] == "}"){
        p -= 1;
      }
      if (p == 0){
        end = i;
        break;
      }
      if (p < 0){
        end = len;
        break;
      }
    }
    return str.substring(0,regex.lastIndex-match[0].length)+str.substring(end+1,str.length);
}

function findClosingParen(str,idx){
  var p = 0;
  for (var i = idx, len = str.length; i < len; i++) {
    if (str[i] == "{"){
      p += 1;
    } else if (str[i] == "}"){
      p -= 1;
    }
    if (p == 0){
      return i;
    }
    if (p < 0){
      return len;
    }
  }
}

function getMethods(str){
  var functions = []
  var regex = /^\s*?[a-zA-Z\d]{1,6}\s*?(\S+)\(.*?\)\s*?{/img;
  while ((match = regex.exec(str)) !== null) {
    var msg = 'Found ' + match[1] + '. ';
    var last = findClosingParen(str,regex.lastIndex-1);
    var first = regex.lastIndex - match[0].length;
    functions.push({name:match[1],protoLength:match[0].length,first:regex.lastIndex,last:last});
    regex.lastIndex = last;
  }
  return functions;
}
function hasPrototypeFor(theString,name){
  var regex = new RegExp('^\s*?[a-zA-Z0-9]{1,6} +'+name+'\(.*?\)\s*?;','img');
  return regex.exec(theString) != null;
}
function removeMethod(str,methods,method){
  var to_return = str;
  var removed_amount = undefined;
  for (var j=0;j<methods.length;j++){
    if (methods[j].name == method){
      if (hasPrototypeFor(str,method)){
          to_return = str.substring(0,methods[j].first-methods[j].protoLength)+""+str.substring(methods[j].last+1,str.length);
          removed_amount = methods[j].last - methods[j].first+methods[j].protoLength;
     } else {
         to_return = str.substring(0,methods[j].first-1)+";"+str.substring(methods[j].last+1,str.length);
         removed_amount = methods[j].last - methods[j].first+1;
     }
    } else if ( removed_amount ) {
      methods[j].first -= removed_amount;
      methods[j].last -= removed_amount;
    }
  }

  return to_return;
}

function overrideCode( cumulativeCode, newCode ) {
  if ( !cumulativeCode ) { return ""; }
  var newMethods = getMethods(newCode);
  var cumulativeMethods = getMethods(cumulativeCode);

  for (var j=0;j<newMethods.length;j++){
    cumulativeCode = removeMethod(cumulativeCode,cumulativeMethods,newMethods[j].name);
  }
  return cumulativeCode;
}

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
    var cumulativeCode = "";

    for(var i = 0; i < ccList.length; i++){ 
        var width = 250;
        var srcFile; var textures = [];
        var theme = "default"
        var preF = preFunction;
        var postF = postFunction;
        if (ccList[i].hasAttribute("literate")){
            preF += "\n"+cumulativeCode;
        }
        if (ccList[i].hasAttribute("pre")){
            preF += ccList[i].getAttribute("pre");
        }

        if (ccList[i].hasAttribute("data")){
            srcFile = ccList[i].getAttribute("data");
        } else {
            srcFile = ccList[i].innerHTML;
            ccList[i].innerHTML = "";
        }
//        cumulativeCode += overrideCode(srcFile, cumulativeCode);
//        preF = overrideCode(preF, srcFile);
        cumulativeCode += sliceOutMain(srcFile);
        if (ccList[i].hasAttribute("override")){
            var k = ccList[i].getAttribute("override").split(",");
            var methods = getMethods(preF);
            for (var j=0;j<k.length;j++){
                preF = removeMethod(preF,methods,k);
            }
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
        /*window.setTimeout(function(e,s){
          return function(){
            e.open(s);
            window.scrollTo(0,0);
          }}(editor,srcFile),glslEditors.length*500+500);*/
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

//loadGlslElements();

window.onload = function() {
  window.scrollTo(0,0);
  window.setTimeout(function(){
    window.scrollTo(0,0);
    loadGlslElements();
  },100);
}
},{"glslify":2}],2:[function(require,module,exports){
module.exports = function(strings) {
  if (typeof strings === 'string') strings = [strings]
  var exprs = [].slice.call(arguments,1)
  var parts = []
  for (var i = 0; i < strings.length-1; i++) {
    parts.push(strings[i], exprs[i] || '')
  }
  parts.push(strings[i])
  return parts.join('')
}

},{}]},{},[1]);
