precision mediump float;
#define PI 3.14159265359
#define PI2 6.28318530718

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
float zoom = 0.5;
vec2 offset = vec2(0.5);

mat3 rotationMatrix3(vec3 v, float angle)
{  float c = cos(radians(angle));
    float s = sin(radians(angle));
    return mat3(c + (1.0 - c) * v.x * v.x, (1.0 - c) * v.x * v.y - s * v.z, (1.0 - c) * v.x * v.z + s * v.y,
        (1.0 - c) * v.x * v.y + s * v.z, c + (1.0 - c) * v.y * v.y, (1.0 - c) * v.y * v.z - s * v.x,
        (1.0 - c) * v.x * v.z - s * v.y, (1.0 - c) * v.y * v.z + s * v.x, c + (1.0 - c) * v.z * v.z
        );
}

vec3 radius(vec2 c,float r1, float r2, float angle){
    mat3 m =rotationMatrix3(vec3(0,0,1),angle);
    c = (m * vec3(c,0)).xy;
    return vec3( (smoothstep(r1,r1+.01, c.x) - smoothstep(r2,r2+.01,c.x) ) * 
                   (smoothstep(-0.02,-0.01,c.y) - smoothstep(0.01,0.02,c.y) ));
}
void addColor(inout vec3 base, vec3 new, vec3 amt){
    base = mix(base,new,amt);
}
vec3 circle(vec2 c, float r){
    return vec3( smoothstep(0.,.01,length(c)-r+0.02)-smoothstep(0.,.01,length(c)-r-0.02));
}
vec3 circles(vec2 z,float r1,float r2){
    vec3 col;
    addColor(col,vec3(0,1,0),radius(z, r1,r2,0.));
    addColor(col,vec3(0,0,1),radius(z, r1,r2,90.));
    addColor(col,vec3(1,1,0),radius(z, r1,r2,180.));
    addColor(col,vec3(1,0,1),radius(z, r1,r2,270.));
    addColor(col,vec3(1,0.5,0.5),circle(z,r1));
    addColor(col,vec3(1,0.5,0.5),circle(z,r2));
    return col;
}
float cosh(float val)
{
    float tmp = exp(val);
    float cosH = (tmp + 1.0 / tmp) / 2.0;
    return cosH;
}
float tanh(float val)
{
    float tmp = exp(val);
    float tanH = (tmp - 1.0 / tmp) / (tmp + 1.0 / tmp);
    return tanH;
}
float sinh(float val)
{
    float tmp = exp(val);
    float sinH = (tmp - 1.0 / tmp) / 2.0;
    return sinH;
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
vec2 cExp(in vec2 z){
    return vec2(exp(z.x)*cos(z.y),exp(z.x)*sin(z.y));
}
vec2 cLog(vec2 a) {
    float b =  atan(a.y,a.x);
    if (b>0.0) b-=2.0*3.1415;
    return vec2(log(length(a)),b);
}
vec2 cSqr(vec2 z) {
    return vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y);
}
vec2 cSin(vec2 z) {
    return vec2(sin(z.x)*cosh(z.y), cos(z.x)*sinh(z.y));
}
vec2 cCos(vec2 z) {
    return vec2(cos(z.x)*cosh(z.y), -sin(z.x)*sinh(z.y));
}
vec2 cPower2(vec2 z, vec2 a) {
    return cExp(cMul(cLog(z), a));
}


vec3 hash3( vec2 p ){
    vec3 q = vec3( dot(p,vec2(127.1,311.7)), 
                   dot(p,vec2(269.5,183.3)), 
                   dot(p,vec2(419.2,371.9)) );
    return fract(sin(q)*43758.5453);
}

float iqnoise( in vec2 x, float u, float v ){
//https://www.shadertoy.com/view/Xd23Dh
    vec2 p = floor(x);
    vec2 f = fract(x);

    float k = 1.0+63.0*pow(1.0-v,4.0);

    float va = 0.0;
    float wt = 0.0;
    for( int j=-2; j<=2; j++ )
    for( int i=-2; i<=2; i++ )
    {
        vec2 g = vec2( float(i),float(j) );
        vec3 o = hash3( p + g )*vec3(u,u,1.0);
        vec2 r = g - f + o.xy;
        float d = dot(r,r);
        float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );
        va += o.z*ww;
        wt += ww;
    }

    return va/wt;
}
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


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


vec2 projectToSphere(vec2 uv, out float distanceToClosestPointInScene){
    vec3 cameraPosition = vec3(0.,-10.026,10.260);
    
    // We will need to shoot a ray from our camera's position through each pixel.  To do this,
    // we will exploit the uv variable we calculated earlier, which describes the pixel we are
    // currently rendering, and make that our direction vector.
    vec3 cameraDirection = normalize( vec3( uv.x, uv.y, -10.0) );
    cameraDirection = cameraDirection * rotationMatrix3(vec3(1,0,0),44.);
    vec3 pointOnSurface;
    distanceToClosestPointInScene = trace( cameraPosition, cameraDirection, pointOnSurface );
    vec2 projected = pointOnSurface.xy / (1.-pointOnSurface.z);
    return projected;
}