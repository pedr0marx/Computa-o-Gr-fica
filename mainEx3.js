function main() {
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });

    if (!gl) {
        throw new Error('WebGL not supported');
    }

    var vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
    var fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    var program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const colorLocation = gl.getAttribLocation(program, 'color');
    gl.enableVertexAttribArray(colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);
    

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let ponto1 = null;
    let ponto2 = null;
    let ponto3 = null;
    let colorVector = [0.0, 0.0, 0.0];
    let espessura = 1.0; 
    let modo = 'linha';
    let modoEspessura = false;

    canvas.addEventListener("mousedown", mouseClick, false);

    function mouseClick(event) {
        const x = (2 / canvas.width * event.offsetX) - 1;
        const y = (-2 / canvas.height * event.offsetY) + 1;

        if (modo === 'linha') {
            Linha(x, y);
        } else if (modo === 'triangulo') {
            Triangulo(x, y);
        }
    }

    function Linha(x, y) {
        if (!ponto1) {
            ponto1 = { x, y };
        } else if (!ponto2) {
            ponto2 = { x, y };
            desenhaLinha(ponto1, ponto2);
        } else {
            ponto1 = ponto2;
            ponto2 = { x, y };
            gl.clear(gl.COLOR_BUFFER_BIT);
            desenhaLinha(ponto1, ponto2);
        }
    }

    function Triangulo(x, y) {
        if (!ponto1) {
            ponto1 = { x, y };
        } else if (!ponto2) {
            ponto2 = { x, y };
        } else if (!ponto3) {
            ponto3 = { x, y };
            desenhaTriangulo(ponto1, ponto2, ponto3);
        } else {
            ponto1 = ponto2;
            ponto2 = ponto3;
            ponto3 = { x, y };
            gl.clear(gl.COLOR_BUFFER_BIT);
            desenhaTriangulo(ponto1, ponto2, ponto3);
        }
    }

    function desenhaLinha(comeco, fim) {
        const pontos = bresenham(
            Math.round((comeco.x + 1) * canvas.width / 2),
            Math.round((1 - comeco.y) * canvas.height / 2),
            Math.round((fim.x + 1) * canvas.width / 2),
            Math.round((1 - fim.y) * canvas.height / 2)
        );

        const positions = [];
        pontos.forEach(p => {
            positions.push((2 / canvas.width) * p.x - 1, (-2 / canvas.height) * p.y + 1);
        });

        const colors = Array(pontos.length).fill(colorVector).flat();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);


        desenhaPontos(pontos.length);
    }

    function desenhaTriangulo(P1, P2, P3) {
        desenhaLinha(P1, P2);
        desenhaLinha(P2, P3);
        desenhaLinha(P1, P3);
    }

    function desenhaPontos(numpontos) {
        gl.drawArrays(gl.POINTS, 0, numpontos);
    }

    const bodyElement = document.querySelector("body");
    bodyElement.addEventListener("keydown", keyDown, false);

    function keyDown(event) {
        switch (event.key) {
            case "r": case "R":
                modo = 'linha';
                modoEspessura = false;
                gl.clear(gl.COLOR_BUFFER_BIT);
                ponto1 = ponto2 = ponto3 = null;
                break;
            case "t": case "T":
                modo = 'triangulo';
                modoEspessura = false;
                gl.clear(gl.COLOR_BUFFER_BIT);
                ponto1 = ponto2 = ponto3 = null;
                break;
            case "e": case "E":
                modoEspessura = true;
                break;
            case "k": case "K":
                modoEspessura = false;
                break;
            default:
                if (modoEspessura) {
                    if (event.key >= '0' && event.key <= '9') {
                        switch (event.key) {
                            case "0": espessura = 1; break;
                            case "1": espessura = 2; break;
                            case "2": espessura = 3; break;
                            case "3": espessura = 4; break;
                            case "4": espessura = 5; break;
                            case "5": espessura = 6; break;
                            case "6": espessura = 7; break;
                            case "7": espessura = 8; break;
                            case "8": espessura = 9; break;
                            case "9": espessura = 10; break;
                        }
                    }
                } else {
                    if (event.key >= '0' && event.key <= '9') {
                        switch (event.key) {
                            case "0": colorVector = [0.0, 0.0, 0.0]; break;
                            case "1": colorVector = [1.0, 0.0, 0.0]; break;
                            case "2": colorVector = [0.0, 1.0, 0.0]; break;
                            case "3": colorVector = [0.0, 0.0, 1.0]; break;
                            case "4": colorVector = [1.0, 1.0, 0.0]; break;
                            case "5": colorVector = [0.0, 1.0, 1.0]; break;
                            case "6": colorVector = [1.0, 0.0, 1.0]; break;
                            case "7": colorVector = [1.0, 0.5, 0.5]; break;
                            case "8": colorVector = [0.5, 1.0, 0.5]; break;
                            case "9": colorVector = [0.5, 0.5, 1.0]; break;
                        }
                    }
                }
                break;
        }
    
        const espessuraLocation = gl.getUniformLocation(program, 'espessura');
        gl.uniform1f(espessuraLocation, espessura); 

        if (modo === 'linha' && ponto1 && ponto2) {
            gl.clear(gl.COLOR_BUFFER_BIT);
            desenhaLinha(ponto1, ponto2);
        } else if (modo === 'triangulo' && ponto1 && ponto2 && ponto3) {
            gl.clear(gl.COLOR_BUFFER_BIT); 
            desenhaTriangulo(ponto1, ponto2, ponto3);
        }
    }
}

function bresenham(x0, y0, x1, y1) {
    const deltaX = Math.abs(x1 - x0);
    const deltaY = Math.abs(y1 - y0);

    let X = x0;
    let Y = y0;

    const moveX = (x0 < x1) ? 1 : -1;
    const moveY = (y0 < y1) ? 1 : -1;
    const pontos = [];
    let diferenca = deltaX - deltaY;

    while (true) {
        pontos.push({ x: X, y: Y });

        if ((X === x1) && (Y === y1)) {
            break;
        }

        const p = 2 * diferenca;

        if (p > -deltaY) {
            diferenca -= deltaY;
            X += moveX;
        }
        if (p < deltaX) {
            diferenca += deltaX;
            Y += moveY;
        }
    }

    return pontos;
}

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

main();
