

float rand (in vec2 co) {
    return fract(sin(dot(co.xy,vec2(12.9898,78.233)))*43758.5453);
}
float plotFunction(float x);

float lineJitter = 0.0;
float lineWidth = 4.0;
float gridWidth = 1.7;
float scale = 0.001;

vec3 grid2D( in vec2 _st, in float _width ) {
    float axisDetail = _width*scale;
    if (abs(_st.x)<axisDetail || abs(_st.y)<axisDetail) 
        return 1.0-vec3(0.65,0.65,1.0);
    if (abs(mod(_st.x,1.0))<axisDetail || abs(mod(_st.y,1.0))<axisDetail) 
        return 1.0-vec3(0.80,0.80,1.0);
    if (abs(mod(_st.x,0.25))<axisDetail || abs(mod(_st.y,0.25))<axisDetail) 
        return 1.0-vec3(0.95,0.95,1.0);
    return vec3(0.0);
}
vec3 plot2D(in vec2 _st, in float _width ) {
    const float samples = 3.0;
    float lineJitter = .5;
    vec2 steping = _width*vec2(scale)/samples;
    float count = 0.0;
    float mySamples = 0.0;
    for (float i = 0.0; i < samples;  i++) {
        for (float j = 0.0;j < samples; j++) {
            if (i*i+j*j>samples*samples) 
                continue;
            mySamples++;
            float ii = i + lineJitter*rand(vec2(_st.x+ i*steping.x,_st.y+ j*steping.y));
            float jj = j + lineJitter*rand(vec2(_st.y + i*steping.x,_st.x+ j*steping.y));
            float f = plotFunction(_st.x+ ii*steping.x)-(_st.y+ jj*steping.y);
            count += (f>0.) ? 1.0 : -1.0;
        }
    }
    vec3 color = vec3(1.0);
    if (abs(count)!=mySamples)
        color = vec3(abs(float(count))/float(mySamples));
    return color;
}
float plotFunction(float x){
    return exp2(ceil(log2(x)));
}
vec3 color(vec2 st) {
    //scale *= zoom;
    //st *= zoom;
    st += 1.;
    st /= 3.;
    
    vec3 color = plot2D(st,lineWidth);
    color -= grid2D(st,gridWidth);
    return color;
}