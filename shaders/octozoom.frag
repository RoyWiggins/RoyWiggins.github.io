#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_tex0;
void main() {
    vec2 z = gl_FragCoord.xy/u_resolution.xy;
    z.x *= u_resolution.x/u_resolution.y;
    z = z - vec2(0.300,0.470);
    vec2 k = vec2(0.235,-0.4726);
    z = z - k;
    z = z * (0.288-mod(pow(u_time*10000.,.5),1.)*0.144);
    z = z+ k;

	gl_FragColor =  texture2D(u_tex0,z+vec2(.5));
}