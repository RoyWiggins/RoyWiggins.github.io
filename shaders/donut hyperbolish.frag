// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif
//=-------------------------
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;

    st += vec2(0.000,-0.010);
    vec3 color = vec3(1.);
    color = vec3(st.x,st.y,abs(sin(u_time)));
	st -= 0.5;
    st = st * 5.224;
    st = normalize(st) * (exp(2.*length(st))-6.824)/(exp(2.056*length(st))+5.896);
    
    gl_FragColor = texture2D(u_tex0,st/1.556+0.500);
}