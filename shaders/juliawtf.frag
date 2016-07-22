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

#define RES u_resolution.xy

#define FXAA_SPAN_MAX 8.0
#define FXAA_REDUCE_MUL   (1.0/FXAA_SPAN_MAX)
#define FXAA_REDUCE_MIN   (1.0/128.0)
#define FXAA_SUBPIX_SHIFT (1.0/4.0)
vec3 sample(vec2 z);

vec3 fxaa(vec2 p)
{

    // 1st stage - Find edge
    vec3 rgbNW = sample(p + (vec2(-1.,-1.) / RES));
    vec3 rgbNE = sample(p + (vec2( 1.,-1.) / RES));
    vec3 rgbSW = sample(p + (vec2(-1., 1.) / RES));
    vec3 rgbSE = sample(p + (vec2( 1., 1.) / RES));
    vec3 rgbM  = sample(p);

    vec3 luma = vec3(0.299, 0.587, 0.114);

    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);

    vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
    
    float lumaSum   = lumaNW + lumaNE + lumaSW + lumaSE;
    float dirReduce = max(lumaSum * (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);
    float rcpDirMin = 1. / (min(abs(dir.x), abs(dir.y)) + dirReduce);

    dir = min(vec2(FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX), dir * rcpDirMin)) / RES;

    // 2nd stage - Blur
    vec3 rgbA = .5 * (sample(p + dir * (1./3. - .5)) +
                      sample(p + dir * (2./3. - .5)));
    vec3 rgbB = rgbA * .5 + .25 * (
                      sample(p + dir * (0./3. - .5)) +
                      sample(p + dir * (3./3. - .5)));
    
    float lumaB = dot(rgbB, luma);
    
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

    return ((lumaB < lumaMin) || (lumaB > lumaMax)) ? rgbA : rgbB;
}
float cosh(float val)
{
    float tmp = exp(val);
    float cosH = (tmp + 1.0 / tmp) / 2.0;
    return cosH;
}
 vec2 cis(float a){
    return vec2(cos(a),sin(a));
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
    return vec3(hsv2rgb(vec3(atan(z.y,z.x)/PI2*4.+-0.224,1.,1.)));
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
    float epsilon = .001;
    if (m < epsilon) {
    t = sin(u);
    b = cos(u);
    ai = m * (u - t * b) / 4.;
    return vec4(
      t - ai * b,
      b + ai * t,
      1. - m * t * t / 2.,
      u - ai
    );
  }
  if (m >= 1. - epsilon) {
    ai = (1. - m) / 4.;
    b = cosh(u);
    t = tanh(u);
    phi = 1. / b;
    twon = b * sinh(u);
    return vec4(
      t + ai * (twon - u) / (b * b),
      phi - ai * t * phi * (twon - u),
      phi + ai * t * phi * (twon + u),
      2. * atan(exp(u)) - PI/2. + ai * (twon - u) / b
    );
    }
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
    
    if (abs(u) < 0.0001) {
        b = ellipticJ(v, 1. - m);
        sn = vec2(0, b[0] / b[1]),
        cn = vec2(1. / b[1], 0),
        dn = vec2(b[2] / b[1], 0);
    } else {
    a = ellipticJ(u, m);
    b = ellipticJ(v, 1. - m);
    c = b[1] * b[1] + m * a[0] * a[0] * b[0] * b[0];
    sn = vec2(a[0] * b[2] / c, a[1] * a[2] * b[0] * b[1] / c);
    cn = vec2(a[1] * b[1] / c, -a[0] * a[2] * b[0] * b[2] / c);
    dn = vec2(a[2] * b[1] * b[2] / c, -m * a[0] * a[1] * b[0] / c);
    }
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
vec3 domain2(vec2 z){
    //if (dot(z,z) > 0.872)
        z = cInverse(z);
    
    z = vec2(length(z)+-0.00,atan(z.y,z.x)/3.14);
    float p=exp2(ceil(-log2(1.-z.x)));
    return vec3(mod(z.y,2./p)*p<1.);
}

/*vec2 M(vec2 z,vec2 c){    
    for (int i=0; i<5;i++){
        z = cPower(z,2.) + c;
    } return z;
}*/
vec3 M(vec2 z,vec2 c){
    //vec2 c = 0.3250*cis(sin(u_time*3.)/6.+0.500);
    vec2 CA = vec2(0.470,-0.730);
    vec2 CB = vec2(-0.210,-0.490);//+cis(u_time)/20.;
    vec2 CC = vec2(-0.370,-0.480);
    vec2 CD = vec2(0.150,-0.370);
    vec3 color;
    for (int i=0; i<20;i++){
        if( dot(z,z)>10000.0 ) continue;
        z = cMul(z,z);
        vec2 _;
        z = cDiv(cMul(CA,z)+CB,cMul(z,CC)+CD);          
        
        if (i < 3) continue;
        //if (i/2 * 2 == i) continue;
        float amount = 1.;
        amount = pow(7./float(i+1),2.608);
        color = (1.-amount)*color+amount*length(z)*domain2(z)*domain(z);
    }

    return color;
}
vec3 sample(vec2 z){
    z += vec2(0.000,-0.500);
    z *= 4.208;
    vec2 _;
    z = z * 2.;
       
    z = cLog(z);
    z *= 1.179;
    z.x -= mod(u_time/2.,1.)*3.736;
    
    z *= mat2(1,-1,1,1);     

    ellipticJi(z,0.5,_,z,_);
    //z = mod(z,.9);
    vec2 c = vec2(0.540,0.350);

    vec3 color = M(z,z);
    //vec3 color = texture2D(u_tex0,unproject(z)).xyz;

    return color;
}

vec4 color(vec2 z){
    #ifdef AA
        return vec4(fxaa(z),1.);
    #endif
    return vec4(sample(z),1.);
}

void main() {
    vec2 z = gl_FragCoord.xy/u_resolution.xy;
    z.x *= u_resolution.x/u_resolution.y;
    z.x -= 0.5;
    gl_FragColor = vec4(color(z));
}
