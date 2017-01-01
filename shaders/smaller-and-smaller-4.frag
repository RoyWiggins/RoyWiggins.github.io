// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

vec2 cMul(vec2 a, vec2 b) {return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);}
vec2 cPower(vec2 z, float n) {
    float r2 = dot(z,z);
    return pow(r2,n/2.0)*vec2(cos(n*atan(z.y,z.x)),sin(n*atan(z.y,z.x)));
}
vec2 cInverse(vec2 a) {return  vec2(a.x,-a.y)/dot(a,a);}
vec2 cDiv(vec2 a, vec2 b) { return cMul( a,cInverse(b));}
vec2 cExp(in vec2 z){return vec2(exp(z.x)*cos(z.y),exp(z.x)*sin(z.y));}
vec2 cLog(vec2 a) {
    float b =  atan(a.y,a.x);
    if (b>0.0) b-=2.0*3.1415;
    return vec2(log(length(a)),b);
}


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
    //return abs(1.-color);
    return smoothstep(-.01,0.001,color);
    //return 1.-smoothstep(0.,1.,abs(-color));;
}
/*
const vec3 light = vec3(0.953,0.995,0.963);
const vec3 mid = vec3(0.995,0.548,0.315);
const vec3 dark = vec3(0.235,0.135,0.078);

*/
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
vec3 corner_tile(vec2 z,bool type, bool c){
    z = z*4.-2.;
    int t = int(type);
    vec3 color = vec3(0);
    z *= mat2(.5,.5,-.5,.5);
    z = z.yx;
    if ( t == 0 )
        z *= mat2(0,1,-1,0);
	z = z.yx;
    color = mix(color,colors(3,type == !c),
                bird(z+vec2(0.,-2.)));
    color = mix(color,colors(2,type == !c),
                bird(-z+vec2(0.,-2.)));
    color = mix(color,colors(2-int(type),type == !c),
                bird(-z+vec2(0.,1.)));
    color = mix(color,colors(1-int(type),type == !c),
                bird(z*mat2(1,1,1,-1)*.5+vec2(1.,-3.)));
    return vec3(color);
}

vec3 side_tiles(vec2 z,int colStart,bool cycleDir){
    z = -z*4. + vec2(6,2);
    vec3 col = three_birds(-z,1+colStart,!cycleDir);
    vec3 tile2 = three_birds(-z*mat2(0,1,-1,0)+vec2(0,-4)
,1+colStart,!cycleDir);
    col = max(vec3(0.),col - tile2)+tile2;

    col = mix(col,colors(2+colStart,cycleDir),
                  bird((z.yx*-1.)*mat2(1,1,1,-1)+vec2(2.,2.)));
    col = mix(col,colors(colStart,cycleDir),
                  bird((z.yx*-1.)*mat2(1,1,1,-1)+vec2(6.,-2.)));
    col = mix(col,colors(2+colStart,cycleDir),
          bird((z.yx)*mat2(0,1,-1,0)*.5+vec2(1.,-3.)));

    col = mix(col,colors(2+colStart,cycleDir),
                  bird((-z.yx)*mat2(-1,1,1,1)*.5+vec2(4.,2.)));
    return col;
}
vec3 color(vec2 z) {
    z = (z+3.)*.25; 
    vec2 a_z = abs(z-.75);
    vec2 scale = scale_f(a_z);
    float scale_2 = scale_f(vec2(max(a_z.x,a_z.y))).x;
    bool every_other = bool(mod(log2(scale_2),2.));
    if (scale.x == scale.y) {
        vec2 w = z;
        if (z.y  < .75 )
            z = -z;
        return corner_tile(mod(z*scale_2,1.),((w.x>.75 && w.y>.75) ||
                          					 (w.x<.75 && w.y<.75)) , every_other ); 
    } else if (scale.x < scale.y){
        // Top and bottom
        z.y = -z.y;
        if (z.x  > .75 )
            z = -z;
        return side_tiles(mod(-z.yx*scale.x+1.,vec2(2,1)),1,every_other);

    } else { //scale.x > scale.y
        if (z.y  < .75 )
            z = -z;
        return side_tiles(mod(z*scale.y+1.,vec2(2,1)),1,every_other);

    }
    return vec3(0);
}

float PI = 3.14159;
void main(){
    vec2 st = (gl_FragCoord.xy/u_resolution.xy)*2.-1.;
    st.x *= u_resolution.x/u_resolution.y;
    st *= .5;
    float ratio = pow(4.,4.);
    float angle = atan(log(ratio)/(2.0*PI));
    st = cLog(st);
    st = cDiv(st, cExp(vec2(0,angle))*cos(angle));
    st = cExp(st+vec2(mod(u_time,4.19)-4.,0));
    gl_FragColor = vec4(vec3(color(st)),1.0);
}
