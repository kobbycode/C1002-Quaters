const key = "AIzaSyDIixTwTOc8f83mwqaAGGRuMgIkqiNZayk";
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
    .then(res => res.json())
    .then(data => {
        if (data.models) {
            console.log("Available Models:");
            console.log(data.models.map(m => m.name).join('\n'));
        } else {
            console.log("Response:", data);
        }
    })
    .catch(console.error);
