uniform float diameter;
uniform vec2 center;
uniform vec2 scale;

attribute vec2 position;

void main() {
    vec2 pos = 2.0 * (center - vec2(0.5, 0.5)) + (position * diameter) / scale;
    gl_Position = vec4(pos.x, -pos.y, 0.0, 1.0);
}
