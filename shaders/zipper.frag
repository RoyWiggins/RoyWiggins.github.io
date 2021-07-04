// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec3 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;


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
#define PI 3.14159

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
vec3 tiling(vec2 pt) {
    int n=0;
    vec2 invCent=vec2(1); float invRad=1.11;
    pt = cInverse(pt-.5,vec2(0.,-1.),1.);
	calcCircle(PI/4.,PI/5.,invCent,invRad);
    vec3 color = vec3(1.);//drawCircle(pt,invCent,invRad);
    for (int i=0;i<30;i++) {
        doFolds(pt,invCent,invRad,n);
    }
    color *= hsv2rgb(vec3(fract(float(n)/2.)/4.,1.,1.-float(n)/200.));
    return color;
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
vec2 cis(float a){
    return vec2(cos(a),sin(a));
}

vec2 cMul(vec2 a, vec2 b) {
    return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);
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
vec2 cConj(vec2 z) {
    return vec2(z.x,-z.y);
}
vec2 cPower(vec2 z, float n) {
    float r2 = dot(z,z);
    return pow(r2,n/2.0)*vec2(cos(n*atan(z.y,z.x)),sin(n*atan(z.y,z.x)));
}
vec2 cPower_a(vec2 z, float n) {
    z = -z.yx;
    float r2 = dot(z,z);
    return pow(r2,n/2.0)*vec2(-cos(n*atan(z.x,z.y)+PI/2.),sin(n*atan(z.x,z.y)+PI/2.));
}

vec3 circle(vec2 z, float r){
    return vec3( 1.-smoothstep(.0,0.01,(length(z)-r)))	;
}

vec2 f(vec2 z, vec2 a) {
    vec2 bc = dot(a,a)/a;
    z = cDiv(z, vec2(1,0)-cDiv(z,vec2(bc[0],0)));
	z = cSqr(z)+vec2(bc[1]*bc[1],0);
    z = cPower_a(z,.5);
	return z;
}

vec2 f_inv(vec2 z, vec2 a) {
    vec2 bc = dot(a,a)/a;
    z = cPower(z,2.);
	z = cPower(z-vec2(bc[1]*bc[1]),.5);
    z = cDiv(z, vec2(1,0)+cDiv(z,vec2(bc[0],0)));
	return z;
}
vec2 g(vec2 z,vec2 z0, vec2 z1){
    return cMul(vec2(0,1),cPower(cDiv(z-z1,z-z0),.5));
}
#define N_PTS 9
vec3 color(vec2 z){
	vec3 o = vec3(0);
	z *= 1.;
    vec2 pts[N_PTS];
    
/*    pts[0] = vec2(0,0);
    pts[1] = vec2(0.260,0.560);
	pts[2] = vec2(0.560,0.550);  
	pts[3] = vec2(0.590,0.030);  */

    pts[0] = vec2(-0.090,0.780);
    pts[1] = vec2(0.450,0.940);
    pts[2] = vec2(0.450,0.870);
    pts[3] = vec2(0.430,0.510);
    pts[4] = vec2(0.370,-0.450);
    pts[5] = vec2(0.350,-0.440);
    pts[6] = vec2(0.240,-0.390);
	pts[7] = vec2(-0.080,-0.020);

    pts[8] = vec2(-0.400,0.620);
    vec2 z0 = pts[0];
    vec2 z1 = pts[1];

    for (int i=0;i<=N_PTS;i++){
        o += circle(z-pts[i],.01);
    }

    z = cMul(vec2(0,1),cPower(cDiv(z-pts[1],z-pts[0]),.5));

    for (int i=0;i<N_PTS;i++){
    	pts[i] = g(pts[i],z0,z1);
    }
    
    for (int i=1;i<=N_PTS;i++){
        //o += circle(z-pts[i],.01)*(float(i)/3.);
    }

    for (int i=2;i<N_PTS;i++){
        for (int j=3;j<N_PTS;j++){
            if (j>i){
                pts[j] = f(pts[j],pts[i]);
            }
        }
    }

    for (int i=2;i<N_PTS;i++){
        //pts[0] = f(pts[0],pts[1]);
        z = f(z,pts[i]);
    }



//    o += circle(z-f(pt1,pt1),.01);
//    o += vec3(0,0,1)*circle(z-pt2,.01);
    
    //o += circle(z-f(vec2(pt1),pt1),.01);

    
    
    //    z = f(z,b2,c2);    


//    o += circle(z-vec2(0,0),.03);
//    o += vec3(1.,0,0)*circle(abs(z)-vec2(bc1[1],0),.03);
//    o += circle(abs(z)-vec2(bc1[1]+bc2[1],0),.03);


//    if (abs(z.x)<.01 && abs(z.y)<.3)
//        c = vec3(0,1,0);
    
    if (abs(z.y)<.002 ){}
        //o = vec3(1,0,0);
//	o =vec3(sin(z.x)*sin(z.y)*10.);
    float k=-1.0;
    // this should be necessary but isn't???
    z = cSqr(cDiv(z,vec2(1.,0)-cDiv(z,vec2(k*2.,0))));
	
    //o += circle(z-vec2(k,0),k) * float(z.y>0.);
	//o += float(z.y>0.);
    o += tiling(z)*float(z.y>0.);
    //if (abs(z.y)<.006 && abs(z.x) < bc1[1]+bc2[1]){
        //o = vec3(1,1,0);
    //}
    //if (abs(z.y)<.01 && abs(z.x) < bc2[1]){
        //o = vec3(0,1,0);
    //}
	
    return o;
}

vec3 test(vec2 z){
    vec3 o = vec3(0);
//    z = f(z,vec2(0.170,0.400));
    vec2 a = vec2(.4);
    vec2 bc = dot(a,a)/a;
    z = cDiv(z, vec2(1,0)-cDiv(z,vec2(bc[0],0)));
	z = cSqr(z)+vec2(bc[1]*bc[1],0);
    z = cPower_a(z,.5);

    o = tiling(z) * float(z.y>0.);
    return o;
}
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    st -= .5;
    st *= 2.;
    
    gl_FragColor = vec4(color(st),1.);
}
