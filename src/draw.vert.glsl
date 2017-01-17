precision mediump float;

uniform float diameter;
uniform vec2 center;
uniform vec2 scale;

attribute vec2 position;

void main() {
    gl_Position = vec4((position * diameter + (center - scale / 2.0)) / scale, 0.0, 1.0);
}
