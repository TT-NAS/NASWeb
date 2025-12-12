const { animate, utils, createDraggable, spring } = anime;

var animationMs = 300;
var restMs = 300;
var intervalMs = animationMs + restMs;

const filtersColorMap = {
    linear: "#76E174",
    relu: "#81D16E",
    softplus: "#8CC267",
    elu: "#96B261",
    selu: "#A1A35B",
    sigmoid: "#AC9354",
    tanh: "#B7834E",
    softsign: "#C17447",
    softmax: "#CC6441",
};

const arrowSizes = {
    1: 2,
    3: 4,
    5: 6,
};

const poolingColorMap = {
    max: "#567ebb",
    average: "#538a95",
};

const posEnum = {
    Hidden: 0,
    Normal: 1,
    Center: 2,
};

const arrows = {
    layer0: {
        arrow_out: null,
        arrow_in: null,
    },
    layer1: {
        arrow_conv: null,
        arrow_out: null,
        arrow_deconv: null,
        arrow_in: null,
        arrow_concat: null,
    },
    layer2: {
        arrow_conv: null,
        arrow_out: null,
        arrow_deconv: null,
        arrow_in: null,
        arrow_concat: null,
    },
    layer3: {
        arrow_conv: null,
        arrow_out: null,
        arrow_deconv: null,
        arrow_in: null,
        arrow_concat: null,
    },
    layer4: {
        arrow_conv: null,
        arrow_out: null,
        arrow_deconv: null,
        arrow_in: null,
        arrow_concat: null,
    },
    layer5: {
        arrow_conv: null,
    },
};

const prevState = {
    layer0: {
        active: true,
    },
    layer1: {
        active: false,
        convBlock1: {
            posConv0: posEnum.Normal,
            posConv1: posEnum.Normal,
            in: null,
            out: null,
            kernelSizeIn: null,
            kernelSizeOut: null,
        },
        convBlock2: {
            posConv0: posEnum.Normal,
            posConv1: posEnum.Normal,
            in: null,
            out: null,
            kernelSizeIn: null,
            kernelSizeOut: null,
        },
    },
    layer2: {
        active: false,
        convBlock1: {
            posConv0: posEnum.Normal,
            posConv1: posEnum.Normal,
            in: null,
            out: null,
            kernelSizeIn: null,
            kernelSizeOut: null,
        },
        convBlock2: {
            posConv0: posEnum.Normal,
            posConv1: posEnum.Normal,
            in: null,
            out: null,
            kernelSizeIn: null,
            kernelSizeOut: null,
        },
    },
    layer3: {
        active: false,
        convBlock1: {
            posConv0: posEnum.Normal,
            posConv1: posEnum.Normal,
            in: null,
            out: null,
            kernelSizeIn: null,
            kernelSizeOut: null,
        },
        convBlock2: {
            posConv0: posEnum.Normal,
            posConv1: posEnum.Normal,
            in: null,
            out: null,
            kernelSizeIn: null,
            kernelSizeOut: null,
        },
    },
    layer4: {
        active: false,
        convBlock1: {
            posConv0: posEnum.Normal,
            posConv1: posEnum.Normal,
            in: null,
            out: null,
            kernelSizeIn: null,
            kernelSizeOut: null,
        },
        convBlock2: {
            posConv0: posEnum.Normal,
            posConv1: posEnum.Normal,
            in: null,
            out: null,
            kernelSizeIn: null,
            kernelSizeOut: null,
        },
    },
    layer5: {
        active: true,
        convBlock1: {
            posConv0: posEnum.Normal,
            posConv1: posEnum.Normal,
            in: null,
            out: null,
            kernelSizeIn: null,
            kernelSizeOut: null,
        },
    },
};

const mutLines = [];

const conv0_ur = document.getElementById("img1");
const conv0_dr = document.getElementById("img2");

const conv1_dl = document.querySelector(
    '[data-layer="1"] [data-conv-block="1"] [data-conv="1"]'
);
const conv1_dr = document.querySelector(
    '[data-layer="1"] [data-conv-block="1"] [data-conv="2"]'
);
const conv1_ul = document.querySelector(
    '[data-layer="1"] [data-conv-block="2"] [data-conv="2"]'
);
const conv1_ur = document.querySelector(
    '[data-layer="1"] [data-conv-block="2"] [data-conv="1"]'
);
arrows["layer0"].arrow_out = new LeaderLine(conv0_dr, conv1_dl, {
    color: "white",
    size: 3,
    path: "grid",
});
arrows["layer0"].arrow_in = new LeaderLine(conv1_ul, conv0_ur, {
    color: "white",
    size: 3,
    path: "grid",
});
mutLines.push(arrows["layer0"].arrow_out);
mutLines.push(arrows["layer0"].arrow_in);

const conv2_dl = document.querySelector(
    '[data-layer="2"] [data-conv-block="1"] [data-conv="1"]'
);
const conv2_dr = document.querySelector(
    '[data-layer="2"] [data-conv-block="1"] [data-conv="2"]'
);
const conv2_ul = document.querySelector(
    '[data-layer="2"] [data-conv-block="2"] [data-conv="2"]'
);
const conv2_ur = document.querySelector(
    '[data-layer="2"] [data-conv-block="2"] [data-conv="1"]'
);
arrows["layer1"].arrow_conv = new LeaderLine(conv1_dl, conv1_dr, {
    color: "white",
    size: 3,
    path: "straight",
});
arrows["layer1"].arrow_out = new LeaderLine(conv1_dr, conv2_dl, {
    color: "white",
    size: 3,
    path: "grid",
});
arrows["layer1"].arrow_deconv = new LeaderLine(conv1_ur, conv1_ul, {
    color: "white",
    size: 3,
    path: "straight",
});
arrows["layer1"].arrow_in = new LeaderLine(conv2_ul, conv1_ur, {
    color: "white",
    size: 3,
    path: "grid",
});
arrows["layer1"].arrow_concat = new LeaderLine(conv1_dr, conv1_ur, {
    color: "#ffe29a",
    size: 3,
    path: "fluid",
});
mutLines.push(arrows["layer1"].arrow_out);
mutLines.push(arrows["layer1"].arrow_in);

const conv3_dl = document.querySelector(
    '[data-layer="3"] [data-conv-block="1"] [data-conv="1"]'
);
const conv3_dr = document.querySelector(
    '[data-layer="3"] [data-conv-block="1"] [data-conv="2"]'
);
const conv3_ul = document.querySelector(
    '[data-layer="3"] [data-conv-block="2"] [data-conv="2"]'
);
const conv3_ur = document.querySelector(
    '[data-layer="3"] [data-conv-block="2"] [data-conv="1"]'
);
arrows["layer2"].arrow_conv = new LeaderLine(conv2_dl, conv2_dr, {
    color: "white",
    size: 3,
    path: "straight",
});
arrows["layer2"].arrow_out = new LeaderLine(conv2_dr, conv3_dl, {
    color: "white",
    size: 3,
    path: "grid",
});
arrows["layer2"].arrow_deconv = new LeaderLine(conv2_ur, conv2_ul, {
    color: "white",
    size: 3,
    path: "straight",
});
arrows["layer2"].arrow_in = new LeaderLine(conv3_ul, conv2_ur, {
    color: "white",
    size: 3,
    path: "grid",
});
arrows["layer2"].arrow_concat = new LeaderLine(conv2_dr, conv2_ur, {
    color: "#ffe29a",
    size: 3,
    path: "fluid",
});
mutLines.push(arrows["layer2"].arrow_out);
mutLines.push(arrows["layer2"].arrow_in);

const conv4_dl = document.querySelector(
    '[data-layer="4"] [data-conv-block="1"] [data-conv="1"]'
);
const conv4_dr = document.querySelector(
    '[data-layer="4"] [data-conv-block="1"] [data-conv="2"]'
);
const conv4_ul = document.querySelector(
    '[data-layer="4"] [data-conv-block="2"] [data-conv="2"]'
);
const conv4_ur = document.querySelector(
    '[data-layer="4"] [data-conv-block="2"] [data-conv="1"]'
);
arrows["layer3"].arrow_conv = new LeaderLine(conv3_dl, conv3_dr, {
    color: "white",
    size: 3,
    path: "straight",
});
arrows["layer3"].arrow_out = new LeaderLine(conv3_dr, conv4_dl, {
    color: "white",
    size: 3,
    path: "grid",
});
arrows["layer3"].arrow_deconv = new LeaderLine(conv3_ur, conv3_ul, {
    color: "white",
    size: 3,
    path: "straight",
});
arrows["layer3"].arrow_in = new LeaderLine(conv4_ul, conv3_ur, {
    color: "white",
    size: 3,
    path: "grid",
});
arrows["layer3"].arrow_concat = new LeaderLine(conv3_dr, conv3_ur, {
    color: "#ffe29a",
    size: 3,
    path: "fluid",
});
mutLines.push(arrows["layer3"].arrow_out);
mutLines.push(arrows["layer3"].arrow_in);

const conv5_dl = document.querySelector(
    '[data-layer="5"] [data-conv-block="1"] [data-conv="1"]'
);
const conv5_dr = document.querySelector(
    '[data-layer="5"] [data-conv-block="1"] [data-conv="2"]'
);
arrows["layer4"].arrow_conv = new LeaderLine(conv4_dl, conv4_dr, {
    color: "white",
    size: 3,
    path: "straight",
});
arrows["layer4"].arrow_out = new LeaderLine(conv4_dr, conv5_dl, {
    color: "white",
    size: 3,
    path: "grid",
});
arrows["layer4"].arrow_deconv = new LeaderLine(conv4_ur, conv4_ul, {
    color: "white",
    size: 3,
    path: "straight",
});
arrows["layer4"].arrow_in = new LeaderLine(conv5_dr, conv4_ur, {
    color: "white",
    size: 3,
    path: "grid",
});
arrows["layer4"].arrow_concat = new LeaderLine(conv4_dr, conv4_ur, {
    color: "#ffe29a",
    size: 3,
    path: "fluid",
});
mutLines.push(arrows["layer4"].arrow_out);
mutLines.push(arrows["layer4"].arrow_in);

arrows["layer5"].arrow_conv = new LeaderLine(conv5_dl, conv5_dr, {
    color: "white",
    size: 3,
    path: "straight",
});

function getElementDistance(el1, el2) {
    const rect1 = el1.getBoundingClientRect();
    const rect2 = el2.getBoundingClientRect();
    return Math.abs(rect2.left - rect1.left);
}

// actualizar continuamente las flechas para que sigan a los elementos
(() => {
    const lines = [];
    for (const layerArrows of Object.values(arrows)) {
        for (const line of Object.values(layerArrows)) {
            if (line) lines.push(line);
        }
    }
    let rafId = null;

    function updateLines() {
        for (const line of lines) {
            try {
                line.position();
            } catch (e) {
                /* ignore if removed */
            }
        }
        for (const line of mutLines) {
            try {
                // Obtener distancia entre elementos
                const distance = getElementDistance(line.start, line.end);

                // Si la distancia es corta, usa "straight", sino "grid"
                const threshold = 125; // Ajusta este valor según tus necesidades
                const newPath = distance < threshold ? "straight" : "grid";

                // Solo actualiza si cambió el path
                if (line.path !== newPath) {
                    line.setOptions({ path: newPath });
                }
            } catch (e) {
                /* ignore if removed */
            }
        }
        rafId = requestAnimationFrame(updateLines);
    }

    // comenzar loop (se puede cancelar con cancelAnimationFrame(rafId) si se necesita)
    rafId = requestAnimationFrame(updateLines);

    // también recalcular inmediatamente en eventos relevantes
    const refresh = () => updateLines();
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", refresh, true);
    new MutationObserver(refresh).observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
    });
})();

function easeInOutCubicSize(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateLineSize(line, from, to, duration = 300) {
    return new Promise((resolve) => {
        const start = performance.now();

        function tick(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = easeInOutCubicSize(t);
            const current = from + (to - from) * eased;

            // actualizar tamaño
            line.setOptions({ size: current });
            // forzar recalculo/posicion si es necesario
            if (typeof line.position === "function") line.position();

            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(tick);
    });
}

function easeInOutCubicColor(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function parseColor(color) {
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = color;
    const computed = ctx.fillStyle; // esto normaliza nombres y hex cortos
    const rgb = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(computed);
    if (rgb) {
        return {
            r: parseInt(rgb[1], 16),
            g: parseInt(rgb[2], 16),
            b: parseInt(rgb[3], 16),
        };
    }
    const rgb2 = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (rgb2) {
        return { r: +rgb2[1], g: +rgb2[2], b: +rgb2[3] };
    }
    console.warn("No se pudo parsear color:", color);
    return { r: 0, g: 0, b: 0 };
}

function animateLineColor(line, fromColor, toColor, duration = 400) {
    return new Promise((resolve) => {
        const start = performance.now();
        const from = parseColor(fromColor);
        const to = parseColor(toColor);

        function tick(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = easeInOutCubicColor(t);

            const r = Math.round(from.r + (to.r - from.r) * eased);
            const g = Math.round(from.g + (to.g - from.g) * eased);
            const b = Math.round(from.b + (to.b - from.b) * eased);
            const color = `rgb(${r}, ${g}, ${b})`;

            line.setOptions({ color });
            if (typeof line.position === "function") line.position();

            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(tick);
    });
}

function applyArrowsConfig(config) {
    for (let layerIndex = 0; layerIndex < 5; layerIndex++) {
        if (!prevState[`layer${layerIndex}`].active && layerIndex !== 0) {
            const arrowGroup = arrows[`layer${layerIndex}`];
            if (arrowGroup) {
                for (const line of Object.values(arrowGroup)) {
                    line.hide();
                }
            }
            continue;
        }

        const layerKey = `layer${layerIndex}`;
        let nextLayerIndex = layerIndex + 1;

        while (
            nextLayerIndex <= 5 &&
            !prevState[`layer${nextLayerIndex}`].active
        ) {
            nextLayerIndex++;
        }
        const nextLayerKey = `layer${nextLayerIndex}`;

        if (nextLayerKey === "layer5") {
            animateLineColor(
                arrows[layerKey].arrow_out,
                arrows[layerKey].arrow_out.color,
                poolingColorMap[
                    config[`layer${layerIndex - 1}`].convPath.pooling
                ],
                animationMs / 2
            );
            animateLineSize(
                arrows[layerKey].arrow_out,
                arrows[layerKey].arrow_out.size,
                arrowSizes[prevState[nextLayerKey].convBlock1.kernelSizeIn],
                animationMs / 2
            );
            animateLineSize(
                arrows[layerKey].arrow_in,
                arrows[layerKey].arrow_in.size,
                arrowSizes[prevState[layerKey].convBlock2.kernelSizeIn],
                animationMs / 2
            );

            arrows[layerKey].arrow_out.start =
                prevState[layerKey].convBlock1.out;
            arrows[layerKey].arrow_in.end = prevState[layerKey].convBlock2.in;
            arrows[layerKey].arrow_out.end =
                prevState[nextLayerKey].convBlock1.in;
            arrows[layerKey].arrow_in.start =
                prevState[nextLayerKey].convBlock1.out;

            if (
                prevState[nextLayerKey].convBlock1.in ===
                prevState[nextLayerKey].convBlock1.out
            ) {
                arrows[layerKey].arrow_out.endSocket = "bottom";
                arrows[layerKey].arrow_in.startSocket = "top";
            } else {
                arrows[layerKey].arrow_out.endSocket = "left";
                arrows[layerKey].arrow_in.startSocket = "left";
            }
        } else if (layerIndex === 0) {
            animateLineSize(
                arrows[layerKey].arrow_out,
                arrows[layerKey].arrow_out.size,
                arrowSizes[prevState[nextLayerKey].convBlock1.kernelSizeIn],
                animationMs / 2
            );

            arrows[layerKey].arrow_out.end =
                prevState[nextLayerKey].convBlock1.in;
            arrows[layerKey].arrow_in.start =
                prevState[nextLayerKey].convBlock2.out;
            arrows[layerKey].arrow_out.endSocket = "left";
            arrows[layerKey].arrow_in.startSocket = "left";
        } else {
            arrows[layerKey].arrow_out.show();
            arrows[layerKey].arrow_in.show();
            animateLineColor(
                arrows[layerKey].arrow_out,
                arrows[layerKey].arrow_out.color,
                poolingColorMap[
                    config[`layer${layerIndex - 1}`].convPath.pooling
                ],
                animationMs / 2
            );
            animateLineSize(
                arrows[layerKey].arrow_out,
                arrows[layerKey].arrow_out.size,
                arrowSizes[prevState[nextLayerKey].convBlock1.kernelSizeIn],
                animationMs / 2
            );
            animateLineSize(
                arrows[layerKey].arrow_in,
                arrows[layerKey].arrow_in.size,
                arrowSizes[prevState[layerKey].convBlock2.kernelSizeIn],
                animationMs / 2
            );

            arrows[layerKey].arrow_out.start =
                prevState[layerKey].convBlock1.out;
            arrows[layerKey].arrow_in.end = prevState[layerKey].convBlock2.in;
            arrows[layerKey].arrow_out.end =
                prevState[nextLayerKey].convBlock1.in;
            arrows[layerKey].arrow_in.start =
                prevState[nextLayerKey].convBlock2.out;
            arrows[layerKey].arrow_out.endSocket = "left";
            arrows[layerKey].arrow_in.startSocket = "left";
        }

        if (layerIndex === 0) continue;

        if (
            prevState[layerKey].convBlock1.in ===
            prevState[layerKey].convBlock1.out
        ) {
            arrows[layerKey].arrow_conv.hide();
        } else {
            arrows[layerKey].arrow_conv.show();
            arrows[layerKey].arrow_out.startSocket = "right";
            animateLineSize(
                arrows[layerKey].arrow_conv,
                arrows[layerKey].arrow_conv.size,
                arrowSizes[prevState[layerKey].convBlock1.kernelSizeOut],
                animationMs / 2
            );
        }
        if (
            prevState[layerKey].convBlock2.in ===
            prevState[layerKey].convBlock2.out
        ) {
            arrows[layerKey].arrow_deconv.hide();
        } else {
            arrows[layerKey].arrow_deconv.show();
            arrows[layerKey].arrow_in.endSocket = "right";
            animateLineSize(
                arrows[layerKey].arrow_deconv,
                arrows[layerKey].arrow_deconv.size,
                arrowSizes[prevState[layerKey].convBlock2.kernelSizeOut],
                animationMs / 2
            );
        }

        if (config[`layer${layerIndex - 1}`].deconvPath.concat) {
            arrows[layerKey].arrow_concat.show();
            arrows[layerKey].arrow_concat.startSocket = "top";
            arrows[layerKey].arrow_concat.endSocket = "bottom";

            arrows[layerKey].arrow_concat.start =
                prevState[layerKey].convBlock1.out;
            arrows[layerKey].arrow_concat.end =
                prevState[layerKey].convBlock2.in;
        } else {
            arrows[layerKey].arrow_concat.hide();
        }
    }

    if (
        prevState["layer5"].convBlock1.in === prevState["layer5"].convBlock1.out
    ) {
        try {
            if (arrows["layer5"] && arrows["layer5"].arrow_conv) {
                arrows["layer5"].arrow_conv.hide();
            }
        } catch (e) {
            console.error("No se pudo ocultar arrow_conv:", e);
        }
    }
}

function applyConvConfig(details, layerNumber, convBlockNumber, bottleneck) {
    const distances = {
        x: "128%",
        y: "82%",
    };

    const signs = {
        0: "-",
        1: "+",
    };
    let sign = details.convIndex ^ (convBlockNumber - 1);
    if (bottleneck) sign = sign ^ 1;

    const convElement = document.querySelector(
        `[data-layer="${layerNumber}"] [data-conv-block="${convBlockNumber}"] [data-conv="${
            details.convIndex + 1
        }"] .convolution`
    );

    if (
        details.fromPos === posEnum.Normal &&
        details.toPos === posEnum.Hidden
    ) {
        animate(convElement.parentElement, {
            duration: animationMs,
            opacity: 0,
            onComplete: () => {
                convElement.parentElement.style.position = "absolute";
            },
        });
    } else if (
        details.fromPos === posEnum.Normal &&
        details.toPos === posEnum.Center
    ) {
        sign = signs[sign ^ 1];
        animate(convElement.parentElement, {
            duration: animationMs,
            x: bottleneck ? "0%" : sign + distances.x,
            y: bottleneck ? sign + distances.y : "0%",
            onComplete: () => {
                animate(convElement.parentElement, {
                    duration: 0,
                    x: "0%",
                    y: "0%",
                });
            },
        });
    } else if (
        details.fromPos === posEnum.Center &&
        details.toPos === posEnum.Normal
    ) {
        sign = signs[sign];
        animate(convElement.parentElement, {
            duration: animationMs / 2,
            x: bottleneck ? "0%" : sign + distances.x,
            y: bottleneck ? sign + distances.y : "0%",
            onComplete: () => {
                animate(convElement.parentElement, {
                    duration: 0,
                    x: "0%",
                    y: "0%",
                });
            },
        });
    } else if (
        details.fromPos === posEnum.Hidden &&
        details.toPos === posEnum.Normal
    ) {
        animate(convElement.parentElement, {
            delay: animationMs / 2,
            duration: animationMs,
            opacity: 1,
            onBegin: () => {
                convElement.parentElement.style.position = "relative";
            },
        });
    } else if (
        details.fromPos === posEnum.Center &&
        details.toPos === posEnum.Hidden
    ) {
        sign = signs[sign];
        animate(convElement.parentElement, {
            duration: animationMs / 3,
            x: bottleneck ? "0%" : sign + distances.x,
            y: bottleneck ? sign + distances.y : "0%",
            onComplete: () => {
                animate(convElement.parentElement, {
                    duration: 0,
                    x: "0%",
                    y: "0%",
                });
            },
        });
        animate(convElement.parentElement, {
            delay: animationMs / 3,
            duration: (animationMs * 2) / 3,
            opacity: 0,
            onComplete: () => {
                convElement.parentElement.style.position = "absolute";
            },
        });
    } else if (
        details.fromPos === posEnum.Hidden &&
        details.toPos === posEnum.Center
    ) {
        animate(convElement.parentElement, {
            delay: animationMs / 3,
            duration: animationMs / 3,
            opacity: 1,
            onBegin: () => {
                convElement.parentElement.style.position = "relative";
            },
        });
        sign = signs[sign ^ 1];
        animate(convElement.parentElement, {
            delay: (animationMs * 2) / 3,
            duration: animationMs / 3,
            x: bottleneck ? "0%" : sign + distances.x,
            y: bottleneck ? sign + distances.y : "0%",
            onComplete: () => {
                animate(convElement.parentElement, {
                    duration: 0,
                    x: "0%",
                    y: "0%",
                });
            },
        });
    }

    if (details.toPos !== posEnum.Hidden) {
        animate(convElement, {
            width: `${details.widthPercent}%`,
            backgroundColor: details.backgroundColor,
            duration: animationMs,
        });
    }
}

function applyConvBlockConfig(
    layerNumber,
    convBlockNumber,
    pathConfig,
    bottleneck = false
) {
    const detailsAnimation = {
        conv0: {},
        conv1: {},
    };

    ["conv0", "conv1"].forEach((convKey, convIndex) => {
        const convConfig = pathConfig[convKey];
        const fromPos =
            prevState[`layer${layerNumber}`][`convBlock${convBlockNumber}`][
                `posConv${convIndex}`
            ];
        const toPos = convConfig ? posEnum.Normal : posEnum.Hidden;

        detailsAnimation[convKey] = {
            convIndex,
            fromPos,
            toPos,
        };

        if (convConfig) {
            const filters = convConfig.filters;
            const activation = convConfig.activation;
            backgroundColor = filtersColorMap[activation] || "#FFFFFF";
            widthPercent = filters
                ? Math.min(9 * (Math.log2(filters) + 1), 100)
                : 0;

            if (widthPercent === 99) widthPercent = 100;
            detailsAnimation[convKey].widthPercent = widthPercent;
            detailsAnimation[convKey].backgroundColor = backgroundColor;
        }
    });

    Object.values(detailsAnimation).forEach((details) => {
        if (details.toPos === posEnum.Hidden) {
            const otherConvKey = details.convIndex === 0 ? "conv1" : "conv0";
            detailsAnimation[otherConvKey].toPos = posEnum.Center;
        }
    });

    const conv1 = document.querySelector(
        `[data-layer="${layerNumber}"] [data-conv-block="${convBlockNumber}"] [data-conv="${
            detailsAnimation.conv0.convIndex + 1
        }"]`
    );
    const conv2 = document.querySelector(
        `[data-layer="${layerNumber}"] [data-conv-block="${convBlockNumber}"] [data-conv="${
            detailsAnimation.conv1.convIndex + 1
        }"]`
    );

    if (detailsAnimation.conv0.toPos !== posEnum.Hidden) {
        prevState[`layer${layerNumber}`][`convBlock${convBlockNumber}`].in =
            conv1;
        prevState[`layer${layerNumber}`][
            `convBlock${convBlockNumber}`
        ].kernelSizeIn = pathConfig.conv0.kernelSize;
    } else {
        prevState[`layer${layerNumber}`][`convBlock${convBlockNumber}`].in =
            conv2;
        prevState[`layer${layerNumber}`][
            `convBlock${convBlockNumber}`
        ].kernelSizeIn = pathConfig.conv1.kernelSize;
    }
    if (detailsAnimation.conv1.toPos !== posEnum.Hidden) {
        prevState[`layer${layerNumber}`][`convBlock${convBlockNumber}`].out =
            conv2;
        prevState[`layer${layerNumber}`][
            `convBlock${convBlockNumber}`
        ].kernelSizeOut = pathConfig.conv1.kernelSize;
    } else {
        prevState[`layer${layerNumber}`][`convBlock${convBlockNumber}`].out =
            conv1;
        prevState[`layer${layerNumber}`][
            `convBlock${convBlockNumber}`
        ].kernelSizeOut = pathConfig.conv0.kernelSize;
    }

    prevState[`layer${layerNumber}`][`convBlock${convBlockNumber}`][
        `posConv0`
    ] = detailsAnimation.conv0.toPos;
    prevState[`layer${layerNumber}`][`convBlock${convBlockNumber}`][
        `posConv1`
    ] = detailsAnimation.conv1.toPos;

    applyConvConfig(
        detailsAnimation.conv0,
        layerNumber,
        convBlockNumber,
        bottleneck
    );
    applyConvConfig(
        detailsAnimation.conv1,
        layerNumber,
        convBlockNumber,
        bottleneck
    );
}

function applyUNetConfig(config) {
    for (let layerIndex = 0; layerIndex < 4; layerIndex++) {
        const layerKey = `layer${layerIndex}`;
        const layerConfig = config.unet[layerKey];
        const layerNumber = layerIndex + 1;

        const layerElement = document.querySelector(
            `[data-layer="${layerNumber}"]`
        );
        if (!layerConfig) {
            animate(layerElement, {
                duration: animationMs,
                opacity: 0,
                width: 0,
                marginRight: "-1%",
                onComplete: () => {
                    layerElement.style.display = "none";
                },
            });
            prevState[`layer${layerNumber}`].active = false;
            continue;
        }
        animate(layerElement, {
            duration: animationMs,
            opacity: 1,
            width: "20%",
            marginRight: "1%",
            onBegin: () => {
                layerElement.style.display = "flex";
            },
        });
        prevState[`layer${layerNumber}`].active = true;
        ["convPath", "deconvPath"].forEach((pathKey, pathIndex) => {
            const pathConfig = layerConfig[pathKey];
            applyConvBlockConfig(layerNumber, pathIndex + 1, pathConfig);
        });
    }
    const bottleneckConfig = config.unet.bottleneck;
    const layerNumber = 5;
    const convBlockNumber = 1;
    applyConvBlockConfig(layerNumber, convBlockNumber, bottleneckConfig, true);
    applyArrowsConfig(config.unet);
}

const jsonFiles = [
    "red0.json",
    "red1.json",
    "red2.json",
    "red3.json",
    "red4.json",
    "red5.json",
    "red6.json",
    "red7.json",
    "red8.json",
    "red9.json",
    "red10.json",
];

async function loadAndApplyConfig(file) {
    try {
        const response = await fetch(file);
        const config = await response.json();
        latestConfig = config;
        applyUNetConfig(config);
    } catch (error) {
        console.error(`Error al cargar ${file}:`, error);
    }
}

let loopId = null; // Variable global para guardar el ID del intervalo

function startLoop() {
    let i = 0;

    // Si ya hay un loop corriendo, lo detenemos antes de iniciar otro
    if (loopId !== null) clearInterval(loopId);

    // Guardamos el ID del intervalo
    loopId = setInterval(() => {
        // console.log("Loop");
        const file = jsonFiles[i % jsonFiles.length];
        loadAndApplyConfig("files/redes/" + file);
        i++;
    }, intervalMs);
}

// Función para detener el loop
function stopLoop() {
    if (loopId !== null) {
        clearInterval(loopId);
        loopId = null;
        console.log("Loop detenido");
    }
}
