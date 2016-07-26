// Author: 
// Title: 

#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float f(float x){
    return exp2(-floor(log2(x)));
}
float circle(vec2 z){
    z.y = 1.-z.y;
    if (abs(z.x)>1. || abs(z.y) > 1.) return 0.;
    if (z.x<z.y){
        return 0.;
    }
    if (z.x<1.-z.y){
        return 1.;
    }

    if (z.x>=z.y){
        return .5;
    }
    return 1.-length(2.*z-1.);
}

mat2 rot_mat2(float a){
    return mat2(cos(a),-sin(a),sin(a),cos(a));
}
float bird(vec2 z){
    float color;
    color = (smoothstep(0.,.01,z.x)-smoothstep(1.,1.01,z.x))*(smoothstep(0.01,.0,z.y)-smoothstep(-3.,-3.01,z.y));
    color *= smoothstep(-2.01,-2.0,z.x+z.y)*smoothstep(3.01,3.0,z.x-z.y);
    color += (smoothstep(-2.01,-2.0,z.x)-smoothstep(2.,2.01,z.x))*(smoothstep(-2.01,-2.,z.y)-smoothstep(-1.01,-1.,z.y))*smoothstep(0.01,0.,z.x+z.y)*smoothstep(0.0,0.01,z.x-z.y);
    color *=  1.-smoothstep(1.0,1.01,z.x-z.y)*smoothstep(-2.0,-2.01,z.x+z.y);
    color *= smoothstep(.1,.1,length(z+vec2(1.,1.490)));
    color = color>1.? 1.:color;
    //color = color - ;
    return color;
}
const float PI = 3.14159;
vec3 tile2(vec2 z,int colorType){
    vec3 color;
    vec3 color1,color2,color3;
    color1 = vec3(0.995,0.964,0.573);
    color2 = vec3(0.995,0.663,0.261);
    color3 = vec3(0.995,0.390,0.314);
    if (colorType == 0){
        color1 = color3;
    }
    if (colorType == 2){
        color = color3;
        color3 = color2;
        color2 = color;
        
    }
    z = z * 2.8;
    z *= rot_mat2(-3.*PI/4.);
    z.x = 1.0-z.x;
    
    color = bird(rot_mat2(3.*PI/4.)*z*sqrt(2.)+vec2(3,-1))*color1;
    color += bird(rot_mat2(-3.*PI/4.)*z*sqrt(2.)+vec2(-1,-3.))*color2;
    color += bird(rot_mat2(PI/4.)*z*sqrt(2.)+vec2(1.0,3.))*color2;
    color += bird(rot_mat2(-PI/4.)*z*sqrt(2.)-vec2(3.,-1.0))*color3;
    return color;
}
vec3 tile(vec2 z,int colorType){
    vec3 color;
    vec3 color1,color2,color3;
    color1 = vec3(0.995,0.964,0.573);
    color2 = vec3(0.995,0.663,0.261);
    color3 = vec3(0.995,0.390,0.314);
    if (colorType == 1){
        color = color1;
        color1 = color2;
        color2 = color3;
        color3 = color;
    }
    if (colorType == 2){
        color = color1;
        color1 = color3;
        color2 = color2;
        color3 = color;        
    }
    if (colorType == 3){
        color = color3;
        color3 = color2;
        color2 = color;
    }
    z = z * 2.8;
    z *= rot_mat2(-3.*PI/4.);
    
    color = bird(z)*color1;
    z.x = 1.0-z.x;
    color += bird(rot_mat2(PI/4.)*z*sqrt(2.)+vec2(1.01,3.))*color2;
    color += bird(rot_mat2(-PI/4.)*z*sqrt(2.)-vec2(3.,-1.0))*color3;

    return color;
}
vec3 color(vec2 z) { 
    // Arrived at by motivated guesswork

    z = (z+1.)*.75;
    
    vec2 a_z = .75-abs(z-.75);
    float k = f(min(a_z.x,a_z.y));
    //return vec3(circle(fract(z*k)));
    int color=0;
    if (mod(f(a_z.x)/k,2.)<1. ){
        if (z.y < 0.5) z *= rot_mat2(PI);
        if (mod(z.x,2./k)<1./k) {
            z = z.yx;
            z.y = 1.-z.y;
            color = 1;
        }
        return  vec3(tile(fract(z*k),color));
    }
    if (mod(f(a_z.y)/k,2.)<1. ){
        z = z.yx;
        color = 3;
        z.y = 1.-z.y;
        if (z.y < 0.5) z *= rot_mat2(PI);
        if (mod(z.x,2./k)<1./k) {
            z = z.yx;
            z.y = 1.-z.y;
            color = 2;
        }
        return  vec3(tile(fract(z*k),color));
    }
    //f(a_z.x)>=k && f(a_z.y)>=k &&
    if ( k == 2. ){
        return vec3(tile2(fract(z*k),0));
    }
    color = 2;
    if (z.y > 2.-z.x){
        z *= rot_mat2(PI/2.);
    } else if (z.x < 1.-z.y){
        z *= rot_mat2(-PI/2.);
    } else if (z.x < z.y){
        color = 1;
    } else {
        color = 1;
        z *= rot_mat2(PI);
    }
    return vec3(tile2(fract(z*k),color));
}

void main( )
{
    const float scaleFactor=2.000;
    vec2 uv = scaleFactor*(gl_FragCoord.xy-0.5*u_resolution.xy) / u_resolution.y;
    //aaScale = 0.0001;
    //animUVW(0.5*PI*u_time);
    gl_FragColor = vec4(color(uv),1.000);
}
