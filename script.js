document.addEventListener('DOMContentLoaded', () => {
    const recordBtn = document.getElementById('recordBtn');
    const audioPlayback = document.getElementById('audioPlayback');
    let mediaRecorder;
    let audioChunks = [];

    // Check for MediaRecorder support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support audio recording.");
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { 'type': 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPlayback.src = audioUrl;
                processAudio(audioBlob);
            };
        })
        .catch(error => console.error("Error accessing the microphone: ", error));

    recordBtn.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            recordBtn.textContent = "Record";
        } else {
            audioChunks = [];
            mediaRecorder.start();
            recordBtn.textContent = "Stop Recording";
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const recordBtn = document.getElementById('recordBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const audioPlayback = document.getElementById('audioPlayback');
    const audioFileInput = document.getElementById('audioFile');
    let mediaRecorder;
    let audioChunks = [];

    // Existing code for handling audio recording...

    uploadBtn.addEventListener('click', () => {
        const audioFiles = audioFileInput.files;
        if (audioFiles.length === 0) {
            alert('Please select an audio file first.');
            return;
        }
        const audioFile = audioFiles[0];
        processAudio(audioFile);
    });
});

function processAudio(audioBlob) {
    let formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    // Send the audio file to the server
    fetch('https://epikryza-a89fc16ce1c2.herokuapp.com/process-audio', { //TODO change the website
        method: 'POST',
        body: formData,
    })
    .then(response => response.json()) // Parse the JSON response from the server
    // Inside the processAudio function, after fetching data from the server
    .then(data => {
    console.log('Success:', data);
    // Update the webpage with the processed text
    document.getElementById('transcription').textContent = data.transcript || "No transcription available.";
    document.getElementById('processedText').textContent = data.processed_text || "No processed text available.";
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
