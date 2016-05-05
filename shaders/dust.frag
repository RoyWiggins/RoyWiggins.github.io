// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float f ( in vec2 z ){
    float a = atan(z.y,z.x);
    float r = length(z);
    float t = u_time * 2. * 3.14159;
    //return sin(r*r+a*4.+t);
    //return sin(100.*cos(a/sqrt(abs(a)))*16.+u_time*3.14159*2.);
    return r+sin(u_time)+cos(tan(r)*u_time)/1.+1.;
}
vec2 grad( in vec2 x )
{
    vec2 h = vec2( 0.01, 0.0 );
    return vec2( f(x+h.xy) - f(x-h.xy),
                 f(x+h.yx) - f(x-h.yx) )/(2.0*h.x);
}
float color( in vec2 x )
{
    float v = f( x );
    vec2  g = grad( x );
    float de = abs(v)/length(g);
    return smoothstep( 0., 0.01, de );
}
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    st -= vec2(0.5);
    st *= sin(u_time*3.14159*2.)/10.+6.;
    vec3 c = vec3(1.);
    c = vec3(color(st));

    gl_FragColor = vec4(c,1.0);
}