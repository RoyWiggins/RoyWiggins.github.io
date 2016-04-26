precision mediump float;
#define PI 3.14159265359

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
float zoom = 0.5;
vec2 offset = vec2(0.5);

mat3 rotationMatrix3(vec3 v, float angle)
{  float c = cos(radians(angle));
    float s = sin(radians(angle));
    return mat3(c + (1.0 - c) * v.x * v.x, (1.0 - c) * v.x * v.y - s * v.z, (1.0 - c) * v.x * v.z + s * v.y,
        (1.0 - c) * v.x * v.y + s * v.z, c + (1.0 - c) * v.y * v.y, (1.0 - c) * v.y * v.z - s * v.x,
        (1.0 - c) * v.x * v.z - s * v.y, (1.0 - c) * v.y * v.z + s * v.x, c + (1.0 - c) * v.z * v.z
        );
}
vec3 radius(vec2 c,float r1, float r2, float angle){
    mat3 m =rotationMatrix3(vec3(0,0,1),angle);
    c = (m * vec3(c,0)).xy;
    return vec3( (smoothstep(r1,r1+.01, c.x) - smoothstep(r2,r2+.01,c.x) ) * 
                   (smoothstep(-0.02,-0.01,c.y) - smoothstep(0.01,0.02,c.y) ));
}
void addColor(inout vec3 base, vec3 new, vec3 amt){
    base = mix(base,new,amt);
}
vec3 circle(vec2 c, float r){
    return vec3( smoothstep(0.,.01,length(c)-r+0.02)-smoothstep(0.,.01,length(c)-r-0.02));
}
vec3 circles(vec2 z,float r1,float r2){
    vec3 col;
    addColor(col,vec3(0,1,0),radius(z, r1,r2,0.));
    addColor(col,vec3(0,0,1),radius(z, r1,r2,90.));
    addColor(col,vec3(1,1,0),radius(z, r1,r2,180.));
    addColor(col,vec3(1,0,1),radius(z, r1,r2,270.));
    addColor(col,vec3(1,0.5,0.5),circle(z,r1));
    addColor(col,vec3(1,0.5,0.5),circle(z,r2));
    return col;
}
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