
<div class="codeAndCanvas" data="vec2 f(vec2 z){
    z = z * 1.;
    return cPower(z,3.)+vec2(1);
}
vec3 domain(vec2 z){
    float r1=.5,r2=1.;
    z = droste_(z,r1,r2);
    return planetaryLinkage(z);
}

vec3 color(vec2 z) {
    float dist=1.;
    z = z * 3.-vec2(0.,0);
    z = f(z);
    z = cDiv((z+vec2(-1,0.000)),(z-vec2(-10,-0.00)));
    float onSphere;
    z = sphereViewer(z,onSphere); 
    if (onSphere > 0.)
    	return domain(z);
    return vec3(0);}"></div>