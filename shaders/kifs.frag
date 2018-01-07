// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec3 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;

 vec2 fold(vec2 p, float ang){
    vec2 n=vec2(cos(-ang),sin(-ang));
    p-=2.*min(0.,dot(p,n))*n;
    return p;
}
#define PI 3.14159

vec3 tri_fold(vec3 pt) {
    pt.xy = fold(pt.xy,PI/3.);
    pt.xy = fold(pt.xy,-PI/3.);
    pt.yz = fold(pt.yz,PI/6.+.7);
    pt.yz = fold(pt.yz,-PI/6.);
    return pt;
}
vec3 tri_curve(vec3 pt) {
    for(int i=0;i<8;i++){
        pt*=2.;
        pt.x-=2.6;
        pt=tri_fold(pt);
    }
    return pt;
}
float DE(vec3 p){
    p.x+=1.5;
    p=tri_curve(p);
    return (length( p*.004 ) - .01);
}

vec3 getNormal( vec3 p )
{
    vec3 e = vec3( 0.001, 0, 0 );
    float dX = DE( p + e.xyy ) - DE( p - e.xyy );
    float dY = DE( p + e.yxy ) - DE( p - e.yxy );
    float dZ = DE( p + e.yyx ) - DE( p - e.yyx );
    
    return normalize( vec3( dX, dY, dZ ) );
}

float tracer( vec3 origin, vec3 direction, out vec3 p )
{
    float totalDistance = 0.0;

    for( int i=0; i<115; ++i)
    {
        // Here we march along our ray and store the new point
        // on the ray in the "p" variable.
        p = origin + direction * totalDistance;
        float dist = DE(p);
        totalDistance += dist;
        if( dist < 0.0001 ) break;
        if( totalDistance > 100000.0 )
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
vec3 lighting2(vec3 pointOnSurface, vec3 surfaceNormal, vec3 lightPosition, vec3 cameraPosition)
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


vec3 raymarch(vec2 uv){
    vec3 cameraPosition = vec3( 0., 0.0, -2.0 );
    vec3 cameraDirection = normalize( vec3( uv.x, uv.y, 1.0) );
    vec3 pointOnSurface;
    float distanceToClosestPointInScene = tracer( cameraPosition, cameraDirection, pointOnSurface );
    vec3 finalColor = vec3(0.0);
    if( distanceToClosestPointInScene > 0.0 )
    {
        vec3 lightPosition = vec3( 0.0, 0., -40.0 );
        vec3 surfaceNormal = getNormal( pointOnSurface );
        finalColor = lighting2( pointOnSurface, surfaceNormal, lightPosition, cameraPosition);
    }
    return finalColor;
}

void main( void ) 
{
    vec2 uv = ( gl_FragCoord.xy / u_resolution.xy ) * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y; 
   gl_FragColor = vec4( raymarch(uv), 1.0 );
}
