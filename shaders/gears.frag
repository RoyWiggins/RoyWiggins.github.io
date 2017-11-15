// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// Author: Roy Wiggins
// Title: Gearworld

#define PI 3.14159265359
#define HyperDroste false
#define Invert false
#define Tile false
#define TwoPoles false
#ifdef GL_ES
precision mediump float;
#endif

vec3 smoothstepr(float center, float width, vec3 value){
	return smoothstep(center-width/2.,center+width/2.,value);
}

void addColor(inout vec3 base, vec3 new, vec3 amt){
	base = mix(base,new,amt);
}
vec3 filledcircle(vec2 c, float r){
	return vec3( 1.0-smoothstep(0.,.01,length(c)-r-0.02));
}
vec3 smoothgear(in vec3 col, vec2 z, float r, float n, float toothHeight){
	float theta = atan(z.y,z.x);
	float R = length(z)-r-toothHeight/5.;
	float val = 1.0 - smoothstep(0.,0.01,sin(R)+sin(theta*n)*toothHeight/2.);
	val = val+smoothstepr(R-toothHeight/5.,0.01,vec3(0.)).x-1. ;
	val = clamp(val,0.,1.);
	val = val+smoothstepr(R+toothHeight/5.,0.01,vec3(0.)).x ;
	return vec3(clamp(val,0.,1.));
}
mat3  rotationMatrix3(vec3 v, float angle)
{
	float c = cos(radians(angle));
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
vec3 planetGear(in vec3 col, in vec2 z, float sunRadius, float planetRadius,float planetTeeth,float carrierSpeed, float planetSpeed, float stime, float angle){
	return smoothgear(col,rotate2(rotate2(z,angle+stime*carrierSpeed)-vec2(sunRadius+planetRadius,0),-(stime+angle) * planetSpeed),planetRadius,planetTeeth,0.13);
}
vec3 planetaryLinkage(vec2 z){
	vec3 col = vec3(0.);
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
	return	vec2(a.x,-a.y)/dot(a,a);
}

vec2 cDiv(vec2 a, vec2 b) {
	return cMul( a,cInverse(b));
}

vec2 cExp(vec2 z) {
	return vec2(exp(z.x) * cos(z.y), exp(z.x) * sin(z.y));
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
void rotate(inout vec2 c, float angle){
	mat3 m =rotationMatrix3(vec3(0,0,1),angle);
	c = (m * vec3(c,0)).xy;
}
void hyper(inout vec2 z){
	z = cPower2(z,vec2(3,0)); // "HyperDroste"
	z = cDiv(cSin(z),cCos(z));
}
void droste(inout vec2 z, float r1, float r2, float Branches, float stretch, float a){

	if (HyperDroste){
		 hyper(z);
	 /*float PR = 1;
        float div = 0.5 * (1.0 + z.x * z.x + z.y * z.y + ((1.0 - z.x * z.x - z.y * z.y) * cos(PR)) - (2.0 * z.x * sin(PR)));
        z.x = (z.x * cos(PR) + (0.5 * (1.0 - z.x * z.x - z.y * z.y) * sin(PR))) / div;
	*/
	}
	if (Invert){
		z = cInverse(z);
	}
	if (Tile) {
			z = cCos(z);
	}


	if (TwoPoles) {
		z = cDiv(cMul(z, vec2(1,0)) + vec2(0,1), cMul(z, vec2(	0,1)) + vec2(0,0)); // via https://www.shadertoy.com/view/Xdf3RM
	}
	float scale = log(r2/r1);
	float angle = atan(scale/(2.*PI)*Branches);
	float r = 0.;
	z = cLog(z);

	z = cDiv(z, cMul(cExp(vec2(0,angle)), vec2(cos(angle),0)));
	z.y = z.y * (stretch - a / 360. * Branches); // Formula determined empirically.
	z.y = z.y + floor(z.x / scale) * radians(a);
	z.x = mod(z.x,scale);
	r = z.x;
	z = cMul(cExp(z),vec2(r1,0));	
	if (length(z) < r2 && (abs(z.x) > r2 || abs(z.y) > r2) ){
		z = z / (r2/r1);
		rotate(z,-a);
	}
	//hyper(z);

}


void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st -= .5;
    st.x *= u_resolution.x/u_resolution.y;
    st *= 2.;
    vec3 color = vec3(0.);
    vec2 uv = st;
    st = st - vec2(1.,0.);
    droste(st,0.5,1.0,1.,1.,0.);
	color = planetaryLinkage(st) * vec3(step(0.0,uv.x));
    color += planetaryLinkage(uv+vec2(1.,0)) * vec3(step(uv.x,0.0));
    gl_FragColor = vec4(color,1.0);
}
