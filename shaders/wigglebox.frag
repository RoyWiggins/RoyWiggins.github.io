 #ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
float PI = 3.14159;
 vec2 cLog(vec2 a) {
    float b =  atan(a.y,a.x);
    if (b>0.0) b-=2.0*3.1415;
    return vec2(log(length(a)),b);
}
vec2 cMul(vec2 a, vec2 b) {
    return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);
}
vec2 cInverse(vec2 a) {
    return  vec2(a.x,-a.y)/dot(a,a);
}
vec2 cDiv(vec2 a, vec2 b) {
    return cMul( a,cInverse(b));
}
vec2 cExp(in vec2 z){
    return vec2(exp(z.x)*cos(z.y),exp(z.x)*sin(z.y));
}
vec2 droste_(vec2 z,float r1, float r2) {
    z = cLog(z);
    float scale = log(r2/r1);
    float angle = atan(scale/(2.0*PI));
    
    z = cDiv(z, cExp(vec2(0,angle))*cos(angle)); 
    //z.x = mod(z.x,scale);
    z = cExp(z)*r1;
    return z;
}
float fTorus(vec3 p, float smallRadius, float largeRadius) {
	return length(vec2(length(p.xz) - largeRadius, p.y)) - smallRadius;
}
float sphere( vec3 p, float radius )
{
    return length( p ) - radius;
}

float wiggle(vec3 p){
    float n = 3./PI*2.;
    return p.x+.3*sin(sin(u_time)*PI*2.)*(sin(p.y*n)+sin(p.z*n));
}
float map( vec3 p )
{    
    float ang = PI/4.;
    float si = sin(ang); float co = cos(ang);
   mat3 cam_mat = mat3(
      co, 0., si, 
      0., 1., 0., 
     -si, 0., co );
   si = sin(ang); co = cos(ang);
   cam_mat *= mat3(
      1., 0., 0., 
      0., co, si, 
      0.,-si, co);
    p *= cam_mat;

	float k = wiggle(p.zyx)-5.;
    k = max(k,-(wiggle(p.zyx)+5.));
    k = max(k,-(wiggle(p)+5.));
    k = max(k,wiggle(p)-5.);
	k = max(k,-(wiggle(p.yxz)+5.));  
    k = max(k,wiggle(p.yxz)-5.);  
    return k;
}
 
vec3 getNormal( vec3 p )
{
    vec3 e = vec3( 0.001, 0, 0 );
    float dX = map( p + e.xyy ) - map( p - e.xyy );
    float dY = map( p + e.yxy ) - map( p - e.yxy );
    float dZ = map( p + e.yyx ) - map( p - e.yyx );
    
    return normalize( vec3( dX, dY, dZ ) );
}
 
float trace( vec3 origin, vec3 direction, out vec3 p )
{
    float totalDistance = 0.0;

    for( int i=0; i<42; ++i)
    {
        // Here we march along our ray and store the new point
        // on the ray in the "p" variable.
        p = origin + direction * totalDistance;
        float dist = map(p);
        totalDistance += dist;
        if( dist < 0.0001 ) break;
        if( totalDistance > 10000.0 )
        {
            totalDistance = 0.;
            break;
        }
    }
 
    return totalDistance;
}
 
//-----------------------------------------------------------------------------------------------
// Standard Blinn lighting model.
// This model computes the diffuse and specular components of the final surface color.
vec3 calculateLighting(vec3 pointOnSurface, vec3 surfaceNormal, vec3 lightPosition, vec3 cameraPosition)
{
    vec3 fromPointToLight = normalize(lightPosition - pointOnSurface);
    float diffuseStrength = clamp( dot( surfaceNormal, fromPointToLight ), 0.0, 1.0 );
    
    vec3 diffuseColor = diffuseStrength * vec3( 1.0, 0.0, 0.0 );
    vec3 reflectedLightVector = normalize( reflect( -fromPointToLight, surfaceNormal ) );
    
    vec3 fromPointToCamera = normalize( cameraPosition - pointOnSurface );
    float specularStrength = pow( clamp( dot(reflectedLightVector, fromPointToCamera), 0.0, 1.0 ), 10.0 );
 
    // Ensure that there is no specular lighting when there is no diffuse lighting.
    specularStrength = min( diffuseStrength, specularStrength );
    vec3 specularColor = specularStrength * vec3( 1.0 );
    
    vec3 finalColor = diffuseColor + specularColor; 
 
    return finalColor;
}
 
//-----------------------------------------------------------------------------------------------
// This is where everything starts!
void main( void ) 
{
    vec2 uv = ( gl_FragCoord.xy / u_resolution.xy ) * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;
    vec3 cameraPosition = vec3( 0.0, 0.0, -14.0 );
    vec3 cameraDirection = normalize( vec3( uv.x, uv.y, 1.0) );
    vec3 pointOnSurface;
    float distanceToClosestPointInScene = trace( cameraPosition, cameraDirection, pointOnSurface );
    vec3 finalColor = vec3(0.0);
    if( distanceToClosestPointInScene > 0.0 )
    {
        vec3 lightPosition = vec3( 0, 0, -70.0 );
        vec3 surfaceNormal = getNormal( pointOnSurface );
        finalColor = calculateLighting( pointOnSurface, surfaceNormal, lightPosition, cameraPosition );
    }
    
    gl_FragColor = vec4( finalColor, 1.0 );
}