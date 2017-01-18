precision mediump float;

uniform vec2 bias;
uniform vec2 scale;
uniform sampler2D state;

vec4 get(vec2 position) {
    return texture2D(state, position / scale);
}

void main() {
    vec2 swPos = floor((gl_FragCoord.xy + bias) / 2.0) * 2.0 - bias + 0.5;

    vec4 sw = get(swPos);
    vec4 nw = get(swPos + vec2(0.0, 1.0));
    vec4 se = get(swPos + vec2(1.0, 0.0));
    vec4 ne = get(swPos + vec2(1.0, 1.0));

    if (sw == nw && nw == se && se == ne) {
        gl_FragColor = vec4(vec3(1.0, 1.0, 1.0) - sw.xyz, 1.0);
    } else {
        gl_FragColor = get(gl_FragCoord.xy);
    }
}
