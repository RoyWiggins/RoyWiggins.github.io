// Author: 
// Title: 

// Author: 
// Title: 
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
#define PI 3.14159265359
#define PI2 6.28318530718
float cosh(float val)
{
    float tmp = exp(val);
    float cosH = (tmp + 1.0 / tmp) / 2.0;
    return cosH;
}
 
// TANH Function (Hyperbolic Tangent)
float tanh(float val)
{
    float tmp = exp(val);
    float tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);
    return tanH;
}
 
// SINH Function (Hyperbolic Sine)
float sinh(float val)
{
    float tmp = exp(val);
    float sinH = (tmp - 1.0 / tmp) / 2.0;
    return sinH;
}
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
vec3 domain(vec2 z){
    return vec3(hsv2rgb(vec3(atan(z.y,z.x)/PI2,1.,1.)));
}

vec2 cExp(in vec2 z){
    return vec2(exp(z.x)*cos(z.y),exp(z.x)*sin(z.y));
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
vec2 cLog(vec2 a) {
    float b =  atan(a.y,a.x);
    if (b>0.0) b-=2.0*3.1415;
    return vec2(log(length(a)),b);
}
void fill(inout float[9] k){
    for(int i = 0; i < 8; i++) {
        k[i] = 0.;      //integers will be automatically cast to float in this instance.
    }
}
//https://github.com/d3/d3-geo-projection/blob/master/src/elliptic.js


// Returns [sn, cn, dn, ph](u|m).
vec4 ellipticJ(float u, float m){
    float ai, b, phi, t, twon;
    float a[9];
    fill(a);
    a[0] = 1.;
    float c[9];
    fill(c);
    c[0] = sqrt(m);
    
    b = sqrt(1. - m);
    twon = 1.;
    int i = 0;

    for (int j = 1 ; j < 8;j++){
        if ((c[j-1] / a[j-1]) > 0.1) {
            i++;
            ai = a[j-1];
            c[j] = (ai - b) / 2.;
            a[j] = (ai + b) / 2.;
            b = sqrt(ai * b);
            twon *= 2.;
        }
    }
    for (int j = 8; j > 0;j--){
        if (j == i){
            phi = twon * a[j] * u;
        }
        if (j <= i){
            t = c[j] * sin(b = phi) / a[j];
            phi = (asin(t) + phi) / 2.;
        }
    }
    
    return vec4(sin(phi), t = cos(phi), t / cos(phi - b), phi);
}
void ellipticJi(vec2 z, float m, out vec2 sn, out vec2 cn, out vec2 dn) {
    float u = z.x; float v = z.y;
    vec4 a, b;
    float c;
    a = ellipticJ(u, m);
    b = ellipticJ(v, 1. - m);
    c = b[1] * b[1] + m * a[0] * a[0] * b[0] * b[0];
    sn = vec2(a[0] * b[2] / c, a[1] * a[2] * b[0] * b[1] / c);
    cn = vec2(a[1] * b[1] / c, -a[0] * a[2] * b[0] * b[2] / c);
    dn = vec2(a[2] * b[1] * b[2] / c, -m * a[0] * a[1] * b[0] / c);
}
const float pi = 3.14159265359;
const float quarterPi = 0.78539816339;
const float epsilon = 0.00001;

float ellipticF(float phi, float m) {
  if (m == 0.0) return phi;
  if (m == 1.0) return log(tan(phi / 2.0 + quarterPi));
  float a = 1.0,
      b = sqrt(1.0 - m),
      c = sqrt(m);
  int j = 0;
  
  for (int i=0; i < 10; i++) {
    if (abs(c) > epsilon) {
    if (mod(phi,pi) != 0.0) {
      float dPhi = atan(b * tan(phi) / a);
      if (dPhi < 0.0) {
        dPhi += pi;
      }
      phi += dPhi + floor(phi / pi) * pi;
    } else {
      phi += phi;
    }
    c = (a + b) / 2.0;
    b = sqrt(a * b);
    c = ( (a = c) - b) / 2.0;
    j++;
    }
  }
  //printf("a:%f b: %f c: %f phi: %f\n",a,b,c,phi);
  return phi / (pow(2.0, float(j)) * a);
}
vec2 ellipticFi(float phi, float psi, float m) {
  float r = abs(phi),
      i = abs(psi),
      sinhPsi = sinh(i);
  if (r != 0.0) {
    float cscPhi = 1. / sin(r),
        cotPhi2 = 1. / (tan(r) * tan(r)),
        b = -(cotPhi2 + m * (sinhPsi * sinhPsi * cscPhi * cscPhi) - 1. + m),
        c = (m - 1.) * cotPhi2,
        cotLambda2 = (-b + sqrt(b * b - 4. * c)) / 2.;
    vec2 ret = vec2(
      ellipticF(atan(1. / sqrt(cotLambda2)), m) * sign(phi),
      ellipticF(atan(sqrt((cotLambda2 / cotPhi2 - 1.) / m)), 1. - m) * sign(psi)
    );
    return ret;
  }
  vec2 ret = vec2(
    0,
    ellipticF(atan(sinhPsi), 1. - m) * sign(psi)
  );
  return ret;
}

vec2 unproject(vec2 z){
    float longitude = (atan(z.y,z.x)+PI)/(2.*PI);
    float latitude = 1.-2.*atan(1./length(z))/PI;
    z = vec2(longitude,latitude);
    return z;
}

vec3 checkers(vec2 z ){
    float scale = 0.05;
    float board = sin(z.x/scale)*sin(z.y/scale);
    z = abs(z);
    board = max(z.y,z.x)<.5? board:0.; 
    return vec3(board,-board,board);
}
vec2 M(vec2 z,vec2 c){    
    for (int i=0; i<5;i++){
        z = cPower(z,2.) + c;
    } return z;
}
void main() {
    vec2 z = gl_FragCoord.xy/u_resolution.xy;
    z.x *= u_resolution.x/u_resolution.y;
    //z.x -= u_resolution.x/u_resolution.y/5.;
    z = z - 0.5;
    
    z = z * 2.5;
    vec2 z0 = z;
    //z = M(z,z0);
    
    z = cDiv(z-vec2(1.,0), z+vec2(1.,0));

    z = cLog(z);
    float angle = 2.820;
    z = cDiv(z, cExp(vec2(0,angle))*cos(angle)); 
    z = z*3.55;
    
    vec3 color;
    vec2 sn,cn,dn;    
    
    ellipticJi(z,0.5,sn,cn,dn);
    
    color = texture2D(u_tex0,unproject(cn)).xyz;
//    z = ellipticFi(acos(z.x),acos(z.y),0.21);
//  color = checkers(z);
    gl_FragColor = vec4(color,1.);
}
