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
    color = (smoothstep(0.,.001,z.x)-smoothstep(1.,1.001,z.x))*(smoothstep(0.001,.0,z.y)-smoothstep(-3.,-3.001,z.y));
    color *= smoothstep(-2.001,-2.0,z.x+z.y)*smoothstep(3.001,3.0,z.x-z.y);
    color = mix(color,1.,(smoothstep(-2.001,-2.0,z.x)-smoothstep(2.,2.001,z.x))*(smoothstep(-2.001,-2.,z.y)-smoothstep(-1.001,-1.,z.y))*smoothstep(0.001,0.,z.x+z.y)*smoothstep(0.0,0.001,z.x-z.y));
    color *=  1.-smoothstep(1.0,1.001,z.x-z.y)*smoothstep(-2.0,-2.001,z.x+z.y);
    color *= smoothstep(.1,.1,length(z+vec2(1.,1.490)));
    //color = color>1.? 1.:color;
    //color = color - ;
    return color;
}
const float PI = 3.14159265359;
    
const vec3 light = vec3(0.995,0.964,0.573);
const vec3 mid = vec3(0.995,0.663,0.261);
const vec3 dark = vec3(0.995,0.390,0.314);

float pulse(float x,int k){
    return step(float(k)-0.5,x)-step(float(k)+0.5,x);
}

vec3 tile2(vec2 z,int colorType){
    vec3 color;
    vec3 color1,color2,color3,color4;
    
    color1 = pulse(0.0,colorType)*dark+pulse(1.0,colorType)*light+pulse(2.0,colorType)*light;
    color2 = pulse(0.0,colorType)*mid+pulse(1.0,colorType)*mid+pulse(2.0,colorType)*dark;
    color3 = pulse(0.0,colorType)*dark+pulse(1.0,colorType)*dark+pulse(2.0,colorType)*mid;
    color4 = pulse(0.0,colorType)*mid+pulse(1.0,colorType)*mid+pulse(2.0,colorType)*dark;
/* color1 = dark;
//  color2 = mid;
//  color3 = dark;
//  color4 = mid;
    if (colorType == 1){
        //color1 = light;
        //color2 = mid
//      color3 = dark
        //color4 = mid;
    }else if (colorType == 2){
        //color3 = mid;
        //color2 = dark;
        //color1 = light;
        //color4 = dark;
    }*/
    z = z * sqrt(2.)*2.;
    z *= rot_mat2(-3.*PI/4.);
    z.x = 1.0-z.x;
    
    color = bird(rot_mat2(3.*PI/4.)*z*sqrt(2.)+vec2(3,-1))*color1;
    color = mix(color, color2, bird(rot_mat2(-3.*PI/4.)*z*sqrt(2.)+vec2(-1,-3.)));
    color = mix(color, color2, bird(rot_mat2(PI/4.)*z*sqrt(2.)+vec2(1.0,3.)));
    color = mix(color, color3, bird(rot_mat2(-PI/4.)*z*sqrt(2.)-vec2(3.,-1.0)));
    
    color2 = pulse(0.0,colorType)*mid+pulse(1.0,colorType)*dark+pulse(2.0,colorType)*mid;
//    if (colorType == 2) color2 = mid;
//    if (colorType == 1) color2 = dark;
    color = mix(color, color1, bird(rot_mat2(-3.*PI/4.)*z*sqrt(2.)+vec2(-1.0,-7.)));
    color = mix(color, color2, bird(rot_mat2(-PI/4.)*z*sqrt(2.)-vec2(3.,3.0)));
    color = mix(color, color3, bird(rot_mat2(PI/4.)*z*sqrt(2.)+vec2(1.0,-1.)));
    color = mix(color, color4, bird(rot_mat2(3.*PI/4.)*z*sqrt(2.)+vec2(3,-5)));
    return color;
}

vec3 tile(vec2 z,int colorType){
    vec3 color;
    vec3 color1,color2,color3;
    
    color1 = pulse(0.0,colorType)*light+pulse(1.0,colorType)*mid+pulse(2.0,colorType)*dark+pulse(3.0,colorType)*light;
    color2 = pulse(0.0,colorType)*mid+pulse(1.0,colorType)*dark+pulse(2.0,colorType)*mid+pulse(3.0,colorType)*dark;
    color3 = pulse(0.0,colorType)*dark+pulse(1.0,colorType)*light+pulse(2.0,colorType)*light+pulse(3.0,colorType)*mid;
    /*    color1 = light;
    color2 = mid;
    color3 = dark;
    if (colorType == 1){
        color1 = mid;
        color2 = dark;
        color3 = light;
    } else if (colorType == 2){
        color1 = dark;
        color3 = light;        
    } else if (colorType == 3){
        color3 = mid;
        color2 = dark;
    }*/
    z = z * sqrt(2.)*2.;
    z *= rot_mat2(-3.*PI/4.);
    
    color = bird(z)*color1;
    z.x = 1.0-z.x;
    color = mix(color,color2,bird(rot_mat2(PI/4.)*z*sqrt(2.)+vec2(1.0,3.)));
    color = mix(color,color3,bird(rot_mat2(-PI/4.)*z*sqrt(2.)-vec2(3.,-1.0)));

    return color;
}
vec3 tiles(vec2 z){
    z = z * vec2(2.,1.);
    vec3 color = tile(z*rot_mat2(PI)+vec2(1.,1.),0)+tile(z*rot_mat2(PI/2.)-vec2(-1,1.),1);
    color = mix(color,mid,bird(z*rot_mat2(-PI/4.)*4.*sqrt(2.)+vec2(-2.,2.)));
    color = mix(color,light,bird(z*rot_mat2(-PI/2.)*vec2(-1.,1.)*4.+vec2(2.,-2.)));
    color = mix(color,mid,bird(z*rot_mat2(PI/2.)*vec2(-1.,1.)*4.+vec2(-2.,-10.)));
    color = mix(color, dark,bird(z*vec2(-1.,1.)*2.+vec2(2.,-4.)));
    color = mix(color,mid,bird(z*rot_mat2(-PI/4.)*4.*sqrt(2.)+vec2(-6.,6.)));

    return color;
}
vec3 tiles2(vec2 z){
    z = z * vec2(2.,1.);
    vec3 color = tile(z*rot_mat2(PI)+vec2(1.,1.),3)+tile(z*rot_mat2(PI/2.)-vec2(-1,1.),2);
    color = mix(color, mid,bird(z*vec2(-1.,1.)*2.+vec2(2.,-4.)));
    color = mix(color,light,bird(z*rot_mat2(-PI/2.)*vec2(-1.,1.)*4.+vec2(2.,-2.)));
    color = mix(color,dark,bird(z*rot_mat2(PI/2.)*vec2(-1.,1.)*4.+vec2(-2.,-10.)));
    color = mix(color,dark,bird(z*rot_mat2(-PI/4.)*4.*sqrt(2.)+vec2(-6.,6.)));
    color = mix(color,dark,bird(z*rot_mat2(-PI/4.)*4.*sqrt(2.)+vec2(-2.,2.)));
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
        if (z.y > 0.5) z *= rot_mat2(PI);
        /*if (mod(z.x,2./k)<1./k) {
            z = z.yx;
            z.y = 1.-z.y;
            color = 1;
        }*/
        return  vec3(tiles(fract(z*k*vec2(0.5,1.))));//,color));
    }else 
    if (mod(f(a_z.y)/k,2.)<1. ){
        z = z.yx;
        color = 3;
        z.y = 1.-z.y;
        if (z.y > 0.5) z *= rot_mat2(PI);
        /*if (mod(z.x,2./k)<1./k) {
            z = z.yx;
            z.y = 1.-z.y;
            color = 2;
        }*/
        return  vec3(tiles2(fract(z*k*vec2(0.5,1.))));//,color));
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
    const float scaleFactor=2.;
    vec2 uv = scaleFactor*(gl_FragCoord.xy-0.5*u_resolution.xy) / u_resolution.y;
    //aaScale = 0.0001;
    //animUVW(0.5*PI*u_time);
    gl_FragColor = vec4(vec3(color(uv)),1.000);
}
