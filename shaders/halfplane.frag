// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec2 cis(float a){
    return vec2(cos(a),sin(a));
}
vec2 cMul(vec2 a, vec2 b) {
    return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);
}
vec2 cPower(vec2 z, float n) {
    float r2 = dot(z,z);
    return pow(r2,n/2.0)*vec2(cos(n*atan(z.y,z.x)),sin(n*atan(z.y,z.x)));
}
vec2 cInverse(vec2 a) {
    return  vec2(a.x,-a.y)/dot(a,a);
}
vec2 cDiv(vec2 a, vec2 b) {
    return cMul( a,cInverse(b));
}
vec2 cConj(vec2 z) {
    return vec2(z.x,-z.y);
}

//-------
float slope(vec2 a, vec2 b){
    vec2 k = a-b;
    return k.y/k.x;
}
vec3 circle(vec2 c, float r){
    return vec3( smoothstep(0.,.01,length(c)-r+0.006)-smoothstep(0.,.01,length(c)-r-0.002));
}
// Draw the arc on a circle between pta and ptb
vec3 arc(vec2 z, vec2 center, float r, vec2 pta, vec2 ptb){
    vec2 c = (pta+ptb)/2.;
    vec3 color = circle(z-center,r)*smoothstep(-0.001,0.001,length(pta-c)-length(z-c));
    return color;
}
// Invert across a non-degenerate circle
vec2 invert(vec2 z, vec3 line){
    if (dot(line,line)==0.){
        return vec2(z.x,-z.y);
    }
    return cInverse(cConj(z-line.xy)/line.z)*line.z+line.xy;
}
// Intersect a non-vertical line with the horizontal
vec2 intersect_horizontal(vec2 pt, float slope){
    return vec2((-pt.y / slope) + pt.x ,0.);
}
vec3 calculate_line_between(vec2 A, vec2 B){
    vec3 line;
    if (abs(B.x-A.x) < 0.00001){
        return vec3(0);
    }
    float slope = -( B.x - A.x ) / (B.y - A.y);
    line.xy = intersect_horizontal((A+B)/2.,slope);
    line.z = length(A-line.xy);
    return line;
}
vec3 hline(vec2 z,vec2 A, vec2 B, out vec3 line){
    line = calculate_line_between(A,B);
    /*if (dot(line,line) == 0.){
        return vec3(0.);
    }*/
    return arc(z,line.xy,line.z,A,B);
}

vec3 full_line(vec2 z, vec3 line){
    return circle(z-line.xy,line.z)*smoothstep(0.,0.,z.y);
}

void calculate_perpendicular_line(vec2 A, vec2 B, out vec3 line){
    line.xy = intersect_horizontal(A,-1./slope(A,B));
    line.z = length(A - line.xy);
}

void invert3(inout vec2 z1, inout vec2 z2, inout vec2 z3, vec2 center, float radius){
    z1 = cInverse(cConj(z1-center)/radius)*radius+center;
    z2 = cInverse(cConj(z2-center)/radius)*radius+center;
    z3 = cInverse(cConj(z3-center)/radius)*radius+center;
}

vec3 triangle(vec2 z,vec2 A, vec2 B, float angle, out vec2 C, out vec3 AB,out vec3 AC, out vec3 BC){
    vec3 color = vec3(0.);
    
    color = color + hline(z,A,B, AB);

    float angle_at_A = atan(-1./slope(AB.xy,A));
    vec2 handle = A+cis(angle_at_A+radians(angle));
    calculate_perpendicular_line(B,AB.xy,BC);
    calculate_perpendicular_line(A,handle,AC);
    C = AC.xy;
    float d = BC.x-AC.x;
    // Circle-circle intersection
    C.x = (pow(AC.z,2.)-pow(BC.z,2.)+pow(d,2.))/(2.*d);
    C.y = sqrt(pow(AC.z,2.)-pow(C.x,2.));
    C.x += AC.x;

    color = color + arc(z,AC.xy,AC.z,A,C);
    color = color + arc(z,BC.xy,BC.z,B,C);
    return color;
}
const int nSides = 5;
vec3 ngon(vec2 z, vec2 A, vec2 B, out vec2 C, out vec3[nSides] sides, out vec2[nSides] Bs){
    vec3 color;
    vec3 AB,AC, BC;
    const float angle = 180./float(nSides);
	color = color ;+ triangle(z,A,B,angle, C,AB, AC, BC);
    for (int i=0; i<nSides;i++){
        z = invert(z,AB);
        //C = invert(C,AB);
        
        color = color + hline(z,B,C, BC);
        color = color + hline(z,A,C, BC);
        z = invert(z,BC);
        //B = invert(B,BC);
        color = color + hline(z,A,B, AB);
        color = color + hline(z,B,C, BC);
        sides[i] = BC;
        Bs[i] = B;
    }
    return color;
}

vec3 marker(vec2 z,vec2 c){
    return circle(z-c,0.03);

}
vec3 color(vec2 z){
    vec2 A = vec2(0,1);
    vec2 B = A+vec2(0.720,0.000);
    vec2 C;
    //z = cDiv(cMul(z-vec2(0,1),vec2(1,1)),cMul(z+vec2(0,1),vec2(1,-1)));
    //z = cMul(cis(radians(36.)),z);
    //z = cInverse(cDiv(cMul(z-vec2(0,1),vec2(1,1)),cMul(z+vec2(0,1),vec2(1,-1))));

    //z = cInverse(cDiv(cMul(z-vec2(-0.,1.),vec2(1,1)),cMul(z+vec2(0,1),vec2(1,-1))));
    vec2 pt2 = vec2(0,-1./A.y);
    /*z = cDiv(cMul(z-pt2,vec2(1,0)-A
                          )
                     ,cMul(z-A,
                           vec2(1,0)-pt2
                          ))
                      ;
     */           
//    z = cDiv(z+A,cMul(A,z));
    
    vec3 color;
    //color = color + circle(z-k,.5);
    //z = invert(z,k, .5);
    color = color + marker(z,A);
    color = color + marker(z,B);
	
    vec2 w;
    vec3 sides[nSides], t[nSides];
    vec2 Bs[nSides], s[nSides];
    vec2 newA;
	color = color + ngon(z, A, B, C, sides, Bs);
    
    B = Bs[4];
    A = invert(z,sides[4]);
    color = color + ngon(z, A, B, w, t,s);
//    color = color + ngon(z, A, B, w, t,s);

	//color = color + full_line(z,sides[4]);
    //color = color + ngon(z, A, B, C, sides);
    
//    color = color + circle(z-AB_center,.02);
//    color = color + circle(z-BC_center,.02);
/*    for (int i=0; i<sides;i++){
        C = invert(C,AB_center,length(AB_center-A));
        color = color + hline(z,B,C, BC_center);
        color = color + hline(z,A,C, AC_center);
        B = invert(B,AC_center,length(AC_center-C));
        color = color + hline(z,B,C, BC_center);
        color = color + hline(z,A,B, AB_center);
    }*/




//    color = color + line(z,A,C);
//    color = color + line(z,B,C);

    return color;
}
void main() {
    vec2 z = gl_FragCoord.xy/u_resolution.xy;
    z.x *= u_resolution.x/u_resolution.y;

    z = (z-vec2(0.490,0.470))*2.;
    z = cInverse(cDiv(cMul(z-vec2(0,1),vec2(1,1)),cMul(z+vec2(0,1),vec2(1,-1))));
    vec3 color_ = vec3(smoothstep(-0.01,0.01,z.y)*(1.-smoothstep(-0.01,0.01,z.y)))*5.;
    color_ = color_ + vec3(smoothstep(-0.01,0.01,z.x)*(1.-smoothstep(-0.01,0.01,z.x)))*5.;
    gl_FragColor = vec4(color_+color(z),1.0);
}