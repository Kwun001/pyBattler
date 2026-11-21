const startScanButton = document.getElementById('startScan');
const stopScanButton = document.getElementById('stopScan');
const scanMessage = document.getElementById('scanMessage');

const roomId = window.roomId;
const html5QrCode = new Html5Qrcode('reader');

let isScanning = false;
let isProcessing = false;

// Start camera
startScanButton.addEventListener('click', async () => {
    if (isScanning) {
        return;
    }

    try {
        scanMessage.textContent = 'Starting camera...';
        stopScanButton.disabled = false;

        await html5QrCode.start(
            { facingMode: 'environment' },
            {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250
                }
            },
            onScanSuccess,
            onScanFailure
        );

        isScanning = true;
        startScanButton.disabled = true;
        stopScanButton.disabled = false;
        stopScanButton.hidden = false;

        scanMessage.textContent =
            'Camera started. Point it at your card QR code.';

    } catch (error) {
        console.error(error);

        isScanning = false;
        stopScanButton.disabled = true;
        startScanButton.disabled = false;

        scanMessage.textContent =
            'Unable to start camera. Please allow camera permission and try again.';
    }
});


// Stop camera
stopScanButton.addEventListener('click', async () => {
    if (!isScanning) {
        return;
    }

    try {
        await html5QrCode.stop();

        isScanning = false;
        startScanButton.disabled = false;
        stopScanButton.disabled = true;
        stopScanButton.hidden = true;

        scanMessage.textContent = 'Camera stopped.';

    } catch (error) {
        console.error(error);
        scanMessage.textContent = 'Unable to stop camera.';
    }
});


// QR code detected
async function onScanSuccess(decodedText) {
    if (isProcessing) {
        return;
    }

    isProcessing = true;
    scanMessage.textContent = 'QR code detected. Checking card...';

    try {
        if (isScanning) {
            await html5QrCode.stop();
            isScanning = false;
        }

        startScanButton.disabled = true;
        stopScanButton.disabled = true;
        stopScanButton.hidden = true;

        const response = await fetch(`/scan/${roomId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                qr_code: decodedText
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        scanMessage.textContent =
            'Card found: ' + result.card.card_type;

        window.location.href = '/question';

    } catch (error) {
        console.error(error);

        scanMessage.textContent = error.message;

        isProcessing = false;
        startScanButton.disabled = false;
        stopScanButton.disabled = true;
    }
}

// Ignore unsuccessful QR detection attempts
function onScanFailure(error) {
    // No action needed while the camera is searching.
}