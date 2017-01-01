var glslify = require('glslify');

var preFunction = glslify('../shaders/header.frag');

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