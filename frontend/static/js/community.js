export function setupCommunityPage(groupId) {
    // --- DOM Elements for Members Popup ---
    const membersLink = document.getElementById('members-link');
    const membersPopupModal = document.getElementById('members-popup-modal');
    const membersListContainer = document.getElementById('member-list-container');
    const closeMembersPopupButton = membersPopupModal ? membersPopupModal.querySelector('.close-button') : null;

    // --- DOM Elements for Settings Modal ---
    const settingsButton = document.getElementById('community-settings-button');
    const settingsModal = document.getElementById('community-settings-modal');
    const closeSettingsModalButton = document.getElementById('close-community-settings-modal');
    const settingsForm = document.getElementById('community-settings-form');
    const settingsMessages = document.getElementById('community-settings-messages');

    // --- Function to show/hide settings button based on role ---
    const updateSettingsButtonVisibility = () => {
        if (settingsButton && (window.is_admin || window.is_moderator)) {
            settingsButton.style.display = 'flex';
        } else if (settingsButton) {
            settingsButton.style.display = 'none';
        }
    };

    // --- Function to fetch and display members ---
    const showMembersPopup = async () => {
        if (!membersPopupModal || !membersListContainer) return;

        membersPopupModal.style.display = 'flex'; // Show the modal using flex for centering
        membersListContainer.innerHTML = '<p>Loading members...</p>'; // Show loading state

        try {
            const response = await fetch(`/api/groups/${groupId}/members`);
            const members = await response.json();

            membersListContainer.innerHTML = ''; // Clear loading message

            if (members.length > 0) {
                members.forEach(member => {
                    const memberItem = document.createElement('div');
                    memberItem.classList.add('member-item');

                    let roleIdentifier = '';
                    if (member.role === 'admin') {
                        roleIdentifier = '<span class="role-identifier admin"> Admin</span>';
                    } else if (member.role === 'moderator') {
                        roleIdentifier = '<span class="role-identifier moderator"> Moderator</span>';
                    }

                    memberItem.innerHTML = `
                        <a href="/profile/${member.username}" class="member-info">
                            <img src="${member.profile_picture || '/static/media/default/pfp.jpg'}" alt="${member.username}">
                            <span>${member.username} ${roleIdentifier}</span>
                        </a>
                        <div class="member-actions">
                            <button class="three-dots-button">⋮</button>
                            <div class="dropdown-menu">
                                </div>
                        </div>
                    `;

                    const dropdownMenu = memberItem.querySelector('.dropdown-menu');
                    const threeDotsButton = memberItem.querySelector('.three-dots-button');

                    // Populate dropdown menu based on current user's role and member's role
                    if (window.is_admin || window.is_moderator) {
                        // Option to remove member (available for admin/moderator)
                        if (member.user_id !== parseInt(window.current_user_id)) {
                            let removeOptionHTML = `<a href="#" class="dropdown-item remove-member-button" data-user-id="${member.user_id}">Remove Member</a>`;
                            dropdownMenu.insertAdjacentHTML('beforeend', removeOptionHTML);
                            
                        }
                    }

                    if (window.is_admin) {
                        // Admin-specific options
                        if (member.user_id !== parseInt(window.current_user_id)) {
                        if (member.role === 'member') {
                            dropdownMenu.insertAdjacentHTML('beforeend', `<a href="#" class="dropdown-item make-moderator-button" data-user-id="${member.user_id}">Make Moderator</a>`);
                        } else if (member.role === 'moderator') {
                            dropdownMenu.insertAdjacentHTML('beforeend', `<a href="#" class="dropdown-item remove-moderator-button" data-user-id="${member.user_id}">Remove Moderator Privileges</a>`);
                        }
                        // Only show "Give Away Admin Power" if the current user is an admin and not trying to give it to themselves
                         // Assuming window.current_user_id exists
                            dropdownMenu.insertAdjacentHTML('beforeend', `<a href="#" class="dropdown-item make-admin-button" data-user-id="${member.user_id}">Give Away Admin Power</a>`);
                        }
                    }

                    // Add event listeners for dropdown actions
                    if (dropdownMenu.children.length > 0) { // Only show button if there are options
                        threeDotsButton.style.display = 'block'; // Make button visible

                        threeDotsButton.addEventListener('click', (event) => {
                            event.stopPropagation(); // Prevent the window click from immediately closing it
                            // Close other open dropdowns
                            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                                if (menu !== dropdownMenu) {
                                    menu.style.display = 'none';
                                }
                            });
                            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
                        });

                        // Event listeners for the actions within the dropdown
                        dropdownMenu.querySelectorAll('.remove-member-button').forEach(button => {
                            button.addEventListener('click', (event) => {
                                event.preventDefault();
                                removeMember(button.dataset.userId);
                                dropdownMenu.style.display = 'none';
                            });
                        });

                        dropdownMenu.querySelectorAll('.make-moderator-button').forEach(button => {
                            button.addEventListener('click', (event) => {
                                event.preventDefault();
                                updateMemberRole(button.dataset.userId, 'moderator');
                                dropdownMenu.style.display = 'none';
                            });
                        });

                        dropdownMenu.querySelectorAll('.remove-moderator-button').forEach(button => {
                            button.addEventListener('click', (event) => {
                                event.preventDefault();
                                updateMemberRole(button.dataset.userId, 'member'); // Assuming 'member' is the default role
                                dropdownMenu.style.display = 'none';
                            });
                        });

                        dropdownMenu.querySelectorAll('.make-admin-button').forEach(button => {
                            button.addEventListener('click', (event) => {
                                event.preventDefault();
                                giveAwayAdminPower(button.dataset.userId);
                                dropdownMenu.style.display = 'none';
                            });
                        });
                    } else {
                         threeDotsButton.style.display = 'none'; // Hide button if no options
                    }
                    membersListContainer.appendChild(memberItem);
                });
            } else {
                membersListContainer.innerHTML = '<p>No members found.</p>';
            }
        } catch (error) {
            console.error('Error fetching members:', error);
            if (membersPopupModal.style.display === 'flex') {
                membersListContainer.innerHTML = '<p class="error-message">Failed to load members.</p>';
            }
        }
    };

    // --- Event Listeners for Members Popup ---
    if (membersLink) {
        membersLink.addEventListener('click', (event) => {
            event.preventDefault();
            showMembersPopup();
        });
    }

    if (closeMembersPopupButton) {
        closeMembersPopupButton.addEventListener('click', () => {
            membersPopupModal.style.display = 'none';
        });
    }

    if (membersPopupModal) {
        // Close modal if clicking on the background overlay
        window.addEventListener('click', (event) => {
            if (event.target === membersPopupModal) {
                membersPopupModal.style.display = 'none';
                // Close any open dropdowns when modal closes
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.style.display = 'none';
                });
            } else if (!event.target.closest('.member-actions')) { // Close dropdown if clicked outside of any dropdown button
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.style.display = 'none';
                });
            }
        });
    }

    // --- Function to remove member ---
    const removeMember = async (memberUserId) => {
        if (!confirm('Are you sure you want to remove this member?')) return;

        try {
            const response = await fetch(`/api/groups/${groupId}/members/${memberUserId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Member removed successfully.');
                showMembersPopup(); // Refresh the member list
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to remove member.'}`);
            }
        } catch (error) {
            console.error('Error removing member:', error);
            alert('An error occurred while trying to remove the member.');
        }
    };
    // Call this function initially when the page is set up
    updateSettingsButtonVisibility();


    // --- Function to update member role ---
    const updateMemberRole = async (memberUserId, newRole) => {
        if (!confirm(`Are you sure you want to change this member's role to ${newRole}?`)) return;

        try {
            const response = await fetch(`/api/groups/${groupId}/members/${memberUserId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role: newRole
                })
            });

            if (response.ok) {
                alert(`Member role updated to ${newRole} successfully.`);
                showMembersPopup(); // Refresh the member list
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to update member role.'}`);
            }
        } catch (error) {
            console.error('Error updating member role:', error);
            alert('An error occurred while trying to update the member role.');
        }
    };

    // --- Function to give away admin power ---
    const giveAwayAdminPower = async (newAdminUserId) => {
        if (!confirm('WARNING: Are you sure you want to give away your admin power to this user? You will become a regular member.')) return;

        try {
            const response = await fetch(`/api/groups/${groupId}/transfer-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    new_admin_user_id: newAdminUserId
                })
            });

            if (response.ok) {
                alert('Admin power successfully transferred. Your role has been updated.');
                // Optionally, redirect or refresh the page to reflect the new user's permissions
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message || 'Failed to transfer admin power.'}`);
            }
        } catch (error) {
            console.error('Error transferring admin power:', error);
            alert('An error occurred while trying to transfer admin power.');
        }
    };

    // --- Settings Modal Logic ---

    const openSettingsModal = () => {
        if (!settingsModal || !settingsForm) return;

        // Populate form with current data
        const groupName = document.querySelector('.profile-overlay h2').textContent;
        const groupDescription = document.querySelector('.profile-overlay p').textContent;
        const groupProfilePic = document.querySelector('.community-group-logo img')?.src || document.querySelector('.profile-pic img').src; // A bit of a guess, adjust selector if needed
        const groupCoverPic = document.querySelector('.profile-image-wrapper img').src;

        settingsForm.elements['name'].value = groupName;
        settingsForm.elements['description'].value = groupDescription;
        document.getElementById('community-settings-profile-pic-preview').src = groupProfilePic;
        document.getElementById('community-settings-cover-pic-preview').src = groupCoverPic;

        settingsModal.style.display = 'flex';
    };

    const closeSettingsModal = () => {
        if (settingsModal) {
            settingsModal.style.display = 'none';
            if (settingsMessages) settingsMessages.style.display = 'none';
        }
    };

    const handleSettingsFormSubmit = async (event) => {
        event.preventDefault();
        if (!settingsMessages) return;

        settingsMessages.textContent = 'Saving changes...';
        settingsMessages.className = 'message-container info';
        settingsMessages.style.display = 'block';

        const currentName = document.querySelector('.profile-overlay h2').textContent;
        const currentDescription = document.querySelector('.profile-overlay p').textContent;

        const newName = settingsForm.elements['name'].value;
        const newDescription = settingsForm.elements['description'].value;
        const profilePicFile = settingsForm.elements['profile_picture'].files[0];
        const coverPicFile = settingsForm.elements['cover_picture'].files[0];

        const formData = new FormData();
        let hasChanges = false;

        if (newName !== currentName) {
            formData.append('name', newName);
            hasChanges = true;
        }
        if (newDescription !== currentDescription) {
            formData.append('description', newDescription);
            hasChanges = true;
        }
        if (profilePicFile) {
            formData.append('profile_picture', profilePicFile);
            hasChanges = true;
        }
        if (coverPicFile) {
            formData.append('cover_picture', coverPicFile);
            hasChanges = true;
        }

        if (!hasChanges) {
            settingsMessages.textContent = 'No changes to save.';
            settingsMessages.className = 'message-container info';
            setTimeout(() => { settingsMessages.style.display = 'none'; }, 2000);
            return;
        }

        try {
            const response = await fetch(`/api/groups/${groupId}/update`, {
                method: 'PUT',
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                settingsMessages.textContent = data.message || 'Changes saved successfully!';
                settingsMessages.className = 'message-container success';

                // Update the UI directly with the new values from the form or response
                const newName = formData.get('name');
                document.querySelector('.profile-overlay p').textContent = newDescription;

                // Update images if a new file was selected or if the backend returned new paths
                const profilePicFile = settingsForm.elements['profile_picture'].files[0];
                const coverPicFile = settingsForm.elements['cover_picture'].files[0];

                if (profilePicFile) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const profilePicElements = document.querySelectorAll('.community-group-logo img, #community-settings-profile-pic-preview');
                        profilePicElements.forEach(el => el.src = e.target.result);
                    };
                    reader.readAsDataURL(profilePicFile);
                } else if (newName) { // Only update if name was changed and no new profile pic
                    document.querySelector('.profile-overlay h2').textContent = newName;

                } else if (data.profile_picture_url) {
                    document.querySelectorAll('.community-group-logo img, #community-settings-profile-pic-preview').forEach(el => el.src = data.profile_picture_url);
                }

                if (coverPicFile) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        document.querySelector('.profile-image-wrapper img').src = e.target.result;
                        document.getElementById('community-settings-cover-pic-preview').src = e.target.result;
                    };
                    reader.readAsDataURL(coverPicFile);
                } else if (data.cover_picture_url) {
                    document.querySelector('.profile-image-wrapper img').src = data.cover_picture_url;
                    document.getElementById('community-settings-cover-pic-preview').src = data.cover_picture_url;
                }
                setTimeout(closeSettingsModal, 1500);
            } else {
                const errorData = await response.json();
                settingsMessages.textContent = errorData.message || 'Failed to save changes.';
                settingsMessages.className = 'message-container error';
            }
        } catch (error) {
            console.error('Error updating community settings:', error);
            settingsMessages.textContent = 'An error occurred while saving changes.';
            settingsMessages.className = 'message-container error';
        }
    };

    // --- Event Listeners for Settings Modal ---
    if (settingsButton) {
        settingsButton.addEventListener('click', (e) => {
            e.preventDefault();
            openSettingsModal();
        });
    }

    if (closeSettingsModalButton) {
        closeSettingsModalButton.addEventListener('click', closeSettingsModal);
    }

    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsFormSubmit);
    }

    // Also close modal on background click
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            closeSettingsModal();
        }
    });
}