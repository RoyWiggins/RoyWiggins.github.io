vec3 project(vec2 z){
    return vec3(2.*z,1.-space*dot(z,z))*1./(1.+space*dot(z,z));
}
vec3 color(vec2 z) {
    vec3 w = vec3(2.*z,1.-space*dot(z,z))*1./(1.+space*dot(z,z));
    vec3 w2 = w;
    // Apply hyperbolic rotation
    vec2 pt = (u_mouse/u_resolution-.5)*2.; vec2(0.130,0.100);
    float t = u_time*2. + atan(pt.y,pt.x);
    
    vec3 ptw = project(pt);
    vec2 pty = vec2(sqrt(dot(ptw.xy,ptw.xy)),ptw.z);

    pt /= length(pt);
    pt = -pt.yx;
    w.xy = w.xy * mat2(pt.y,pt.x,-pt.x,pt.y);

    w.xz = w.xz * mat2(pty.y,pty.x,
                       pty.x,pty.y); 

    w.xy = w.xy * mat2(cos(t),-sin(t),sin(t),cos(t));
    vec3 c = min(3.*calc(w2),1.);
    if (abs(w.x)<.1 && abs(w.y)<1.5)
        return c*10.*abs(w.x)+(1.-10.*abs(w.x))*vec3(1,0,0);
    if (abs(w.y)<.1 && abs(w.x)<1.5)
        return c*10.*abs(w.y)+(1.-10.*abs(w.y))*vec3(1,0,0);

    return c;
//    return calc(w);
}