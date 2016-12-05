// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec3 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0;

void main() {
    vec2 z = gl_FragCoord.xy/u_resolution.xy;
    z.x *= u_resolution.x/u_resolution.y;
        
    z = z * 4.;
    z -= vec2(0.990,0.990)*2.;
    z.y = -z.y;
    float a = sin(u_time*13.)*.1,b=0.676,c=0.288,d=.50; 
    //float color = (b-z.y)*(c-z.y)*(d-z.y) - a*pow(z.x,2.);
    float color = (((z.x*z.x + pow(z.y-a,2.)) + pow(c,2.)*pow(pow(z.x,2.) + pow((z.y+a),2.) - 4.*pow(b,2.),2.) -
 4.*(z.x*z.x + pow(z.y-a,2.))*c*c*(z.x*z.x + pow((z.y+a),2.))));
    //color = smoothstep(0.,0.01,color);


    /*    float a = sin(u_time*3.14159)*1.2,b=1.5,c=1.35;
    float color = (((z.x*z.x + pow(z.y-a,2.)) + pow(c,2.)*pow(pow(z.x,2.) + pow((z.y+a),2.) - 4.*pow(b,2.),2.) - 4.*(z.x*z.x + pow(z.y-a,2.))*c*c*(z.x*z.x + pow((z.y+a),2.))));
*/
    gl_FragColor = vec4(vec3(pow(color,3.)),1.0);
}