// Author: 
// Title: 

#ifdef GL_ES
precision highp float;
#endif
#define PI2 6.28318530718
#define PI 3.14159265359

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
// Ray Marching Tutorial (With Shading)
// By: Brandon Fogerty
// bfogerty at gmail dot com
// xdpixel.com
 
// Ray Marching is a technique that is very similar to Ray Tracing.
// In both techniques, you cast a ray and try to see if the ray intersects
// with any geometry.  Both techniques require that geometry in the scene 
// be defined using mathematical formulas.  However the techniques differ
// in how the geometry is defined mathematically.  As for ray tracing,
// we have to define geometry using a formula that calculates the exact
// point of intersection.  This will give us the best visual result however
// some types of geometry are very hard to define in this manner.
// Ray Marching using distance fields to decribe geometry.  This means all
// we need to know to define a kind of geometry is how to mearsure the distance
// from any arbitrary 3d position to a point on the geometry.  We iterate or "march"
// along a ray until one of two things happen.  Either we get a resulting distance
// that is really small which means we are pretty close to intersecting with some kind
// of geometry or we get a really huge distance which most likely means we aren't
// going to intersect with anything.
 
// Ray Marching is all about approximating our intersection point.  We can take a pretty
// good guess as to where our intersection point should be by taking steps along a ray
// and asking "Are we there yet?".  The benefit to using ray marching over ray tracing is
// that it is generally much easier to define geometry using distance fields rather than
// creating a formula to analytically find the intersection point.  Also, ray marching makes
// certain effects like ambient occlusion almost free.  It is a little more work to compute
// the normal for geometry.  I will cover more advanced effects using ray marching in a later tutorial.
// For now,  we will simply ray march a scene that consists of a single sphere at the origin.
// We will not bother performing any fancy shading to keep things simple for now.
 
#ifdef GL_ES
precision mediump float;
#endif
 
uniform vec2 resolution;
 
float sphere( vec3 p, float radius )
{
    return length( p ) - radius;
}
 
//-----------------------------------------------------------------------------------------------
// The map function is the function that defines our scene.

float map( vec3 p )
{    
    return sphere( p, 1.0 );
}
 
vec3 getNormal( vec3 p )
{
    vec3 e = vec3( 0.001, 0.00, 0.00 );
    
    float deltaX = map( p + e.xyy ) - map( p - e.xyy );
    float deltaY = map( p + e.yxy ) - map( p - e.yxy );
    float deltaZ = map( p + e.yyx ) - map( p - e.yyx );
    
    return normalize( vec3( deltaX, deltaY, deltaZ ) );
}
 
float trace( vec3 origin, vec3 direction, out vec3 p )
{
    float totalDistanceTraveled = 0.0;
 
    for( int i=0; i <170; ++i)
    {
        // Here we march along our ray and store the new point
        // on the ray in the "p" variable.
        p = origin + direction * totalDistanceTraveled;
 
        // "distanceFromPointOnRayToClosestObjectInScene" is the 
        // distance traveled from our current position along 
        // our ray to the closest point on any object
        // in our scene.  Remember that we use "totalDistanceTraveled"
        // to calculate the new point along our ray.  We could just
        // increment the "totalDistanceTraveled" by some fixed amount.
        // However we can improve the performance of our shader by
        // incrementing the "totalDistanceTraveled" by the distance
        // returned by our map function.  This works because our map function
        // simply returns the distance from some arbitrary point "p" to the closest
        // point on any geometric object in our scene.  We know we are probably about 
        // to intersect with an object in the scene if the resulting distance is very small.
        float distanceFromPointOnRayToClosestObjectInScene = map( p );
        totalDistanceTraveled += distanceFromPointOnRayToClosestObjectInScene;
 
        // If our last step was very small, that means we are probably very close to
        // intersecting an object in our scene.  Therefore we can improve our performance
        // by just pretending that we hit the object and exiting early.
        if( distanceFromPointOnRayToClosestObjectInScene < 0.0001 )
        {
            break;
        }
 
        // If on the other hand our totalDistanceTraveled is a really huge distance,
        // we are probably marching along a ray pointing to empty space.  Again,
        // to improve performance,  we should just exit early.  We really only want
        // the trace function to tell us how far we have to march along our ray
        // to intersect with some geometry.  In this case we won't intersect with any
        // geometry so we will set our totalDistanceTraveled to 0.00. 
        if( totalDistanceTraveled > 10000.0 )
        {
            totalDistanceTraveled = 0.0000;
            break;
        }
    }
 
    return totalDistanceTraveled;
}
 
//-----------------------------------------------------------------------------------------------
// Standard Blinn lighting model.
// This model computes the diffuse and specular components of the final surface color.
vec3 calculateLighting(vec3 pointOnSurface, vec3 surfaceNormal, vec3 lightPosition, vec3 cameraPosition,vec3 diff)
{
    vec3 fromPointToLight = normalize(lightPosition - pointOnSurface);
    float diffuseStrength = clamp( dot( surfaceNormal, fromPointToLight ), 0.0, 1.0 );
    
    vec3 diffuseColor = diffuseStrength * diff;
    vec3 reflectedLightVector = normalize( reflect( -fromPointToLight, surfaceNormal ) );
    
    vec3 fromPointToCamera = normalize( cameraPosition - pointOnSurface );
    float specularStrength = pow( clamp( dot(reflectedLightVector, fromPointToCamera), 0.0, 1.0 ), 10.0 );
 
    // Ensure that there is no specular lighting when there is no diffuse lighting.
    specularStrength = min( diffuseStrength, specularStrength );
    vec3 specularColor = specularStrength * vec3( 1.0 );
    
    vec3 finalColor = diffuseColor;// + specularColor; 
 
    return finalColor;
}
 mat3 rotationMatrix3(vec3 v, float angle)
{  float c = cos(angle);
    float s = sin(angle);
    return mat3(c + (1.0 - c) * v.x * v.x, (1.0 - c) * v.x * v.y - s * v.z, (1.0 - c) * v.x * v.z + s * v.y,
        (1.0 - c) * v.x * v.y + s * v.z, c + (1.0 - c) * v.y * v.y, (1.0 - c) * v.y * v.z - s * v.x,
        (1.0 - c) * v.x * v.z - s * v.y, (1.0 - c) * v.y * v.z + s * v.x, c + (1.0 - c) * v.z * v.z
        );
}
vec3 domain(vec2 z){
//    return vec3(smoothstep(0.999,1.01,length(z)/1.));
    return vec3(hsv2rgb(vec3(atan(z.y,z.x)/PI2,1.,1.)));
}
vec2 cis(float a){
    return vec2(cos(a),sin(a));
}
vec2 projectToSphere(vec2 uv, out float distanceToClosestPointInScene){
    
    // We will need to shoot a ray from our camera's position through each pixel.  To do this,
    // we will exploit the uv variable we calculated earlier, which describes the pixel we are
    // currently rendering, and make that our direction vector.
    vec2 mouse_uv = ( u_mouse.xy / u_resolution.xy ) * 2.0 - 1.0;
    vec3 cameraPosition = vec3(0.,15.*cis(mouse_uv.y*PI/2.));
    vec3 cameraDirection = normalize( vec3( uv.x, uv.y, -10.0) );
    cameraDirection = cameraDirection * rotationMatrix3(vec3(1,0,0),-atan(cameraPosition.y, cameraPosition.z));//PI/4.);
    vec3 pointOnSurface;
    distanceToClosestPointInScene = trace( cameraPosition, cameraDirection, pointOnSurface );
    vec2 projected = pointOnSurface.xy / (1.-pointOnSurface.z);
    return projected;
}

//-----------------------------------------------------------------------------------------------
// This is where everything starts!
void main( void ) 
{
    vec2 uv = ( gl_FragCoord.xy / u_resolution.xy ) * 2.0 - 1.0;

    float dist;

    vec2 z = projectToSphere(uv,dist);
    if (dist > 0.){
        gl_FragColor = vec4( domain(z) , 1.0 );
    }
}