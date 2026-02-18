// gcode-utils.js

export function gcodeGrblify(gcode) {
    // Split into lines for processing
    const lines = gcode.split(/\r?\n/);

    const processed = lines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            // 1. Remove G00 Sxxxx spindle speed lines
            if (/^G00\s+S\d+/i.test(line)) return null;

            // 2. Remove M5 and M0 (optional manual tool stop)
            if (/^M5\b/i.test(line)) return null;
            if (/^M0\b/i.test(line)) return null;

            // 3. Convert M3 alone into M3 Sxxxx if needed
            // We'll leave existing M3 Sxxxx as-is; if only M3 exists, set S1000
            if (/^M3\b/i.test(line) && !/S\d+/.test(line)) {
                return "M3 S1000";
            }

            // 4. Remove G64 commands (path smoothing)
            if (/^G64\b/i.test(line)) return null;

            // 5. Simplify G04 dwell commands to 2 decimal places
            if (/^G04\s+P([\d\.]+)/i.test(line)) {
                const match = line.match(/^G04\s+P([\d\.]+)/i);
                let pval = parseFloat(match[1]);
                if (pval === 0) pval = 0.01; // GRBL doesn’t like zero dwell
                line = `G04 P${pval.toFixed(2)}`;
            }

            // 6. Convert MSG lines to simple comments
            if (/^\(MSG,/.test(line)) {
                line = line.replace(/^\(MSG,/, "(").replace(/\)$/, ")");
            }

            // 7. Remove T1 lines (tool selection)
            if (/^T\d+/i.test(line)) return null;

            return line;
        })
        .filter(Boolean);

    return processed.join("\n")+"\n";
}

/**
 * Find minimum X and Y coordinates in a G-code file
 * @param {string} gcode
 * @returns {[number, number]} [minX, minY]
 */
export function gcodeFindMin(gcode) {
    let minX = Infinity;
    let minY = Infinity;

    const lines = gcode.split(/\r?\n/);

    for (const line of lines) {
        // Strip comments: ( ... ) and ; ...
        const clean = line
            .replace(/\(.*?\)/g, '')
            .replace(/;.*/, '')
            .trim();

        if (!clean) continue;

        // Only care about motion commands
        if (!/G0|G1|G2|G3/.test(clean)) continue;

        const xMatch = clean.match(/X(-?\d*\.?\d+)/i);
        const yMatch = clean.match(/Y(-?\d*\.?\d+)/i);

        if (xMatch) {
            const x = parseFloat(xMatch[1]);
            if (x < minX) minX = x;
        }

        if (yMatch) {
            const y = parseFloat(yMatch[1]);
            if (y < minY) minY = y;
        }
    }

    if (!isFinite(minX)) minX = 0;
    if (!isFinite(minY)) minY = 0;

    return [minX, minY];
}

/**
 * Translate all X/Y coordinates in a G-code file
 * @param {string} gcode
 * @param {[number, number]} delta [dx, dy]
 * @returns {string}
 */
export function gcodeTranslate(gcode, [dx, dy]) {
    const lines = gcode.split(/\r?\n/);

    return lines.map(line => {
        // Preserve comments by operating only on code part
        const commentMatch = line.match(/(\(.*?\)|;.*)$/);
        const comment = commentMatch ? commentMatch[0] : '';

        let code = commentMatch
            ? line.slice(0, commentMatch.index)
            : line;

        // Replace X and Y values if present
        code = code.replace(/X(-?\d*\.?\d+)/gi, (_, v) =>
            `X${(parseFloat(v) + dx).toFixed(5)}`
        );

        code = code.replace(/Y(-?\d*\.?\d+)/gi, (_, v) =>
            `Y${(parseFloat(v) + dy).toFixed(5)}`
        );

        return (code + comment).trimEnd();
    }).join('\n');
}
