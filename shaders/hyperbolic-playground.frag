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

vec2 cLog(vec2 a) {
    float b =  atan(a.y,a.x);
    if (b>0.0) b-=2.0*3.1415;
    return vec2(log(length(a)),b);
}
vec2 cTanh(vec2 pt) {
    return cDiv(cExp(2.*pt)-vec2(1.,0),
                cExp(2.*pt)+vec2(1.,0));	
}
vec2 cATanh(vec2 pt) {
    return .5*cLog(cDiv(pt-vec2(1.,0),pt+vec2(1.,0)));
}
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
void fill(inout float[9] k){for( int i=0;i<8;i++) { k[i] = 0.;} }

vec4 ellipticJ(float u, float m){
    float ai, b=sqrt(1.-m), phi, t, twon=1.;
    float a[9],c[9];
    fill(a); fill(c);
	a[0] = 1.; c[0] = sqrt(m);
    int i=0;
    for (int j=1;j<8;j++){
        if ((c[j-1] / a[j-1]) > 0.1) {
            i++;
            ai = a[j-1];
            c[j] = (ai - b) * .5;
            a[j] = (ai + b) * .5;
            b = sqrt(ai * b);
            twon *= 2.;
        }
    }
    for (int j=8;j>0;j--){
        if (j == i) phi = twon * a[j] * u;
        if (j <= i){
            t = c[j] * sin(b = phi) / a[j];
            phi = (asin(t) + phi) / 2.;
        }
    }
    return vec4(sin(phi), t = cos(phi), t / cos(phi - b), phi);
}
// Jacobi's cn tiles the plane with a sphere 
vec2 cn(vec2 z, float m) {
    vec4 a = ellipticJ(z.x, m), b = ellipticJ(z.y, 1. - m);
    return vec2(a[1] * b[1] , -a[0] * a[2] * b[0] * b[2] )/ (b[1] * b[1] + m * a[0] * a[0] * b[0] * b[0]);
}
vec2 rot(vec2 z,float t){
    return mat2(cos(t),-sin(t),sin(t),cos(t))*z;
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
vec2 translate(vec2 pt, float amt){
	pt=cInverse(pt,vec2(0,-1),1.);
    pt.y+=.5;
    //Scaling
    pt *= pow(2.,amt);
    pt.y-=.5;
    return cInverse(pt,vec2(0,-1),1.);
}
void doFolds(inout vec2 z,vec2 c,float r,inout int n) {              
    fold(z,vec2(1,0),n);
    fold(z,vec2(0,1),n);
    fold_circle(z,c,r,n);
}
vec2 squareify(vec2 z){
	z *= 1.31;
    z += 1.3;
    z *= mat2(cos(PI/4.),sin(PI/4.),-sin(PI/4.),cos(PI/4.));
    z = cn(z,.5);
    z = translate(z,mix(0.,1.516,2.2));
    return z;
}

vec3 color(vec2 pt) {
    int n=0;
    vec2 invCent=vec2(1); float invRad=1.11;
    calcCircle(PI/4.,PI/5.,invCent,invRad);
    vec3 color = vec3(1.);//drawCircle(pt,invCent,invRad);
    float half_time = min(fract(u_time/10.)*2.,.5)/.5;
    //pt = rot(pt,min(fract(u_time/10.)*2.,.5)*2.*PI);
//    pt = translate(pt,-2.);
//    pt = rot(pt,half_time*2.*PI);
//    pt = translate(pt,2.);
	pt = translate(pt,mix(0.,-4.24,half_time));
    for (int i=0;i<28;i++) {
        doFolds(pt,invCent,invRad,n);
    }
    color *= hsv2rgb(vec3(fract(float(n)/2.)/4.,1.,1.-pow(float(n)/400.,.9)));
    return color;
}


float dots(vec3 p, vec3 q){
    return dot(p.xy,q.xy)-p.z*q.z;
}
float hlength(vec3 p){
    return sqrt(abs(dots(p,p)+2.));
}
float hsphere( vec3 p, float radius )
{
	p = p.zxy;
	return hlength(p)-radius;//(sqrt(dots(p,p)+2.)-1.)/4.;
}
 
float map( vec3 p )
{ 
//	return min	(length(p)-1.,p.y);
    return hsphere(p,1.)/5.;
//    return min(hsphere( p, 1. )/4.,length(p)-1.);
}
 
vec3 getNormal( vec3 p )
{
    vec3 e = vec3( 0.001, 0, 0 );
    float dX = map( p + e.xyy ) - map( p - e.xyy );
    float dY = map( p + e.yxy ) - map( p - e.yxy );
    float dZ = map( p + e.yyx ) - map( p - e.yyx );
    
    return normalize( vec3( dX, dY, dZ ) );
}
 
float trace( vec3 origin, vec3 direction, out vec3 p )
{
    float totalDistance = 0.000;

    for( int i=0; i<320; ++i)
    {
        // Here we march along our ray and store the new point
        // on the ray in the "p" variable.
        p = origin + direction * totalDistance;
        float dist = map(p);
        totalDistance += dist;
        if( dist < 0.0001 ) break;
        if( totalDistance > 10000.0 )
        {
            totalDistance = 0.;
            break;
        }
    }
 
    return totalDistance;
}
float calculateLighting(vec3 pointOnSurface, vec3 surfaceNormal, vec3 lightPosition, vec3 cameraPosition)
{
    vec3 fromPointToLight = normalize(lightPosition - pointOnSurface);
    float diffuseStrength = clamp( dot( surfaceNormal, fromPointToLight ), 0.0, 1.0 );
    
    vec3 diffuseColor = diffuseStrength*vec3(0.);//*color;
    vec3 reflectedLightVector = normalize( reflect( -fromPointToLight, surfaceNormal ) );
    
    vec3 fromPointToCamera = normalize( cameraPosition - pointOnSurface );
    float specularStrength = pow( clamp( dot(reflectedLightVector, fromPointToCamera), 0.0, 1.0 ), 10.0 );
 
    // Ensure that there is no specular lighting when there is no diffuse lighting.
    specularStrength = min( diffuseStrength, specularStrength );
    vec3 specularColor = specularStrength * vec3( 1.0 );
    
    float finalColor = diffuseStrength+specularStrength;// + specularColor; 
 
    return finalColor;
}


vec3 camera( vec2 uv, out float brightness ) {
    vec3 cameraPosition = vec3( 0.0, -1.25, -3.45 );
    vec3 cameraDirection = normalize( vec3( uv.x, uv.y, 1.0) );
    vec3 pointOnSurface;
    float distanceToClosestPointInScene = trace( cameraPosition, cameraDirection, pointOnSurface );
    vec3 finalColor = vec3(0.0);

    if( distanceToClosestPointInScene > 0.0 )
    {
        vec3 lightPosition = vec3( 0.0, 6.5, 4.0 );
        vec3 surfaceNormal = getNormal( pointOnSurface );
        brightness = calculateLighting( pointOnSurface, surfaceNormal, lightPosition, cameraPosition );
        return pointOnSurface;
    }
    return vec3(-10);
}


void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    st -= vec2(.5);
    float brightness;
    vec3 pt = camera(st,brightness);
    vec2 projected = pt.xz / (0.-pt.y);
//    if (pt.y <= -10.) 
//        gl_FragColor = vec4(0); 
//    else
	    gl_FragColor = vec4(color(projected)*brightness,1);
//    gl_FragColor = vec4(color(st),1.0);
}
