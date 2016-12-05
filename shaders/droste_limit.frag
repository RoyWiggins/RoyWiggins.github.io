#ifdef GL_ES
precision mediump float;
#endif
#define PI 3.14159265359
#define PI2 6.28318530718

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec2 mouse_uv(){
        return ( u_mouse.xy / u_resolution.xy ) * 2.0 - 1.0;
}
vec3 phase_portrait(vec2 z){
    return vec3(hsv2rgb(vec3(atan(z.y,z.x)/PI2,1.,1.)));
}

// ---- complex operators
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
vec2 scaling_tile(in vec2 z){
    z = (z-1.)*pow(2.,ceil(-log(1.-z.x)/log(2.)))+2.;
    //z.x = z.x*2.-1.;
    //z.y = mod(z.y,3.14159);
    return z;
}

// --- Droste
vec2 droste_(vec2 z,float r1, float r2) {
    z = z * 3.;
    z = cLog(z);
    float scale = log(r2/r1);
    float angle = atan(scale/(2.0*PI));
    
    //z = cDiv(z, cExp(vec2(0,angle))*cos(angle)); 
    z = scaling_tile(z);
    //z.x = mod(z.x,scale);
    z = cExp(z)*r1;
    return z;
}
// --- gears
// ---------
vec3 smoothstepr(float center, float width, vec3 value){
    return smoothstep(center-width/2.,center+width/2.,value);
}

mat3 rotationMatrix3(vec3 v, float angle)
{  float c = cos(radians(angle));
    float s = sin(radians(angle));
    return mat3(c + (1.0 - c) * v.x * v.x, (1.0 - c) * v.x * v.y - s * v.z, (1.0 - c) * v.x * v.z + s * v.y,
        (1.0 - c) * v.x * v.y + s * v.z, c + (1.0 - c) * v.y * v.y, (1.0 - c) * v.y * v.z - s * v.x,
        (1.0 - c) * v.x * v.z - s * v.y, (1.0 - c) * v.y * v.z + s * v.x, c + (1.0 - c) * v.z * v.z
        );
}

vec2 rotate2(in vec2 c, float angle){
    mat3 m =rotationMatrix3(vec3(0,0,1),angle);
    return (m * vec3(c,0)).xy;
}
void addColor(inout vec3 base, vec3 new, vec3 amt){
    base = mix(base,new,amt);
}
vec3 smoothgear(in vec3 col, vec2 z, float r, float n, float toothHeight){
    float theta = atan(z.y,z.x);
    float R = length(z)-r-toothHeight/5.;
    float val;
    val = 1.0 - smoothstep(0.,0.01,sin(R)+sin(theta*n)*toothHeight/2.);
    val = val+smoothstepr(R-toothHeight/5.,0.01,vec3(0.)).x-1. ;
    val = clamp(val,0.,1.);
    val = val+smoothstepr(R+toothHeight/5.,0.01,vec3(0.)).x ;
    return vec3(clamp(val,0.,1.));
}
vec3 planetGear(in vec3 col, in vec2 z, float sunRadius, float planetRadius,float planetTeeth,float carrierSpeed, float planetSpeed, float stime, float angle){
    return smoothgear(col,rotate2(rotate2(z,angle+stime*carrierSpeed)-vec2(sunRadius+planetRadius,0),-(stime+angle) * planetSpeed),planetRadius,planetTeeth,0.13);
}

vec3 planetaryLinkage(vec2 z){
    vec3 col;
    float r1 = 0.5;
    float r2 = 1.;
    float secondsPerRotation = 40.;
    float stime = 360. * u_time/secondsPerRotation;
    float sunTeeth = 30.;
    float planetTeeth = 8.;
    float annulusTeeth = 40.;

    float sunToothHeight = 0.1;
    float sunRadius = r1+sunToothHeight;
    float carrierSpeed = 4.;    
    float planetSpeed =  annulusTeeth/planetTeeth * carrierSpeed;
    float sunSpeed = (1.+annulusTeeth/sunTeeth)*carrierSpeed;
    float planetRadius = (r2-sunRadius-0.1)/2.;
    float nPlanets = 10.;

    z = rotate2(z,-stime*1.5);
    vec3 annulusColor = vec3(1.,.1,.1);
    addColor(col,annulusColor,vec3(1)-smoothgear(col,rotate2(z,  0.),sunRadius+planetRadius+sunToothHeight*2.,annulusTeeth,0.1));
    addColor(col,annulusColor,smoothgear(col,rotate2(z,  stime*sunSpeed),sunRadius,sunTeeth,sunToothHeight*1.5));

    for( float x = 0.; x<360.; x += 36.){
        addColor(col,vec3(0.925,0.701,0.),planetGear(col,z,sunRadius+0.061,planetRadius-0.018,planetTeeth,carrierSpeed,planetSpeed,stime,x));
    }
    return col;
}
vec2 M(vec2 z,vec2 c){    
    for (int i=0; i<6;i++){
        z = cPower(z,2.) + c;
    } return z;
}
vec3 domain(vec2 z){
    float shade = length(z)<1.?1.:0.;
    //return phase_portrait(z)*shade;
    z = droste_(z/1.1,0.492,3.224);
    return planetaryLinkage(z)*shade;
}
vec3 color(vec2 z) {
    vec2 c = mouse_uv();
    //vec2 c = vec2(-0.580,0.460)+cis(u_time)/10.;
    //z = cDiv((z+vec2(-1,0.000)),(z+vec2(1.0,0.00)));
    
    //z = M(z*1.,z);
    
    
    return domain(z);
}
void main(){
    vec2 st = (gl_FragCoord.xy/u_resolution.xy)-vec2(0.5);
    st.x *= u_resolution.x/u_resolution.y;
    gl_FragColor = vec4(color(2.*st),1.0);
}