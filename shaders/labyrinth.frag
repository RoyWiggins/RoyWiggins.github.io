// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec3 u_mouse;
uniform float u_time;
uniform sampler2D u_texA;
uniform sampler2D u_texB;

uniform float factor; // 0;0.848;1; factor
uniform vec3 clickColor; // #5cecff;
float f(float x){
    return exp2(-floor(log2(x))-2.); // here's the change
}
float PI = 3.14159;
vec2 cLog(vec2 a) {
    float b =  atan(a.y,a.x);
    if (b>0.0) b-=2.0*3.1415;
    return vec2(log(length(a)),b);
}
vec2 cMul(vec2 a, vec2 b) {
    return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);
}
vec2 cPower(vec2 z, float n) {
    float r2 = dot(z,z);
    return pow(r2,n/2.0)*vec2(cos(n*atan(z.y,z.x)),sin(n*atan(z.y,z.x)));
}
vec2 cInverse(vec2 a) {
    return  vec2(a.x,-a.y)/dot(a,a);
}
vec2 cDiv(vec2 a, vec2 b) {
    return cMul( a,cInverse(b));
}
vec2 cExp(in vec2 z){
    return vec2(exp(z.x)*cos(z.y),exp(z.x)*sin(z.y));
}
vec3 color_(vec2 z) {
    float angle = atan(log(2.)/(2.0*PI))*1.;
    z = cExp(cDiv(cLog(z), cExp(vec2(0,angle))*cos(angle))); 
    vec2 a_z = abs(z);
    float scale = f(max(a_z.x,a_z.y));
    return texture2D(u_texA,z*scale+0.5).xyz;
}
float scale = 1.;

float AA(float w, float a,float x){

    return smoothstep(a-w*.5*scale,a+w*.5*scale,x);
}

vec3 snake(vec2 z){
    float n = .75/((7.)*2.+.5);
    float h = .25-n*.8;
    z.x += n*.5-.25;
    vec2 w = z;
    vec3 c = vec3(AA(.001,0.,abs(mod(z.x+n*.25,n)-n*.5)-n*.25))*(z.y > h? 0.:1.)*(z.y > n*.75? 1.:0.);
    w.x = mod(w.x,n*2.);
    c += vec3(AA(.2,abs(length(w-vec2(n*1.250,h))-n*.5)/n*4.,1.))*(z.y < h? 0.:1.);
    w.x = mod(z.x+n*.5,n*2.)-n*.5;
    c += vec3(AA(.2,abs(length(w-vec2(n*.250,n*.75))-n*.5)/n*4.0,1.))*(z.y > n*.75? 0.:1.);
    c *= z.x < n*.25? 0.:1.;
    c += (AA(.001,.75-n*.5,z.x-n*.5)) * (z.y < 0.25-n*0.25? 1.:0.)* (z.y > 0.25-n? 1.:0.);
    return c;
}
vec3 color(vec2 z){
    vec3 c;
    z = z - .5;
    float angle = atan(log(2.)/(2.0*PI));
    z = cExp(cDiv(cLog(z), cExp(vec2(0,angle))*cos(angle))); 
    vec2 a_z = abs(z);
    scale = f(max(a_z.x,a_z.y));
    z = z*scale + .5;
    c = snake(z);
    z.y = 1.-z.y;
    c += snake(z.yx);
    z.x = 1.-z.x;
    c += snake(z);
    z.y = 1.-z.y;
    c += snake(z.yx);
    return vec3(c);
}
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    //st += fract(u_time)+vec2(0.910,0.930);

    gl_FragColor = vec4(color(st),1.);
}
