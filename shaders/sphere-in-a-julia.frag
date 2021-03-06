// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec3 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;

vec2 cExp(in vec2 z){
    return vec2(exp(z.x)*cos(z.y),exp(z.x)*sin(z.y));
}
vec2 cLog(vec2 a) {
    float b =  atan(a.y,a.x);
    if (b>0.0) b-=2.0*3.1415;
    return vec2(log(length(a)),b);
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


vec2 cpow( vec2 z, float n) { float r = length( z ); float a = atan( z.y, z.x ); return pow( r, n )*vec2( cos(a*n), sin(a*n) ); }
float PI = 3.14159;
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

float f(float x){
    return exp2(floor(log2(x)));
}

vec2 unproject(vec2 z){
    float longitude = (atan(z.y,z.x)+PI)/(2.*PI);
    float latitude = 1.-2.*atan(1./length(z))/PI;
    z = vec2(longitude,latitude);
    return z;
}
vec2 cTanh(vec2 pt) {
    return cDiv(cExp(2.*pt)-vec2(1.,0),
                cExp(2.*pt)+vec2(1.,0));	
}
vec2 cATanh(vec2 pt) {
    return .5*cLog(cDiv(pt-vec2(1.,0),pt+vec2(1.,0)));
}

vec3 color(vec2 z){
    z -= .5;
    //z.x -= .6;
    //z.y += .15;
    z *= 5.28;
//    z = cExp(z.yx);
//    z = cInverse(z);

    vec2 pt = vec2(0.170,0.300);//+sin(3.*u_time)*.27;
    //z = test(z,pt,2.);
    //if (dot(z,z)<1.) return vec3(0.);

//    z /= 8.;
    z = cInverse(z);
	z = test(z,pt,2.);
//    z = test(z,vec2(0.690,0.500)+sin(u_time*3.1)*vec2(-0.980,0.980)*.05,6.);
    if (dot(z,z)<1.) return vec3(0.);

        z /= 2.5;
//    z += vec2(-0.040,0.050);
    z = cInverse(z);

    z = unproject(z);
    float k = pow(length(z),.7);
    //z.x = atan(z.y,z.x)/PI*.5+0.5;
    //z.y = k;
//	z.x*=-1.;
    z.x-=0.27;

    return texture2D(u_tex0,fract(z)).xyz;
}
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    st += vec2(.0);    
    gl_FragColor = vec4(color(st),1.0);
}
