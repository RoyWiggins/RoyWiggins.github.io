// Author: 
// Title: 

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
// https://www.shadertoy.com/view/Mt2GWD
#define DOWN_SCALE 1.

#define MAX_INT_DIGITS 4

#define CHAR_SIZE vec2(8, 12)
#define CHAR_SPACING vec2(8, 12)

#define STRWIDTH(c) (c * CHAR_SPACING.x)
#define STRHEIGHT(c) (c * CHAR_SPACING.y)

#define NORMAL 0
#define INVERT 1
#define UNDERLINE 2

int TEXT_MODE = NORMAL;


//Automatically generated from the 8x12 font sheet here:
//http://www.massmind.org/techref/datafile/charset/extractor/charset_extractor.htm

vec4 ch_per = vec4(0x000000,0x000000,0x000038,0x380000);

vec4 ch_ats = vec4(0x007CC6,0xC6DEDE,0xDEC0C0,0x7C0000);

vec4 ch_a = vec4(0x000000,0x00780C,0x7CCCCC,0x760000);
vec4 ch_c = vec4(0x000000,0x0078CC,0xC0C0CC,0x780000);
vec4 ch_g = vec4(0x000000,0x0076CC,0xCCCC7C,0x0CCC78);
vec4 ch_i = vec4(0x001818,0x007818,0x181818,0x7E0000);
vec4 ch_l = vec4(0x007818,0x181818,0x181818,0x7E0000);
vec4 ch_m = vec4(0x000000,0x00FCD6,0xD6D6D6,0xC60000);
vec4 ch_o = vec4(0x000000,0x0078CC,0xCCCCCC,0x780000);
vec4 ch_r = vec4(0x000000,0x00EC6E,0x766060,0xF00000);
vec4 ch_t = vec4(0x000020,0x60FC60,0x60606C,0x380000);
vec4 ch_w = vec4(0x000000,0x00C6C6,0xD6D66C,0x6C0000);
vec4 ch_y = vec4(0x000000,0x006666,0x66663C,0x0C18F0);

vec2 res = u_resolution.xy / DOWN_SCALE;
vec2 print_pos = vec2(0);

//Extracts bit b from the given number.
//Shifts bits right (num / 2^bit) then ANDs the result with 1 (mod(result,2.0)).
float extract_bit(float n, float b)
{
    b = clamp(b,-1.0,24.0);
	return floor(mod(floor(n / pow(2.0,floor(b))),2.0));   
}

//Returns the pixel at uv in the given bit-packed sprite.
float sprite(vec4 spr, vec2 size, vec2 uv)
{
    uv = floor(uv);
    
    //Calculate the bit to extract (x + y * width) (flipped on x-axis)
    float bit = (size.x-uv.x-1.0) + uv.y * size.x;
    
    //Clipping bound to remove garbage outside the sprite's boundaries.
    bool bounds = all(greaterThanEqual(uv,vec2(0))) && all(lessThan(uv,size));
    
    float pixels = 0.0;
    pixels += extract_bit(spr.x, bit - 72.0);
    pixels += extract_bit(spr.y, bit - 48.0);
    pixels += extract_bit(spr.z, bit - 24.0);
    pixels += extract_bit(spr.w, bit - 00.0);
    
    return bounds ? pixels : 0.0;
}

//Prints a character and moves the print position forward by 1 character width.
float char(vec4 ch, vec2 uv)
{
    if( TEXT_MODE == INVERT )
    {
      //Inverts all of the bits in the character.
      ch = pow(2.0,24.0)-1.0-ch;
    }
    if( TEXT_MODE == UNDERLINE )
    {
      //Makes the bottom 8 bits all 1.
      //Shifts the bottom chunk right 8 bits to drop the lowest 8 bits,
      //then shifts it left 8 bits and adds 255 (binary 11111111).
      ch.w = floor(ch.w/256.0)*256.0 + 255.0;  
    }

    float px = sprite(ch, CHAR_SIZE, uv - print_pos);
    print_pos.x += CHAR_SPACING.x;
    return px;
}

float text(vec2 uv)
{
    float col = 0.0;
    
    vec2 center = res/2.0;
    
    //Greeting Text
    
    print_pos = floor(center - vec2(STRWIDTH(17.0),STRHEIGHT(1.0))/2.0);
       
    col += char(ch_r,uv);
    col += char(ch_o,uv);
    col += char(ch_y,uv);
    col += char(ch_w,uv);
    col += char(ch_i,uv);
    col += char(ch_g,uv);
    
    col += char(ch_ats,uv);
    
    col += char(ch_g,uv);
    col += char(ch_m,uv);
    col += char(ch_a,uv);
    col += char(ch_i,uv);
    col += char(ch_l,uv);
    col += char(ch_per,uv);
    col += char(ch_c,uv);
    col += char(ch_o,uv);
    col += char(ch_m,uv);
        
    return col;
}

void main()
{
    vec2 uv = gl_FragCoord.xy / DOWN_SCALE;
	vec2 duv = floor(gl_FragCoord.xy / DOWN_SCALE);
    
	float pixel = text(duv);
    
    //Shading stuff
    vec3 col = vec3(1);
    col *= (1.-distance(mod(uv,vec2(1.0)),vec2(0.65)))*1.2;
    col *= mix(vec3(0.2),vec3(1,1,1),pixel);

	gl_FragColor = vec4(vec3(col), 1.0);
}