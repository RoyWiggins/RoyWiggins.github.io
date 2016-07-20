
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
uniform sampler2D u_tex1;

vec2 unproject(vec2 z){
    float longitude = (atan(z.y,z.x)+PI)/(2.*PI);
    float latitude = 1.-2.*atan(1./length(z))/PI;
    z = vec2(longitude,latitude);
    return z;
}
void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    st -= vec2(.5);
    vec3 color = vec3(1.);
    st = st*10.;
    vec2 z = st;
    
    gl_FragColor = texture2D(u_tex0,unproject(z));
}