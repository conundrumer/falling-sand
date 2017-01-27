precision mediump float;

uniform vec2 resolution;
uniform sampler2D state;
uniform bool adjustColor;

float adjust(float x) {
    return mix(1.0, mix(pow(x, 0.325), x, pow(x, 0.5)), 0.9);
}

void main() {
    vec4 c = texture2D(state, gl_FragCoord.xy / resolution);
    if (adjustColor) {
        gl_FragColor = vec4(adjust(c.r), adjust(c.g), adjust(c.b), 1.0);
    } else {
        gl_FragColor = c;
    }
}
