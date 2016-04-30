// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif
#define PI 3.14159
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}
vec3 palette(float value){
    value = sin((value-.25)*PI*2.)/2.+0.5;
    return mix(vec3(0.385,0.923,1.000),vec3(0.023,0.679,1.000),value);
}
vec3 colorWave(float in_,float wavea, float waveb){
    float value = map(in_,wavea,waveb,0.,1.);
    return palette(mod(value-u_time,1.))*step(wavea,in_)*(1.-step(waveb,in_));
}
float wave(float x, float height,float y){
    return height*sin(x)+y;
}
float nthWave(float x, float n){
    return wave(x, n,exp(n)-1.);
}
vec3 waves(vec2 z){
    vec3 color;
    color = colorWave(z.y,0.,nthWave(z.x,1.));
    for (float j = 1.; j < 6.; j+=1.){
        color += colorWave(z.y, nthWave(z.x,j),nthWave(z.x,j+1.));
    }
    return color;
}
void main() {
    vec2 z = gl_FragCoord.xy/u_resolution.xy;
    z.x *= u_resolution.x/u_resolution.y;
    z += vec2(-1);
    z = z * 16.;
    z.y = -z.y;
    vec3 color = vec3(0.,0.,0.);
    color = mix(waves(z),waves(z-vec2(3.14,0.)),0.5);
    color = mix(color, vec3(0.044,0.069,0.225),(z.y/20.));
    gl_FragColor = vec4(color,1.0);
}