// Este script vincula los controles de tipo 'range' del formulario con sus salidas <output>,
// mostrando dinámicamente el valor seleccionado por el usuario en cada control.
// Facilita la visualización en tiempo real de los parámetros configurados en el formulario.
function setupRange(idInput, idOutput) {
  const input = document.getElementById(idInput);
  const output = document.getElementById(idOutput);
  if (input && output) {
    output.textContent = input.value;
    input.addEventListener("input", () => {
      output.textContent = input.value;
    });
  }
}

setupRange("range-population-size", "range-population-size-value");
setupRange("range-f", "range-f-value");
setupRange("range-crossover", "range-crossover-value");
setupRange("range-mutation", "range-mutation-value");
setupRange("range-generations", "range-generations-value");