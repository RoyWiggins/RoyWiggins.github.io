// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec3 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;


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
vec2 cLog(vec2 a) {
    float b =  atan(a.y,a.x);
    if (b>0.0) b-=2.0*3.1415;
    return vec2(log(length(a)),b);
}
float PI = 3.1415;
float f(float x,float n){
    return pow(n,-floor(log(x)/log(n))-2.);
}
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    st += vec2(.0);    
    vec3 color = vec3(u_mouse.xy/u_resolution.xy,u_mouse.z);
    float ratio = pow(4.25,1.);
    float angle = atan(log(ratio)/(2.*PI));
//	st = cDiv(st-vec2(-1,0), st-vec2(1,0));
    st -= .5;
    st = cLog(st);

    st = cDiv(st, cExp(vec2(0,angle))*cos(angle));
    st.x += mod(u_time,8.)*4.35*.125-7.;
    st = cExp(st);
    vec2 a_z = abs(st);
    float scale = f(max(a_z.x,a_z.y),4.25);
    color = texture2D(u_tex0,st*scale+.5).xyz;
    gl_FragColor = vec4(color,1.0);
}
