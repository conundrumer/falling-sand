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

const int FALL = 90;
const int OFF = 130;
const int ON = 210;
const int RISE = 250;
const float steps = 256.0;

bool has_neighbor(vec4 neighbors, int neighbor_state) {
    return
        int(neighbors.x) == neighbor_state ||
        int(neighbors.y) == neighbor_state ||
        int(neighbors.z) == neighbor_state ||
        int(neighbors.w) == neighbor_state;
}

int get_next(int current, vec4 same_neigbors, vec4 diff_neighbors) {
    if (has_neighbor(diff_neighbors, ON) || has_neighbor(diff_neighbors, RISE)) {
        return FALL;
    }
    if (has_neighbor(diff_neighbors, OFF) || has_neighbor(diff_neighbors, FALL)) {
        return RISE;
    }
    if (current == RISE) {
        return ON;
    }
    if (current == FALL) {
        return OFF;
    }
    if (current == OFF && has_neighbor(same_neigbors, RISE)) {
        return RISE;
    }
    if (current == ON && has_neighbor(same_neigbors, FALL)) {
        return FALL;
    } // don't know
    return current;
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

    if (r >= FALL) {
        int next = get_next(r, vec4(e.r, w.r, n.r, s.r), vec4(e.b, w.b, n.b, s.b));
        gl_FragColor = vec4(float(next) / steps, 0.0, 0.0, 1.0);
    } else if (g >= FALL) {
        int next = get_next(g, vec4(e.g, w.g, n.g, s.g), vec4(e.r, w.r, n.r, s.r));
        gl_FragColor = vec4(0.0, float(next) / steps, 0.0, 1.0);
    } else if (b >= FALL) {
        int next = get_next(b, vec4(e.b, w.b, n.b, s.b), vec4(e.g, w.g, n.g, s.g));
        gl_FragColor = vec4(0.0, 0.0, float(next) / steps, 1.0);
    } else { // don't know
        gl_FragColor = vec4(c, 1.0);
    }
}
