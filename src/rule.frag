precision mediump float;

uniform vec2 bias;
uniform vec2 scale;
uniform sampler2D state;

vec4 get(vec2 position) {
    return texture2D(state, position / scale);
}
vec3 get_relative(vec2 offset) {
    return texture2D(state, (gl_FragCoord.xy + offset) / scale).rgb;
}

const int GREY = 1;
const int FALL = 2;
const int OFF = 4;
const int ON = 6;
const int RISE = 8;
const float steps = 8.0;

bool has_neighbor(vec4 neighbors, int neighbor_state) {
    return
        int(neighbors.x) == neighbor_state ||
        int(neighbors.y) == neighbor_state ||
        int(neighbors.z) == neighbor_state ||
        int(neighbors.w) == neighbor_state;
}

int get_next(int current, vec4 neighbors) {
    if (current == RISE) {
        return ON;
    }
    if (current == FALL) {
        return OFF;
    }
    if (current == OFF && has_neighbor((neighbors + 1.0) / 2.0, RISE / 2)) {
        return RISE;
    }
    if (current == ON && has_neighbor((neighbors + 1.0) / 2.0, FALL / 2)) {
        return FALL;
    } // don't know
    return current;
}

int get_next_color(int current, vec4 neighbors, vec4 diff_neighbors) {
    if (has_neighbor(diff_neighbors, ON) || has_neighbor(diff_neighbors, RISE)) {
        return FALL;
    }
    if (has_neighbor(diff_neighbors, OFF) || has_neighbor(diff_neighbors, FALL)) {
        return RISE;
    }
    return get_next(current, neighbors);
}

int get_next_grey(int current, vec4 neighbors) {
    return get_next(current + GREY, neighbors) - GREY;
}

const float threshold = 0.5;
void main() {
    vec3 c = get_relative(vec2(0.0, 0.0));
    vec3 current = steps * c + threshold;

    vec3 e = steps * get_relative(vec2(1.0, 0.0)) + threshold;
    vec3 w = steps * get_relative(vec2(-1.0, 0.0)) + threshold;
    vec3 n = steps * get_relative(vec2(0.0, 1.0)) + threshold;
    vec3 s = steps * get_relative(vec2(0.0, -1.0)) + threshold;

    int r = int(current.r);
    int g = int(current.g);
    int b = int(current.b);

    if (r > 0) {
        if (b == 0) {
            r = get_next_color(r, vec4(e.r, w.r, n.r, s.r), vec4(e.b, w.b, n.b, s.b));
        } else {
            r = get_next_grey(r, vec4(e.r, w.r, n.r, s.r));
        }
    }
    if (g > 0) {
        if (r == 0) {
            g = get_next_color(g, vec4(e.g, w.g, n.g, s.g), vec4(e.r, w.r, n.r, s.r));
        } else {
            g = get_next_grey(g, vec4(e.g, w.g, n.g, s.g));
        }
    }
    if (b > 0) {
        if (g == 0) {
            b = get_next_color(b, vec4(e.b, w.b, n.b, s.b), vec4(e.g, w.g, n.g, s.g));
        } else {
            b = get_next_grey(b, vec4(e.b, w.b, n.b, s.b));
        }
    }
    gl_FragColor = vec4(vec3(r, g, b) / steps, 1.0);
}
