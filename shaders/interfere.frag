// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 z = gl_FragCoord.xy/u_resolution.xy;
    z.x *= u_resolution.x/u_resolution.y;
    z += vec2(-0.5);
    z = z * 3.;
    vec3 color = vec3(1.);
    float a = atan(z.y,z.x);
    float r = length(z);

    color = vec3(r+cos(tan(r*fract(u_time/20000.))*u_time)/1.);

    gl_FragColor = vec4(color,1.0);
}