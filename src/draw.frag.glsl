precision mediump float;

uniform float diameter;
uniform vec2 center;
uniform bool circle;
uniform vec4 cell;
uniform sampler2D state;

void main() {
    if (circle) {
        float dist = distance(gl_FragCoord.xy, center);
        if (dist <= diameter / 2.0) {
            gl_FragColor = cell;
        } else {
            gl_FragColor = texture2D(state, gl_FragCoord.xy);
        }
    } else {
        gl_FragColor = cell;
    }
}
