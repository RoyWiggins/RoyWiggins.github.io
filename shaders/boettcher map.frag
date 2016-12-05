vec2 cpow( vec2 z, float n ) { float r = length( z ); float a = atan( z.y, z.x ); return pow( r, n )*vec2( cos(a*n), sin(a*n) ); }

float grid( in vec2 p )
{
    vec2 q = 16.0*p;
    vec2 r = fract( q );
    float fx = smoothstep( 0.05, 0.06, r.x ) - smoothstep( 0.94, 0.95, r.x );
    float fy = smoothstep( 0.05, 0.06, r.y ) - smoothstep( 0.94, 0.95, r.y );
        
    return 0.5 + 0.5*mod( floor(q.x+0.)+floor(q.y), 2.0 );
}

vec2 f(vec2 z,vec2 c){    
    z = cPower2(z,vec2(2.,0));
    return z = z+c;
}

vec3 domain(vec2 z){

    //if (length(z) < 1.)
    return vec3(hsv2rgb(vec3(atan(z.y,z.x)/PI2,1.,1.)));
    return vec3(0.);
}

vec3 color(vec2 z) {
    float dist=1.;
    z = z * 2.-vec2(0.010,0.000);
    vec2 c = vec2(0.350,-0.330);
    const int n = 39;
    vec2 phi = z;
    float k = 0.;
    for (int i=0; i<n;i++){

        if( dot(z,z)>20.0 ) continue;
        k = k+1.;
        // point
        z = cMul(z,z) + c;
        vec2 a = cDiv(z,z-c);
        float s = pow( 0.5, k );
        // phi
        phi = cMul( phi, cpow(a, s) );
    }

    
    if (k < float(n)) {
        return vec3(grid(phi*0.3));
    }
    return vec3(0);
}