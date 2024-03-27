document.addEventListener('DOMContentLoaded', () => {
    const recordBtn = document.getElementById('recordBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const audioPlayback = document.getElementById('audioPlayback');
    const audioFileInput = document.getElementById('audioFile');
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

                // Use the processAudio function for the recorded audio
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

    uploadBtn.addEventListener('click', () => {
        const audioFiles = audioFileInput.files;
        if (audioFiles.length === 0) {
            alert('Please select an audio file first.');
            return;
        }
        const audioFile = audioFiles[0];

        // Use the processAudio function for the uploaded audio file
        processAudio(audioFile);
    });
});

function processAudio(audioData) {
    let formData = new FormData();

    // Handle both Blob from recording and File from input
    if(audioData instanceof Blob) {
        formData.append('audio', audioData, 'audio.wav');
    } else {
        // This is assuming audioData is a File
        formData.append('audio', audioData);
    }

    fetch('https://epikryza-a89fc16ce1c2.herokuapp.com/process-audio', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        document.getElementById('transcription').textContent = data.transcript || "No transcription available.";
        document.getElementById('processedText').textContent = data.processed_text || "No processed text available.";
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
