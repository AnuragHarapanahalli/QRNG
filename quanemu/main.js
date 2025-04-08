const canvas = document.querySelector('#bg');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const light = new THREE.PointLight(0x00ffff, 1, 100);
light.position.set(0, 5, 10);
scene.add(light);

camera.position.z = 12;

const waveMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
const waveGeometry = new THREE.BufferGeometry();
const wave = new THREE.Line(waveGeometry, waveMaterial);
scene.add(wave);

let barrierGeometry = new THREE.BoxGeometry(2, 5, 0.5);
let barrierMaterial = new THREE.MeshBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0.5 });
let barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
barrier.position.x = 0;
scene.add(barrier);

// Constants
const ħ = 1, m = 1;
function calculateProbability(V0, E, a) {
  if (E >= V0) return 1;
  const kappa = Math.sqrt(2 * m * (V0 - E)) / ħ;
  return Math.exp(-2 * kappa * a);
}

// Chart
const ctx = document.getElementById('chart').getContext('2d');
let chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Tunneling Probability',
      data: [],
      borderColor: '#00ffff',
      backgroundColor: 'rgba(0,255,255,0.1)',
      tension: 0.2,
      fill: true
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { labels: { color: '#0ff' } } },
    scales: {
      x: { ticks: { color: '#0ff' } },
      y: { ticks: { color: '#0ff' }, min: 0, max: 1 }
    }
  }
});

// DOM elements
const bh = document.getElementById('barrierHeight');
const bw = document.getElementById('barrierWidth');
const energy = document.getElementById('energy');
const probText = document.getElementById('probability');
const generateBit = document.getElementById('generateBit');
const bitOutput = document.getElementById('bitOutput');

// UI Update
function updateSimulation() {
  const V0 = parseFloat(bh.value);
  const a = parseFloat(bw.value);
  const E = parseFloat(energy.value);

  barrier.scale.x = a;
  barrier.scale.y = V0;
  barrier.position.y = V0 / 2 - 2.5;

  const prob = calculateProbability(V0, E, a);
  probText.textContent = `Tunneling Probability: ${prob.toFixed(4)}`;

  chart.data.labels.push(`a=${a.toFixed(1)}`);
  chart.data.datasets[0].data.push(prob);
  chart.update();
}

[bh, bw, energy].forEach(slider => slider.addEventListener('input', updateSimulation));

// Animate wave
let time = 0;
function animate() {
  requestAnimationFrame(animate);

  const V0 = parseFloat(bh.value);
  const a = parseFloat(bw.value);
  const E = parseFloat(energy.value);
  const T = calculateProbability(V0, E, a);

  const barrierStart = -a / 2;
  const barrierEnd = a / 2;
  const k = Math.sqrt(2 * m * E) / ħ;
  const kappa = Math.sqrt(2 * m * Math.abs(V0 - E)) / ħ;

  time += 0.05;
  let newPoints = [];

  for (let x = -10; x <= 10; x += 0.1) {
    let y;
    if (x < barrierStart) {
      y = Math.sin(k * x - time);
    } else if (x >= barrierStart && x <= barrierEnd) {
      const decayX = x - barrierStart;
      y = Math.exp(-kappa * decayX) * Math.sin(k * barrierStart - time);
    } else {
      y = Math.sqrt(T) * Math.sin(k * x - time);
    }
    newPoints.push(new THREE.Vector3(x, y, 0));
  }

  wave.geometry.setFromPoints(newPoints);
  renderer.render(scene, camera);
}
updateSimulation();
animate();

// QRNG: Single Bit
generateBit.addEventListener('click', () => {
  const V0 = parseFloat(bh.value);
  const a = parseFloat(bw.value);
  const E = parseFloat(energy.value);
  const T = calculateProbability(V0, E, a);

  const rand = Math.random();
  const bit = rand < T ? 1 : 0;
  bitOutput.textContent = `Output: ${bit} (rand=${rand.toFixed(4)}, T=${T.toFixed(4)})`;
});
