// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif
#define PI 3.14159265359
#define PI2 6.28318530718

//=-------------------------
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
vec2 cis(float a){
    return vec2(cos(a),sin(a));
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
vec2 cPower2(vec2 z, vec2 a) {
    return cExp(cMul(cLog(z), a));
}

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
vec3 domain(vec2 z){
    z = cInverse(z);
    z = vec2(length(z)-0.,atan(z.y,z.x)/PI2);
    float p=pow(2.,float(ceil(log2((2./(1.-z.x))))));
    return vec3(mod(z.y,2./p)*p<1.);
}
void main() {
    vec2 z=gl_FragCoord.xy/u_resolution;
    z = (z - 0.5)*2.;
    z = z - vec2(1.,0);
    //z = z * 2.*(sqrt(fract(u_time)));
    z = z + vec2(1.000,0);
        z = z * 2.-vec2(0.000,-0.010);
    vec2 c = 0.250*cis(sin(u_time*PI2)/3.+0.200);
    const int n = 70;
    vec2 phi = z;
    float k = 0.;
    for (int i=0; i<n;i++){

        if( dot(z,z)>62.0 ) continue;
        k = k+1.;
        // point
        z = cMul(z,z) + c;
        vec2 a = cDiv(z,z-c);
        float s = pow( 0.5, k );
        // phi
        phi = cMul( phi, cPower(a, s) );
    }
    gl_FragColor = vec4(domain(z),1.);
}