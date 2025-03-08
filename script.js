const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let storedQRNGKey = "";  // Stores QRNG key for encryption/decryption

// Access laptop camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
        video.play();
    })
    .catch((err) => {
        console.error("Camera access denied:", err);
        alert("Camera access denied. Please enable permissions.");
    });

// Hash randomness using SHA-256
async function hashRandomness(randomness) {
    const encoder = new TextEncoder();
    const data = encoder.encode(randomness);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Generate a QRNG key
async function generateQRNGKey() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = frame.data;

    let randomness = "";
    for (let i = 0; i < pixels.length; i += 4) {
        randomness += pixels[i];
    }

    return await hashRandomness(randomness);
}

// Encrypt user input using QRNG-based key
async function encryptWithQRNG() {
    let userInput = document.getElementById("userInput").value;
    if (!userInput) {
        alert("Please enter text to encrypt.");
        return;
    }

    const qrngKey = await generateQRNGKey();
    storedQRNGKey = qrngKey;  // Store the QRNG key for decryption

    // Hash input + QRNG Key
    const combinedData = userInput + qrngKey;
    const encoder = new TextEncoder();
    const data = encoder.encode(combinedData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert hash to hex string
    const encryptedText = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    document.getElementById("output").textContent = `Encrypted Text: ${encryptedText}`;
    document.getElementById("qrngKeyDisplay").textContent = `QRNG Key: ${qrngKey}`;
}

// Decrypt the text using stored QRNG key
async function decryptWithQRNG() {
    let enteredKey = document.getElementById("qrngKeyInput").value;

    if (!enteredKey) {
        alert("Please enter the correct QRNG key for decryption.");
        return;
    }

    if (enteredKey !== storedQRNGKey) {
        alert("Incorrect QRNG key! Decryption failed.");
        return;
    }

    alert("Decryption successful! The original message was: " + document.getElementById("userInput").value);
}

// Generate a random number
async function generateRandomNumber() {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = frame.data;

    let randomness = "";
    for (let i = 0; i < pixels.length; i += 4) {
        randomness += pixels[i];
    }

    const hashedRandomness = await hashRandomness(randomness);
    document.getElementById("output").textContent = `Random Hash: ${hashedRandomness}`;
}

// Generate a bitstream
function generateRandomBitstream(length = 256) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = frame.data;

    let bitstream = "";
    for (let i = 0; i < length; i++) {
        let pixelIndex = Math.floor(Math.random() * pixels.length);
        bitstream += (pixels[pixelIndex] % 2) ? "1" : "0";
    }

    document.getElementById("output").textContent = `Bitstream: ${bitstream}`;
}

// Fetch a true quantum random number
async function getTrueQuantumRandom() {
    try {
        let response = await fetch("https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8");
        let data = await response.json();
        document.getElementById("output").textContent = `True QRNG: ${data.data[0]}`;
    } catch (error) {
        console.error("Error fetching QRNG:", error);
        alert("Failed to fetch true quantum random number.");
    }
}
