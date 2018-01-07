////// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec3 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
float PI = 3.14159;
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

vec2 unproject(vec2 z){
    float longitude = (atan(z.y,z.x)+PI)/(2.*PI);
    float latitude = 1.-2.*atan(1./length(z))/PI;
    z = vec2(longitude,latitude);
    return z;
}
vec2 cInverse(vec2 z, vec2 center, float radius){
    z -= center;
    return z*radius*radius/dot(z,z) + center;
}

vec2 cpow( vec2 z, float n) { float r = length( z ); float a = atan( z.y, z.x ); return pow( r, n )*vec2( cos(a*n), sin(a*n) ); }

vec2 test(vec2 z, vec2 c,float q) {
    float dist=1.;
    z = z * 2.;
    //vec2(-.1,sin(fract(u_time/2.)*2.*PI)/1.5);
    const int n = 50;
    vec2 phi = z;
    float k = 0.;
    for (int i=0; i<n;i++){
        if( dot(z,z)>20000.0 ) continue;
        k = k+1.;
        // point
        z = cPower(z,q) + c;
        vec2 a = cDiv(z,z-c);
        float s = pow( 1./q, k );
        // phi
        phi = cMul( phi, cpow(a, s) );
    }
//    return vec3(.4)*pow(length(phi),2.);
    if (k < float(n)) {
        return phi;
    }
    return vec2(0);
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

void fold_circle(inout vec2 z, vec2 c, float r, inout int n) {
    if (distance(z,c)>r) return;
    z = cInverse(z,c,r);
    n++;
}
void doFolds(inout vec2 z,vec2 c,float r,inout int n) {              
    fold_circle(z,c,r,n);
    fold_circle(z,vec2(-c.x,c.y),r,n);
    fold_circle(z,vec2(c.y,c.x),r,n);
    fold_circle(z,vec2(c.y,-c.x),r,n);
}
vec2 transform(vec2 z) {
    vec2 q = z;
    float s = 4.;
    int n;

    z *= 2.*1.74;
    float k = 2.09;
    for (int i=0;i<4;i++)
        doFolds(z,vec2(k+.91,0.),k+.36,n);
    z *= .65;
    z /= .5*(1. + dot(z,z)*.8);
    z*= 2.;
    z += 1.312;

    z = rot(z,PI/4.);
//    z += vec2(.0,0.185);
    z = cn(z,.5);
    z = rot(z,3.*PI/4.);

    //    z = cInverse(z);
//    z = test(z,vec2(0.290,0.380),2.);
    if (length(z)>1.) return vec2(0.);
    z *= .5;
    z.y += .5;
    //z += vec2(0.010,-0.050);
//    z.y *= -1.;
    z = cInverse(z, vec2(0,1.),1.);
    z = rot(z,PI);
    z = cMul(z,z);
   
//  z = cInverse(z.xy, 3.*(u_mouse.xy/u_resolution.xy-.5),1.);
//    z = cInverse(z,vec2(0.),1.);
    z = unproject(z);
    if (fract(float(n)*.5)>0.)
    z.x = 1.-z.x;
    return z;
}
void main() {
    vec2 z = gl_FragCoord.xy/u_resolution.xy;
    z.x *= u_resolution.x/u_resolution.y;
    z -= .5;
    if (dot(z,z)<.25)
        gl_FragColor = vec4(texture2D(u_tex0,transform(z)).xyz,1.0);
}
