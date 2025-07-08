    document.addEventListener('DOMContentLoaded', function() {
        const notificationBadge = document.querySelector('.notification-badge');
        const notificationsDropdownContent = document.getElementById('notifications-dropdown-content');
        const notificationList = notificationsDropdownContent.querySelector('.notification-list');
        const bellIcon = document.querySelector('.fa-bell');

        function fetchNotifications() {
            fetch('/notifications') // Assuming an API endpoint for notifications
                .then(response => response.json())
                .then(data => {
                    notificationList.innerHTML = ''; // Clear existing notifications

                    let unreadCount = 0;
                    if (data.length > 0) {
                        data.forEach(notification => {
                            const notificationItem = document.createElement('div');
                            notificationItem.classList.add('notification-item');
                            if (!notification.is_read) {
                                notificationItem.classList.add('unread');
                                unreadCount++;
                            }
                            
                            notificationItem.innerHTML = `
                                <p><strong>${notification.type || ''}</strong></p><p> ${notification.content}</p>
                                <small>${timeAgo(notification.created_at)}</small>
                            `;
                            notificationList.appendChild(notificationItem);
                            notificationItem.addEventListener('click', () => {
                                
                                if (!notification.read) {
                                    fetch(`/notifications/${notification.notification_id}/read`, {
                                        method: 'PUT'
                                    })
                                    .then(response => {
                                        if (response.ok) {
                                            notification.read = true;
                                            notificationItem.classList.remove('unread');
                                            unreadCount--;
                                            if (unreadCount > 0) {
                                                notificationBadge.textContent = unreadCount;
                                            } else {
                                                notificationBadge.style.display = 'none';
                                            }
                                        } else {
                                            console.error('Failed to mark notification as read');
                                        }
                                    })
                                    .catch(error => console.error('Error marking notification as read:', error));
                                }
                                if(notification.source_type === 'post'){
                                    window.location.href = `/feed/post/${notification.source_id}`;
                                }else if(notification.source_type === 'group'){
                                    window.location.href = `/feed/community/${notification.source_id}`;
                                }else if(notification.source_type === 'user'){
                                    window.location.href = `/profile/id/${notification.source_id}`;
                                }else if(notification.source_type === 'job'){
                                    window.location.href = `/jobs/${notification.source_id}`;
                                }
                            });
                                                        
                        });
                    } else {
                        notificationList.innerHTML = '<p class="no-notifications">No new notifications.</p>';
                    }

                    if (unreadCount > 0) {
                        notificationBadge.textContent = unreadCount;
                        notificationBadge.style.display = 'block'; // Show the badge
                    } else {
                        notificationBadge.style.display = 'none'; // Hide the badge
                    }
                })
                .catch(error => {
                    console.error('Error fetching notifications:', error);
                    notificationList.innerHTML = '<p class="error-notifications">Failed to load notifications.</p>';
                });
        }

        // Fetch notifications when the page loads
        fetchNotifications();

        // Fetch notifications periodically (e.g., every minute)
        const notificationUpdateInterval = 60000; // 60 seconds
        const notificationIntervalId = setInterval(fetchNotifications, notificationUpdateInterval);

        // Toggle dropdown visibility
        bellIcon.parentElement.addEventListener('click', function(event) {
            event.stopPropagation(); // Stop event from bubbling up to document
            notificationsDropdownContent.classList.toggle('show');
            // Optionally, you might want to clear the interval when the dropdown is closed
            // clearInterval(notificationIntervalId);
                    });
            
                    // Close the dropdown if the user clicks outside of it
                    document.addEventListener('click', function(event) {
                        if (!notificationsDropdownContent.contains(event.target) && !bellIcon.parentElement.contains(event.target)) {
                            notificationsDropdownContent.classList.remove('show');
                        }
                    });
        //function to calculate time passed since notification.created_at
        function timeAgo(dateString) {
            // Get the current time in milliseconds since the UTC epoch.
            const now = Date.now();
            // The backend sends UTC time strings (e.g., "2025-07-08T14:36:19").
            // Appending 'Z' to the string forces the JavaScript Date constructor
            // to parse it as UTC, rather than incorrectly interpreting it as local time.
            const past = new Date(dateString + 'Z').getTime();
            const seconds = Math.floor((now - past) / 1000);
            let interval = seconds / 31536000;
            if (interval > 1) {
                return Math.floor(interval) + " years ago";
            }
            interval = seconds / 2592000;
            if (interval > 1) {
                return Math.floor(interval) + " months ago";
            }
            interval = seconds / 86400;
            if (interval > 1) {
                return Math.floor(interval) + " days ago";
            }
            interval = seconds / 3600;
            if (interval > 1) {
                return Math.floor(interval) + " hours ago";
            }
            interval = seconds / 60;
            if (interval > 1) {
                return Math.floor(interval) + " minutes ago";
            }
            return Math.max(0, Math.floor(seconds)) + " seconds ago";
        }
                });
