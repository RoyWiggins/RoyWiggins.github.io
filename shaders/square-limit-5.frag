// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec3 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;
float bird_shape(vec2 z){
    return 10.*(z.y+min(0.,abs(z.x+.5)-.5)+2.);
}
float bird(vec2 z){
    float color = bird_shape(z)*smoothstep(-0.001,0.001,-z.x);
    // rot 180
    color -= bird_shape(z*mat2(-1,0,0,-1)+vec2(0,-4))*smoothstep(0.,0.001,z.x);
    z *= mat2(1.,1.,-1.,1.);// rot 45, scale
    z.y += 4.;
    z = vec2(z.x,-z.y);
    color = min(color,bird_shape(z*.5));
    z *= mat2(0.,1.,-1.,0.);
    z += 4.;
    color = min(color,-bird_shape(-z*.5));
    return smoothstep(-0.001,.001,color);
}
const vec3 light = vec3(0.995,0.964,0.573);
const vec3 mid = vec3(0.995,0.663,0.261);
const vec3 dark = vec3(0.995,0.390,0.314);
vec3 colors(int n,bool cycleDir){
    n = n > 2? n-3: n;
    if (!cycleDir) n = 2 - n;
    return n == 2? mid: n == 1? dark: light;
}
vec3 three_birds(vec2 z, int t,bool s){
    vec3 color;
    z = z.yx;
    color = bird(z)*colors(t,s);
    color = mix(color,colors(1+t,s),bird(z*mat2(0,-1,1,0)));
    z = (z+vec2(-2.,-2.))*mat2(-.5,.5,.5,.5);
    color = mix(color,colors(2+t,s),bird(z));
    return color;
}
vec2 scale_f(vec2 x){
    return exp2(-floor(log2(x)));
}
vec3 center_tile(vec2 z){
    vec3 color = vec3(0);
    z = z.yx;
    z = z*4.-2.;
    z *= mat2(.5,.5,-.5,.5);

    for (int n=0;n<=1;n++){
        // modulo(int) doesn't seem to exist, two loops
        // seems to be the cleanest way to do this.
        for (int m=0;m<=1;m++){
            color += three_birds(z*2.+2.,m+1,m==1);
            z *= mat2(0,1,-1,0);
        }
    }
    return color;
}
vec3 corner_tile(vec2 z,bool type){
    z = z.yx;
    z = z*4.-2.;
    int t = int(type);
    vec3 color = vec3(0);
    z *= mat2(.5,.5,-.5,.5);
    if ( t == 1 )
        z *= mat2(0,1,-1,0);

    color += three_birds(z*2.+2.,1+t,0+t ==1);
    z *= mat2(0,1,-1,0);
    color += three_birds(z*2.+2.,2-t,1-t ==1);
    z *= mat2(0,1,-1,0) * mat2(1,1,-1,1);
    color = mix(color,colors(0,true),bird(z));
    z *= mat2(0,-1,1,0);
    color = mix(color,colors(2-t,true),bird(z));
    z *= mat2(0,-1,1,0);
    color = mix(color,colors(1+t,true),
                bird(z+vec2(0.,-4.)));
    z *= mat2(0,-1,1,0);
    color = mix(color,colors(2,false),
                bird(z+vec2(0.,-4.)));
    return vec3(color);
}

vec3 side_tiles(vec2 z,int colStart,bool cycleDir){
    z = -z*4. + vec2(6,2);
    vec3 col = three_birds(z,colStart,cycleDir);
    vec3 tile2 = three_birds(z*mat2(0,1,-1,0)+vec2(0,4)
,1+colStart,cycleDir);
    col = max(vec3(0.),col - tile2)+tile2;

    // fill in around the edge
    // Left and right
    col = mix(col, colors(2+colStart,cycleDir),
                   bird(z*mat2(0,-1,-1,0)-vec2(0,4)));
    col = mix(col, colors(  colStart,cycleDir),
                   bird(z*mat2(0,1,1,0)-vec2(0,8)));

    // Big top bird
    col = mix(col,colors(1+colStart,cycleDir),
                  bird((z-2.)*mat2(-.5,0,0,.5)+vec2(0.,-2.)));
    // Small bottom birds.
    z.x = mod(z.x-2.,4.)+2.;
    col = mix(col,colors(colStart,cycleDir),
                  bird((z-2.)*mat2(1,1,-1,1)+vec2(2.,6.)));
    col = mix(col,colors(2+colStart,cycleDir),
                  bird((z+vec2(-2,2))*mat2(1,-1,1,1)-2.));
    return col;
}
vec3 color(vec2 z) {
    if (z.y < 0.) z=-z; 
    z = (z+1.)*.75; 
    vec2 a_z = .75-abs(z-.75);
    vec2 scale = scale_f(a_z);
    if (scale.x == scale.y) {
        if (scale.x == 2.)// Center square
              return center_tile(z*2.-1.);
        else // 'Corner' squares
            return corner_tile(mod(z*scale,1.),z.x>1.); 
    } else if (scale.x < scale.y){
        // Top and bottom
        return side_tiles(mod(z*scale.y,2.),0,false);
    } else { //scale.x > scale.y
        // Left and right
        // Rotate around so the right-hand side is correct:
        if (z.x > 1.) z = -z;
        z = vec2(z.y,-z.x); // 90 degree rotation
        return side_tiles(mod(z*scale.x,2.),1,true);
    }
    return vec3(0);
}
void main(){
    vec2 st = (gl_FragCoord.xy/u_resolution.xy)*2.-1.;
    st.x *= u_resolution.x/u_resolution.y;
    gl_FragColor = vec4(color(st),1.0);
}
