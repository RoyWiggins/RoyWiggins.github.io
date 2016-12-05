// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif
const vec3 light = vec3(0.995,0.964,0.573);
const vec3 mid = vec3(0.995,0.663,0.261);
const vec3 dark = vec3(0.995,0.390,0.314);


uniform vec2 u_resolution;
uniform vec3 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
uniform float shape; //-1.0;1;2.0
float PI = 3.1415;

float bird_shape(vec2 z){
    float d = min(0.,sin(z.x*PI))*2.+(z.y+2.0)*10.;
   
    float c = 10.*(min(z.y-.5,abs(z.x+.5)+z.y-1.)+2.5);

    return c;//mix(c,d,shape);
}
float bird(vec2 z){
    float color;
    color = bird_shape(z);
    color *= smoothstep(0.,0.001,-z.x);
    // rot 180
    color += -bird_shape(z*mat2(-1,0,0,-1)+vec2(0.,-4.))* smoothstep(0.,0.001,z.x);;
    
    z *= mat2(1.,1.,-1.,1.);// rot 45, scale
    z.y += 4.;
    z = vec2(z.x,-z.y);
    color = min(color,bird_shape(z*.5));//= min(color,bird_shape(z*.5));
    z *= mat2(0.,1.,-1.,0.);
    z += 4.;

    color = min(color,-bird_shape(-z*.5));
    color = min(fract(color),color);
    color = smoothstep(0.,1.,1.0-abs(color-.5)*2.);
    
    color = pow(color,.45);
/*     // ro
    z -= vec2(-12,-10.);
    color = min(color,1.-bird_shape(-z*.5));
    //color = smoothstep(0.4,0.5,color);
/*  z *= mat2(0.,1.,1.,0.);
    color = min(color,bird_shape(-z*.5+1.)-10.);
    color = smoothstep(-.1,0.0,color);*/
    
    /*color = bird_shape(z) < 10.-z.y*10.-30. ? 0.:1.;
    z = z * mat2(1.,1.,-1.,1.);
    color *= bird_shape(z*.5) > z.y*5. ? 1.:0.;
    z = z * mat2(0.,1.,1.,0.);
    color *= bird_shape(z*.5) > -z.y*5. ? 0.:1.;
    */
    
    return fract(color);

}
vec3 side_colors(int n,int cycleDir){
    n = n > 2? n-3: n;
    if (cycleDir == 0)
        return n == 2? light: n == 1? dark: mid;
    return n == 2? mid: n == 1? dark: light;
}
vec3 side_tile(vec2 z, int t,int s){
    vec3 color;
    z = z.yx;
    color = bird(z)*side_colors(t,s);
    color = mix(color,side_colors(1+t,s),bird(z*mat2(0,-1,1,0)));
    color = mix(color,side_colors(2+t,s),bird((z+vec2(-2.,-2.))*mat2(-.5,.5,.5,.5)));
    return color;
}
float old_bird(vec2 z){
    float e = .0001;
    float color = smoothstep(-1.-e,-1.,-abs(z.y*-2.-3.));
    color *= smoothstep(-e,0.,-max(z.y-z.x,z.x+z.y))-smoothstep(1.,1.+e,-max(z.y-z.x,z.x+z.y+1.));
    color = mix(color,1.,smoothstep(-1.-e,-1.,-abs(2.*z.x-1.))*step(0.,-z.y)*(1.-smoothstep(1.,1.+e,-min(z.y-z.x+2.,z.x+z.y+1.))));
    color *= smoothstep(.1,.15,length(z+vec2(1.,1.5)));
    return color;
}

vec3 center_tile(vec2 z){
    vec3 color = vec3(0);
    z = z.yx;
    z = z*4.-2.;
    z *= mat2(.5,.5,-.5,.5);

    for (int n=0;n<=1;n++){
        for (int m=0;m<=1;m++){
            color += side_tile(z*2.+2.,m+1,m);
            z *= mat2(0,1,-1,0);
        }
    }
    return color;
}
vec3 corner_tile(vec2 z,int t){
    z = z.yx;
    z = z*4.-2.;
    
    vec3 color = vec3(0);
    z *= mat2(.5,.5,-.5,.5);
    if ( t == 1 ){
    z *= mat2(0,1,-1,0);
    }
    color += side_tile(z*2.+2.,1+t,0+t);
    z *= mat2(0,1,-1,0);
    color += side_tile(z*2.+2.,2-t,1-t);
    z *= mat2(0,1,-1,0) * mat2(1,1,-1,1);
    color = mix(color,side_colors(0,1),bird(z));
    z *= mat2(0,-1,1,0);
    color = mix(color,side_colors(2-t,1),bird(z));
    z *= mat2(0,-1,1,0);
    color = mix(color,side_colors(1+t,1),bird(z+vec2(0.,-4.)));
    z *= mat2(0,-1,1,0);
    color = mix(color,side_colors(2,0),bird(z+vec2(0.,-4.)));

    return vec3(color);
}


vec3 side_tiles(vec2 z,int firstColor,int colorDirection){
    z = z*mat2(-1,0,0,-1)*4.*vec2(2.,1) + vec2(6.,2);
    vec3 color = side_tile(z,0+firstColor,colorDirection);
    vec3 tile2 = side_tile(z*mat2(0,1,-1,0)+vec2(0,4)
,1+firstColor,colorDirection);
        color = max(vec3(0.),color - tile2)+tile2;

    // fill in
    color = mix(color, side_colors(2+firstColor,colorDirection), bird(z*mat2(0,-1,-1,0)-vec2(0,4)));
    color = mix(color, side_colors(0+firstColor,colorDirection), bird(z*mat2(0,1,1,0)-vec2(0,8)));

    color = mix(color,side_colors(1+firstColor,colorDirection),bird((z+vec2(-2.,-2.))*mat2(-.5,0,0,.5)+vec2(0.,-2.)));
    z.x = mod(z.x-2.,4.)+2.;
    color = mix(color,side_colors(0+firstColor,colorDirection),bird((z+vec2(-2.,-2.))*mat2(1,1,-1,1)+vec2(2.,6.)));
    color = mix(color,side_colors(2+firstColor,colorDirection),bird((z+vec2(-2,2))*mat2(1,-1,1,1)+vec2(-2,-2)));

    return color;

}
vec2 scale_f(vec2 x){
    return exp2(-floor(log2(x)));
}

vec3 limit(vec2 z) {
    if (z.y < -.25) {
        z = mat2(-1,0,0,-1)*z;
    }
    z = (z+1.)*.75; 
    vec2 a_z = .75-abs(z-.75);
    vec2 scale = scale_f(a_z);
    if (scale.x == scale.y) {
        if (scale.x == 2.) {// Center square
              return center_tile(z*2.-1.);
        }
        else { // 'Corner' squares
            return corner_tile(mod(z*scale+vec2(z.x<.75?1:0,0),vec2(2)),z.x<.75? 0:1); 
        }
    } else if (scale.x < scale.y){
        // Top and bottom
        return side_tiles(mod(z*scale.y*vec2(.5,1.),vec2(1.,2)),0,0);
    } else { //scale.x > scale.y
        // Left and right
        if (z.x > 0.75)
            z *= mat2(-1,0,0,-1);
        return side_tiles(mod(z*mat2(0,1,-1,0)*scale.x*vec2(.5,1.),vec2(1.,2)),1,1);
    }
    return vec3(0);
}

void main() {
    vec2 st = 2.*gl_FragCoord.xy/u_resolution.xy-1.;
    st.x *= u_resolution.x/u_resolution.y;
    st = st*5.-2.5;
    vec3 color = vec3(bird(st));
    gl_FragColor = vec4(color,1.0);
}
