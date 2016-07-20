
vec2 unproject(vec2 z){
    float longitude = 1.-(atan(z.y,z.x)+PI)/(2.*PI);
    float latitude = 1.-2.*atan(1./length(z))/PI;
    return vec2(longitude,latitude);
}
vec2 theta1(vec2 z){
    vec2 u = vec2(1,0);
    vec2 tau = vec2(0.360,0.380);
    vec2 q = cExp(cMul(vec2(0,PI),tau));
    
    for (int n=1; n<7; n++){
        u = u + 2. * cPower(q,float(n*n))*cCos(PI2*float(n)*z);
    }
    return u;
}
vec3 domain(vec2 z){
    // r1=0.7, r2=1.4:
    //z = droste_(z,0.7,1.4);


    z = z * 3.;
    z = theta1(z);
    
    //return texture2D(u_tex0,unproject(z)).xyz;
    return phase_portrait(z);
}
vec3 color(vec2 z) {
    float onSphere=1.0;
    //z = z * 3.;
    //z = sphereViewer(z,onSphere); 
    return onSphere>0.? domain(z): vec3(0);
}