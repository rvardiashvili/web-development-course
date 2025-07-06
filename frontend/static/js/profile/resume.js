// resume.js
// Add this to your profileApp.js or a relevant script
export function setupResumeListeners(user_id) {
    const resume_btn = document.querySelector(".cv-pdf");
    const resumeViewerPopup = document.getElementById("resume-viewer-popup");
    const resumeViewerCloseButton = document.getElementById("resume-viewer-close-button");
    const resumePdfIframe = document.getElementById("resume-pdf-iframe");
    console.log("RESUME")
    if (resume_btn) {
        resume_btn.addEventListener('click', async () => { // Made the event listener async
            const pdfUrl = await fetchResume(user_id); // Await the URL from fetchResume
            console.log("url: " + pdfUrl)
            if (pdfUrl) { // Only set src if a URL is returned
                resumePdfIframe.src = pdfUrl;
                resumeViewerPopup.style.display = "flex"; // Use flex to center the modal
            } else {
                console.warn("No resume URL available or an error occurred.");
                // Optionally display a message to the user that no resume is available
            }
        });
    }

    if (resumeViewerCloseButton) {
        resumeViewerCloseButton.addEventListener('click', () => {
            resumeViewerPopup.style.display = "none";
            resumePdfIframe.src = ""; // Clear the iframe src when closing
            // Revoke the object URL to free up memory
            if (resumePdfIframe.dataset.objectUrl) {
                URL.revokeObjectURL(resumePdfIframe.dataset.objectUrl);
                delete resumePdfIframe.dataset.objectUrl;
            }
        });
    }

    // Close the popup if clicking outside the modal content
    if (resumeViewerPopup) {
        resumeViewerPopup.addEventListener('click', (event) => {
            if (event.target === resumeViewerPopup) {
                resumeViewerPopup.style.display = "none";
                resumePdfIframe.src = ""; // Clear the iframe src when closing
                // Revoke the object URL to free up memory
                if (resumePdfIframe.dataset.objectUrl) {
                    URL.revokeObjectURL(resumePdfIframe.dataset.objectUrl);
                    delete resumePdfIframe.dataset.objectUrl;
                }
            }
        });
    }
}

async function fetchResume(userId) {
  const url = `/api/profile/resume/${userId}`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      // If the response is not OK, it means there's no resume or an error occurred.
      // We should not try to create a Blob URL from an error response.
      console.error(`HTTP error! status: ${response.status} when fetching resume.`);
      return null; // Return null if fetching fails
    }

    // Get the response as a Blob
    const resumeBlob = await response.blob();

    // Check if the blob is empty or indicates no file (e.g., 0 bytes for a missing PDF)
    if (resumeBlob.size === 0 || resumeBlob.type !== 'application/pdf') {
        console.warn("Fetched resume is empty or not a PDF.");
        return null;
    }

    // Create an object URL from the Blob
    const objectUrl = URL.createObjectURL(resumeBlob);
    // Store the object URL in a data attribute for later revocation
    document.getElementById("resume-pdf-iframe").dataset.objectUrl = objectUrl;
    return objectUrl; // Return the object URL
  } catch (error) {
    console.error("Error fetching resume:", error);
    return null;
  }
}

// In settingsFormListeners.js (or a new resumeUpload.js file)

// Assuming you have a function to handle form submissions generally
// This example focuses on the resume upload specific parts
export function setupResumeUploadListeners(fetchAndRenderMainPageData) {
    const uploadResumeForm = document.getElementById('upload-resume-form');
    const uploadNewResumeButton = document.getElementById('upload-new-resume-button');
    const currentResumeContainer = document.querySelector('.current-resume-container'); // To potentially show upload status or current file

    if (uploadNewResumeButton) {
        uploadNewResumeButton.addEventListener('click', () => {
            // Trigger the hidden file input
            uploadResumeForm.querySelector('input[type="file"]').click();
        });
    }

    if (uploadResumeForm) {
        const fileInput = uploadResumeForm.querySelector('input[type="file"]');

        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) {
                return; // No file selected
            }

            const formData = new FormData();
            formData.append('resume', file);

            try {
                // Assuming your backend endpoint for resume upload is /api/profile/resume/upload_resume
                const response = await fetch('/api/profile/resume/upload_resume', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (response.ok) {
                    // Display success message
                    console.log('Resume upload successful:', result.message);
                    // Optionally, refresh the main page data to show new resume status
                    if (fetchAndRenderMainPageData) {
                        await fetchAndRenderMainPageData();
                    }
                    // Hide the form or provide feedback
                    // clearMessageContainers(); // If you have general message clear
                    // showMessage('Resume uploaded successfully!', 'success'); // Custom message display
                } else {
                    // Display error message
                    console.error('Resume upload failed:', result.message);
                    // showMessage(`Error: ${result.message}`, 'error'); // Custom message display
                }
            } catch (error) {
                console.error('Error during resume upload:', error);
                // showMessage('An unexpected error occurred during upload.', 'error'); // Custom message display
            }
            // Clear the input to allow re-uploading the same file if needed
            event.target.value = '';
        });
    }
}