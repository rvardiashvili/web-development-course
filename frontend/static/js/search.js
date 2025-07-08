document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const resultsDropdown = document.getElementById('search-results-dropdown');
    let searchTimeout;

    searchInput.addEventListener('input', function() {
        const query = this.value.trim();

        // Clear previous timeout
        clearTimeout(searchTimeout);

        if (query) {
            // Set a timeout to prevent excessive requests while typing
            searchTimeout = setTimeout(() => {
                fetch(`/search/live_search?q=${query}`)
                    .then(response => response.json())
                    .then(data => {
                        resultsDropdown.innerHTML = ''; // Clear previous results
                        let hasResults = false;

                        // Display Users
                        if (data.users && data.users.length > 0) {
                            hasResults = true;
                            const userHeader = document.createElement('div');
                            userHeader.textContent = 'Users';
                            userHeader.classList.add('dropdown-header');
                            resultsDropdown.appendChild(userHeader);
                            data.users.forEach(user => {
                                const a = document.createElement('a');
                                a.href = `/profile/${user.username}`;
                                const userDiv = document.createElement('div');
                                userDiv.classList.add('search-user-item');

                                const profilePic = document.createElement('img');
                                if(user.profile_pic_path){
                                    user.profile_pic_path = user.profile_pic_path;
                                }
                                else{
                                    user.profile_pic_path = '/static/media/default/pfp.jpg'; // Use path or default
                                }
                                profilePic.src = user.profile_pic_path;
                                profilePic.alt = user.full_name;
                                profilePic.classList.add('search-profile-pic');

                                const textSpan = document.createElement('span');
                                textSpan.textContent = `${user.full_name} (@${user.username})`;

                                userDiv.appendChild(profilePic);
                                userDiv.appendChild(textSpan);
                                a.appendChild(userDiv);
                                resultsDropdown.appendChild(a);
                            });
                        }

                        // Display Groups
                        if (data.groups && data.groups.length > 0) {
                            hasResults = true;
                            const groupHeader = document.createElement('div');
                            groupHeader.textContent = 'Groups';
                            groupHeader.classList.add('dropdown-header');
                            resultsDropdown.appendChild(groupHeader);
                            data.groups.forEach(group => {
                                const a = document.createElement('a');
                                a.href = `/feed/community/${group.id}`;
                                a.textContent = group.name;
                                resultsDropdown.appendChild(a);
                            });
                        }

                        // Display Employers
                        if (data.employers && data.employers.length > 0) {
                            hasResults = true;
                            const employerHeader = document.createElement('div');
                            employerHeader.textContent = 'Employers';
                            employerHeader.classList.add('dropdown-header');
                            resultsDropdown.appendChild(employerHeader);
                            data.employers.forEach(employer => {
                                const a = document.createElement('a');
                                a.href = `/employers/${employer.id}`; // Adjust URL as needed
                                a.textContent = employer.business_name;
                                resultsDropdown.appendChild(a);
                            });
                        }

                        // Display Posts
                        if (data.posts && data.posts.length > 0) {
                            hasResults = true;
                            const postHeader = document.createElement('div');
                            postHeader.textContent = 'Posts';
                            postHeader.classList.add('dropdown-header');
                            resultsDropdown.appendChild(postHeader);
                            data.posts.forEach(post => {
                                const a = document.createElement('a');
                                a.href = `/feed/post/${post.id}`; // Adjust URL as needed
                                a.textContent = post.content;
                                resultsDropdown.appendChild(a);
                            });
                        }

                        // Display Job Postings
                        if (data.job_postings && data.job_postings.length > 0) {
                            hasResults = true;
                            const jobHeader = document.createElement('div');
                            jobHeader.textContent = 'Job Postings';
                            jobHeader.classList.add('dropdown-header');
                            resultsDropdown.appendChild(jobHeader);
                            data.job_postings.forEach(job => {
                                const a = document.createElement('a');
                                a.href = `/jobs/${job.id}`; // Adjust URL as needed
                                a.textContent = `${job.title} at ${job.employer_name || 'Unknown Employer'}`;
                                resultsDropdown.appendChild(a);
                            });
                        }

                        if (hasResults) {
                            resultsDropdown.classList.add('show');
                        } else {
                            resultsDropdown.classList.remove('show');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching search results:', error);
                        resultsDropdown.innerHTML = '<p>Error fetching results.</p>';
                        resultsDropdown.classList.add('show');
                    });
            }, 300); // Adjust the delay (in milliseconds) as needed
        } else {
            resultsDropdown.classList.remove('show');
            resultsDropdown.innerHTML = '';
        }
    });

    // Close the dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('#search')) {
            resultsDropdown.classList.remove('show');
        }
    });
});