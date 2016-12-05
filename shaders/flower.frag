uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float f ( in vec2 z ){
    float a = atan(z.y,z.x)+fract(u_time/2.)*3.1415*2.;
    float r = length(z);
    return r - 1. + .7*sin(6.*a + sin(u_time*10.)*1.3*r*r);
}
/*float f ( in vec2 z ){
    float a = atan(z.y,z.x)+fract(u_time);
    float r = length(z);
    
    return r+sin(u_time)+cos(r*u_time)/1.-1.;
}/*
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
    return smoothstep( 0., 0.02, de );
}
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    st -= vec2(0.5);
    st *= 4.;
    vec3 c = vec3(1.);
    c = vec3(color(st));

    gl_FragColor = vec4(c,1.0);
}