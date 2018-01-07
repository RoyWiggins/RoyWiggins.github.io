// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec3 u_mouse;
uniform float u_time;

vec2 cInverse(vec2 a) {
    return  vec2(a.x,-a.y)/dot(a,a);
}
vec2 cMul(vec2 a, vec2 b) {
    return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);
}
vec2 cDiv(vec2 a, vec2 b) {
    return cMul( a,cInverse(b));
}
vec2 cExp(in vec2 z){
    return vec2(exp(z.x)*cos(z.y),exp(z.x)*sin(z.y));
}
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void fold(inout vec2 p, vec2 dir,inout int n){
    float dt = dot(p,dir);
    if (dt<0.) {
        p-=2.*dt*dir;
        n++;
    }
}
float PI = 3.1415;
void calcCircle(float theta, float phi,
                out vec2 cPos, out float r){
	float tanTheta = tan(PI/2. - theta);
    float tanTheta2 = tanTheta * tanTheta;
    float tanPhi2 = tan(phi) * tan(phi);
    cPos=sqrt(vec2(1.+tanTheta2,(1.+tanPhi2)*tanTheta2)
                /(-tanPhi2+tanTheta2)
        );
    r = sqrt((1.+tanPhi2)*(1.+tanTheta2)
             /(-tanPhi2 + tanTheta2)
        );
}
vec2 cInverse(vec2 z, vec2 center, float radius){
    z -= center;
    return z*radius*radius/dot(z,z) + center;
}
void fold_circle(inout vec2 z, vec2 c, float r, inout int n) {
    if (distance(z,c)>r) return;
    z = cInverse(z,c,r);
    n++;
}
vec3 drawCircle(vec2 z,vec2 c,float r) {
    return vec3(smoothstep(distance(z,c)-r,.01,0.));
}
void doFolds(inout vec2 z,vec2 c,float r,inout int n) {              
    fold(z,vec2(1,0),n);
    fold(z,vec2(0,1),n);
    fold_circle(z,c,r,n);
}
vec3 color(vec2 pt) {
    int n=0;
    vec2 invCent=vec2(1); float invRad=1.11;
    calcCircle(PI/5.,PI/4.,invCent,invRad);
    vec3 color = vec3(1.);//drawCircle(pt,invCent,invRad);
        pt = cDiv(cExp(2.*pt)-vec2(1.,0),
              cExp(2.*pt)+vec2(1.,0));	
    for (int i=0;i<20;i++) {
        doFolds(pt,invCent,invRad,n);
    }
    color *= hsv2rgb(vec3(fract(float(n)/2.)/4.,1.,1.-float(n)/40.));
    return color;
}
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    st -= vec2(.5);
    st *= 2.;
    gl_FragColor = vec4(color(st),1.0);
}
