#ifdef GL_ES
precision mediump float;
#endif
 
uniform vec2 u_resolution;
 
float sphere( vec3 p, float radius )
{
    return length( p ) - radius;
}
 
float map( vec3 p )
{    
    return sphere( p, 3.0 );
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

    for( int i=0; i<32; ++i)
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
    vec3 cameraPosition = vec3( 0.0, 0.0, -10.0 );
    vec3 cameraDirection = normalize( vec3( uv.x, uv.y, 1.0) );
    vec3 pointOnSurface;
    float distanceToClosestPointInScene = trace( cameraPosition, cameraDirection, pointOnSurface );
    vec3 finalColor = vec3(0.0);
    if( distanceToClosestPointInScene > 0.0 )
    {
        vec3 lightPosition = vec3( 0.0, 4.5, -10.0 );
        vec3 surfaceNormal = getNormal( pointOnSurface );
        finalColor = calculateLighting( pointOnSurface, surfaceNormal, lightPosition, cameraPosition );
    }
    
    gl_FragColor = vec4( finalColor, 1.0 );
}