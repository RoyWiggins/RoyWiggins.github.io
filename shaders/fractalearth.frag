// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif
#define PI 3.14159 

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
uniform sampler2D u_tex1;
float cosh(float val)
{
    float tmp = exp(val);
    float cosH = (tmp + 1.0 / tmp) / 2.0;
    return cosH;
}
float tanh(float val)
{
    float tmp = exp(val);
    float tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);
    return tanH;
}
float sinh(float val)
{
    float tmp = exp(val);
    float sinH = (tmp - 1.0 / tmp) / 2.0;
    return sinH;
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
vec2 cLog(vec2 a) {
    float b =  atan(a.y,a.x);
    if (b>0.0) b-=2.0*3.1415;
    return vec2(log(length(a)),b);
}
vec2 cSqr(vec2 z) {
    return vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y);
}
vec2 cSin(vec2 z) {
    return vec2(sin(z.x)*cosh(z.y), cos(z.x)*sinh(z.y));
}
vec2 cCos(vec2 z) {
    return vec2(cos(z.x)*cosh(z.y), -sin(z.x)*sinh(z.y));
}
vec2 cPower2(vec2 z, vec2 a) {
    return cExp(cMul(cLog(z), a));
}
vec2 cis(float a){
    return vec2(cos(a),sin(a));
}
vec2 M(vec2 z,vec2 c){    
    // Iterate m(z) 3 times
    for (int i=0; i<3;i++){
        //if (dot(z,z) > 1000.){continue;};
        z = cPower(z,2.) + c;
    } return z;
}
vec2 unproject(vec2 z){
    float longitude = 1.-(atan(z.y,z.x)+PI)/(2.*PI);
    float latitude = 1.-2.*atan(1./length(z))/PI;
    z = vec2(longitude,latitude);
    return z;
}
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    st -= vec2(0.290,0.010) + vec2(0.5);
    vec3 color = vec3(1.);
    st = st*2.3;
    vec2 z = st;
    
    z = M(z,z);
    //z = cDiv((z+vec2(-1,0.000)),(z+vec2(1.0,.00)));
    //z = cDiv((z+vec2(-1,0.000)),(z+vec2(1.0,1.00)));
    //z = cDiv(z-vec2(1.,0), cMul(z,z)+z+vec2(1.,0));
    
    z = cDiv(z-vec2(1.,0),(cPower(z,3.)+z+vec2(1.,0.)));
    
    gl_FragColor = texture2D(u_tex0,unproject(z));
}