document.addEventListener("DOMContentLoaded", function() {
    var el = document.getElementById('cropper');
    var cropper = new Croppie(el, {
        viewport: { width: 200, height: 200, type: 'square' },
        boundary: { width: 250, height: 250 },
        showZoomer: true,
        enableOrientation: true
    });

    var imageSettings = {};
    var currentImageIndex = null;
    var croppedImages = {};
    var currentImageBlob;

    var dropOverlay = document.getElementById('dropOverlay');

    window.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropOverlay.style.display = 'flex';
    });

    window.addEventListener('dragleave', function(e) {
        e.preventDefault();
        if (e.clientX === 0 || e.clientY === 0) {
            dropOverlay.style.display = 'none';
        }
    });

    window.addEventListener('drop', function(e) {
        e.preventDefault();
        dropOverlay.style.display = 'none';
        processFiles(e.dataTransfer.files);
    });

    document.getElementById('upload').addEventListener('change', function(event) {
        processFiles(event.target.files);
    });
    function processFiles(files) {
    var imageGallery = document.getElementById('imageGallery');
    imageGallery.innerHTML = '';
    var editDiv = document.querySelector('.edit');
    editDiv.style.display = 'block'; // Show the edit div

    for (let i = 0; i < files.length; i++) {
        let reader = new FileReader();
        reader.onload = function(e) {
            console.log("FileReader loaded an image"); // Debugging log
            let img = document.createElement('img');
            img.src = e.target.result;
            img.style = 'width: 100px; height: 100px; margin: 5px;';

            img.draggable = false;

            img.onclick = function() {
                currentImageIndex = i;
                if (imageSettings[i]) {
                    cropper.bind({
                        url: e.target.result,
                        points: imageSettings[i].points
                    }).then(function() {
                        cropper.setZoom(imageSettings[i].zoom);
                    });
                } else {
                    cropper.bind({
                        url: e.target.result
                    });
                }
            };
            imageGallery.appendChild(img);

            // Bind the first image to Croppie
            if (i === 0) {
                console.log("Binding first image to Croppie"); // Debugging log
                currentImageIndex = 0;
                cropper.bind({
                    url: e.target.result
                });
            }
        };
        reader.readAsDataURL(files[i]);
    }
}

    el.addEventListener('update', function(ev) {
        if (currentImageIndex !== null) {
            imageSettings[currentImageIndex] = {
                points: ev.detail.points,
                zoom: ev.detail.zoom
            };
        }
    });




    document.getElementById('downloadCurrentImage').addEventListener('click', function() {
    if (currentImageIndex !== null) {
        var format = document.getElementById('formatSelector').value;
        cropper.result({
            type: 'blob',
            size: 'original', // Use 'original' to maintain original resolution
            format: format
        }).then(function(blob) {
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'cropped-image.' + format;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});






});